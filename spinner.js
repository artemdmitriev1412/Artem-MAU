const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const RES = 32;

const img = new Image();
const ready = new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
});
img.src = 'assets/spinner.svg';

async function draw(percent) {
    await ready;

    const small = document.createElement('canvas');
    small.width = small.height = RES;
    const sctx = small.getContext('2d');
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(img, 0, 0, RES, RES);

    const imageData = sctx.getImageData(0, 0, RES, RES);
    const d = imageData.data;
    const c = RES / 2;
    const limit = (percent / 100) * 2 * Math.PI;

    for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
            const i = (y * RES + x) * 4;
            if (d[i + 3] === 0) continue;

            let a = Math.atan2(x + 0.5 - c, -(y + 0.5 - c));
            if (a < 0) a += 2 * Math.PI;

            if (a < limit) {
                d[i] = 21; d[i + 1] = 63; d[i + 2] = 21;
            }
        }
    }
    sctx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
}

window.Spinner = { draw };