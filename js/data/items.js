/* Каталог предметов, декоративные иконки и монета. */

const ITEMS = [
    { id: "dirt", n: "Земля", v: 1, f: tile(grassDirt) },
    { id: "sand", n: "Песок", v: 2, f: tile(sandTex) },
    {
        id: "cobble",
        n: "Булыжник",
        v: 3,
        img: COBBLE_IMG,
    },
    {
        id: "coal",
        n: "Уголь",
        v: 5,
        nw: 1,
        f: art(COAL, { k: "#050505", G: "#2a2a2a", B: "#5a5a5a", D: "#141414" }),
    },
    {
        id: "apple",
        n: "Яблоко",
        v: 5,
        f: art(APPLE, {
            k: "#4a0808",
            R: "#d62a2a",
            r: "#a01818",
            h: "#ff9a8a",
            s: "#6a4420",
            g: "#3fa030",
        }),
    },
    { id: "copper", n: "Медный слиток", v: 6, nw: 1, f: ingot(["#4a2010", "#ffbf94", "#e0803f", "#a8501f"]) },
    { id: "iron", n: "Железный слиток", v: 8, nw: 1, f: ingot(["#3a3a3a", "#f0f0f0", "#d4d4d4", "#9a9a9a"]) },
    { id: "gunp", n: "Порох", v: 9, f: mound(["#2e2e2e", "#9a9a9a", "#6a6a6a", "#454545"]) },
    { id: "lapis", n: "Лазурит", v: 10, nw: 1, f: lump(["#0a1850", "#4a6cf0", "#2a4fd0", "#1a2f9a"], "#e8f0ff") },
    { id: "blaze", n: "Огненный стержень", v: 12, f: blazeF(["#f2a21a", "#c26a0a", "#ffd24a"]) },
    {
        id: "blazep",
        n: "Огненный порошок",
        v: 6,
        c: 1,
        f: mound(["#c98a1a", "#e8b428", "#a06a0a", "#f2c030"]),
    },
    { id: "gold", n: "Золотой слиток", v: 13, nw: 1, f: ingot(["#6b4a00", "#fff3a0", "#fbd635", "#c9981a"]) },
    {
        id: "quartz",
        n: "Кварц",
        v: 14,
        nw: 1,
        f: art(QUARTZ, {
            a: "#fcf9f8",
            b: "#f3e8e2",
            c: "#f1e4de",
            d: "#efe0d8",
            e: "#e7d0c5",
            f: "#debdad",
            g: "#d9b4a2",
            h: "#cfa28b",
        }),
    },
    { id: "red", n: "Редстоун", v: 18, nw: 1, f: mound(["#4a0000", "#ff6a5a", "#e01010", "#9a0a0a"]) },
    {
        id: "amet",
        n: "Аметист",
        v: 20,
        f: amethyst,
    },
    {
        id: "obs",
        n: "Обсидиан",
        v: 22,
        f: tile(voro(["#1a1230", "#241a40", "#2c1f4e", "#150e28"], "#08050f", "#6a3ac0", 7)),
    },
    { id: "pearl", n: "Жемчуг Края", v: 27, f: pearlF(["#0a2a24", "#9af8de", "#1f8a72", "#0f4a3e"]) },
    {
        id: "dia",
        n: "Алмаз",
        v: 30,
        nw: 1,
        f: art(DIA, { k: "#0a4a55", W: "#ffffff", C: "#4fe8d8", D: "#1b9aa6" }),
    },
    {
        id: "em",
        n: "Изумруд",
        v: 45,
        nw: 1,
        f: art(EM2, { k: "#07351a", W: "#c9ffd8", L: "#5fe88a", G: "#24b85a", D: "#13803f", d: "#0c5a2c" }),
    },
    {
        id: "egg",
        n: "Яйцо дракона",
        v: 100,
        f: (p, r) => {
            for (let i = 0; i < 16; i++)
                for (let j = 0; j < 16; j++) {
                    const dx = (i - 7.5) / 4.6,
                        dy = (j - 8) / 6.8;
                    if (dx * dx + dy * dy < 1)
                        p(i, j, r() < 0.18 ? "#8a3ae8" : pk(["#0d0716", "#150b22", "#1c1030"], r));
                }
        },
    },
    { id: "debris", n: "Древние обломки", v: 60, f: tile(debris) },
    { id: "log", n: "Бревно", v: 2, f: tile(logTex) },
    { id: "planks", n: "Доски", v: 2, c: 1, f: tile(planks) },
    { id: "stick", n: "Палка", v: 2, c: 1, f: rod(["#8a6a3a", "#5e4524", "#a98450"]) },
    { id: "glass", n: "Стекло", v: 4, f: glassTex },
    {
        id: "charcoal",
        n: "Древесный уголь",
        v: 4,
        f: lump(["#0e0a08", "#4a4038", "#2a2420", "#14100e"], "#6a5a4a"),
    },
    {
        id: "scrap",
        n: "Незеритовый лом",
        v: 60,
        f: lump(["#2a1a14", "#8a5a42", "#5a3a2e", "#3a2218"], "#c88a60"),
    },
    {
        id: "neth",
        n: "Незеритовый слиток",
        v: 300,
        c: 1,
        f: ingot(["#120c0c", "#7a6868", "#4a3f3f", "#2f2626"]),
    },
    { id: "brick", n: "Кирпич", v: 4, f: brickItem },
    /* руды: на колесе и в магазине, плавятся в печи в слитки и самоцветы */
    { id: "coalore", n: "Угольная руда", v: 3, f: oreTile(["#1c1c1c", "#3a3a3a"]) },
    { id: "copperore", n: "Медная руда", v: 4, f: oreTile(["#c8763c", "#e89a5e"]) },
    { id: "ironore", n: "Железная руда", v: 6, f: oreTile(["#d8b79c", "#f0d2b8"]) },
    { id: "lapisore", n: "Лазуритовая руда", v: 7, f: oreTile(["#2a4bd7", "#5f7bff"]) },
    { id: "quartzore", n: "Кварцевая руда", v: 9, f: oreTile(["#e8ddcc", "#fffaf0"], netherBg) },
    { id: "redore", n: "Редстоуновая руда", v: 11, f: oreTile(["#c81a1a", "#ff4a3a"]) },
    { id: "goldore", n: "Золотая руда", v: 11, f: oreTile(["#f5c518", "#ffe680"]) },
    { id: "diaore", n: "Алмазная руда", v: 26, f: oreTile(["#4fe8d8", "#a8fff6"]) },
    { id: "emore", n: "Изумрудная руда", v: 40, f: oreTile(["#25d366", "#78f79a"]) },
    {
        id: "torch",
        n: "Факел",
        v: 6,
        c: 1,
        f: art(TORCH, { f: "#fff08a", O: "#ff8a1a", k: "#2a2a2a", s: "#8a6a3a", S: "#5e4524" }),
    },
    { id: "tnt", n: "ТНТ", v: 53, c: 1, f: tile(tntTex) },
    {
        id: "gapple",
        n: "Золотое яблоко",
        v: 110,
        c: 1,
        f: art(APPLE, {
            k: "#6b4a00",
            R: "#fbd635",
            r: "#c9981a",
            h: "#fff8b0",
            s: "#6a4420",
            g: "#3fa030",
        }),
    },
    { id: "eye", n: "Око Края", v: 40, c: 1, f: eyeF },
    { id: "iblock", n: "Железный блок", v: 72, c: 1, f: tile(metalBlock("#d4d4d4", "#f4f4f4", "#9a9a9a")) },
    { id: "gblock", n: "Золотой блок", v: 117, c: 1, f: tile(metalBlock("#fbd635", "#fff3a0", "#c9981a")) },
    {
        id: "dblock",
        n: "Алмазный блок",
        v: 270,
        c: 1,
        f: tile(metalBlock("#4fe8d8", "#d8fffa", "#1b9aa6")),
    },
    /* --- блоки из остальных руд: 9 материала → блок --- */
    { id: "coalblock", n: "Угольный блок", v: 45, c: 1, f: tile(metalBlock("#2a2a2a", "#5a5a5a", "#101010")) },
    { id: "cublock", n: "Медный блок", v: 54, c: 1, f: tile(metalBlock("#e0803f", "#ffbf94", "#a8501f")) },
    { id: "lapblock", n: "Лазуритовый блок", v: 90, c: 1, f: tile(metalBlock("#2a4fd0", "#7f96ff", "#1a2f9a")) },
    { id: "qblock", n: "Кварцевый блок", v: 126, c: 1, f: tile(metalBlock("#f3e8e2", "#ffffff", "#cfa28b")) },
    { id: "redblock", n: "Редстоуновый блок", v: 162, c: 1, f: tile(metalBlock("#e01010", "#ff6a5a", "#9a0a0a")) },
    { id: "eblock", n: "Изумрудный блок", v: 405, c: 1, f: tile(metalBlock("#24b85a", "#8bffae", "#0c5a2c")) },
    { id: "wpick", n: "Деревянная кирка", v: 7, c: 1, f: pickG("#b8945f", "#7d5f35", "#d9b574") },
    { id: "spick", n: "Каменная кирка", v: 13, c: 1, f: pickG("#8a8a8a", "#5a5a5a", "#b0b0b0") },
    { id: "ipick", n: "Железная кирка", v: 28, c: 1, f: pickG("#d4d4d4", "#8a8a8a", "#ffffff") },
    { id: "dpick", n: "Алмазная кирка", v: 94, c: 1, f: pickG("#4fe8d8", "#1b9aa6", "#d8fffa") },
    { id: "wsword", n: "Деревянный меч", v: 6, c: 1, f: swordG("#b8945f", "#7d5f35", "#d9b574") },
    { id: "ssword", n: "Каменный меч", v: 8, c: 1, f: swordG("#8a8a8a", "#5a5a5a", "#b0b0b0") },
    { id: "isword", n: "Железный меч", v: 18, c: 1, f: swordG("#d4d4d4", "#8a8a8a", "#ffffff") },
    { id: "dsword", n: "Алмазный меч", v: 62, c: 1, f: swordG("#4fe8d8", "#1b9aa6", "#d8fffa") },
    /* --- блоки из металлов: только предметы, которые есть в Minecraft --- */
    {
        id: "nblock",
        n: "Незеритовый блок",
        v: 2700,
        c: 1,
        s: 910,
        f: tile(metalBlock("#3a3030", "#6a5858", "#181212")),
    },
    {
        id: "bedrock",
        n: "Бедрок",
        v: 100000,
        smin: 100000,
        smax: 110000,
        nw: 1,
        secret: 1,
        f: tile(bedrockF),
    },
];
ITEMS.sort((a, b) => a.v - b.v);
/* у каждого предмета своё постоянное «зерно» текстуры: картинка не меняется,
   даже если поменять ценность или порядок в списке. Новые предметы задают s сами. */
