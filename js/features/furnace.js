/* Печь: переплавка, топливо и рецепты. */

/* ===== Печь: переплавка ===== */
const fFuelOk = () => (fFuel && FUEL[fFuel] && have(fFuel) > 0 ? fFuel : null);
function fSay(t, bad, keep) {
    fNote = t || "";
    fNoteBad = !!bad;
    clearTimeout(fNoteTo);
    if (t && !keep)
        fNoteTo = setTimeout(() => {
            fNote = "";
            renderFurn();
        }, 2400);
}
const fBatches = () => {
    if (!fIn || !SMELT[fIn]) return 0;
    const r = SMELT[fIn],
        fp = fFuelOk();
    return Math.min(Math.floor(have(fIn) / r.need), fHeat + (fp ? have(fp) * FUEL[fp] : 0));
};
function renderFurn() {
    const box = $("fin");
    if (!box) return;
    if (fIn && (!SMELT[fIn] || !(inv[fIn] > 0))) fIn = null;
    if (fFuel && !FUEL[fFuel]) fFuel = null;
    if (fFuel && !(inv[fFuel] > 0)) fFuel = null;
    const r = fIn ? SMELT[fIn] : null,
        fp = fFuelOk();
    slot(box, fIn, 0);
    box.disabled = !fIn;
    box.classList.toggle("sel", !!fIn);
    if (fIn) {
        const x = document.createElement("i");
        x.className = "fx";
        x.textContent = "×";
        box.appendChild(x);
    }
    const fb = $("ffuel");
    slot(fb, fp, fp ? inv[fp] : 0);
    fb.disabled = !fp;
    fb.classList.toggle("sel", !!fp);
    if (fp) {
        const x = document.createElement("i");
        x.className = "fx";
        x.textContent = "×";
        fb.appendChild(x);
    }
    slot($("fout"), r ? r.out : null, 0);
    $("fdin").textContent = r ? inv[fIn] + " шт" : "";
    $("fdfuel").textContent = fp ? inv[fp] + " шт" : "";
    $("fdout").textContent = r ? "+1" : "";
    const batches = fBatches(),
        full = r ? room(r.out) < 1 : false;
    $("ftop").textContent = "Жар: " + fHeat;
    $("fone").disabled = fBusy || spinning || !batches || full;
    $("fall").disabled = $("fone").disabled;
    let msg,
        bad = false;
    if (fNote) {
        msg = fNote;
        bad = fNoteBad;
    } else if (!r) msg = "Нажми на руду в инвентаре — печь покажет, что получится.";
    else if (!fp && fHeat < 1) msg = "Нажми на топливо в инвентаре: угольный блок, уголь, древесный уголь, доски или палку.";
    else if (!batches) msg = "Мало предметов: нужно " + r.need + " × " + by(fIn).n + ".";
    else if (full) msg = NO_ROOM;
    else
        msg =
            "1 плавка: " +
            r.need +
            " × " +
            by(fIn).n +
            " → " +
            by(r.out).n +
            "." +
            (fp ? " 1 × " + by(fp).n + " = " + FUEL[fp] + " жара." : " Жар: " + fHeat + ".");
    const e = $("fhint");
    e.textContent = msg;
    e.style.color = bad ? "#ff9d95" : "";
    const rec = $("frec");
    if (!rec) return;
    rec.innerHTML = "";
    Object.keys(SMELT).forEach((id) => {
        const rr = SMELT[id],
            b = document.createElement("button");
        b.type = "button";
        b.className = "frr" + (fIn === id ? " sel" : "") + (have(id) > 0 ? "" : " no");
        b.innerHTML =
            '<img src="' +
            by(id).img +
            '" alt="' +
            by(id).n +
            '"><span>×' +
            rr.need +
            '</span><span class="farr">→</span><img src="' +
            by(rr.out).img +
            '" alt="' +
            by(rr.out).n +
            '"><span class="fq">+1</span>';
        b.onclick = () => pickFurn(id);
        rec.appendChild(b);
    });
}
function pickFurn(id) {
    if (FUEL[id] && !SMELT[id]) {
        fFuel = fFuel === id ? null : id;
        snd(520, 0.05, "square");
        fSay("");
        render();
        return;
    }
    if (!SMELT[id]) {
        fSay("Это не плавится.", true);
        snd(220, 0.1, "sawtooth");
        renderFurn();
        return;
    }
    fIn = fIn === id ? null : id;
    snd(520, 0.05, "square");
    fSay("");
    render();
}
function doSmelt(all) {
    if (fBusy || spinning) return;
    const r = fIn ? SMELT[fIn] : null;
    if (!r) {
        fSay("Выбери, что плавить.", true);
        renderFurn();
        return;
    }
    const fp = fFuelOk();
    if (!fp && fHeat < 1) {
        fSay("Выбери топливо: нажми на угольный блок, уголь, древесный уголь, доски или палку.", true);
        snd(220, 0.12, "sawtooth");
        renderFurn();
        return;
    }
    const max = fBatches();
    if (max < 1) {
        fSay("Мало предметов: нужно " + r.need + " × " + by(fIn).n + ".", true);
        renderFurn();
        return;
    }
    const n = Math.min(all ? max : 1, room(r.out));
    if (n < 1) {
        fSay(NO_ROOM, true);
        snd(220, 0.12, "sawtooth");
        renderFurn();
        return;
    }
    /* жар: дожигаем топливо, пока его не хватит на выбранное число плавок */
    let heat = fHeat;
    while (heat < n && fp && have(fp) > 0) {
        inv[fp] -= 1;
        if (inv[fp] <= 0) delete inv[fp];
        heat += FUEL[fp];
    }
    if (heat < n) {
        fSay("Не хватает топлива.", true);
        snd(220, 0.12, "sawtooth");
        renderFurn();
        return;
    }
    fHeat = heat - n;
    const items = n * r.need;
    inv[fIn] -= items;
    if (inv[fIn] <= 0) delete inv[fIn];
    inv[r.out] = have(r.out) + n;
    got[r.out] = 1;
    fBusy = true;
    $("fflame").classList.add("on");
    $("fbar").style.width = "100%";
    fSay("Плавится…", false, true);
    snd(300, 0.12, "sawtooth");
    render();
    setTimeout(() => {
        fBusy = false;
        $("fflame").classList.remove("on");
        $("fbar").style.width = "0%";
        fSay("Готово: " + by(r.out).n + " ×" + n + ".");
        snd(660, 0.09, "square");
        setTimeout(() => snd(880, 0.1, "square"), 100);
        render();
    }, 640);
}
$("fin").onclick = () => {
    fIn = null;
    fSay("");
    snd(380, 0.04, "square");
    render();
};
$("ffuel").onclick = () => {
    fFuel = null;
    fSay("");
    snd(380, 0.04, "square");
    render();
};
$("fone").onclick = () => doSmelt(false);
$("fall").onclick = () => doSmelt(true);
function smelt(id, n = 1) {
    fIn = id;
    doSmelt(n > 1);
    return true;
}
