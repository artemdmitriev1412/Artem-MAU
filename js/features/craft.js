/* Верстак: рецепты, сетка 3x3 и сборка. */

/* ===== Верстак: рецепты, стол 3x3 и сборка ===== */
// плавка в печи (интерфейс печи добавим позже)
/* печь: что во что плавится (need — сколько предметов уходит на 1 результат) */
const SMELT = {
    coalore: { out: "coal", need: 1 },
    copperore: { out: "copper", need: 1 },
    ironore: { out: "iron", need: 1 },
    lapisore: { out: "lapis", need: 1 },
    quartzore: { out: "quartz", need: 1 },
    redore: { out: "red", need: 1 },
    goldore: { out: "gold", need: 1 },
    diaore: { out: "dia", need: 1 },
    emore: { out: "em", need: 1 },
    sand: { out: "glass", need: 1 },
    log: { out: "charcoal", need: 1 },
    debris: { out: "scrap", need: 1 },
};
/* топливо: сколько жара даёт 1 предмет */
const FUEL = { coalblock: 80, coal: 8, charcoal: 6, planks: 2, stick: 1 };
const have = (id) => inv[id] || 0;
/* @CRAFT-LOGIC-START */
// pat — схема на столе ('.' = пусто), key — какой предмет за какой буквой; shapeless — без формы.
// Новый рецепт = ещё одна строка в этом списке.
const RECIPES = [
    { id: "planks", out: "planks", n: 4, shapeless: ["log"] },
    { id: "stick", out: "stick", n: 4, pat: ["p", "p"], key: { p: "planks" } },
    { id: "torch", out: "torch", n: 4, pat: ["c", "s"], key: { c: "coal", s: "stick" } },
    { id: "torch2", out: "torch", n: 4, pat: ["c", "s"], key: { c: "charcoal", s: "stick" } },
    { id: "tnt", out: "tnt", n: 1, pat: ["gsg", "sgs", "gsg"], key: { g: "gunp", s: "sand" } },
    {
        id: "neth",
        out: "neth",
        n: 1,
        shapeless: ["scrap", "scrap", "scrap", "scrap", "gold", "gold", "gold", "gold"],
    },
    { id: "gapple", out: "gapple", n: 1, pat: ["ggg", "gag", "ggg"], key: { g: "gold", a: "apple" } },
    { id: "blazep", out: "blazep", n: 2, shapeless: ["blaze"] },
    { id: "eye", out: "eye", n: 1, shapeless: ["pearl", "blazep"] },
    { id: "iblock", out: "iblock", n: 1, pat: ["iii", "iii", "iii"], key: { i: "iron" } },
    { id: "gblock", out: "gblock", n: 1, pat: ["ggg", "ggg", "ggg"], key: { g: "gold" } },
    { id: "dblock", out: "dblock", n: 1, pat: ["ddd", "ddd", "ddd"], key: { d: "dia" } },
    { id: "coalblock", out: "coalblock", n: 1, pat: ["kkk", "kkk", "kkk"], key: { k: "coal" } },
    { id: "cublock", out: "cublock", n: 1, pat: ["ccc", "ccc", "ccc"], key: { c: "copper" } },
    { id: "lapblock", out: "lapblock", n: 1, pat: ["lll", "lll", "lll"], key: { l: "lapis" } },
    { id: "redblock", out: "redblock", n: 1, pat: ["rrr", "rrr", "rrr"], key: { r: "red" } },
    { id: "qblock", out: "qblock", n: 1, pat: ["qqq", "qqq", "qqq"], key: { q: "quartz" } },
    { id: "eblock", out: "eblock", n: 1, pat: ["eee", "eee", "eee"], key: { e: "em" } },
];
[
    ["w", "planks"],
    ["s", "cobble"],
    ["i", "iron"],
    ["d", "dia"],
].forEach(([m, id]) =>
    RECIPES.push(
        { id: m + "pick", out: m + "pick", n: 1, pat: ["hhh", ".s.", ".s."], key: { h: id, s: "stick" } },
        { id: m + "sword", out: m + "sword", n: 1, pat: ["h", "h", "s"], key: { h: id, s: "stick" } }
    )
);
/* --- незеритовый блок --- */
RECIPES.push({ id: "nblock", out: "nblock", n: 1, pat: ["nnn", "nnn", "nnn"], key: { n: "neth" } });
// сколько чего нужно для рецепта
function recipeNeed(rc) {
    const need = {};
    if (rc.shapeless) rc.shapeless.forEach((id) => (need[id] = (need[id] || 0) + 1));
    else
        rc.pat.forEach((s) =>
            [...s].forEach((ch) => {
                if (ch !== ".") {
                    const id = rc.key[ch];
                    need[id] = (need[id] || 0) + 1;
                }
            })
        );
    return need;
}
// какой рецепт получился на столе (форма может стоять в любом месте и быть зеркальной)
function gridMatch() {
    let r0 = 9,
        r1 = -1,
        c0 = 9,
        c1 = -1;
    grid.forEach((v, i) => {
        if (v) {
            const r = Math.floor(i / 3),
                c = i % 3;
            r0 = Math.min(r0, r);
            r1 = Math.max(r1, r);
            c0 = Math.min(c0, c);
            c1 = Math.max(c1, c);
        }
    });
    if (r1 < 0) return null;
    const h = r1 - r0 + 1,
        w = c1 - c0 + 1,
        flat = grid.filter(Boolean);
    for (const rc of RECIPES) {
        if (rc.shapeless) {
            if (
                flat.length === rc.shapeless.length &&
                [...rc.shapeless].sort().join() === [...flat].sort().join()
            )
                return rc;
            continue;
        }
        const W = Math.max(...rc.pat.map((s) => s.length));
        if (rc.pat.length !== h || W !== w) continue;
        const rows = rc.pat.map((s) => s.padEnd(W, "."));
        const test = (rr) =>
            rr.every((s, r) =>
                [...s].every(
                    (ch, c) => (ch === "." ? null : rc.key[ch]) === (grid[(r0 + r) * 3 + c0 + c] || null)
                )
            );
        if (test(rows) || test(rows.map((s) => [...s].reverse().join("")))) return rc;
    }
    return null;
}
// выложить рецепт на стол из инвентаря
function fillRecipe(rc, quiet) {
    const need = recipeNeed(rc),
        lack = Object.keys(need).filter((id) => have(id) < need[id]);
    grid = Array(9).fill(null);
    if (lack.length) {
        if (!quiet)
            cmsg = "Не хватает: " + lack.map((id) => by(id).n + " ×" + (need[id] - have(id))).join(", ");
        return false;
    }
    if (rc.shapeless) rc.shapeless.forEach((id, i) => (grid[i] = id));
    else
        rc.pat.forEach((s, r) =>
            [...s].forEach((ch, c) => {
                if (ch !== ".") grid[r * 3 + c] = rc.key[ch];
            })
        );
    return true;
}
/* @CRAFT-LOGIC-END */
const used = (id) => grid.filter((x) => x === id).length;
function pruneGrid() {
    const c = {};
    grid.forEach((id, i) => {
        if (!id) return;
        c[id] = (c[id] || 0) + 1;
        if (c[id] > have(id)) grid[i] = null;
    });
}
function toastGot(id) {
    $("ti").src = by(id).img;
    $("tn").textContent = by(id).n;
    $("toast").classList.add("on");
    setTimeout(() => $("toast").classList.remove("on"), 3200);
}
function renderCraft() {
    pruneGrid();
    const g = $("cg");
    g.innerHTML = "";
    grid.forEach((id, i) => {
        const b = document.createElement("button");
        b.className = "slot";
        if (id) slot(b, id, 0);
        b.onclick = () => {
            if (spinning) return;
            if (held) {
                if (grid[i] === held || have(held) - used(held) > 0) {
                    grid[i] = held;
                    snd(500, 0.05, "square");
                } else cmsg = "Не хватает предмета: " + by(held).n;
            } else if (grid[i]) {
                grid[i] = null;
                snd(400, 0.04, "square");
            }
            render();
        };
        g.appendChild(b);
    });
    const rc = gridMatch(),
        o = $("co"),
        full = !!rc && room(rc.out) < rc.n;
    o.disabled = !rc || full || spinning;
    if (rc) slot(o, rc.out, rc.n);
    else {
        o.innerHTML = "";
        delete o.dataset.tip;
    }
    $("cinfo").textContent =
        cmsg ||
        (full
            ? NO_ROOM
            : rc
              ? `Готово: ${rc.n > 1 ? rc.n + "× " : ""}${by(rc.out).n}. Нажми на результат!`
              : grid.some(Boolean)
                ? "Такого рецепта нет."
                : "");
    cmsg = "";
    renderBook();
}
function renderBook() {
    const b = $("rb");
    b.innerHTML = "";
    RECIPES.map((rc) => {
        const need = recipeNeed(rc);
        return { rc, need, can: Object.keys(need).every((id) => have(id) >= need[id]) };
    })
        .sort((a, b) => b.can - a.can)
        .forEach(({ rc, need, can }) => {
            const d = document.createElement("div");
            d.className = "rr" + (can ? " can" : " no");
            const im = document.createElement("img");
            im.src = by(rc.out).img;
            const t = document.createElement("div"),
                nm = document.createElement("b"),
                sm = document.createElement("small");
            nm.textContent = (rc.n > 1 ? rc.n + "× " : "") + by(rc.out).n;
            sm.textContent = Object.keys(need)
                .map((id) => by(id).n + " ×" + need[id])
                .join(", ");
            t.append(nm, sm);
            d.append(im, t);
            d.onclick = () => {
                if (spinning) return;
                lastRc = rc;
                fillRecipe(rc);
                render();
                $("pg2").scrollIntoView({ behavior: "smooth", block: "start" });
            };
            b.appendChild(d);
        });
}
function doCraft() {
    if (spinning) return;
    const rc = gridMatch();
    if (!rc) return;
    if (room(rc.out) < rc.n) {
        cmsg = NO_ROOM;
        render();
        return;
    }
    grid.forEach((id) => {
        if (id) {
            inv[id]--;
            if (inv[id] <= 0) delete inv[id];
        }
    });
    const first = !got[rc.out];
    inv[rc.out] = have(rc.out) + rc.n;
    got[rc.out] = 1;
    snd(660, 0.12, "square");
    setTimeout(() => snd(990, 0.2, "square"), 110);
    if (first) toastGot(rc.out);
    lastRc = rc;
    fillRecipe(rc, true); // сразу готовим следующий такой же крафт, если хватает материалов
    render();
}
$("co").onclick = doCraft;
$("cx").onclick = () => {
    grid = Array(9).fill(null);
    render();
};
