/* Каталог предметов, декоративные иконки и монета. */

const ITEMS = [
    { id: "dirt", n: "Земля", v: 1 },
    { id: "sand", n: "Песок", v: 2 },
    { id: "cobble", n: "Булыжник", v: 3 },
    { id: "coal", n: "Уголь", v: 5, nw: 1 },
    { id: "apple", n: "Яблоко", v: 5 },
    { id: "copper", n: "Медный слиток", v: 6, nw: 1 },
    { id: "iron", n: "Железный слиток", v: 8, nw: 1 },
    { id: "gunp", n: "Порох", v: 9 },
    { id: "lapis", n: "Лазурит", v: 10, nw: 1 },
    { id: "blaze", n: "Огненный стержень", v: 12 },
    { id: "blazep", n: "Огненный порошок", v: 6, c: 1 },
    { id: "gold", n: "Золотой слиток", v: 13, nw: 1 },
    { id: "quartz", n: "Кварц", v: 14, nw: 1 },
    { id: "red", n: "Редстоун", v: 18, nw: 1 },
    { id: "amet", n: "Аметист", v: 20 },
    { id: "obs", n: "Обсидиан", v: 22 },
    { id: "pearl", n: "Жемчуг Края", v: 27 },
    { id: "dia", n: "Алмаз", v: 30, nw: 1 },
    { id: "em", n: "Изумруд", v: 45, nw: 1 },
    { id: "egg", n: "Яйцо дракона", v: 100 },
    { id: "debris", n: "Древние обломки", v: 60 },
    { id: "log", n: "Бревно", v: 2 },
    { id: "planks", n: "Доски", v: 2, c: 1 },
    { id: "stick", n: "Палка", v: 2, c: 1 },
    { id: "glass", n: "Стекло", v: 4 },
    { id: "charcoal", n: "Древесный уголь", v: 4 },
    { id: "scrap", n: "Незеритовый лом", v: 60 },
    { id: "neth", n: "Незеритовый слиток", v: 300, c: 1 },
    { id: "brick", n: "Кирпич", v: 4 },
    /* руды: на колесе и в магазине, плавятся в печи в слитки и самоцветы */
    { id: "coalore", n: "Угольная руда", v: 3 },
    { id: "copperore", n: "Медная руда", v: 4 },
    { id: "ironore", n: "Железная руда", v: 6 },
    { id: "lapisore", n: "Лазуритовая руда", v: 7 },
    { id: "quartzore", n: "Кварцевая руда", v: 9 },
    { id: "redore", n: "Редстоуновая руда", v: 11 },
    { id: "goldore", n: "Золотая руда", v: 11 },
    { id: "diaore", n: "Алмазная руда", v: 26 },
    { id: "emore", n: "Изумрудная руда", v: 40 },
    { id: "torch", n: "Факел", v: 6, c: 1 },
    { id: "tnt", n: "ТНТ", v: 53, c: 1 },
    { id: "gapple", n: "Золотое яблоко", v: 110, c: 1 },
    { id: "eye", n: "Око Края", v: 40, c: 1 },
    { id: "iblock", n: "Железный блок", v: 72, c: 1 },
    { id: "gblock", n: "Золотой блок", v: 117, c: 1 },
    { id: "dblock", n: "Алмазный блок", v: 270, c: 1 },
    /* --- блоки из остальных руд: 9 материала → блок --- */
    { id: "coalblock", n: "Угольный блок", v: 45, c: 1 },
    { id: "cublock", n: "Медный блок", v: 54, c: 1 },
    { id: "lapblock", n: "Лазуритовый блок", v: 90, c: 1 },
    { id: "qblock", n: "Кварцевый блок", v: 126, c: 1 },
    { id: "redblock", n: "Редстоуновый блок", v: 162, c: 1 },
    { id: "eblock", n: "Изумрудный блок", v: 405, c: 1 },
    { id: "wpick", n: "Деревянная кирка", v: 7, c: 1 },
    { id: "spick", n: "Каменная кирка", v: 13, c: 1 },
    { id: "ipick", n: "Железная кирка", v: 28, c: 1 },
    { id: "dpick", n: "Алмазная кирка", v: 94, c: 1 },
    { id: "wsword", n: "Деревянный меч", v: 6, c: 1 },
    { id: "ssword", n: "Каменный меч", v: 8, c: 1 },
    { id: "isword", n: "Железный меч", v: 18, c: 1 },
    { id: "dsword", n: "Алмазный меч", v: 62, c: 1 },
    /* --- блоки из металлов: только предметы, которые есть в Minecraft --- */
    { id: "nblock", n: "Незеритовый блок", v: 2700, c: 1, s: 910 },
    { id: "bedrock", n: "Бедрок", v: 100000, smin: 100000, smax: 110000, nw: 1, secret: 1 },
];
ITEMS.sort((a, b) => a.v - b.v);
/* иконки предметов — готовые PNG-файлы, по одному на предмет */
ITEMS.forEach((i) => {
    i.img = `assets/img/items/${i.id}.png`;
});
/* иконки удалённых предметов — чтобы в интерфейсе (меню, сундук, обновления) всё осталось как было */
const DECO = {
    table: { n: "Верстак", img: "assets/img/deco/table.png" },
    chest: { n: "Сундук", img: "assets/img/deco/chest.png" },
    furnace: { n: "Печь", img: "assets/img/deco/furnace.png" },
    eapple: { n: "Зачарованное золотое яблоко", img: "assets/img/deco/eapple.png" },
};
const dirtTile = "assets/img/dirt.png";
/* --- монета: валюта магазина (золотой кружок с ободком и бликом) --- */
const coinImg = "assets/img/coin.png";
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
