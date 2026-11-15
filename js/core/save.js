/* Сохранение, загрузка и синхронизация прогресса. */

function readSave() {
    const parse = (key) => {
        try {
            const v = JSON.parse(localStorage.getItem(key) || "null");
            return v && typeof v === "object" ? v : null;
        } catch (e) {
            return null;
        }
    };
    let s = parse(SAVE_KEY);
    if (!s) {
        const box = parse(SLOT_KEY);
        if (box && Array.isArray(box.slots)) {
            const i = Math.max(0, Math.min(box.slots.length - 1, Math.floor(+box.active) || 0));
            s = box.slots[i] || box.slots.find((x) => x && typeof x === "object") || null;
        }
    }
    return s;
}
function spillInv() {
    if (slotsOf(inv) <= SL) return;
    for (const id in inv) {
        while (inv[id] > 0 && slotsOf(inv) > SL) {
            const r = chestRoom(id);
            if (r < 1) break;
            const n = Math.min(inv[id], r);
            inv[id] -= n;
            if (inv[id] <= 0) delete inv[id];
            chest[id] = (chest[id] || 0) + n;
        }
        if (slotsOf(inv) <= SL) break;
    }
    if (slotsOf(inv) > SL) inv = fit(inv, SL);
}
function applySave(s) {
    resetGameState();
    if (!s || typeof s !== "object") return;
    try {
        if (s.inv) {
            const o = {};
            for (const k in s.inv) {
                const n = Math.floor(+s.inv[k]),
                    m = mg(k);
                if (by(m) && n > 0) o[m] = (o[m] || 0) + n;
            }
            inv = Object.keys(o).length ? o : {};
        }
        if (s.csl != null && isFinite(+s.csl)) chestSL = Math.max(10, Math.min(MAXC, Math.floor(+s.csl) || 10));
        if (s.chest) {
            const o = {};
            for (const k in s.chest) {
                const n = Math.floor(+s.chest[k]),
                    m = mg(k);
                if (by(m) && n > 0) o[m] = (o[m] || 0) + n;
            }
            if (Object.keys(o).length) {
                const need = slotsOf(o);
                if (need > chestSL) chestSL = Math.min(MAXC, need);
                chest = fit(o, chestSL);
            }
        }
        spillInv();
        {
            const sb = mg(s.bet),
                sg = mg(s.tgt);
            if (by(sb) && inv[sb] > 0) bet = sb;
            if (by(sg) && !by(sg).nw && sg !== bet && ok(sg)) tgt = sg;
        }
        if (s.got) for (const k in s.got) if (by(k)) got[k] = 1;
        if (s.coins != null && isFinite(+s.coins)) coins = Math.max(0, Math.floor(+s.coins));
        coinInf = !!s.cinf;
        if (s.auto != null && isFinite(+s.auto)) autoOwned = +s.auto > 0;
        autoPaused = !!s.ap;
        if (typeof s.cd === "string") clkDay = s.cd;
        if (s.cu != null && isFinite(+s.cu)) clkUsed = Math.max(0, Math.floor(+s.cu));
        if (s.cl != null && isFinite(+s.cl)) clkLuck = Math.max(0, Math.min(100, Math.floor(+s.cl)));
        clkInf = !!s.ci;
        if (typeof s.ff === "string") fFuel = s.ff;
        if (s.heat != null && isFinite(+s.heat)) fHeat = Math.max(0, Math.floor(+s.heat));
        else if (s.fb != null && isFinite(+s.fb)) fHeat = Math.max(0, Math.floor(+s.fb));
        if (s.rm === "click" || s.rm === "wheel") rMode = s.rm;
        if (TABS.includes(s.tb)) tab = s.tb;
    } catch (e) {
        storeOk = false;
    }
}
function loadStore() {
    applySave(readSave());
    if (!CATALOG_ONLY) {
        try {
            localStorage.removeItem(SLOT_KEY);
        } catch (e) {}
    }
}
function save(d) {
    if (CATALOG_ONLY || suppressSave) return;
    const data = { inv: d || inv, bet, tgt, got, chest, csl: chestSL, coins, cinf: coinInf ? 1 : 0, auto: autoOwned ? 1 : 0, ap: autoPaused ? 1 : 0, ff: fFuel, heat: fHeat, cd: clkDay, cu: clkUsed, cl: clkLuck, ci: clkInf ? 1 : 0, rm: rMode, tb: tab, ts: Date.now() };
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        storeOk = false;
    }
    if (typeof dbSave === "function") dbSave();
}
function syncFromAdmin() {
    if (CATALOG_ONLY) return;
    if (spinning || clkBusy || fBusy) {
        pendingSync = true;
        return;
    }
    const s = readSave();
    if (!s) return;
    suppressSave = true;
    try {
        applySave(s);
        if (clkDay !== dayKey()) {
            clkDay = dayKey();
            clkUsed = 0;
        }
        for (const k in inv) got[k] = 1;
        setTab(tab);
    } finally {
        suppressSave = false;
    }
}
window.addEventListener("storage", (e) => {
    if (e.key === "mcw_sync") {
        pendingSync = true;
        if (!document.hidden) {
            pendingSync = false;
            syncFromAdmin();
        }
    } else if (e.key === "mcw_ev") reloadEvents();
});
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pendingSync) {
        pendingSync = false;
        syncFromAdmin();
    }
});
setInterval(() => {
    if (pendingSync && !spinning && !clkBusy && !fBusy) {
        pendingSync = false;
        syncFromAdmin();
    }
}, 1500);
loadStore();
if (clkDay !== dayKey()) {
    clkDay = dayKey();
    clkUsed = 0;
}
for (const k in inv) got[k] = 1;
