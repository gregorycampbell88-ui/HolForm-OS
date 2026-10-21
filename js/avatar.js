// ============================================================
// HolForm Ranger — layered SVG hero + unlock catalogs
// (original design; lv = level that unlocks the item)
// ============================================================

const SUITS = [
  { id: 'emerald', label: 'Emerald', lv: 1, color: '#14a85f' },
  { id: 'crimson', label: 'Crimson', lv: 1, color: '#d23b3b' },
  { id: 'cobalt', label: 'Cobalt', lv: 1, color: '#2d63d8' },
  { id: 'solar', label: 'Solar', lv: 1, color: '#e8b82a' },
  { id: 'rose', label: 'Rose', lv: 1, color: '#e0589a' },
  { id: 'onyx', label: 'Onyx', lv: 1, color: '#2b3036' },
  { id: 'violet', label: 'Violet', lv: 8, color: '#7a4fd0' },
];
const TRIMS = [
  { id: 'gold', label: 'Gold', lv: 1, color: '#f2c14e' },
  { id: 'silver', label: 'Silver', lv: 1, color: '#cfd6dc' },
  { id: 'white', label: 'White', lv: 1, color: '#f4f6f7' },
];
const HELMETS = [
  { id: 'sentinel', label: 'Sentinel', lv: 1 },
  { id: 'tiger', label: 'Tiger', lv: 1 },
  { id: 'hawk', label: 'Hawk', lv: 1 },
  { id: 'wolf', label: 'Wolf', lv: 1 },
  { id: 'dragon', label: 'Dragon', lv: 6 },
  { id: 'phoenix', label: 'Phoenix', lv: 10 },
];
const EMBLEMS = [
  { id: 'tiger', label: 'Tiger', lv: 1 },
  { id: 'hawk', label: 'Hawk', lv: 1 },
  { id: 'wolf', label: 'Wolf', lv: 1 },
];
const CHESTS = [
  { id: 'standard', label: 'Standard', lv: 1 },
  { id: 'guardian', label: 'Guardian Shield', lv: 2 },
  { id: 'dragon', label: 'Dragon Shield', lv: 5 },
  { id: 'titan', label: 'Titan Armor', lv: 9 },
];
const WEAPONS = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'blade', label: 'Guardian Blade', lv: 3 },
  { id: 'blaster', label: 'Blaster', lv: 5 },
  { id: 'staff', label: 'Battle Staff', lv: 7 },
  { id: 'twin', label: 'Twin Blades', lv: 10 },
];
const CAPES = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'short', label: 'Short Cape', lv: 6 },
  { id: 'legend', label: 'Legend Cape', lv: 11 },
];
const BEASTS = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'tiger', label: 'Tiger Guardian', lv: 4 },
  { id: 'hawk', label: 'Hawk Guardian', lv: 7 },
  { id: 'wolf', label: 'Wolf Guardian', lv: 9 },
  { id: 'dragon', label: 'Dragon Guardian', lv: 12 },
];
const AURAS = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'glow', label: 'Power Glow', lv: 2 },
  { id: 'blaze', label: 'Blazing Mode', lv: 5 },
  { id: 'bolt', label: 'Lightning', lv: 8 },
  { id: 'legend', label: 'Legend Surge', lv: 11 },
];
const BACKGROUNDS = [
  { id: 'plain', label: 'Plain', lv: 1 },
  { id: 'sunrise', label: 'Sunrise', lv: 2 },
  { id: 'city', label: 'Command Center', lv: 4 },
  { id: 'stars', label: 'Stars', lv: 6 },
  { id: 'forest', label: 'Forest', lv: 8 },
  { id: 'arena', label: 'Arena', lv: 10 },
];
// Unmasked look (shown when the helmet is off)
const CHARS = [
  { id: 'kai', label: 'Focused', lv: 1, eye: '#2c6fb5', tilt: 0, iris: [8.5, 11] },
  { id: 'ren', label: 'Fierce', lv: 1, eye: '#1fa36b', tilt: 4, iris: [8, 11.5] },
  { id: 'mika', label: 'Bright', lv: 1, eye: '#b5612c', tilt: -1, iris: [9.5, 11.5] },
];
const SKINS = [
  { id: 's1', label: 'Fair', lv: 1, color: '#fbe0cf' },
  { id: 's2', label: 'Light', lv: 1, color: '#f2c6a0' },
  { id: 's3', label: 'Tan', lv: 1, color: '#d9a273' },
  { id: 's4', label: 'Brown', lv: 1, color: '#b57a4e' },
  { id: 's5', label: 'Deep', lv: 1, color: '#8a5a3a' },
  { id: 's6', label: 'Dark', lv: 1, color: '#5e3a26' },
];
const HAIR_STYLES = [
  { id: 'short', label: 'Short', lv: 1 },
  { id: 'swept', label: 'Swept', lv: 1 },
  { id: 'spiky', label: 'Spiky', lv: 1 },
  { id: 'long', label: 'Long', lv: 2 },
  { id: 'bun', label: 'Top bun', lv: 6 },
];
const HAIR_COLORS = [
  { id: 'black', label: 'Black', lv: 1, color: '#1b1b22' },
  { id: 'brown', label: 'Brown', lv: 1, color: '#5a3a22' },
  { id: 'blonde', label: 'Blonde', lv: 1, color: '#e0b84a' },
  { id: 'red', label: 'Red', lv: 1, color: '#b8442c' },
  { id: 'blue', label: 'Blue', lv: 1, color: '#3b6fd8' },
  { id: 'green', label: 'Green', lv: 3, color: '#16a268' },
  { id: 'white', label: 'White', lv: 6, color: '#e8ecef' },
];

