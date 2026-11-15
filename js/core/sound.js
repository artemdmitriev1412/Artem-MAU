/* Синтез коротких звуковых эффектов. */

function snd(f, d, t, f2) {
    try {
        ac = ac || new AudioContext();
        const o = ac.createOscillator(),
            g = ac.createGain();
        o.type = t;
        o.frequency.value = f;
        if (f2) o.frequency.linearRampToValueAtTime(f2, ac.currentTime + d);
        g.gain.setValueAtTime(0.12, ac.currentTime);
        g.gain.linearRampToValueAtTime(0, ac.currentTime + d);
        o.connect(g);
        g.connect(ac.destination);
        o.start();
        o.stop(ac.currentTime + d);
    } catch (e) {}
}
