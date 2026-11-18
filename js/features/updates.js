/* Вкладка обновлений и стартовый баннер. */

/* ===== Вкладка «Обновление» ===== */
function renderUpdates() {
    const box = $("ulist");
    if (!box) return;
    box.innerHTML = "";
    UPDATES.slice(0, 1).forEach((u, idx) => {
        const c = document.createElement("div");
        c.className = "ucard" + (idx === 0 ? " now" : "");
        const h = document.createElement("div");
        h.className = "uhead";
        const v = document.createElement("span");
        v.className = "uver";
        v.textContent = u.v;
        const d = document.createElement("span");
        d.className = "udate";
        d.textContent = u.date || "";
        h.append(v, d);
        const t = document.createElement("div");
        t.className = "utitle";
        t.textContent = u.title || "";
        c.append(h, t);
        if (u.icons && u.icons.length) {
            const ic = document.createElement("div");
            ic.className = "uitems";
            u.icons.forEach((id) => {
                const it = byAny(id);
                if (!it) return;
                const im = document.createElement("img");
                im.src = it.img;
                im.alt = it.n;
                im.title = it.n;
                ic.appendChild(im);
            });
            if (ic.children.length) c.appendChild(ic);
        }
        (u.items || []).forEach(([type, txt]) => {
            const r = document.createElement("div");
            r.className = "urow";
            const g = document.createElement("span");
            g.className = "tag " + type;
            g.textContent = type === "new" ? "НОВОЕ" : type === "fix" ? "ИСПРАВЛЕНО" : "ИЗМЕНЕНО";
            r.append(g, document.createTextNode(txt));
            c.appendChild(r);
        });
        box.appendChild(c);
    });
}
function updSeenKey() {
    const u = UPDATES[0];
    return u ? u.v + "|" + (u.title || "") : "";
}
function showUpd(force) {
    const u = UPDATES[0];
    if (!u) return;
    let seen = null;
    try {
        seen = localStorage.getItem("mcw_upd");
    } catch (e) {}
    if (!force && seen === updSeenKey()) return;
    $("uv").textContent = "ОБНОВЛЕНИЕ " + u.v;
    $("ud").textContent = u.date || "";
    $("ut").textContent = u.title;
    const ic = $("ui");
    ic.innerHTML = "";
    (u.icons || []).forEach((id) => {
        const it = byAny(id);
        if (it) {
            const im = document.createElement("img");
            im.src = it.img;
            im.alt = it.n;
            im.title = it.n;
            ic.appendChild(im);
        }
    });
    const ul = $("ul");
    ul.innerHTML = "";
    u.items.forEach(([t, s]) => {
        const li = document.createElement("li"),
            g = document.createElement("span");
        g.className = "tag " + t;
        g.textContent = t === "new" ? "НОВОЕ" : t === "fix" ? "ИСПРАВЛЕНО" : "ИЗМЕНЕНО";
        li.append(g, document.createTextNode(s));
        ul.appendChild(li);
    });
    $("upd").classList.add("on");
    $("upd").scrollTop = 0;
    window.dispatchEvent(new CustomEvent("mcw:update-open"));
}
function hideUpd() {
    $("upd").classList.remove("on");
    try {
        localStorage.setItem("mcw_upd", updSeenKey());
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("mcw:update-seen"));
    checkGameOver();
}
$("up").onclick = hideUpd;
$("upd").addEventListener("click", (e) => {
    if (e.target === $("upd")) hideUpd();
});