const CATALOG_SECTIONS = [
  { key: 'suit', label: 'Suit color', items: SUITS, onboarding: true },
  { key: 'trim', label: 'Trim', items: TRIMS, onboarding: true },
  { key: 'helmet', label: 'Helmet', items: HELMETS, onboarding: true },
  { key: 'emblem', label: 'Emblem', items: EMBLEMS, onboarding: true },
  { key: 'skin', label: 'Skin tone (helmet off)', items: SKINS, onboarding: true },
  { key: 'hairStyle', label: 'Hairstyle (helmet off)', items: HAIR_STYLES, onboarding: true },
  { key: 'hairColor', label: 'Hair color (helmet off)', items: HAIR_COLORS },
  { key: 'base', label: 'Face (helmet off)', items: CHARS },
  { key: 'chest', label: 'Chest armor', items: CHESTS },
  { key: 'weapon', label: 'Weapon', items: WEAPONS },
  { key: 'cape', label: 'Cape', items: CAPES },
  { key: 'beast', label: 'Guardian beast', items: BEASTS },
  { key: 'aura', label: 'Power-up', items: AURAS },
  { key: 'background', label: 'Background', items: BACKGROUNDS },
];


// ---- pixel engine ----
// The hero is drawn on a 40x48 pixel grid and emitted as crisp SVG rects.
// Colors may carry an opacity as "#rrggbb@0.4".

