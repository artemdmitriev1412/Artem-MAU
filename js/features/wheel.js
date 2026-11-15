/* Колесо фортуны, шансы и общий рендер интерфейса. */

/* Шанс — честная вероятность для правил игры (выиграл: цель себе, ставка остаётся;
   проиграл: ставка пропадает): p = ценность ставки / (ценность ставки + ценность цели).
   Одинаковые предметы — 50%, цель в 2 раза дороже — 33%, в 3 раза — 25%,
   в 4 раза — 20%, в 6 раз — 14%. Если цель дешевле ставки — шанс выше
   (в 2 раза дешевле — 67%, в 3 раза — 75%), но не 98%. */
function chance() {
    if (!bet || !tgt) return 0;
    const bv = by(bet).v,
        tv = by(tgt).v;
    return Math.max(1, Math.min(97, Math.round((bv / (bv + tv)) * 100)));
}
/* Бонус удачи учитывается при броске. */
function realChance() {
    return Math.max(1, Math.min(99, chance() + luck()));
}
function slot(el, id, n) {
    el.innerHTML = id
        ? `<img class="ic" src="${by(id).img}" alt="">` + (n > 1 ? `<span class="n">${n}</span>` : "")
        : '<span class="q">?</span>';
    if (id) {
        const it = by(id),
            rg = sellRange(id);
        el.dataset.tip = it.n;
        el.dataset.sub = "Ценность: " + (rg ? rg[0].toLocaleString("ru-RU") + "+" : it.v);
    } else {
        delete el.dataset.tip;
    }
}
/* колесо: пиксельная отрисовка — как в старом дизайне */
function paint(c) {
    const cv = $("wc"),
        x = cv.getContext("2d"),
        N = 96,
        d = x.createImageData(N, N),
        a = c * 3.6;
    for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
            const dx = i - N / 2 + 0.5,
                dy = j - N / 2 + 0.5,
                r = Math.hypot(dx, dy);
            if (r > N / 2) continue;
            const h = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1,
                v = 0.82 + 0.36 * h,
                k = (j * N + i) * 4;
            const ang = (Math.atan2(dx, -dy) * 57.2958 + 360) % 360;
            let col;
            if (r > 46.3 || (r <= 45 && r > 43.6) || (r <= 10.5 && r > 8.8)) col = [25, 25, 25];
            else if (r > 45) col = [125, 125, 125].map((z) => z * v);
            else if (r < 8.8) col = [85, 85, 85].map((z) => z * v);
            else if (!c) col = [110, 110, 110].map((z) => z * v);
            else if (((Math.min(Math.abs(ang - a), ang, 360 - ang) * Math.PI) / 180) * r < 1.3)
                col = [25, 25, 25];
            else col = (ang < a ? [62, 165, 62] : [178, 46, 38]).map((z) => z * v);
            d.data.set([col[0], col[1], col[2], 255], k);
        }
    x.putImageData(d, 0, 0);
}
function labels(c) {
    const w = $("wheel");
    w.querySelectorAll(".lbl").forEach((e) => e.remove());
    if (!c || !w.clientWidth) return;
    const a = c * 3.6,
        W = w.clientWidth;
    [
        [a / 2, c],
        [a + (360 - a) / 2, 100 - c],
    ].forEach(([g, t]) => {
        const l = document.createElement("div");
        l.className = "lbl";
        l.textContent = t + "%";
        l.style.transform = `rotate(${g - 90}deg) translateX(${W * 0.27}px) rotate(${90 - g}deg) translate(-50%,-50%)`;
        w.appendChild(l);
    });
}
function setInfo(t, cl) {
    const e = $("info");
    e.textContent = t;
    e.className = "info " + (cl || "");
}
function render() {
    const wheelOn = rMode === "wheel";
    $("rwheel").hidden = !wheelOn;
    $("rclick").hidden = wheelOn;
    $("mrWheel").classList.toggle("on", wheelOn);
    $("mrClick").classList.toggle("on", !wheelOn);
    $("mrWheel").setAttribute("aria-selected", wheelOn);
    $("mrClick").setAttribute("aria-selected", !wheelOn);
    if (!(inv[bet] > 0)) bet = null;
    if (tgt && by(tgt) && by(tgt).nw) tgt = null;
    if (tgt && bet) {
        if (tgt === bet) tgt = null;
        else if (!ok(tgt)) tgt = null;
    }
    slot($("bet"), bet, 0);
    slot($("tgt"), tgt, 0);
    $("bet").disabled = $("tgt").disabled = spinning;
    const box = $("inv");
    box.innerHTML = "";
    const st = [];
    ITEMS.forEach((i) => {
        let n = (inv[i.id] || 0) - (tab === "craft" ? used(i.id) : 0);
        while (n > 0) {
            const s = stk(i.id);
            st.push([i, Math.min(n, s)]);
            n -= s;
        }
    });
    let sk = st.findIndex((e) => e[0].id === bet);
    if (bet && st[betK] && st[betK][0].id === bet) sk = betK;
    if (tab === "furnace" && fIn) sk = st.findIndex((e) => e[0].id === fIn);
    for (let k = 0; k < SL; k++) {
        const e = st[k],
            i = e && e[0];
        let b;
        if (i) {
            b = document.createElement("button");
            b.className = "slot" + (k === sk ? " sel" : "");
            slot(b, i.id, e[1]);
            b.disabled = spinning && tab !== "craft";
            b.onclick = () => {
                snd(500, 0.05, "square");
                if (tab === "craft") {
                    held = held === i.id ? null : i.id;
                    render();
                    return;
                }
                if (tab === "chest") {
                    toChest(i.id, e[1]);
                    return;
                }
                if (tab === "furnace") {
                    pickFurn(i.id);
                    return;
                }
                if (k === sk) {
                    bet = null;
                    betK = -1;
                } else {
                    bet = i.id;
                    betK = k;
                }
                if (bet === tgt) tgt = null;
                hold = false;
                render();
            };
        } else {
            b = document.createElement("div");
            b.className = "slot";
        }
        box.appendChild(b);
    }
    const c = chance();
    paint(c);
    labels(c);
    const icn = $("icnt");
    if (icn) icn.textContent = slotsOf(inv) + " / " + SL + " клеток";
    const g = $("go"),
        full = !!tgt && room(tgt) < 1;
    g.disabled = spinning || !bet || !tgt || full;
    g.classList.toggle("spin", spinning);
    g.textContent = spinning ? "Крутится..." : "Крутить!";
    if (!spinning && !hold) {
        setInfo(
            full
                ? NO_ROOM
                : note
                  ? note
                  : bet && tgt
                    ? `${by(bet).n} → ${by(tgt).n}. Шанс успеха: ${c}%`
                    : ""
        );
        note = "";
    }
    renderClick();
    renderCraft();
    renderChest();
    renderFurn();
    if (tab === "shop") renderShop();
    renderAutoBar();
    renderOffer();
    wallet();
    if (!spinning) save();
    checkGameOver();
}
$("bet").onclick = () => {
    if (bet) {
        bet = null;
        hold = false;
        render();
    }
};
$("tgt").onclick = () => {
    if (spinning) return;
    snd(500, 0.05, "square");
    const g = $("grid");
    g.innerHTML = "";
    ITEMS.filter((i) => !i.c && !i.nw).forEach((i) => {
        const bad = !ok(i.id),
            b = document.createElement("button");
        b.className = "slot" + (i.id === bet || bad ? " dim" : "");
        slot(b, i.id, 0);
        b.disabled = i.id === bet || bad;
        b.onclick = () => {
            tgt = i.id;
            hold = false;
            $("ov").classList.remove("on");
            $("tip").style.display = "none";
            render();
        };
        g.appendChild(b);
    });
    $("ov").classList.add("on");
};
$("ov").onclick = (e) => {
    if (e.target === $("ov")) $("ov").classList.remove("on");
};
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".ov").forEach((o) => o.classList.remove("on"));
    if (e.key === "Escape") closeMenu();
    if (e.key === "Escape") checkGameOver();
});
document.addEventListener("mousemove", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]"),
        tp = $("tip");
    if (!t) {
        tp.style.display = "none";
        return;
    }
    tp.innerHTML = t.dataset.tip + "<small>" + t.dataset.sub + "</small>";
    tp.style.display = "block";
    tp.style.left = Math.min(e.clientX + 14, innerWidth - tp.offsetWidth - 6) + "px";
    tp.style.top = e.clientY - 8 + "px";
});
$("go").onclick = () => {
    if (spinning || !bet || !tgt || !(inv[bet] > 0) || room(tgt) < 1 || !ok(tgt)) return;
    const c = chance(),
        a = c * 3.6,
        win = Math.random() * 100 < realChance(),
        pad = Math.min(6, (win ? a : 360 - a) / 4);
    const lo = win ? pad : a + pad,
        hi = win ? a - pad : 360 - pad,
        ang = lo + Math.random() * (hi - lo);
    rot = Math.ceil(rot / 360) * 360 + 360 * 6 + (360 - ang);
    const b = bet,
        t = tgt;
    spinning = true;
    hold = true;
    render();
    {
        const after = { ...inv };
        if (win) {
            after[t] = (after[t] || 0) + 1;
        } else {
            after[b] -= 1;
            if (after[b] <= 0) delete after[b];
        }
        save(after);
    }
    setInfo("Колесо вращается...");
    snd(300, 0.2, "square", 600);
    $("wheel").style.transform = `rotate(${rot}deg)`;
    setTimeout(() => {
        spinning = false;
        let m, cl;
        if (win) {
            inv[t] = (inv[t] || 0) + 1;
            m = "Успех! Получено: " + by(t).n;
            cl = "win";
            snd(660, 0.12, "square");
            setTimeout(() => snd(990, 0.25, "square"), 120);
            if (!got[t]) {
                got[t] = 1;
                $("ti").src = by(t).img;
                $("tn").textContent = by(t).n;
                $("toast").classList.add("on");
                setTimeout(() => $("toast").classList.remove("on"), 3200);
            }
        } else {
            inv[b] -= 1;
            if (inv[b] <= 0) delete inv[b];
            m = "Провал... Потеряно: " + by(b).n;
            cl = "lose";
            snd(220, 0.4, "sawtooth", 90);
            const g = $("gui");
            g.classList.remove("shake");
            void g.offsetWidth;
            g.classList.add("shake");
        }
        render();
        setInfo(m, cl);
    }, 4700);
};
addEventListener("resize", () => labels(chance()));
