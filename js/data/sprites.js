/* Процедурная пиксельная графика предметов и текстур. */

function mk(seed, fn) {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const x = c.getContext("2d"),
        r = R(seed);
    fn((i, j, col) => {
        x.fillStyle = col;
        x.fillRect(i, j, 1, 1);
    }, r);
    return c.toDataURL();
}
/* --- оригинальные 2D-спрайты 16x16 (нарисованы с нуля) --- */
const hash = (x, y) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const noise = (pal) => (p, r) => {
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) p(i, j, pk(pal, r));
};
// слиток: скошенный брусок с гранями
const ingot = (q) => (p, r) => {
    for (let y = 4; y <= 11; y++) {
        const o = (11 - y) >> 1;
        for (let x = 2 + o; x <= 12 + o; x++) {
            const e = y == 4 || y == 11 || x == 2 + o || x == 12 + o;
            p(x, y, e ? q[0] : y == 5 ? q[1] : y == 10 || x >= 10 + o ? q[3] : r() < 0.2 ? q[1] : q[2]);
        }
    }
};
const gem = (q, sx) => (p) => {
    for (let i = 0; i < 16; i++)
        for (let j = 0; j < 16; j++) {
            const dx = i - 7.5,
                dy = j - 7.5,
                m = Math.abs(dx) * sx + Math.abs(dy);
            if (m <= 7) p(i, j, m > 6 ? q[0] : dx + dy < -2 ? q[1] : dx + dy > 2 ? q[3] : q[2]);
        }
};
const blob = (q) => (p) => {
    for (let i = 0; i < 16; i++)
        for (let j = 0; j < 16; j++) {
            const d = Math.hypot(i - 7.5, j - 7.5);
            if (d < 6.2) p(i, j, d > 5.2 ? q[0] : i + j < 11 && d < 4.6 ? q[1] : i + j > 17 ? q[3] : q[2]);
        }
};
const rod = (q) => (p) => {
    for (let i = 2; i <= 13; i++) {
        p(i, 15 - i, i % 4 < 2 ? q[0] : q[2]);
        p(i + 1, 15 - i, q[1]);
        p(i, 14 - i, q[2]);
    }
};
const lump = (q, fl) => (p, r) => {
    for (let i = 0; i < 16; i++)
        for (let j = 0; j < 16; j++) {
            const d = Math.hypot(i - 7.5, j - 7.5) + (r() - 0.5) * 2.4;
            if (d < 6)
                p(i, j, d > 5 ? q[0] : r() < 0.14 ? fl : i + j < 12 ? q[1] : i + j > 17 ? q[3] : q[2]);
        }
};
const mound = (q) => (p, r) => {
    for (let j = 4; j <= 13; j++) {
        const hw = Math.round((j - 3) * 0.75);
        for (let i = 8 - hw; i <= 7 + hw; i++)
            p(
                i,
                j,
                j == 13 || i == 8 - hw || i == 7 + hw
                    ? q[0]
                    : i < 10 - hw
                      ? q[1]
                      : i > 5 + hw
                        ? q[3]
                        : r() < 0.2
                          ? q[1]
                          : q[2]
            );
    }
};
const art = (rows, m) => (p) => {
    rows.forEach((s, j) =>
        [...s.padEnd(16, ".").slice(0, 16)].forEach((c, i) => {
            if (m[c]) p(i, j, m[c]);
        })
    );
};
// плоская плитка блока: тёмная рамка, светлая кромка сверху-слева, тень снизу-справа
const tile = (f) => (p, r) => {
    const T = [];
    f((i, j, c) => {
        T[j * 16 + i] = c.slice(0, 7);
    }, r);
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const c = T[y * 16 + x];
            if (!c) continue;
            const k =
                x == 0 || y == 0 || x == 15 || y == 15
                    ? 0.4
                    : x == 1 || y == 1
                      ? 1.18
                      : x == 14 || y == 14
                        ? 0.8
                        : 1;
            p(x, y, "rgb(" + hex(c).map((z) => Math.min(255, Math.round(z * k))) + ")");
        }
};
// «камешки» (ячейки Вороного): светокамень, обсидиан
const voro = (pal, joint, hi, n) => (p, r) => {
    const S = [];
    for (let k = 0; k < n; k++) S.push([r() * 16, r() * 16]);
    const M = [];
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            let b = 0,
                bd = 1e9;
            S.forEach(([sx, sy], k) => {
                const d = (x - sx) ** 2 + (y - sy) ** 2;
                if (d < bd) {
                    bd = d;
                    b = k;
                }
            });
            M[y * 16 + x] = b;
        }
    const J = (x, y) =>
        (x < 15 && M[y * 16 + x + 1] != M[y * 16 + x]) || (y < 15 && M[(y + 1) * 16 + x] != M[y * 16 + x]);
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
            p(
                x,
                y,
                J(x, y)
                    ? joint
                    : (x > 0 && J(x - 1, y)) || (y > 0 && J(x, y - 1))
                      ? hi
                      : pal[(M[y * 16 + x] * 3) % pal.length]
            );
};
/* бедрок: текстура как в Minecraft — слоистые серые сколы и тёмные трещины */
const BEDROCK_ROWS = [
    "dbbbbcedcecbbcbc",
    "bddededebeedabcb",
    "babbabbbebcccecd",
    "ceddcaceccbbbbbc",
    "abebbbbcbbdeeddb",
    "bcccbccbbaccbbab",
    "eedcdeedcdeedeba",
    "cccbcccbbabbcbdc",
    "deecbbccdeedeeee",
    "cbbabcbcbdcbbbed",
    "ddebdeebabeeedbb",
    "acccbbcdeecddeea",
    "cbbbdcbbdebbbbbc",
    "dedecacbbbabcdee",
    "ddcbbcbbcdeecbbc",
    "babbaeedbcdabbcd",
];
const BEDROCK_COLORS = { a: "#222222", b: "#333333", c: "#575757", d: "#636363", e: "#979797" };
const bedrockF = (p) => {
    BEDROCK_ROWS.forEach((row, y) => {
        for (let x = 0; x < 16; x++) p(x, y, BEDROCK_COLORS[row[x]]);
    });
};
const grassDirt = (p, r) => {
    for (let x = 0; x < 16; x++) {
        const gh = 3 + (r() < 0.5 ? 0 : 1);
        for (let y = 0; y < 16; y++) {
            let c;
            if (y < gh) c = pk(["#5cb83a", "#4ea62f", "#6cc84a"], r);
            else if (y == gh && r() < 0.5) c = pk(["#4ea62f", "#3f8f27"], r);
            else c = r() < 0.12 ? pk(["#a0764f", "#5a3e28"], r) : pk(["#866043", "#79553a", "#6b4a30"], r);
            p(x, y, c);
        }
    }
};
const sandTex = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
            p(
                x,
                y,
                Math.sin(x * 0.7 + y * 1.3) > 0.7
                    ? "#e9e0b0"
                    : r() < 0.1
                      ? "#bdb277"
                      : pk(["#dbd3a0", "#d2c98f", "#e4dcaa"], r)
            );
};
const pearlF = (q) => (p, r) => {
    blob(q)(p, r);
    [
        [6, 5],
        [7, 5],
        [8, 5],
        [9, 6],
        [9, 7],
        [8, 8],
        [7, 8],
        [6, 7],
        [6, 6],
    ].forEach(([x, y]) => p(x, y, "#d8fff2"));
    p(7, 6, "#ffffff");
};
const blazeF = (q) => (p, r) => {
    rod(q)(p, r);
    [
        [14, 1],
        [15, 2],
        [13, 1],
        [14, 0],
        [15, 1],
    ].forEach(([x, y], i) => p(x, y, i % 2 ? "#ff7a1a" : "#ffe060"));
};
const APPLE = [
    "................",
    "........s.g.....",
    ".......s.gggg...",
    "....kkk..kkk....",
    "...kRRRkkRRRk...",
    "..kRhhRRRRRRRk..",
    "..kRhRRRRRRRrk..",
    "..kRRRRRRRRRrk..",
    "..kRRRRRRRRRrk..",
    "..kRRRRRRRRrrk..",
    "...kRRRRRRRrk...",
    "...kRRRRRrrrk...",
    "....kRRRRrrk....",
    ".....kkkkkk.....",
];
const COAL = [
    "................",
    "......kkkk......",
    "....kkGGGGkk....",
    "...kGGGBBGGGk...",
    "..kGGBBBBGGGGk..",
    "..kGBBBGGGGGGk..",
    ".kGGBBGGGGGGDDk.",
    ".kGGGGGGGGGDDDk.",
    ".kGGGGGGGGDDDDk.",
    ".kGGGGGGGDDDDkk.",
    "..kGGGGGDDDDk...",
    "..kkGGGDDDDkk...",
    "....kkkkkkk.....",
];
const DIA = [
    "................",
    "................",
    "....kkkkkkkk....",
    "...kWWCCCCCCk...",
    "..kWWCCCCCCCCk..",
    ".kWCCCCCCCCCCDk.",
    ".kkkkkkkkkkkkkk.",
    ".kCCCCCCCCCCDDk.",
    "..kCCCCCCCCDDk..",
    "...kCCCCCCDDk...",
    "....kCCCCDDk....",
    ".....kCCCDk.....",
    "......kCDk......",
    ".......kk.......",
];
const QUARTZ = [
    ".........eee....",
    "........ecce....",
    ".eee...edcbg....",
    ".eccg.eccbag....",
    ".eccbgebbaag....",
    ".ebbcaeaaafgee..",
    "..gccfeaaagcbe..",
    "...gaeaaafgacg..",
    ".eegfeaaafhah...",
    ".eaegeaaafhaeee.",
    ".gbageaafhfecce.",
    ".gcbagaafhgcbag.",
    ".hccchaffhfcfh..",
    "..hcfhhffhffh...",
    "...hh..hh.hh....",
    "................",
];
const CLUS = [
    "................",
    "...........kk...",
    "..........kWWk..",
    "....kk....kWBBk.",
    "...kWWk...kWBBk.",
    "...kWBBk..kBBDk.",
    "...kWBBBkkkBBDk.",
    "..kkWBBBBkBBBDk.",
    "..kWBBBBBBBBBDk.",
    "..kBBBBBBBBBDDk.",
    "..kBBBBBBBBDDDk.",
    "..kkBBBBBBBDDkk.",
    "...kkkkkkkkkkk..",
];
// аметист: гроздь кристаллов с гранями, бликами и тенями
const amethyst = (p) => {
    const shard = (cx, ty, by, hw) => {
        for (let y = ty; y <= by; y++) {
            const w = Math.min(hw, y - ty);
            for (let x = cx - w; x <= cx + w; x++) {
                if (x < 0 || x > 15 || y < 0 || y > 15) continue;
                let c;
                if (y === ty) c = "#f0d8ff";
                else if (y === ty + 1) c = "#e6c8ff";
                else if (x === cx - w) c = "#d9b8ff";
                else if (x === cx + w) c = "#4a1d86";
                else if (x <= cx - 2) c = "#c99cf5";
                else if (x >= cx + 2) c = "#7a38c8";
                else if (x === cx) c = "#a060e8";
                else c = x < cx ? "#b478f0" : "#8f4fe0";
                p(x, y, c);
            }
        }
    };
    shard(3, 5, 12, 3);
    shard(12, 6, 12, 2);
    shard(8, 1, 12, 4);
    for (let x = 2; x <= 13; x++) p(x, 13, "#2a1050");
};
const EM2 = [
    "................",
    ".....kkkkkk.....",
    "....kWWLLLGk....",
    "...kWLLLLLLGk...",
    "..kWLLGGGGGGDk..",
    "..kLLGGGGGGGDk..",
    "..kLGGGLLGGGDk..",
    "..kLGGLLLLGGDk..",
    "..kGGGLLLLGDDk..",
    "..kGGGGLLGGDDk..",
    "..kGGGGGGGDDdk..",
    "...kGGGGGDDdk...",
    "....kDDDDddk....",
    ".....kkkkkk.....",
];
// древние обломки: пластины с заклёпками
const debris = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const sx = x % 8,
                sy = y % 8;
            p(
                x,
                y,
                sx == 0 || sx == 7 || sy == 0 || sy == 7
                    ? "#241510"
                    : sx == 1 && sy == 1
                      ? "#d8a050"
                      : sx == 1 || sy == 1
                        ? "#8a5a42"
                        : pk(["#5a3a2e", "#503228", "#64402f"], r)
            );
        }
};
const planks = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const row = y >> 2,
                ry = y % 4;
            p(
                x,
                y,
                ry == 3
                    ? "#6a4e28"
                    : x == (row % 2 ? 3 : 11)
                      ? "#7d5f35"
                      : ry == 0
                        ? "#caa56e"
                        : ry == 1 && hash(x, row) < 0.25
                          ? "#9a7a48"
                          : pk(["#b8945f", "#ae8a56", "#c29c66"], r)
            );
        }
};
const glassTex = (p) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const d = Math.min(x, y, 15 - x, 15 - y);
            if (d == 0) p(x, y, "#eaf6fa");
            else if (d == 1) p(x, y, "#9cbcc8");
            else if (
                (x == y && x > 3 && x < 9) ||
                (x == y - 1 && x > 3 && x < 8) ||
                (x + y == 21 && x > 9 && x < 13) ||
                (x + y == 20 && x > 9 && x < 12)
            )
                p(x, y, "rgba(255,255,255,.85)");
            else if ((x + y) % 7 == 0 && d > 2) p(x, y, "rgba(200,230,240,.25)");
        }
};
const logTex = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const w = x % 5;
            p(
                x,
                y,
                w == 0
                    ? "#3e2a14"
                    : w == 1
                      ? "#8a6a3c"
                      : y % 8 == 0
                        ? "#5a3f22"
                        : pk(["#6a4a28", "#5e4224", "#76542c"], r)
            );
        }
};
const brickItem = (p, r) => {
    for (let y = 4; y <= 11; y++)
        for (let x = 2; x <= 13; x++) {
            const e = y == 4 || y == 11 || x == 2 || x == 13;
            p(
                x,
                y,
                e
                    ? "#4a1e14"
                    : y == 5
                      ? "#e08a72"
                      : y >= 10
                        ? "#8a3a2a"
                        : x >= 11
                          ? "#9a4230"
                          : r() < 0.15
                            ? "#c86a52"
                            : "#b5523a"
            );
        }
};
const eappleF = (p, r) => {
    art(APPLE, { k: "#6b4a00", R: "#fbd635", r: "#c9981a", h: "#fff8b0", s: "#6a4420", g: "#3fa030" })(
        p,
        r
    );
    [
        [2, 4],
        [13, 3],
        [14, 9],
        [1, 10],
        [7, 0],
        [12, 12],
    ].forEach(([x, y], i) => p(x, y, i % 2 ? "#c8a0ff" : "#ffffff"));
};
const TABLE = [
    "gggggggggggggggg",
    "gttttgttttgttttg",
    "gttttgttttgttttg",
    "gttttgttttgttttg",
    "gggggggggggggggg",
    "pPPPPPPPPPPPPPPp",
    "pPPsssPPPPPmmmPp",
    "pPPssPPPPPPPhPPp",
    "pPPsPPPPPPPPhPPp",
    "pPPPPPPPPPPPhPPp",
    "pPPPPPPPPPPPPPPp",
    "pPPPPPPPPPPPPPPp",
    "pPPPPPPPPPPPPPPp",
    "pPPPPPPPPPPPPPPp",
    "pppppppppppppppp",
    "pppppppppppppppp",
];
const TORCH = [
    "................",
    ".......ff.......",
    "......fOOf......",
    "......fOOf......",
    ".......OO.......",
    "......kkkk......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
    ".......sS.......",
];
const chestTex = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            let c = pk(["#b07a3a", "#a66f30", "#bb843f"], r);
            if (y == 4) c = "#4a2f12";
            else if (y == 0 || y > 13) c = "#7a4e20";
            if (x < 2 || x > 13) c = y == 4 ? "#4a2f12" : "#8a5a26";
            if ((x == 7 || x == 8) && y >= 3 && y <= 7) c = y == 3 || y == 7 ? "#8a8a8a" : "#d8d8d8";
            p(x, y, c);
        }
};
const tntTex = (p, r) => {
    const L = { T: ["###", ".#.", ".#.", ".#.", ".#."], N: ["#.#", "###", "###", "#.#", "#.#"] },
        W = "TNT";
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            let c;
            if (y == 4 || y == 12) c = "#5a1010";
            else if (y > 4 && y < 12) {
                c = y == 5 ? "#f7f2e8" : y == 11 ? "#d6cebd" : "#efe9dc";
                if (y >= 6 && y <= 10) {
                    const i = Math.floor((x - 2) / 4),
                        cx = (x - 2) % 4;
                    if (i >= 0 && i < 3 && cx < 3 && L[W[i]][y - 6][cx] == "#") c = "#2a1010";
                }
            } else {
                const k = x % 4;
                c =
                    r() < 0.08
                        ? "#c01e1e"
                        : k == 0
                          ? "#8f1c1c"
                          : k == 1
                            ? "#ee4a3a"
                            : k == 2
                              ? "#d62a2a"
                              : "#b82020";
                if (y == 2 || y == 14) c = k == 0 ? "#4a2810" : "#7a4a22";
            }
            p(x, y, c);
        }
};
const furnaceTex = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            let c = hash(x, y) < 0.1 ? "#9c9c9c" : pk(["#808080", "#7a7a7a", "#868686"], r);
            if (x >= 4 && x <= 11 && y >= 5 && y <= 12)
                c =
                    y <= 6 || x == 4 || x == 11
                        ? "#3a3a3a"
                        : y >= 11 && x >= 6 && x <= 9
                          ? y == 12
                              ? "#ffb030"
                              : "#ff7a1a"
                          : "#1a1a1a";
            p(x, y, c);
        }
};
const eyeF = (p, r) => {
    blob(["#0a3a2a", "#9af8de", "#2fa07a", "#14604a"])(p, r);
    for (let x = 6; x <= 9; x++)
        for (let y = 6; y <= 9; y++)
            p(x, y, (x == 7 || x == 8) && (y == 7 || y == 8) ? "#14080f" : "#e8b02a");
};
const metalBlock = (m, l, d) => (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const e = x < 2 || y < 2 || x > 13 || y > 13;
            p(x, y, e ? (x < 2 || y < 2 ? l : d) : x % 7 == 0 || y % 7 == 0 ? d : r() < 0.15 ? l : m);
        }
};
/* фон камня: ровные пятна вместо шумной «гальки» */
const stoneBg = (p, r) => {
    for (let y = 0; y < 16; y += 2)
        for (let x = 0; x < 16; x += 2) {
            const c = pk(["#808080", "#858585", "#7b7b7b", "#898989"], r);
            for (let dy = 0; dy < 2; dy++)
                for (let dx = 0; dx < 2; dx++)
                    p(x + dx, y + dy, r() < 0.1 ? "#6f6f6f" : c);
        }
};
/* фон незеррака: тёмно-красные прожилки */
const netherBg = (p, r) => {
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
            const n = Math.sin(x * 1.7 + y * 0.6) + Math.sin(y * 2.1 - x * 0.4);
            p(
                x,
                y,
                n > 1.1
                    ? pk(["#8a2a22", "#7d241d"], r)
                    : n < -1.1
                      ? pk(["#45100e", "#3c0d0b"], r)
                      : pk(["#611916", "#5a1613", "#6a1d19"], r)
            );
        }
};
/* руда: каменная основа с цветными вкраплениями */
const oreTile = (cols, bg) =>
    tile((p, r) => {
        (bg || stoneBg)(p, r);
        const shape = [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [1, 2],
        ];
        const spots = 6 + Math.floor(r() * 3);
        for (let k = 0; k < spots; k++) {
            const cx = 1 + Math.floor(r() * 12),
                cy = 1 + Math.floor(r() * 12);
            shape.forEach(([dx, dy], i) => p(cx + dx, cy + dy, i % 3 === 0 ? cols[1] : cols[0]));
        }
    });