const GW = 40;
const GH = 48;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((target - r) * p + r);
  g = Math.round((target - g) * p + g);
  b = Math.round((target - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

class PX {
  constructor() { this.c = new Array(GW * GH).fill(null); }
  get(x, y) { return x < 0 || y < 0 || x >= GW || y >= GH ? null : this.c[y * GW + x]; }
  set(x, y, col) { if (x >= 0 && y >= 0 && x < GW && y < GH) this.c[y * GW + x] = col; }
  rect(x, y, w, h, col) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col); }
  ellipse(cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, col);
      }
    }
  }
  poly(pts, col) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach((p) => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        if (inPoly(x + 0.5, y + 0.5, pts)) this.set(x, y, col);
      }
    }
  }
  mpoly(pts, col) { this.poly(pts, col); this.poly(pts.map((p) => [GW - p[0], p[1]]), col); }
  line(x0, y0, x1, y1, col, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      for (let t = 0; t < th; t++) this.set(x0 + t, y0, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  sprite(rows, ox, oy, pal) {
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && pal[ch]) this.set(ox + i, oy + j, pal[ch]); }));
  }
  paste(src) { src.c.forEach((v, i) => { if (v) this.c[i] = v; }); }
  // light on the top/left rim, dark on the bottom/right rim
  bevel(light, dark) {
    const snap = this.c.slice();
    const g = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH ? null : snap[y * GW + x]);
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        if (!snap[y * GW + x]) continue;
        if (!g(x, y - 1) || !g(x - 1, y)) this.c[y * GW + x] = light;
        else if (!g(x, y + 1) || !g(x + 1, y)) this.c[y * GW + x] = dark;
      }
    }
  }
  outline(col) {
    const snap = this.c.slice();
    const g = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH ? null : snap[y * GW + x]);
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        if (snap[y * GW + x]) continue;
        if (g(x - 1, y) || g(x + 1, y) || g(x, y - 1) || g(x, y + 1)) this.c[y * GW + x] = col;
      }
    }
  }
  svg() {
    let out = '';
    for (let y = 0; y < GH; y++) {
      let x = 0;
      while (x < GW) {
        const c = this.c[y * GW + x];
        if (!c) { x++; continue; }
        let e = x + 1;
        while (e < GW && this.c[y * GW + e] === c) e++;
        const parts = c.split('@');
        out += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${parts[0]}"${parts[1] ? ` fill-opacity="${parts[1]}"` : ''}/>`;
        x = e;
      }
    }
    return out;
  }
}

function translucent(buf, color, fillA, edgeA) {
  const out = new PX();
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      if (!buf.get(x, y)) continue;
      const edge = !buf.get(x - 1, y) || !buf.get(x + 1, y) || !buf.get(x, y - 1) || !buf.get(x, y + 1);
      out.set(x, y, `${color}@${edge ? edgeA : fillA}`);
    }
  }
  return out;
}

// ---- layers ----

function pxBackground(id) {
  const b = new PX();
  const bands = (cols) => {
    const h = GH / cols.length;
    cols.forEach((c, i) => b.rect(0, Math.round(i * h), GW, Math.ceil(h) + 1, c));
  };
  switch (id) {
    case 'sunrise':
      bands(['#ffb870', '#f59a62', '#e97b57', '#d4604f', '#a8465a', '#6b3359', '#4a2850']);
      b.ellipse(20, 36, 10, 10, '#ffe7a3');
      b.ellipse(20, 36, 7.5, 7.5, '#fff3c4');
      b.poly([[0, 41], [8, 38], [16, 41], [24, 39], [32, 41], [40, 38], [40, 48], [0, 48]], '#3a1d3f');
      break;
    case 'city':
      bands(['#1c3b5a', '#17324d', '#122941', '#0e2035', '#0a1828']);
      [[0, 30, 7, 18], [6, 26, 6, 22], [12, 32, 6, 16], [22, 28, 7, 20], [29, 24, 6, 24], [34, 31, 6, 17]]
        .forEach((r) => b.rect(r[0], r[1], r[2], r[3], '#0b1520'));
      [[2, 34], [4, 38], [8, 31], [9, 36], [24, 33], [26, 38], [31, 29], [33, 35], [36, 36], [36, 40]]
        .forEach((w) => b.set(w[0], w[1], '#ffd36a'));
      break;
    case 'stars':
      b.rect(0, 0, GW, GH, '#0a0e1c');
      [[4, 6], [12, 3], [30, 5], [36, 12], [6, 18], [34, 20], [22, 2], [3, 30], [37, 32], [20, 8], [9, 11], [27, 14], [15, 24], [31, 40]]
        .forEach((s, i) => { b.set(s[0], s[1], '#fff'); if (i % 3 === 0) { b.set(s[0] + 1, s[1], '#fff@0.5'); b.set(s[0] - 1, s[1], '#fff@0.5'); b.set(s[0], s[1] + 1, '#fff@0.5'); b.set(s[0], s[1] - 1, '#fff@0.5'); } });
      break;
    case 'forest':
      bands(['#14473a', '#103d31', '#0d3228', '#0a281f']);
      [[3, 26], [10, 20], [30, 22], [37, 28]].forEach((t) => {
        b.poly([[t[0], t[1]], [t[0] - 5, t[1] + 14], [t[0] + 5, t[1] + 14]], '#0c2e25');
        b.poly([[t[0], t[1] - 5], [t[0] - 4, t[1] + 6], [t[0] + 4, t[1] + 6]], '#0f3b2f');
      });
      break;
    case 'arena':
      b.rect(0, 0, GW, GH, '#140e24');
      b.poly([[8, 0], [13, 0], [24, 48], [0, 48]], '#ffffff@0.07');
      b.poly([[27, 0], [32, 0], [40, 48], [16, 48]], '#ffffff@0.07');
      break;
    default:
      b.rect(0, 0, GW, GH, '#161c20');
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if ((x * 13 + y * 7 + x * y) % 11 === 0) b.set(x, y, '#1a2126');
  }
  return b;
}

