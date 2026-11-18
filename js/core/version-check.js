/* Проверка актуальной версии приложения и плашка «Доступно обновление». */

const APP_VERSION_RAW =
    "https://raw.githubusercontent.com/artemdmitriev1412/Artem-MAU/main/version.json";
const APP_VERSION_RE = /^\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/;
const APP_VERSION_CHECK_MS = 5 * 60 * 1000;
const APP_VERSION_TIMEOUT_MS = 4000;

let lastVersionCheck = 0;
let pendingAppVersion = "";
let versionCheckBusy = false;

function seenAppVersion() {
    try {
        const raw = localStorage.getItem("mcw_upd") || "";
        return raw.split("|")[0];
    } catch (e) {
        return "";
    }
}

function appVersionNewer(remote, local) {
    return String(remote).localeCompare(String(local), "en", { numeric: true }) > 0;
}

// Локально (и в предпросмотре) берём version.json с того же адреса,
// в продакшене — сначала с GitHub, затем с самого сайта.
function versionEndpoints() {
    const sameOrigin = new URL("version.json", location.href).toString();
    const host = location.hostname;
    const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host.endsWith(".local") ||
        location.protocol === "file:";
    return isLocal ? [sameOrigin] : [APP_VERSION_RAW, sameOrigin];
}

async function readRemoteVersion(cacheMode) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), APP_VERSION_TIMEOUT_MS);

    try {
        for (const url of versionEndpoints()) {
            try {
                const res = await fetch(url, {
                    cache: cacheMode || "no-cache",
                    signal: ctrl.signal,
                });
                if (!res.ok) continue;

                const data = await res.json();
                const latest = data && data.latest != null ? String(data.latest) : "";
                if (APP_VERSION_RE.test(latest)) return latest;
            } catch (e) {
                // Пробуем следующий источник; при таймауте смысла нет.
                if (ctrl.signal.aborted) return "";
            }
        }
        return "";
    } finally {
        clearTimeout(timer);
    }
}

function appUpdateBar() {
    return document.getElementById("appUpdBar");
}

function updateModalOpen() {
    const modal = document.getElementById("upd");
    return !!(modal && modal.classList.contains("on"));
}

function showAppUpdate(version) {
    const bar = appUpdateBar();
    if (!bar) return;
    const label = document.getElementById("appUpdV");
    if (label) label.textContent = version || "";
    bar.hidden = false;
}

function hideAppUpdate() {
    const bar = appUpdateBar();
    if (bar) bar.hidden = true;
}

function renderAppUpdate() {
    if (!pendingAppVersion || updateModalOpen()) {
        hideAppUpdate();
        return;
    }
    showAppUpdate(pendingAppVersion);
}

async function checkAppUpdate(options) {
    const force = !!(options && options.force);

    if (typeof CATALOG_ONLY !== "undefined" && CATALOG_ONLY) return;
    if (!navigator.onLine) {
        pendingAppVersion = "";
        hideAppUpdate();
        return;
    }

    // На самом первом запуске mcw_upd ещё нет: проверку запустит hideUpd
    // после нажатия «Играть», когда версия уже записана.
    const local = seenAppVersion();
    if (!local) return;

    const now = Date.now();
    if (!force && now - lastVersionCheck < APP_VERSION_CHECK_MS) return;
    if (versionCheckBusy) return;

    lastVersionCheck = now;
    versionCheckBusy = true;

    try {
        const latest = await readRemoteVersion();

        pendingAppVersion = latest && appVersionNewer(latest, seenAppVersion()) ? latest : "";
        renderAppUpdate();
    } finally {
        versionCheckBusy = false;
    }
}

function resetUpdateButton() {
    const btn = document.getElementById("appUpdBtn");
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = "Обновить";
}

function waitWorkerInstalled(worker, timeoutMs) {
    if (!worker) return Promise.resolve(null);
    if (worker.state === "installed" || worker.state === "activated") return Promise.resolve(worker);
    if (worker.state === "redundant") return Promise.resolve(null);

    return new Promise((resolve) => {
        const cleanup = () => {
            clearTimeout(timer);
            worker.removeEventListener("statechange", onChange);
        };
        const onChange = () => {
            if (worker.state === "installed" || worker.state === "activated") {
                cleanup();
                resolve(worker);
            } else if (worker.state === "redundant") {
                cleanup();
                resolve(null);
            }
        };
        const timer = setTimeout(() => {
            cleanup();
            resolve(null);
        }, timeoutMs);
        worker.addEventListener("statechange", onChange);
    });
}

// Дожидаемся нового Service Worker и сразу активируем его:
// пользователь сам нажал «Обновить», поэтому ждать закрытия приложения не нужно.
async function prepareServiceWorkerUpdate(timeoutMs) {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.getRegistration) return false;

    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return false;

        let worker = reg.waiting;
        if (!worker && reg.installing) {
            worker = await waitWorkerInstalled(reg.installing, timeoutMs);
        }

        if (!worker) {
            try {
                await reg.update();
            } catch (e) {}
            worker =
                reg.waiting ||
                (reg.installing ? await waitWorkerInstalled(reg.installing, timeoutMs) : null);
        }

        if (!worker) return false;

        await new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                resolve();
            };
            navigator.serviceWorker.addEventListener("controllerchange", finish, { once: true });
            worker.postMessage({ type: "SKIP_WAITING" });
            setTimeout(finish, 2000);
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function resetAppCache() {
    const btn = document.getElementById("appUpdBtn");

    if (!navigator.onLine) {
        if (btn) btn.textContent = "Нет сети";
        setTimeout(resetUpdateButton, 2500);
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Обновляем…";
    }

    // Не сносим кэш, пока не убедились, что сеть действительно отвечает.
    if (!(await readRemoteVersion("reload"))) {
        if (btn) btn.textContent = "Нет сети";
        setTimeout(resetUpdateButton, 2500);
        return;
    }

    try {
        if (typeof dbSave === "function") {
            await Promise.race([
                dbSave(true),
                new Promise((resolve) => setTimeout(resolve, 1500)),
            ]);
        }
    } catch (e) {}

    // Сначала пробуем активировать уже установленную новую версию:
    // её кэш содержит свежие файлы. Если новой версии нет — чистим кэш,
    // и текущий Service Worker запросит всё заново с сервера.
    const updated = await prepareServiceWorkerUpdate(8000);

    if (!updated) {
        // Удаляем только Cache Storage. localStorage (прогресс игры) не трогаем.
        try {
            if (typeof caches !== "undefined" && caches.keys) {
                const keys = await caches.keys();
                await Promise.all(
                    keys
                        .filter((key) => key.indexOf("mcw-") === 0)
                        .map((key) => caches.delete(key))
                );
            }
        } catch (e) {}
    }

    const url = new URL(location.href);
    url.searchParams.set("v", Date.now().toString(36));
    location.replace(url.toString());
}

function startVersionChecks() {
    window.addEventListener("load", () => {
        setTimeout(() => checkAppUpdate(), 1500);
    });
    window.addEventListener("online", () => checkAppUpdate({ force: true }));
    window.addEventListener("mcw:update-seen", () => {
        if (pendingAppVersion) renderAppUpdate();
        checkAppUpdate({ force: true });
    });
    window.addEventListener("mcw:update-open", hideAppUpdate);
    window.addEventListener("storage", (e) => {
        if (e.key === "mcw_upd") checkAppUpdate({ force: true });
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) checkAppUpdate();
    });

    const btn = document.getElementById("appUpdBtn");
    if (btn) btn.addEventListener("click", resetAppCache);
}

startVersionChecks();
window.checkAppUpdate = checkAppUpdate;
