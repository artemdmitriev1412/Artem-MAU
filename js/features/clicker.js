/* Кликер: генератор предметов и таблица шансов. */

/* ===== Кликер: генератор случайных предметов (10 в день) ===== */
const clkPrice = (id) => Math.max(1, Math.round(by(id).v));
function coinWord(n) {
    const a = Math.abs(n) % 100,
        b = a % 10;
    if (a > 10 && a < 20) return "монет";
    if (b === 1) return "монета";
    if (b >= 2 && b <= 4) return "монеты";
    return "монет";
}
/* шанс зависит от ценности: вес = 1 / цена^0.6 */
const CLK_EXP = 0.6;
const CLK_SECRET_ID = "bedrock";
const CLK_SECRET_PCT = 0.0001;
const clkNormal = () => ITEMS.filter((i) => !i.secret);
function clkWeights(list) {
    let total = 0;
    const w = [];
    list.forEach((i) => {
        const x = 1 / Math.pow(Math.max(1, i.v), CLK_EXP);
        w.push(x);
        total += x;
    });
    return { w, total };
}
let clkBase = null;
const clkBaseData = () => (clkBase = clkBase || clkWeights(clkNormal()));
function clkTable() {
    const list = clkNormal();
    const { w, total } = clkBaseData();
    const rows = list.map((it, k) => ({ it, p: (w[k] / total) * (100 - CLK_SECRET_PCT) }));
    const secret = by(CLK_SECRET_ID);
    if (secret) rows.push({ it: secret, p: CLK_SECRET_PCT });
    return rows.sort((a, b) => b.p - a.p);
}
function clkPickOne() {
    const list = clkNormal();
    const { w, total } = clkBaseData();
    let r = Math.random() * total;
    for (let k = 0; k < list.length; k++) {
        r -= w[k];
        if (r <= 0) return list[k];
    }
    return list[list.length - 1];
}
/* Бонус кликера: с шансом clkLuck% выпадают самые дорогие предметы.
   Секретный бедрок тоже входит в богатый пул: с включённым бонусом его
   реально увидеть за 20–30 нажатий, а без бонуса остаётся базовый 0,0001%. */
const CLK_RICH_V = 100;
const clkRichList = () => {
    const list = ITEMS.filter((i) => i.v >= CLK_RICH_V || i.secret);
    const secret = list.find((i) => i.secret);
    if (secret && clkLuck >= 100) list.push(secret);
    return list;
};
function clkPick() {
    if (Math.random() * 100 < CLK_SECRET_PCT) return by(CLK_SECRET_ID);
    if (clkLuck > 0 && Math.random() * 100 < clkLuck) {
        const list = clkRichList();
        return list[(Math.random() * list.length) | 0];
    }
    return clkPickOne();
}
const fmtPct = (p) =>
    (p >= 10 ? String(Math.round(p * 10) / 10) : p >= 1 ? p.toFixed(1) : p >= 0.01 ? p.toFixed(2) : p.toFixed(4)).replace(
        ".",
        ","
    );