function pxBeast(kind, trim) {
  if (!kind || kind === 'none') return null;
  const s = new PX();
  const X = '#000';
  switch (kind) {
    case 'tiger':
      s.ellipse(20, 24, 19, 20, X); s.ellipse(5, 8, 5, 5, X); s.ellipse(35, 8, 5, 5, X);
      break;
    case 'hawk':
      s.mpoly([[1, 33], [0, 14], [2, 8], [8, 5], [8, 13], [12, 10], [12, 17], [16, 15], [17, 27], [11, 30]], X);
      break;
    case 'wolf':
      s.ellipse(20, 25, 18, 20, X);
      s.mpoly([[7, 22], [4, 1], [17, 12]], X);
      break;
    case 'dragon':
      s.mpoly([[19, 36], [6, 40], [8, 31], [1, 31], [5, 23], [0, 19], [10, 17], [10, 8], [19, 19]], X);
      s.mpoly([[14, 11], [9, 9], [7, 3], [10, 3], [11, 7], [15, 9]], X);
      s.poly([[18, 7], [20, 2], [22, 7]], X);
      break;
    default:
      return null;
  }
  const out = translucent(s, trim, 0.2, 0.75);
  if (kind === 'tiger') {
    [[2, 21, 7, 22], [2, 26, 7, 27], [33, 22, 38, 21], [33, 27, 38, 26], [6, 9, 8, 11], [32, 11, 34, 9]]
      .forEach((l) => out.line(l[0], l[1], l[2], l[3], `${trim}@0.65`));
  }
  return out;
}