const SEED = {
        dirt: 7, sand: 8, log: 9, planks: 10, stick: 11, glass: 13, charcoal: 14,
        brick: 15, coal: 16, apple: 17, copper: 18, blazep: 19, torch: 20, wsword: 21,
        iron: 22, table: 23, ssword: 24, gunp: 25, lapis: 26, wpick: 27, blaze: 28,
        gold: 29, spick: 30, quartz: 31, chest: 32, red: 33, isword: 34, amet: 35,
        obs: 36, furnace: 37, pearl: 39, ipick: 40, dia: 41, eye: 42,
        em: 43, tnt: 44, debris: 45, scrap: 46, dsword: 47, iblock: 48, eapple: 49,
        neth: 50, dpick: 51, egg: 52, gapple: 53, gblock: 54, dblock: 55,
        coalore: 56, copperore: 57, ironore: 58, lapisore: 59, quartzore: 60,
        redore: 61, goldore: 62, diaore: 63, emore: 64,
        coalblock: 66, cublock: 67, lapblock: 68, qblock: 69,
        redblock: 70, eblock: 71,
        bedrock: 72,
    },
    seedOf = (i) => (i.s != null ? i.s : SEED[i.id] != null ? SEED[i.id] : 7);
ITEMS.forEach((i) => {
    if (!i.img) i.img = mk(seedOf(i), i.f);
});
/* иконки удалённых предметов — чтобы в интерфейсе (меню, сундук, обновления) всё осталось как было */
const DECO = {
    table: {
        n: "Верстак",
        img: mk(
            SEED.table,
            tile(
                art(TABLE, {
                    g: "#5a3e1a",
                    t: "#d9b574",
                    p: "#8a6a3a",
                    P: "#b8945f",
                    s: "#d0d0d0",
                    m: "#8a8a8a",
                    h: "#5e4524",
                })
            )
        ),
    },
    chest: { n: "Сундук", img: mk(SEED.chest, tile(chestTex)) },
    furnace: { n: "Печь", img: mk(SEED.furnace, tile(furnaceTex)) },
    eapple: { n: "Зачарованное золотое яблоко", img: mk(SEED.eapple, eappleF) },
};
const dirtTile = mk(3, DIRT);
/* --- монета: валюта магазина (золотой кружок с ободком и бликом) --- */
const coinImg = mk(77, (p) => {
    for (let i = 0; i < 16; i++)
        for (let j = 0; j < 16; j++) {
            const d = Math.hypot(i - 7.5, j - 7.5);
            if (d < 7.6) {
                if (d > 6.3) p(i, j, i + j < 14 ? "#8a5a06" : "#c98f12");
                else if (d > 4.3) p(i, j, i + j < 12 ? "#ffe680" : i + j > 19 ? "#e0a81c" : "#f7cf3f");
                else p(i, j, i + j < 12 ? "#fff6c0" : "#ffd84a");
            }
        }
});
const by = (id) => ITEMS.find((i) => i.id === id);
/* предмет для иконок: обычный или «декоративный» (удалённый из игры, но его иконка нужна в UI) */
const byAny = (id) => by(id) || DECO[id] || null;
/* у некоторых предметов цена продажи не фиксирована, а выбирается из диапазона */
const sellRange = (id) => {
    const it = by(id);
    return it && it.smin != null && it.smax != null ? [it.smin, it.smax] : null;
};
/* фон — затемнённая земля, как в Minecraft */
document.body.style.backgroundImage = `radial-gradient(1100px 620px at 50% -12%, rgba(61,220,138,.10), transparent 62%), radial-gradient(900px 520px at 50% 112%, rgba(242,201,107,.07), transparent 62%), linear-gradient(#080b0eeb, #060809f7), url(${dirtTile})`;
document.body.style.backgroundSize = "auto, auto, auto, 128px";
document.body.style.backgroundAttachment = "fixed, fixed, fixed, fixed";
document.body.style.backgroundRepeat = "no-repeat, no-repeat, no-repeat, repeat";
