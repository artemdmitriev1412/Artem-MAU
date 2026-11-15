/* События удачи и экран завершения игры. */

/* ===== События «удачи» ===== */
let EV = [],
    evCol = null,
    udoc = null,
    dt = 0,
    ll = 0;
function luck() {
    return EV.filter((e) => e && (!e.it || e.it === tgt)).reduce((a, e) => a + (e.lk || 0), 0);
}
function reloadEvents() {
    try {
        EV = JSON.parse(localStorage.getItem("mcw_ev") || "[]");
    } catch (e) {
        EV = [];
    }
    if (!Array.isArray(EV)) EV = [];
    ll = -1;
    evRender();
}
function evRender() {
    const l = luck();
    if (l !== ll) {
        ll = l;
        if (!CATALOG_ONLY && !spinning && !hold) render();
    }
}
document
    .querySelectorAll("[data-close]")
    .forEach(
        (b) =>
            (b.onclick = () => {
                b.closest(".ov").classList.remove("on");
                checkGameOver();
            })
    );
/* ===== Игра окончена ===== */
function gameOverOn() {
    return slotsOf(inv) === 0 && !coinInf && coins === 0;
}
function checkGameOver() {
    const g = $("gob");
    if (!g) return;
    const busy = spinning || $("upd").classList.contains("on");
    const on = gameOverOn() && !busy && tab !== "chest";
    if (on) {
        const ch = slotsOf(chest) > 0;
        $("gotitle").textContent = ch ? "Предметы закончились" : "Игра окончена!";
        $("gohint").textContent = ch
            ? "В инвентаре пусто и монет нет. В сундуке ещё есть предметы — забери их, чтобы продолжить."
            : "Предметы и монеты закончились.";
        $("gotake").hidden = !ch;
    }
    g.classList.toggle("on", on);
}
$("gotake").onclick = () => {
    $("gob").classList.remove("on");
    snd(500, 0.06, "square");
    setTab("chest");
};
$("gostart").onclick = () => {
    if (spinning || clkBusy || fBusy) return;
    if (!confirm("Начать заново? Текущий прогресс будет удалён.")) return;
    $("gob").classList.remove("on");
    resetGameState();
    save();
    setTab("roulette");
    snd(660, 0.09, "square");
    setTimeout(() => snd(880, 0.12, "square"), 110);
};
/* ===== Облачное сохранение (работает только внутри артефакта Claude) ===== */