function pxAura(kind, suit) {
  if (!kind || kind === 'none') return null;
  const p = new PX();
  const glow = (color) => {
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const d = Math.hypot(x + 0.5 - 20, y + 0.5 - 24);
        if (d < 9 || d > 21.5) continue;
        const a = d < 14 ? 0.4 : d < 18 ? 0.28 : ((x + y) % 2 === 0 ? 0.22 : null);
        if (a) p.set(x, y, `${color}@${a}`);
      }
    }
  };
  const flame = (x, y, h, w, outer, inner) => {
    p.poly([[x - w, y], [x - w * 0.6, y - h * 0.55], [x, y - h], [x + w * 0.6, y - h * 0.55], [x + w, y]], outer);
    p.poly([[x - w * 0.5, y], [x - w * 0.3, y - h * 0.4], [x, y - h * 0.65], [x + w * 0.3, y - h * 0.4], [x + w * 0.5, y]], inner);
  };
  if (kind === 'glow') glow(suit);
  if (kind === 'blaze') {
    glow('#ffb020');
    [[10, 20, 8, 2.6], [30, 20, 8, 2.6], [20, 9, 10, 3.2], [13, 12, 7, 2.3], [27, 12, 7, 2.3], [4, 36, 9, 2.6], [36, 36, 9, 2.6], [7, 28, 7, 2.2], [33, 28, 7, 2.2]]
      .forEach((f, i) => flame(f[0], f[1], f[2], f[3], i % 2 ? '#ff8a1f' : '#ffb020', '#fff3b0'));
  }
  if (kind === 'bolt') {
    glow('#3aa5d8');
    const bolt = [[6, 11], [9, 17], [7, 18], [10, 24]];
    const bolt2 = [[3, 22], [6, 26], [4, 27], [7, 31]];
    [bolt, bolt2].forEach((pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#9be3ff');
        p.line(GW - pts[i][0] - 1, pts[i][1], GW - pts[i + 1][0] - 1, pts[i + 1][1], '#9be3ff');
      }
    });
  }
  if (kind === 'legend') {
    glow('#ffd54a');
    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI) / 6;
      p.line(20 + Math.cos(ang) * 15, 24 + Math.sin(ang) * 15, 20 + Math.cos(ang) * 24, 24 + Math.sin(ang) * 24, '#fff3b0@0.45');
    }
    [[6, 14], [34, 18], [9, 31], [32, 8], [4, 6]].forEach((s) => {
      p.set(s[0], s[1], '#fff3b0'); p.set(s[0] - 1, s[1], '#fff3b0'); p.set(s[0] + 1, s[1], '#fff3b0'); p.set(s[0], s[1] - 1, '#fff3b0'); p.set(s[0], s[1] + 1, '#fff3b0');
    });
  }
  return p;
}

const EMBLEM_SPRITES = {
  tiger: ['c.cccc.c', 'cccccccc', 'cdccccdc', 'cccddccc', 'cccccccc', '.cdccdc.', '..cccc..', '........'],
  hawk: ['c......c', 'cc....cc', 'ccc..ccc', 'cccddccc', '.cccccc.', '..cccc..', '...cc...', '........'],
  wolf: ['cc....cc', 'ccc..ccc', 'cccccccc', 'cdccccdc', 'cccddccc', '.cccccc.', '..cddc..', '...cc...'],
};

