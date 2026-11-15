/* Подстановка иконок предметов в элементы меню. */

// цветные иконки-предметы рядом с названиями пунктов меню
[
    ["t1", "eye"],
    ["t2", "table"],
    ["t3", "chest"],
    ["t4", "em"],
    ["t10", "nblock"],
    ["t5", "torch"],
].forEach(([id, item]) => {
    const b = $(id),
        it = byAny(item);
    if (b && it) {
        const im = document.createElement("img");
        im.src = it.img;
        im.alt = "";
        im.setAttribute("aria-hidden", "true");
        b.appendChild(im);
    }
});
// иконки-предметы в кнопках улучшения сундука (как в меню)
document.querySelectorAll(".uic").forEach((im) => {
    const it = byAny(im.dataset.item);
    if (it) im.src = it.img;
});
// иконка монеты в кошельке
["wico"].forEach((id) => {
    const e = $(id);
    if (e) e.src = coinImg;
});
