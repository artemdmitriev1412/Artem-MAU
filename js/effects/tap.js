/* tap */

(function () {
    var timers = new WeakMap();
    function tap(e) {
        if (e.type === "pointerdown" && e.button !== 0) return;
        var t = e.target;
        var b = t && t.closest ? t.closest(".btn, .sbtn") : null;
        if (!b || b.disabled) return;
        var old = timers.get(b);
        if (old) clearTimeout(old);
        b.classList.remove("tapped");
        void b.offsetWidth;
        b.classList.add("tapped");
        timers.set(b, setTimeout(function () {
            b.classList.remove("tapped");
            timers.delete(b);
        }, 300));
    }
    document.addEventListener("pointerdown", tap, { capture: true, passive: true });
    if (!("PointerEvent" in window)) {
        document.addEventListener("touchstart", tap, { capture: true, passive: true });
    }
    document.addEventListener("click", function (e) {
        var t = e.target;
        var b = t && t.closest ? t.closest(".btn, .sbtn") : null;
        if (b) setTimeout(function () { b.blur(); }, 0);
    }, true);
})();