function avatarSVG(a) {
  const suit = (SUITS.find((s) => s.id === a.suit) || SUITS[0]).color;
  const suitD = shade(suit, -0.3);
  const suitL = shade(suit, 0.3);
  const trim = (TRIMS.find((t) => t.id === a.trim) || TRIMS[0]).color;
  const trimD = shade(trim, -0.38);
  const trimL = shade(trim, 0.35);
  const WHITE = '#eef2f4';
  const WHITE_D = '#c3ccd1';
  const INK = '#0b0e10';
  const DARK = '#0e1113';
  const morphed = a.morphed !== false;

  const hero = new PX();
  const layer = (draw, bevelPair) => {
    const t = new PX();
    draw(t);
    if (bevelPair) t.bevel(bevelPair[0], bevelPair[1]);
    hero.paste(t);
  };

  // ---- weapons behind the hero ----
  if (a.weapon === 'blade') {
    layer((t) => {
      t.rect(33, 4, 3, 33, '#d9e8ee'); t.rect(33, 4, 1, 33, '#aebfc7'); t.set(34, 3, '#d9e8ee'); t.rect(34, 6, 1, 28, '#f6fbfd');
      t.rect(31, 37, 7, 2, trim); t.rect(31, 38, 7, 1, trimD);
    });
  } else if (a.weapon === 'twin') {
    layer((t) => {
      t.line(20, 46, 4, 3, '#d9e8ee', 3);
      t.line(18, 46, 2, 3, '#aebfc7', 1);
      t.line(18, 46, 34, 3, '#d9e8ee', 3);
      t.line(22, 46, 38, 3, '#aebfc7', 1);
    });
  } else if (a.weapon === 'staff') {
    layer((t) => {
      t.rect(3, 4, 2, 44, trim); t.rect(3, 4, 1, 44, trimL);
      t.ellipse(4, 3.5, 3.4, 3.4, trim); t.ellipse(4, 3.5, 2.2, 2.2, suitL);
    });
  }

  // ---- cape ----
  if (a.cape === 'short') {
    layer((t) => t.mpoly([[8, 35], [4, 40], [3, 48], [12, 48], [11, 37]], suitD));
  } else if (a.cape === 'legend') {
    layer((t) => { t.mpoly([[8, 34], [2, 40], [0, 48], [13, 48], [11, 36]], trim); t.mpoly([[8, 35], [3, 40], [2, 47], [12, 47], [11, 37]], suitD); });
  }

  // ---- unmasked hair (back layer) ----
  const skin = (SKINS.find((s) => s.id === a.skin) || SKINS[2]).color;
  const skinD = shade(skin, -0.16);
  const hair = (HAIR_COLORS.find((c) => c.id === a.hairColor) || HAIR_COLORS[0]).color;
  const hairD = shade(hair, -0.3);
  const hairL = shade(hair, 0.22);
  const ch = CHARS.find((c) => c.id === a.base) || CHARS[0];
  if (!morphed) {
    if (a.hairStyle === 'long') layer((t) => t.poly([[11, 16], [10, 28], [11.5, 38], [28.5, 38], [30, 28], [29, 16], [27, 6], [13, 6]], hair));
    if (a.hairStyle === 'spiky') layer((t) => t.poly([[12, 14], [10, 8], [15, 11], [17, 4], [20, 10], [23, 4], [25, 11], [30, 8], [28, 14]], hair));
    if (a.hairStyle === 'bun') layer((t) => t.ellipse(20, 6, 3.4, 3.4, hair));
  }

  // ---- body ----
  layer((t) => t.poly([[3, 48], [3, 41], [7, 36], [13, 32.5], [20, 31.5], [27, 32.5], [33, 36], [37, 41], [37, 48]], suit), [suitL, suitD]);
  layer((t) => t.mpoly([[3, 48], [3, 42], [6, 37.5], [9, 35], [14, 48]], WHITE), [WHITE, WHITE_D]);
  layer((t) => t.rect(17, 27, 6, 6, morphed ? suitD : skinD));
  layer((t) => t.poly([[15.5, 31.5], [17.5, 29.5], [22.5, 29.5], [24.5, 31.5], [25.5, 36], [14.5, 36]], WHITE), [WHITE, WHITE_D]);

  // ---- chest armor ----
  const emblemSprite = EMBLEM_SPRITES[a.emblem] || EMBLEM_SPRITES.tiger;
  const pal = { c: trim, d: DARK };
  switch (a.chest) {
    case 'guardian':
    case 'titan':
      layer((t) => t.poly([[3.5, 39.5], [9, 35], [20, 33.5], [31, 35], [36.5, 39.5], [30, 48], [10, 48]], trim), [trimL, trimD]);
      layer((t) => t.poly([[6, 40], [10.5, 36.5], [20, 35.5], [29.5, 36.5], [34, 40], [28.5, 46.5], [11.5, 46.5]], suit), [suitL, suitD]);
      layer((t) => { t.ellipse(20, 41, 6, 6, trim); t.ellipse(20, 41, 4.9, 4.9, DARK); t.sprite(emblemSprite, 16, 37, pal); });
      if (a.chest === 'titan') {
        layer((t) => { t.ellipse(7, 37, 5.6, 3.4, trim); t.ellipse(33, 37, 5.6, 3.4, trim); }, [trimL, trimD]);
        hero.set(7, 37, suitL); hero.set(33, 37, suitL);
      }
      break;
    case 'dragon':
      layer((t) => t.ellipse(20, 44, 10.5, 10.5, trim), [trimL, trimD]);
      layer((t) => { t.ellipse(20, 44, 7.6, 7.6, trimD); t.ellipse(20, 44, 6.6, 6.6, trim); t.ellipse(20, 44, 4.8, 4.8, DARK); t.sprite(emblemSprite, 16, 40, pal); });
      [[20, 34], [13, 37], [27, 37], [10, 44], [30, 44]].forEach((s) => hero.set(s[0], s[1], trimD));
      break;
    default:
      layer((t) => { t.line(15, 36, 20, 41, trim); t.line(25, 36, 20, 41, trim); t.sprite(emblemSprite, 16, 38, pal); t.rect(6, 46, 28, 2, trim); t.rect(18, 46, 4, 2, trimD); });
  }

  // ---- helmet or face ----
  if (morphed) {
    // pieces that sit behind the shell
    switch (a.helmet) {
      case 'tiger':
        layer((t) => { t.mpoly([[11, 13], [11, 4], [17, 8]], suit); t.mpoly([[12.4, 10.5], [12.4, 6.5], [15.4, 8.6]], trim); }, null);
        break;
      case 'hawk':
        layer((t) => t.mpoly([[11, 17], [3.5, 10.5], [8, 22.5], [11, 24]], trim), [trimL, trimD]);
        break;
      case 'wolf':
        layer((t) => { t.mpoly([[12, 13], [9.5, 2], [17.5, 8]], suit); t.mpoly([[12.6, 10.5], [11, 5], [15.4, 8.6]], trim); }, null);
        break;
      case 'dragon':
        layer((t) => t.mpoly([[14, 11], [8.5, 9], [6.5, 3], [10, 2.5], [11.2, 7], [15, 9]], trim), [trimL, trimD]);
        break;
      case 'phoenix':
        layer((t) => {
          t.poly([[16, 9], [17, 4.5], [20, 0.5], [23, 4.5], [24, 9]], '#ffb020');
          t.mpoly([[13, 10], [13, 6], [16, 4], [17, 8.5]], '#ff8a1f');
          t.poly([[18.2, 9], [19, 5.5], [20, 3.5], [21, 5.5], [21.8, 9]], '#fff3b0');
        });
        break;
      default:
        break;
    }
    layer((t) => t.ellipse(20, 17, 9, 10.5, suit), [suitL, suitD]);
    // visor (trim edge, glass, glints) and chin guard
    layer((t) => t.poly([[15.5, 24], [24.5, 24], [23.6, 27.2], [20, 28.4], [16.4, 27.2]], WHITE), [WHITE, WHITE_D]);
    layer((t) => t.poly([[13.2, 15], [26.8, 15], [25.8, 21.5], [22.8, 24.2], [20, 25], [17.2, 24.2], [14.2, 21.5]], trim));
    layer((t) => t.poly([[14, 15.8], [26, 15.8], [25, 21], [22.4, 23.4], [20, 24.2], [17.6, 23.4], [15, 21]], '#0a0d10'));
    [[15, 17], [16, 17], [15, 18], [17, 18]].forEach((g) => hero.set(g[0], g[1], '#ffffff@0.3'));
    // crest pieces on top of the shell
    switch (a.helmet) {
      case 'tiger':
        [[18, 8], [18, 9], [18, 10], [21, 8], [21, 9], [21, 10], [19, 7], [20, 7], [19, 8], [20, 8]].forEach((s) => hero.set(s[0], s[1], DARK));
        break;
      case 'hawk':
        layer((t) => t.poly([[20, 5.5], [22.5, 11.5], [20, 14.5], [17.5, 11.5]], trim), [trimL, trimD]);
        break;
      case 'wolf':
        layer((t) => t.poly([[20, 7.5], [21.8, 11.5], [20, 13.8], [18.2, 11.5]], trim), [trimL, trimD]);
        break;
      case 'dragon':
        layer((t) => t.poly([[20, 4.5], [22.4, 9.5], [20, 12], [17.6, 9.5]], trim), [trimL, trimD]);
        break;
      case 'phoenix':
        layer((t) => t.poly([[20, 8], [21.8, 11.8], [20, 13.8], [18.2, 11.8]], trim), [trimL, trimD]);
        break;
      default:
        layer((t) => t.poly([[20, 5.5], [24, 11.5], [20, 9.8], [16, 11.5]], trim), [trimL, trimD]);
        hero.set(19, 12, suitL); hero.set(20, 12, suitL);
    }
  } else {
    // unmasked face
    layer((t) => { t.rect(11, 17, 2, 4, skin); t.rect(27, 17, 2, 4, skin); });
    layer((t) => t.ellipse(20, 18, 7.6, 9.6, skin));
    hero.set(11, 19, skinD); hero.set(28, 19, skinD);
    const eye = (x) => {
      hero.rect(x, 16, 3, 1, INK);
      hero.rect(x, 17, 3, 3, '#ffffff');
      hero.rect(x + 1, 17, 2, 3, ch.eye);
      hero.set(x + 1, 18, INK); hero.set(x + 1, 17, '#ffffff');
    };
    eye(15); eye(22);
    hero.rect(14, 14, 4, 1, hairD); hero.rect(22, 14, 4, 1, hairD);
    hero.set(19, 21, skinD); hero.set(20, 21, skinD);
    hero.rect(18, 24, 4, 1, '#8a3b3b'); hero.set(17, 23, '#8a3b3b'); hero.set(22, 23, '#8a3b3b');
    hero.rect(14, 21, 2, 1, '#ff7a7a@0.4'); hero.rect(24, 21, 2, 1, '#ff7a7a@0.4');
    // front hair
    switch (a.hairStyle) {
      case 'swept':
        layer((t) => { t.poly([[11.5, 18], [11, 11], [14, 6.5], [21, 5], [27, 7], [29, 12], [28.5, 18], [27, 13], [22, 10], [17, 10.5], [13.5, 14]], hair); t.poly([[14, 11], [19, 8], [26, 9], [21, 11]], hairL); });
        break;
      case 'long':
        layer((t) => t.poly([[12, 17], [11.5, 11], [14, 7], [20, 5.5], [26, 7], [28.5, 11], [28, 17], [26, 13], [20, 10.5], [14, 13]], hair));
        break;
      default:
        layer((t) => t.poly([[12, 17], [11.5, 11], [14, 7], [20, 5.5], [26, 7], [28.5, 11], [28, 17], [26, 13.5], [23, 11.5], [20, 13], [17, 11.5], [14, 13.5]], hair));
        [[15, 8], [16, 7], [17, 7]].forEach((s) => hero.set(s[0], s[1], hairL));
    }
  }

  // ---- weapon in front ----
  if (a.weapon === 'blaster') {
    layer((t) => { t.rect(22, 43, 11, 4, '#2a3138'); t.rect(22, 42, 8, 1, trim); t.rect(31, 41, 3, 3, '#2a3138'); t.rect(24, 44, 6, 1, suitL); t.set(34, 42, suitL); });
  }

  hero.outline(INK);

  const beast = pxBeast(a.beast, trim);
  const aura = pxAura(a.aura, suit);
  return `<svg viewBox="0 0 ${GW} ${GH}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" class="avatar-svg avatar-pixel" role="img" aria-label="Your ranger">` +
    pxBackground(a.background).svg() +
    (beast ? beast.svg() : '') +
    (aura ? `<g class="aura-pulse">${aura.svg()}</g>` : '') +
    hero.svg() + '</svg>';
}
