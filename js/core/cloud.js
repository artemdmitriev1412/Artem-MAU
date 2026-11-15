/* Необязательное облачное сохранение. */

function dbSave(now) {
    if (!udoc) return Promise.resolve();
    clearTimeout(dt);
    const w = () => udoc.set({ inv, bet: bet || "", tgt: tgt || "", got, chest, csl: chestSL, coins, cinf: coinInf ? 1 : 0 }).catch(() => {});
    if (now) return w();
    dt = setTimeout(w, 2000);
}
if (typeof claude === "undefined" || !claude) {
    try {
        EV = JSON.parse(localStorage.getItem("mcw_ev") || "[]");
    } catch (e) {}
}
(async () => {
    try {
        const db = await claude.use("db");
        if (db) {
            evCol = db.collection("events");
            evCol.onSnapshot((s) => {
                EV = s.docs.map((d) => d.data()).filter((e) => e && e.id);
                evRender();
            });
        }
    } catch (e) {}
    try {
        const u = await claude.use("user"),
            db = await claude.use("db");
        if (!u || !db) return;
        udoc = db.collection("data/users/" + (await u.id())).doc("save");
        const sn = await udoc.get();
        if (sn.exists && !spinning) {
            const d = sn.data() || {},
                o = {};
            for (const k in d.inv || {}) {
                const n = Math.floor(+d.inv[k]),
                    m = mg(k);
                if (by(m) && n > 0) o[m] = (o[m] || 0) + n;
            }
            if (Object.keys(o).length) {
                inv = fit(o);
                for (const k in d.got || {}) if (by(k)) got[k] = 1;
                for (const k in inv) got[k] = 1;
                if (d.csl) chestSL = Math.max(10, Math.min(MAXC, Math.floor(+d.csl) || 10));
                if (d.coins != null && isFinite(+d.coins)) coins = Math.max(coins, Math.floor(+d.coins));
                if (d.cinf) coinInf = true;
                {
                    const co = {};
                    for (const k in d.chest || {}) {
                        const n = Math.floor(+d.chest[k]),
                            m = mg(k);
                        if (by(m) && n > 0) co[m] = (co[m] || 0) + n;
                    }
                    if (Object.keys(co).length) {
                        const need = slotsOf(co);
                        if (need > chestSL) chestSL = need;
                        chest = fit(co, chestSL);
                    }
                }
                const cb = mg(d.bet),
                    cg = mg(d.tgt);
                bet = by(cb) && inv[cb] > 0 ? cb : null;
                tgt = by(cg) && cg !== bet ? cg : null;
                render();
            }
        } else dbSave(true);
    } catch (e) {}
})();
setInterval(() => {
    evRender();
}, 5000);
