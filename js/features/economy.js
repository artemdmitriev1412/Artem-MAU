/* Монеты, кошелёк и магазин. */

/* ===== Монеты: валюта магазина ===== */
const money = (n) => Math.floor(n).toLocaleString("ru-RU");
const plural = (n, a, b, c) => {
    const k = Math.abs(n) % 100,
        d = k % 10;
    return d === 1 && k !== 11 ? a : d >= 2 && d <= 4 && (k < 10 || k >= 20) ? b : c;
};
const coinsWord = (n) => plural(n, "монету", "монеты", "монет");
function wallet() {
    const t = coinInf ? "∞" : money(coins);
    if ($("wcoins")) $("wcoins").textContent = t;
}
/* цена покупки и продажи считается от ценности предмета */
const buyPrice = (id) => Math.max(2, Math.round(by(id).v * 2));
const sellPrice = (id) => Math.max(1, Math.round(by(id).v));
const saleRoll = (id) => {
    const rg = sellRange(id);
    return rg ? rg[0] + Math.floor(Math.random() * (rg[1] - rg[0] + 1)) : sellPrice(id);
};
let shMode = "buy",
    shQ = "",
    shNote = "";
const coinTag = (n) => `<img src="${coinImg}" alt="">` + money(n);
const coinPlusTag = (a) => `<img src="${coinImg}" alt="">` + money(a) + "+";
function shopMsg(t, bad) {
    const e = $("shmsg");
    if (!e) return;
    e.textContent = t || "";
    e.className = "shmsg" + (t ? (bad ? " bad" : " good") : "");
}
function renderShop() {
    const box = $("shlist");
    if (!box) return;
    const q = shQ.trim().toLowerCase(),
        buy = shMode === "buy";
    const list = ITEMS.filter((i) => {
        if (buy && i.secret) return false;
        if (!buy && !(inv[i.id] > 0)) return false;
        if (!q) return true;
        return i.n.toLowerCase().includes(q) || i.id.includes(q);
    });
    box.innerHTML = "";
    if (!list.length) {
        const e = document.createElement("p");
        e.className = "shmsg";
        e.textContent = buy ? "Ничего не найдено." : "Нечего продавать.";
        box.appendChild(e);
        return;
    }
    list.forEach((it) => {
        const price = buy ? buyPrice(it.id) : sellPrice(it.id),
            rg = buy ? null : sellRange(it.id),
            row = document.createElement("div");
        row.className = "srow";
        const ic = document.createElement("div");
        ic.className = "sic";
        const im = document.createElement("img");
        im.src = it.img;
        im.alt = "";
        ic.appendChild(im);
        const nm = document.createElement("div");
        nm.className = "sname";
        nm.innerHTML =
            "<b></b><small class=\"" +
            (buy ? "buy" : "sell") +
            '">' +
            (rg ? coinPlusTag(rg[0]) : coinTag(price)) +
            "</small>";
        nm.querySelector("b").textContent = it.n;
        nm.querySelector("small").insertAdjacentText("beforeend", " за штуку");
        const bs = document.createElement("div");
        bs.className = "sbtns";
        const has = inv[it.id] || 0;
        const steps = buy ? [1, 10, 64] : [1, 10, 0];
        steps.forEach((n) => {
            const b = document.createElement("button");
            b.className = "sbtn" + (buy ? "" : " sec");
            b.textContent = n ? "×" + n : "всё";
            if (buy) {
                b.disabled = spinning || (!coinInf && coins < price) || room(it.id) < 1;
                b.onclick = () => shBuy(it.id, n);
            } else {
                b.disabled = spinning || has < 1 || (n > 0 && has < n);
                b.onclick = () => shSell(it.id, n || has);
            }
            bs.appendChild(b);
        });
        row.append(ic, nm, bs);
        box.appendChild(row);
    });
    if (shNote) shopMsg(shNote, false);
    else if (buy && list.length && list.every((i) => room(i.id) < 1)) shopMsg(NO_ROOM, true);
    else shopMsg("", false);
    shNote = "";
}
function shBuy(id, n) {
    if (spinning || by(id).secret) return;
    const price = buyPrice(id),
        can = Math.min(n, room(id), coinInf ? Infinity : Math.floor(coins / price));
    if (can < 1) {
        shopMsg(!coinInf && coins < price ? "Не хватает монет." : NO_ROOM, true);
        snd(220, 0.15, "sawtooth");
        return;
    }
    if (!coinInf) coins -= price * can;
    inv[id] = (inv[id] || 0) + can;
    got[id] = 1;
    snd(660, 0.07, "square");
    shNote = "Куплено: " + by(id).n + " ×" + can + " за " + money(price * can) + " " + coinsWord(price * can) + ".";
    render();
}
function shSell(id, n) {
    if (spinning) return;
    const have = inv[id] || 0;
    if (have < 1) return;
    const cnt = Math.min(n, have),
        price = saleRoll(id);
    inv[id] -= cnt;
    if (inv[id] <= 0) delete inv[id];
    coins += price * cnt;
    snd(560, 0.08, "square");
    shNote = "Продано: " + by(id).n + " ×" + cnt + " за " + money(price * cnt) + " " + coinsWord(price * cnt) + ".";
    render();
}
