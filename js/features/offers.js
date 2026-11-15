/* Акция с автокликером. */

/* ===== Акция: автокликер ===== */
const AUTO_COST = 3;
function autoMsg(t, bad) {
    const e = $("automsg");
    if (!e) return;
    e.textContent = t || "";
    e.className = "ofr-msg" + (t ? (bad ? " bad" : " good") : "");
}
function renderOffer() {
    const buy = $("ofrBuy"),
        own = $("ofrOwned"),
        b = $("autobuy"),
        st = $("ofrState");
    if (!buy || !own) return;
    buy.hidden = autoOwned;
    own.hidden = !autoOwned;
    if (autoOwned) {
        autoMsg("");
        if (st) st.textContent = "Куплено";
        return;
    }
    const can = (inv.nblock || 0) >= AUTO_COST;
    if (b) {
        b.disabled = !can;
        b.textContent = "Купить";
    }
    autoMsg(can ? "" : "Нужно 3 незеритовых блока.", !can);
}
$("autobuy").onclick = () => {
    if (spinning || autoOwned) return;
    if (!((inv.nblock || 0) >= AUTO_COST)) {
        autoMsg("Нужно 3 незеритовых блока.", true);
        snd(220, 0.15, "sawtooth");
        return;
    }
    inv.nblock -= AUTO_COST;
    if (inv.nblock <= 0) delete inv.nblock;
    autoOwned = true;
    autoPaused = true;
    snd(660, 0.1, "square");
    setTimeout(() => snd(880, 0.14, "square"), 110);
    render();
};
function renderAutoBar() {
    const bar = $("autobar");
    if (!bar) return;
    bar.hidden = !autoOwned;
    const locked = autoOwned && !autoPaused;
    const lock = $("clklock");
    if (lock) lock.hidden = !locked;
    const clickPage = $("rclick");
    if (clickPage) clickPage.classList.toggle("locked", locked);
    if (!autoOwned) return;
    bar.classList.toggle("paused", !!autoPaused);
    $("autotxt").textContent = autoPaused ? "Автокликер выключен" : "Автокликер включён";
    $("autopause").textContent = autoPaused ? "Включить" : "Пауза";
}
$("autopause").onclick = () => {
    autoPaused = !autoPaused;
    snd(autoPaused ? 330 : 560, 0.06, "square");
    render();
};
/* автокликер просто жмёт «Крутить!» с выбранными ставкой и целью */
function autoRun() {
    if (CATALOG_ONLY || !autoOwned || autoPaused || spinning) return;
    if (!bet || !tgt || !by(bet) || !by(tgt) || !ok(tgt)) return;
    if (!((inv[bet] || 0) > 0) || room(tgt) < 1) return;
    if ($("upd").classList.contains("on") || $("gob").classList.contains("on")) return;
    if ($("ov").classList.contains("on")) return;
    const go = $("go");
    if (!go.disabled) go.click();
}
setInterval(autoRun, 800);
