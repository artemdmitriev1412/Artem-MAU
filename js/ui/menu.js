/* Навигация по вкладкам и выдвижное меню. */

function closeMenu() {
    $("mnusc").classList.remove("on");
    document.body.classList.remove("lock");
}
function setTab(t) {
    tab = TABS.includes(t) ? t : "roulette";
    held = null;
    closeMenu();
    if (t !== "craft") grid = Array(9).fill(null);
    $("pg1").hidden = t !== "roulette";
    $("pg2").hidden = t !== "craft";
    $("pg3").hidden = t !== "craft";
    $("pg8").hidden = t !== "furnace";
    $("pg4").hidden = t !== "chest";
    $("pg5").hidden = t !== "shop";
    $("pg6").hidden = t !== "updates";
    $("pg9").hidden = t !== "offers";
    $("invblock").hidden = t === "updates";
    [
        ["t1", "roulette"],
        ["t4", "shop"],
        ["t10", "offers"],
        ["t2", "craft"],
        ["t7", "furnace"],
        ["t3", "chest"],
        ["t5", "updates"],
    ].forEach(([b, k]) => {
        const e = $(b);
        if (e) e.classList.toggle("on", t === k);
    });
    if (t !== "chest" && $("chh")) $("chh").textContent = "";
    if (t === "updates") renderUpdates();
    if (t === "shop") shopMsg("");
    render();
    save();
}
// выдвижное меню поверх страницы; фон не прокручивается, пока меню открыто
$("tmenu").onclick = () => {
    const on = !$("mnusc").classList.contains("on");
    $("mnusc").classList.toggle("on", on);
    document.body.classList.toggle("lock", on);
    snd(400, 0.04, "square");
};
$("mnusc").addEventListener("click", (e) => {
    if (e.target === $("mnusc")) closeMenu();
});
$("mcx").onclick = () => {
    closeMenu();
    snd(300, 0.04, "square");
};
$("t1").onclick = () => setTab("roulette");
$("t2").onclick = () => setTab("craft");
$("t7").onclick = () => setTab("furnace");
$("t3").onclick = () => setTab("chest");
$("t4").onclick = () => setTab("shop");
$("t10").onclick = () => setTab("offers");
$("t5").onclick = () => setTab("updates");
$("shbuy").onclick = () => {
    shMode = "buy";
    $("shbuy").classList.add("on");
    $("shsell").classList.remove("on");
    shopMsg("");
    snd(500, 0.04, "square");
    render();
};
$("shsell").onclick = () => {
    shMode = "sell";
    $("shsell").classList.add("on");
    $("shbuy").classList.remove("on");
    shopMsg("");
    snd(500, 0.04, "square");
    render();
};
$("shq").addEventListener("input", () => {
    shQ = $("shq").value;
    renderShop();
});