function renderChances() {
    const box = $("chlist");
    if (!box) return;
    box.innerHTML = "";
    clkTable().forEach(({ it, p }) => {
        const row = document.createElement("div");
        row.className = "chrow" + (p < 0.5 ? " rare" : "") + (it.secret ? " secret" : "");
        const im = document.createElement("img");
        im.src = it.img;
        im.alt = "";
        const nm = document.createElement("span");
        nm.className = "nm";
        nm.textContent = it.n;
        const pc = document.createElement("span");
        pc.className = "pc";
        pc.textContent = fmtPct(p) + "%";
        row.append(im, nm, pc);
        box.appendChild(row);
    });
}
function showClk(id) {
    const it = by(id);
    if (!it) return;
    $("clkph").hidden = true;
    const ic = $("clkic");
    if (ic.getAttribute("src") !== it.img) ic.src = it.img;
    ic.alt = it.n;
    ic.hidden = false;
    const nm = $("clknm");
    nm.textContent = it.n;
    nm.hidden = false;
    const pr = $("clkpr"),
        p = clkPrice(id),
        rg = sellRange(id),
        priceText = rg ? money(rg[0]) + "+" : money(p);
    pr.innerHTML = "";
    const im = document.createElement("img");
    im.src = coinImg;
    im.alt = "";
    const b = document.createElement("b");
    b.textContent = priceText;
    const sp = document.createElement("span");
    sp.textContent = coinWord(p);
    pr.append(im, b, sp);
    pr.title = "Цена продажи: " + (rg ? "от " : "") + priceText + " " + coinWord(p);
    pr.hidden = false;
}
function clkBurst(v) {
    const box = $("clkbox"),
        cols = v >= 100 ? ["#f2c96b", "#ffe9a8", "#ff9d95", "#fff"] : ["#3ddc8a", "#f2c96b", "#9ef7c2"],
        n = v >= 100 ? 24 : 14;
    for (let k = 0; k < n; k++) {
        const s = document.createElement("i");
        s.className = "clk-spark";
        s.style.setProperty("--sc", cols[k % cols.length]);
        const a = Math.random() * Math.PI * 2,
            d = 46 + Math.random() * 96;
        s.style.setProperty("--dx", Math.cos(a) * d + "px");
        s.style.setProperty("--dy", Math.sin(a) * d + "px");
        s.style.left = 50 + (Math.random() * 26 - 13) + "%";
        s.style.top = 50 + (Math.random() * 26 - 13) + "%";
        const sz = 4 + ((Math.random() * 5) | 0);
        s.style.width = s.style.height = sz + "px";
        box.appendChild(s);
        setTimeout(() => s.remove(), 1000);
    }
}
function renderClick() {
    if (clkDay !== dayKey()) {
        clkDay = dayKey();
        clkUsed = 0;
    }
    const chip = $("clkleft"),
        go = $("clkgo");
    if (!chip || !go) return;
    const left = clkInf ? CLICKS_MAX : Math.max(0, CLICKS_MAX - clkUsed);
    chip.textContent = clkInf ? "∞" : left + " / " + CLICKS_MAX;
    chip.classList.toggle("off", !clkInf && left < 1);
    chip.classList.toggle("inf", clkInf);
    go.disabled = clkBusy || (!clkInf && left < 1);
    const bw = $("mrWheel"),
        bc = $("mrClick");
    if (bw && bc) bw.disabled = bc.disabled = clkBusy;
    if (clkBusy) return;
    if (clkLast && by(clkLast)) showClk(clkLast);
    else {
        $("clkph").hidden = false;
        $("clkic").hidden = true;
        $("clknm").hidden = true;
        $("clkpr").hidden = true;
    }
    const txt = $("clkmsg");
    if (!clkInf && left < 1 && !clkNote) {
        txt.className = "clk-msg bad";
        txt.textContent = "Клики на сегодня закончились. Приходи завтра.";
    } else {
        txt.className = "clk-msg " + clkMood;
        txt.textContent = clkNote || "10 кликов в день. Жми — предмет упадёт в инвентарь.";
    }
}
$("mrWheel").onclick = () => {
    if (clkBusy) return;
    rMode = "wheel";
    snd(500, 0.04, "square");
    render();
};
$("mrClick").onclick = () => {
    if (clkBusy) return;
    rMode = "click";
    snd(520, 0.05, "square");
    render();
};
$("clkgo").addEventListener(
    "click",
    (e) => {
        if (autoOwned && !autoPaused && e.isTrusted) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    },
    true
);
$("clkgo").onclick = () => {
    if (clkBusy) return;
    if (clkDay !== dayKey()) {
        clkDay = dayKey();
        clkUsed = 0;
    }
    if (!clkInf && CLICKS_MAX - clkUsed < 1) {
        clkNote = "";
        clkMood = "bad";
        render();
        return;
    }
    const it = clkPick();
    if (room(it.id) < 1) {
        clkNote = NO_ROOM;
        clkMood = "bad";
        snd(220, 0.12, "sawtooth");
        render();
        return;
    }
    clkBusy = true;
    clkNote = "Генератор крутит...";
    clkMood = "";
    $("clkmsg").className = "clk-msg";
    $("clkmsg").textContent = clkNote;
    $("clkgo").disabled = true;
    $("mrWheel").disabled = $("mrClick").disabled = true;
    const box = $("clkbox");
    box.classList.remove("hit", "secret-hit", "secret-roll");
    $("clkic").classList.remove("in");
    box.classList.add("roll");
    const secret = !!it.secret,
        started = performance.now(),
        total = secret ? 1700 : 1300;
    let tick = 0,
        stopped = false,
        rollTimer = 0;
    const rollStep = () => {
        if (stopped) return;
        showClk(ITEMS[(Math.random() * ITEMS.length) | 0].id);
        if (tick++ % 2 === 0) snd(360 + Math.random() * 460, 0.02, "square");
        const elapsed = performance.now() - started;
        if (elapsed >= total) return;
        let delay = 65;
        if (secret && elapsed > 420) delay = 95 + Math.min(240, (elapsed - 420) * 0.28);
        rollTimer = setTimeout(rollStep, delay);
    };
    rollStep();
    if (secret) setTimeout(() => box.classList.add("secret-roll"), 400);
    setTimeout(() => {
        stopped = true;
        clearTimeout(rollTimer);
        box.classList.remove("roll", "secret-roll");
        inv[it.id] = (inv[it.id] || 0) + 1;
        if (!clkInf) clkUsed = Math.min(CLICKS_MAX, clkUsed + 1);
        clkLast = it.id;
        clkBusy = false;
        showClk(it.id);
        $("clkic").classList.add("in");
        setTimeout(() => $("clkic").classList.remove("in"), 700);
        box.classList.add("hit");
        setTimeout(() => box.classList.remove("hit"), 620);
        const tail = !clkInf && clkUsed >= CLICKS_MAX ? "Клики на сегодня закончились." : "+1 в инвентарь.";
        if (secret) {
            clkNote = "Секретная находка: " + it.n + "! " + tail;
            clkMood = "secret";
            box.classList.add("secret-hit");
            setTimeout(() => box.classList.remove("secret-hit"), 2200);
            snd(110, 0.35, "sawtooth", 55);
            setTimeout(() => snd(980, 0.18, "triangle", 1470), 90);
        } else {
            clkBurst(it.v);
            clkNote = "Выпало: " + it.n + ". " + tail;
            clkMood = "win";
            snd(660, 0.1, "square");
            setTimeout(() => snd(880, 0.12, "square"), 100);
            setTimeout(() => snd(1180, 0.18, "square"), 200);
        }
        render();
    }, total);
};
$("clkhelp").onclick = () => {
    snd(600, 0.05, "square");
    renderChances();
    $("clkov").classList.add("on");
};
$("clkov").onclick = (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("on");
};
