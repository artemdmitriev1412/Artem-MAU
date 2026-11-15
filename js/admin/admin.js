/* Скрытая панель владельца. */

/* ===== Доступ владельца: проверка на сервере ===== */
let ownerOn = false,
    admLoaded = false,
    admBusy = false,
    staticMode = false;
const ADM_STATIC_KEY = "mcw_adm_static";
const ADM_STATIC_TTL = 30 * 60 * 1000;
function admB64(s) {
    const bin = atob(s),
        out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}
function admStaticSession() {
    try {
        const d = JSON.parse(sessionStorage.getItem(ADM_STATIC_KEY) || "null");
        if (d && +d.exp > Date.now()) return d;
    } catch (e) {}
    return null;
}
function admStaticValid() {
    return !!admStaticSession();
}
async function admVaultUnlock(pw) {
    const v = window.ADM_VAULT;
    if (!v) throw new Error("vault");
    if (!(window.crypto && crypto.subtle)) throw new Error("crypto");
    const base = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(pw),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: admB64(v.salt),
            iterations: +v.iter || 250000,
            hash: "SHA-256",
        },
        base,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
    const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: admB64(v.iv) },
        key,
        admB64(v.data)
    );
    return JSON.parse(new TextDecoder().decode(plain));
}
function ownerMsg(t, bad) {
    const e = $("admMsg");
    e.textContent = t || "";
    e.className = "adm-msg" + (bad ? " bad" : "");
}
async function ownerSession() {
    if (staticMode) return admStaticValid();
    try {
        const r = await fetch("api/session", {
            credentials: "same-origin",
            cache: "no-store",
        });
        if (r.status === 204) return true;
        if (r.ok) {
            const ct = r.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
                try {
                    const d = await r.json();
                    return !!d.ok;
                } catch (e) {
                    return false;
                }
            }
            staticMode = true;
            return admStaticValid();
        }
        if (r.status === 404 || r.status === 405) {
            staticMode = true;
            return admStaticValid();
        }
        return false;
    } catch (e) {
        return false;
    }
}
function ownerTab(on) {
    ownerOn = !!on;
    const b = $("t9"),
        l = $("mnuadmline");
    if (b) {
        b.hidden = !on;
        if (!on) b.classList.remove("on");
    }
    if (l) l.hidden = !on;
}
function ownerGate() {
    $("adm").classList.add("on");
    $("admLogin").hidden = false;
    $("admBody").hidden = true;
    $("admBody").setAttribute("inert", "");
    $("admPw").value = "";
    ownerMsg("");
    setTimeout(() => {
        if (!$("admLogin").hidden) $("admPw").focus();
    }, 60);
}
async function ownerLogin() {
    if (admBusy) return;
    const pw = $("admPw").value.trim();
    if (!pw) {
        ownerMsg("Введи пароль.", true);
        return;
    }
    admBusy = true;
    $("admEnter").disabled = true;
    try {
        if (staticMode) {
            let v;
            try {
                v = await admVaultUnlock(pw);
                if (!v || !v.html || !v.js) throw new Error("vault");
            } catch (e) {
                $("admPw").value = "";
                if (e && e.message === "crypto") {
                    ownerMsg("Для входа нужен HTTPS или localhost.", true);
                } else if (e && e.message === "vault") {
                    ownerMsg("Не удалось открыть панель. Обнови страницу.", true);
                } else {
                    ownerMsg("Неверный пароль.", true);
                }
                return;
            }
            try {
                sessionStorage.setItem(
                    ADM_STATIC_KEY,
                    JSON.stringify({
                        exp: Date.now() + ADM_STATIC_TTL,
                        html: v.html,
                        js: v.js,
                    })
                );
            } catch (e) {}
            $("admPw").value = "";
            ownerMsg("");
            ownerTab(true);
            admBusy = false;
            $("admEnter").disabled = false;
            await ownerOpen();
            return;
        }
        const r = await fetch("api/login", {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
            headers: { "Content-Type": "application/json", "X-MCW": "1" },
            body: JSON.stringify({ password: pw }),
        });
        let d = {};
        try {
            d = await r.json();
        } catch (e) {}
        if (r.ok) {
            $("admPw").value = "";
            ownerMsg("");
            ownerTab(true);
            admBusy = false;
            $("admEnter").disabled = false;
            await ownerOpen();
            return;
        }
        $("admPw").value = "";
        if (r.status === 429) {
            ownerMsg("Слишком много попыток. Подожди " + Math.max(1, Math.ceil(+d.retry || 0)) + " с.", true);
        } else if (r.status === 401) {
            ownerMsg("Неверный пароль." + (d.left > 0 ? " Осталось попыток: " + d.left : ""), true);
        } else {
            ownerMsg("Не удалось войти. Попробуй ещё.", true);
        }
    } catch (e) {
        ownerMsg("Сервер недоступен.", true);
    } finally {
        admBusy = false;
        $("admEnter").disabled = false;
        if (!$("admLogin").hidden) $("admPw").focus();
    }
}
function ownerScript() {
    return new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "admin-panel.js";
        s.onload = () => res();
        s.onerror = () => rej(new Error("script"));
        document.head.appendChild(s);
    });
}
async function ownerOpen() {
    if (admBusy) return;
    if (staticMode) {
        const s = admStaticSession();
        if (!s || !s.html || !s.js) {
            ownerTab(false);
            ownerGate();
            return;
        }
        ownerTab(true);
        if (typeof window.admWatch === "function") window.admWatch();
        if (!admLoaded) {
            admBusy = true;
            try {
                $("admBody").innerHTML = s.html;
                window.ADM_STATIC = true;
                const sc = document.createElement("script");
                sc.textContent = s.js;
                document.head.appendChild(sc);
                admLoaded = true;
                if (typeof window.admInit === "function") window.admInit();
            } catch (e) {
                $("admBody").innerHTML = "";
                ownerMsg("Не удалось открыть панель. Обнови страницу.", true);
                return;
            } finally {
                admBusy = false;
            }
        } else if (typeof window.admRender === "function") {
            window.admRender();
        }
        $("adm").classList.add("on");
        $("admLogin").hidden = true;
        $("admBody").hidden = false;
        $("admBody").removeAttribute("inert");
        return;
    }
    let r;
    try {
        r = await fetch("api/admin", {
            credentials: "same-origin",
            cache: "no-store",
        });
    } catch (e) {
        r = null;
    }
    if (!r || !r.ok) {
        ownerTab(await ownerSession());
        ownerGate();
        return;
    }
    ownerTab(true);
    window.ADM_STATIC = false;
    if (typeof window.admWatch === "function") window.admWatch();
    if (!admLoaded) {
        admBusy = true;
        try {
            const r = await fetch("admin-panel.html", {
                credentials: "same-origin",
                cache: "no-store",
            });
            if (r.status === 401 || r.status === 404) {
                ownerGate();
                return;
            }
            if (!r.ok) throw new Error("http");
            $("admBody").innerHTML = await r.text();
            await ownerScript();
            admLoaded = true;
            if (typeof window.admInit === "function") window.admInit();
        } catch (e) {
            $("admBody").innerHTML = "";
            ownerMsg("Не удалось открыть панель. Обнови страницу.", true);
            return;
        } finally {
            admBusy = false;
        }
    } else if (typeof window.admRender === "function") {
        window.admRender();
    }
    $("adm").classList.add("on");
    $("admLogin").hidden = true;
    $("admBody").hidden = false;
    $("admBody").removeAttribute("inert");
}
function ownerClose() {
    $("adm").classList.remove("on");
    $("admBody").setAttribute("inert", "");
    ownerMsg("");
    checkGameOver();
}
async function ownerInit() {
    $("admClose").onclick = ownerClose;
    $("admEnter").onclick = ownerLogin;
    $("admPw").addEventListener("keydown", (e) => {
        if (e.key === "Enter") ownerLogin();
    });
    $("t9").onclick = () => {
        closeMenu();
        ownerOpen();
    };
    const ttl = $("ttl");
    let hold = 0;
    const stop = () => {
        clearTimeout(hold);
        hold = 0;
    };
    ttl.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        stop();
        hold = setTimeout(() => {
            hold = 0;
            ownerOpen();
        }, 1400);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((n) => ttl.addEventListener(n, stop));
    window.addEventListener("pointerup", stop);
    ttl.addEventListener("contextmenu", (e) => e.preventDefault());
    if (new URLSearchParams(location.search).has("admin")) {
        try {
            history.replaceState(null, "", location.pathname + location.hash);
        } catch (e) {}
        ownerOpen();
    } else {
        ownerTab(await ownerSession());
    }
}
