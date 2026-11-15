/* Запуск приложения. */

window.MCW = { SMELT, FUEL, RECIPES, smelt, craft: doCraft, showUpd };
window.MC_ITEMS = ITEMS.map((i) => ({ id: i.id, n: i.n, img: i.img, secret: !!i.secret, nw: !!i.nw, v: i.v, stk: stk(i.id) }));
if (CATALOG_ONLY) document.body.classList.add("catalog-only");
else {
    setTab(tab);
    renderUpdates();
    showUpd();
    ownerInit();
}