const pickG = (h, m, l) => (p) => {
    for (let x = 2; x <= 11; x++) {
        p(x, 16 - x, "#8a6a3a");
        p(x, 17 - x, "#4a3418");
    }
    [
        [4, 4],
        [5, 3],
        [6, 2],
        [7, 2],
        [8, 2],
        [9, 2],
        [10, 3],
        [11, 3],
        [12, 4],
        [13, 5],
        [13, 6],
        [14, 7],
        [14, 8],
        [14, 9],
    ].forEach(([x, y]) => p(x, y, m));
    [
        [5, 4],
        [6, 3],
        [7, 3],
        [8, 3],
        [9, 3],
        [10, 4],
        [11, 4],
        [12, 5],
        [12, 6],
        [13, 7],
        [13, 8],
        [13, 9],
    ].forEach(([x, y], k) => p(x, y, k < 4 ? l : h));
};
const swordG = (h, m, l) => (p) => {
    for (let k = 0; k <= 8; k++) {
        const x = 6 + k,
            y = 9 - k;
        p(x, y, h);
        p(x + 1, y, m);
        p(x, y - 1, l);
    }
    [
        [3, 8],
        [4, 9],
        [5, 10],
        [6, 11],
        [7, 12],
    ].forEach(([x, y]) => p(x, y, "#5e4524"));
    [
        [4, 11],
        [3, 12],
        [2, 13],
        [1, 14],
    ].forEach(([x, y], i) => p(x, y, i % 2 ? "#5e4524" : "#8a6a3a"));
};
const DIRT = noise(["#866043", "#79553a", "#6b4a30", "#94694a", "#5a3e28"]);
const COBBLE_IMG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA0ElEQVQ4y22S0Q2FMAwDMyMbMABvjcck3YD5QKl01WHxUVDcxElc1+847n3f7zHGPNu2zRjsuq75P//nxPpvrJzYQJ8m6diJ4JB04xdBB/33RBQaT5JiXICMjUPGOk1W/XECYxNDCM7hrvqiCVIHjwxmTZYGqbB390o0Md6E5WRYc2+vRQ53ZTbUzmJIrQnalYtTeU9Ed686Rcyi7EKhReUllgZO8J7e3S+CS5cGTk5N0okWeVk5PW8rf73My8p2Vlr3q9i+mSKmZb9I3DVf7AEDw33Q7E89pwAAAABJRU5ErkJggg==";
