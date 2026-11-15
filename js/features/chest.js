/* Сундук: хранение и расширение. */

/* ===== Сундук: хранилище на 54 клетки ===== */
const chestMsg = (t) => {
    const e = $("chh");
    if (e) e.textContent = t;
};
function chestInfo() {
    const u1 = $("up1"),
        u10 = $("up10");
    if (u1) u1.disabled = spinning || chestSL >= MAXC || !((inv.pearl || 0) >= 1);
    if (u10) u10.disabled = spinning || chestSL + 10 > MAXC || !((inv.dblock || 0) >= 1);
    const c2 = $("csl2");
    if (c2) c2.textContent = chestSL + " / " + MAXC + " клеток";
    const br = $("cbar");
    if (br) br.style.width = Math.round((chestSL / MAXC) * 100) + "%";
}
function renderChest() {
    const box = $("chst");
    if (!box) return;
    box.innerHTML = "";
    const st = [];
    ITEMS.forEach((i) => {
        let n = chest[i.id] || 0;
        while (n > 0) {
            const s = stk(i.id);
            st.push([i, Math.min(n, s)]);
            n -= s;
        }
    });
    for (let k = 0; k < chestSL; k++) {
        const e = st[k],
            i = e && e[0];
        let b;
        if (i) {
            b = document.createElement("button");
            b.className = "slot";
            slot(b, i.id, e[1]);
            b.disabled = spinning;
            b.onclick = () => fromChest(i.id, e[1]);
        } else {
            b = document.createElement("div");
            b.className = "slot";
        }
        box.appendChild(b);
    }
    chestInfo();
}
function toChest(id, want) {
    if (spinning) return;
    if (!id || !(inv[id] > 0)) return;
    const sp = chestRoom(id);
    if (sp <= 0) {
        chestMsg("В сундуке нет свободного места. Улучши сундук.");
        snd(220, 0.15, "sawtooth");
        return;
    }
    const total = inv[id],
        w = Math.max(1, Math.min(want || total, total)),
        n = Math.min(total, sp, w);
    if (n <= 0) return;
    inv[id] -= n;
    if (inv[id] <= 0) delete inv[id];
    chest[id] = (chest[id] || 0) + n;
    snd(560, 0.08, "square");
    chestMsg(
        "Перенесено " + n + "× " + by(id).n + " в сундук." + (n < w ? " В сундуке закончилось место." : "")
    );
    render();
}
function fromChest(id, want) {
    if (spinning) return;
    const sp = room(id);
    if (sp <= 0) {
        chestMsg(NO_ROOM);
        snd(220, 0.15, "sawtooth");
        return;
    }
    const total = chest[id] || 0,
        w = Math.max(1, Math.min(want || total, total)),
        n = Math.min(total, sp, w);
    if (n <= 0) return;
    chest[id] -= n;
    if (chest[id] <= 0) delete chest[id];
    inv[id] = (inv[id] || 0) + n;
    snd(500, 0.06, "square");
    chestMsg("Возвращено " + n + "× " + by(id).n + " в инвентарь." + (n < w ? " " + NO_ROOM : ""));
    render();
}
function upChest(n, costId, costN) {
    if (spinning) return;
    if (chestSL >= MAXC) {
        chestMsg("Сундук уже максимального размера: " + MAXC + " клеток.");
        snd(220, 0.15, "sawtooth");
        return;
    }
    if (chestSL + n > MAXC) {
        chestMsg("До максимума осталось " + (MAXC - chestSL) + " клеток — улучшай по +1.");
        snd(220, 0.15, "sawtooth");
        return;
    }
    if (!((inv[costId] || 0) >= costN)) {
        chestMsg("Нужен предмет: " + costN + "× " + by(costId).n + ".");
        snd(220, 0.15, "sawtooth");
        return;
    }
    inv[costId] -= costN;
    if (inv[costId] <= 0) delete inv[costId];
    chestSL += n;
    snd(660, 0.1, "square");
    chestMsg("Сундук улучшен: +" + n + (n === 1 ? " клетка" : " клеток") + ". Теперь клеток: " + chestSL + " из " + MAXC + ".");
    render();
    requestAnimationFrame(chestInfo);
}
$("up1").onclick = () => upChest(1, "pearl", 1);
$("up10").onclick = () => upChest(10, "dblock", 1);
