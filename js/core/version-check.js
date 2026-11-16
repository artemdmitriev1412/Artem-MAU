/* Проверка актуальной версии приложения и плашка «Доступно обновление». */

const APP_VERSION_URL =
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
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), APP_VERSION_TIMEOUT_MS);
        const res = await fetch(APP_VERSION_URL, {
            cache: "no-cache",
            signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return;

        const data = await res.json();
        const latest = data && data.latest != null ? String(data.latest) : "";
        if (!APP_VERSION_RE.test(latest)) return;

        pendingAppVersion = appVersionNewer(latest, seenAppVersion()) ? latest : "";
        renderAppUpdate();
    } catch (e) {
        // Офлайн или таймаут: молча остаёмся на текущей версии.
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
    try {
        await fetch(APP_VERSION_URL, { cache: "reload" });
    } catch (e) {
        if (btn) btn.textContent = "Нет сети";
        setTimeout(resetUpdateButton, 2500);
        return;
    }

    try {
        if (typeof dbSave === "function") await dbSave(true);
    } catch (e) {}

    try {
        if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((reg) => reg.unregister()));
        }
    } catch (e) {}

    // Удаляем только Cache Storage. localStorage (прогресс игры) не трогаем.
    try {
        if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((key) => key.indexOf("mcw-") === 0)
                    .map((key) => caches.delete(key))
            );
        }
    } catch (e) {}

    const url = new URL(location.href);
    url.searchParams.set("v", Date.now().toString(36));
    location.replace(url.toString());
}

function startVersionChecks() {
    window.addEventListener("load", () => {
        setTimeout(() => checkAppUpdate(), 1500);
    });
    window.addEventListener("online", () => checkAppUpdate({ force: true }));
    window.addEventListener("mcw:update-seen", () => checkAppUpdate({ force: true }));
    window.addEventListener("mcw:update-open", hideAppUpdate);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) checkAppUpdate();
    });

    const btn = document.getElementById("appUpdBtn");
    if (btn) btn.addEventListener("click", resetAppCache);
}

startVersionChecks();
window.checkAppUpdate = checkAppUpdate;
