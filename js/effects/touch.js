/* touch */

(function () {
    try {
        var mobile = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;
        var touch = mobile || (navigator.maxTouchPoints || 0) > 0 || ("ontouchstart" in window);
        if (touch) document.documentElement.classList.add("touch");
    } catch (e) {}
})();
