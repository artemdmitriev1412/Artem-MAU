/* Состояние игры и операции с инвентарём. */

/* --- инвентарь: 27 клеток (3 строки по 9), размер стака у предметов свой --- */
let betK = -1;
const SL = 27,
    ST = 64;
/* --- размер стака как в Minecraft: 64 / 16 / 1 --- */
const S16 = new Set(["pearl"]),
    S1 = new Set(["wpick", "spick", "ipick", "dpick", "wsword", "ssword", "isword", "dsword"]),
    stk = (id) => (S1.has(id) ? 1 : S16.has(id) ? 16 : ST);
/* --- ограничение: цель не может быть ценнее ставки больше чем в MAXR раз --- */
const MAXR = 6;
const MIG = {
        gravel: "sand",
        leaves: "sand",
        ice: "cobble",
        slime: "copper",
        wood: "planks",
        glow: "quartz",
        totem: "em",
        nstar: "egg",
        crystal: "egg",
        heart: "egg",
        disc: "obs",
        shell: "dia",
        clay: "cobble",
        stone: "cobble",
        trident: "neth",
        elytra: "egg",
        candy: "apple",
        ccorn: "apple",
        tomb: "gold",
        witchhat: "torch",
        pumpkin: "quartz",
        jacko: "dia",
        bonemeal: "brick",
        web: "iron",
        bone: "lapis",
        candle: "gold",
        rotflesh: "copper",
        cauldron: "tnt",
        spidereye: "blaze",
        skull: "eye",
    },
    mg = (k) => MIG[k] || k;
const ok = (t) => !bet || (by(t) && !by(t).nw && by(t).v <= by(bet).v * MAXR);
const slotsOf = (o) => Object.entries(o).reduce((a, [k, n]) => a + Math.ceil(n / stk(k)), 0);
function fit(o, lim) {
    const L = lim || SL;
    let f = 0;
    const r = {};
    for (const k in o) {
        const s = stk(k),
            n = Math.min(o[k], (L - f) * s);
        if (n > 0) {
            r[k] = n;
            f += Math.ceil(n / s);
        }
    }
    return r;
}
const noRoom = (t) => (inv[t] || 0) % stk(t) === 0 && slotsOf(inv) >= SL;
const room = (id) => {
    const s = stk(id),
        p = (inv[id] || 0) % s;
    return (SL - slotsOf(inv)) * s + (p ? s - p : 0);
};
const chestRoom = (id) => {
    const s = stk(id),
        p = (chest[id] || 0) % s;
    return (chestSL - slotsOf(chest)) * s + (p ? s - p : 0);
};
const NO_ROOM = "Инвентарь полон — освободи место в инвентаре.";
let tab = "roulette",
    held = null,
    grid = Array(9).fill(null),
    lastRc = null,
    cmsg = "";
let got = {},
    inv = { dirt: 5 },
    chest = {},
    MAXC = 54,
    chestSL = 10,
    bet = null,
    tgt = null,
    coins = 0,
    coinInf = false,
    autoOwned = false,
    autoPaused = false,
    fIn = null,
    fFuel = null,
    fHeat = 0,
    fBusy = false,
    fNote = "",
    fNoteBad = false,
    fNoteTo = 0,
    spinning = false,
    rot = 0,
    hold = false,
    rMode = "wheel",
    clkUsed = 0,
    clkDay = "",
    clkBusy = false,
    clkLast = null,
    clkNote = "",
    clkMood = "",
    clkLuck = 0,
    clkInf = false,
    ac,
    note = "";
const CLICKS_MAX = 10;
const dayKey = () => {
    const d = new Date();
    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
    );
};
let storeOk = true;
const SAVE_KEY = "mcw2",
    SLOT_KEY = "mcw2_slots",
    TABS = ["roulette", "craft", "furnace", "chest", "shop", "offers", "updates"];
let pendingSync = false,
    suppressSave = false;
function resetGameState() {
    got = {};
    inv = { dirt: 5 };
    chest = {};
    chestSL = 10;
    bet = null;
    betK = -1;
    tgt = null;
    coins = 0;
    coinInf = false;
    autoOwned = false;
    autoPaused = false;
    fIn = null;
    fFuel = null;
    fHeat = 0;
    fBusy = false;
    fNote = "";
    fNoteBad = false;
    clearTimeout(fNoteTo);
    fNoteTo = 0;
    spinning = false;
    rot = 0;
    hold = false;
    rMode = "wheel";
    clkUsed = 0;
    clkDay = dayKey();
    clkBusy = false;
    clkLast = null;
    clkNote = "";
    clkMood = "";
    clkLuck = 0;
    clkInf = false;
    note = "";
    grid = Array(9).fill(null);
    held = null;
    lastRc = null;
    cmsg = "";
    tab = "roulette";
}
