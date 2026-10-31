// ============================================================
// HolForm Ranger — layered SVG hero + unlock catalogs
// (original design; lv = level that unlocks the item)
// ============================================================

// Suit colors: four to start, the rest unlock one per level in this order.
// Emerald is last on purpose (the favorite). Its color value (#14a85f) must
// stay matched to the green in the imported art so it needs no recoloring.
const SUITS = [
  { id: 'crimson', label: 'Crimson', lv: 1, color: '#d23b3b' },
  { id: 'solar', label: 'Solar', lv: 1, color: '#e8b82a' },
  { id: 'cobalt', label: 'Cobalt', lv: 1, color: '#2d63d8' },
  { id: 'rose', label: 'Rose', lv: 1, color: '#e0589a' },
  { id: 'graphite', label: 'Graphite', lv: 2, color: '#4a5058' },
  { id: 'orange', label: 'Orange', lv: 3, color: '#ee7d1f' },
  { id: 'white', label: 'White', lv: 4, color: '#eef2f4' },
  { id: 'violet', label: 'Violet', lv: 5, color: '#7a4fd0' },
  { id: 'navy', label: 'Navy', lv: 6, color: '#1d3470' },
  { id: 'silver', label: 'Silver', lv: 7, color: '#b9c2c8' },
  { id: 'gold', label: 'Gold', lv: 8, color: '#cc9a1a' },
  { id: 'onyx', label: 'Onyx', lv: 9, color: '#2b3036' },
  { id: 'emerald', label: 'Emerald', lv: 10, color: '#14a85f' },
];
// Trim: gold to start; white, silver, graphite, then onyx unlock.
const TRIMS = [
  { id: 'gold', label: 'Gold', lv: 1, color: '#f2c14e' },
  { id: 'white', label: 'White', lv: 3, color: '#f4f6f7' },
  { id: 'silver', label: 'Silver', lv: 5, color: '#cfd6dc' },
  { id: 'graphite', label: 'Graphite', lv: 6, color: '#6b727a' },
  { id: 'onyx', label: 'Onyx', lv: 7, color: '#2b3036' },
];
// Trim 2 recolors the white parts (boots, gloves, suit accents). Same colors as trim 1;
// white is the art as drawn, so it is free from the start.
const TRIMS2 = [
  { id: 'white', label: 'White', lv: 1, color: '#f4f6f7' },
  { id: 'gold', label: 'Gold', lv: 1, color: '#f2c14e' },
  { id: 'silver', label: 'Silver', lv: 5, color: '#cfd6dc' },
  { id: 'graphite', label: 'Graphite', lv: 6, color: '#6b727a' },
  { id: 'onyx', label: 'Onyx', lv: 7, color: '#2b3036' },
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
  { id: 'legend', label: 'Legendary Surge', lv: 11 },
  { id: 'legend2', label: 'Legendary Surge II', lv: 15 },
];
const BACKGROUNDS = [
  { id: 'plain', label: 'Plain', lv: 1 },
  { id: 'sunrise', label: 'Sunrise', lv: 2 },
  { id: 'city', label: 'Command Center (Outside)', lv: 4 },
  { id: 'city-inside', label: 'Command Center (Inside)', lv: 6 },
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
  { id: 'short', label: 'Short crop', lv: 1 },
  { id: 'fade', label: 'Fade + curls', lv: 1 },
  { id: 'coils', label: 'Coils', lv: 1 },
  { id: 'afro', label: 'Afro', lv: 1 },
  { id: 'twists', label: 'Twists', lv: 1 },
  { id: 'locs', label: 'Locs', lv: 1 },
  { id: 'braids', label: 'Cornrows + braids', lv: 1 },
  { id: 'spiky', label: 'Spiky', lv: 1 },
  { id: 'swept', label: 'Swept', lv: 2 },
  { id: 'long', label: 'Long', lv: 3 },
  { id: 'bun', label: 'Top bun', lv: 6 },
];
const GLOVES = [
  { id: 'standard', label: 'Standard', lv: 1 },
  { id: 'gauntlet', label: 'Armored Gauntlets', lv: 4 },
  { id: 'power', label: 'Power Gauntlets', lv: 8 },
];
const BOOTS = [
  { id: 'standard', label: 'Standard', lv: 1 },
  { id: 'armored', label: 'Armored Boots', lv: 3 },
  { id: 'winged', label: 'Winged Boots', lv: 9 },
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
  { key: 'trim2', label: 'Trim 2 (boots, gloves, accents)', items: TRIMS2 },
  { key: 'helmet', label: 'Helmet', items: HELMETS, onboarding: true },
  { key: 'emblem', label: 'Emblem', items: EMBLEMS, onboarding: true },
  { key: 'skin', label: 'Skin tone (helmet off)', items: SKINS, onboarding: true },
  { key: 'hairStyle', label: 'Hairstyle (helmet off)', items: HAIR_STYLES, onboarding: true },
  { key: 'hairColor', label: 'Hair color (helmet off)', items: HAIR_COLORS },
  { key: 'base', label: 'Face (helmet off)', items: CHARS },
  { key: 'chest', label: 'Chest armor', items: CHESTS },
  { key: 'gloves', label: 'Gauntlets', items: GLOVES },
  { key: 'boots', label: 'Boots', items: BOOTS },
  { key: 'weapon', label: 'Weapon', items: WEAPONS },
  { key: 'cape', label: 'Cape', items: CAPES },
  { key: 'beast', label: 'Guardian beast', items: BEASTS },
  { key: 'aura', label: 'Aura', items: AURAS },
  { key: 'background', label: 'Background', items: BACKGROUNDS },
];


// ---- pixel engine ----
// The hero is a full-body sprite on a 64x96 pixel grid, emitted as crisp SVG
// rects. Colors may carry an opacity as "#rrggbb@0.4". The center line is x=32.

const GW = 64;
const GH = 104;

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

function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) % 1000;
}

class PX {
  constructor() { this.c = new Array(GW * GH).fill(null); }
  get(x, y) { return x < 0 || y < 0 || x >= GW || y >= GH ? null : this.c[y * GW + x]; }
  set(x, y, col) {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && y >= 0 && x < GW && y < GH) this.c[y * GW + x] = col;
  }
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
  mellipse(cx, cy, rx, ry, col) { this.ellipse(cx, cy, rx, ry, col); this.ellipse(GW - cx, cy, rx, ry, col); }
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
  // scatter light/dark speckles over cells of `base` (hair texture)
  texture(base, light, dark) {
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        if (this.c[y * GW + x] !== base) continue;
        const h = hash2(x, y);
        if (h % 9 === 0) this.c[y * GW + x] = light;
        else if (h % 9 === 4) this.c[y * GW + x] = dark;
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

// ---- background / beast / aura ----

function pxBackground(id) {
  if (id === 'city-inside') id = 'city'; // drawn fallback for the inside view
  const b = new PX();
  const bands = (cols) => {
    const h = GH / cols.length;
    cols.forEach((c, i) => b.rect(0, Math.round(i * h), GW, Math.ceil(h) + 1, c));
  };
  switch (id) {
    case 'sunrise':
      bands(['#ffb870', '#f8a066', '#ee8559', '#dc6a52', '#bd5059', '#8c3d5c', '#5f2f58', '#43264e']);
      b.ellipse(32, 72, 18, 18, '#ffe7a3');
      b.ellipse(32, 72, 13.5, 13.5, '#fff3c4');
      b.poly([[0, 88], [12, 83], [26, 88], [42, 84], [54, 87], [64, 83], [64, 104], [0, 104]], '#3a1d3f');
      break;
    case 'city': {
      bands(['#1c3b5a', '#18344f', '#142c44', '#10243a', '#0c1c2f', '#0a1828']);
      const bl = [[0, 58, 12, 38], [10, 48, 10, 48], [20, 62, 10, 34], [40, 54, 12, 42], [50, 44, 10, 52], [58, 60, 6, 36]];
      bl.forEach((r) => {
        b.rect(r[0], r[1], r[2], r[3] + 8, '#0b1520');
        for (let y = r[1] + 3; y < r[1] + r[3] + 6; y += 4) for (let x = r[0] + 2; x < r[0] + r[2] - 1; x += 3) if (hash2(x, y) % 3 === 0) b.set(x, y, '#ffd36a');
      });
      break;
    }
    case 'stars':
      b.rect(0, 0, GW, GH, '#0a0e1c');
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const h = hash2(x, y);
        if (h < 14) b.set(x, y, '#fff');
        else if (h < 17) { b.set(x, y, '#fff'); b.set(x + 1, y, '#fff@0.5'); b.set(x - 1, y, '#fff@0.5'); b.set(x, y + 1, '#fff@0.5'); b.set(x, y - 1, '#fff@0.5'); }
      }
      break;
    case 'forest':
      bands(['#14473a', '#113f33', '#0e352a', '#0b2a21', '#09221b']);
      [[6, 50], [20, 42], [50, 44], [60, 54], [34, 58]].forEach((t) => {
        b.poly([[t[0], t[1]], [t[0] - 8, t[1] + 26], [t[0] + 8, t[1] + 26]], '#0c2e25');
        b.poly([[t[0], t[1] - 8], [t[0] - 6, t[1] + 10], [t[0] + 6, t[1] + 10]], '#0f3b2f');
      });
      break;
    case 'arena':
      b.rect(0, 0, GW, GH, '#140e24');
      b.poly([[12, 0], [20, 0], [38, 104], [0, 104]], '#ffffff@0.07');
      b.poly([[44, 0], [52, 0], [64, 104], [26, 104]], '#ffffff@0.07');
      b.rect(0, 96, GW, 8, '#1c1432');
      break;
    default:
      b.rect(0, 0, GW, GH, '#161c20');
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (hash2(x, y) % 23 === 0) b.set(x, y, '#1a2126');
  }
  return b;
}

function pxBeast(kind, trim) {
  if (!kind || kind === 'none') return null;
  const s = new PX();
  const X = '#000';
  switch (kind) {
    case 'tiger':
      s.ellipse(32, 44, 31, 38, X); s.mellipse(9, 10, 8, 8, X);
      break;
    case 'hawk':
      s.mpoly([[2, 62], [0, 22], [3, 11], [14, 7], [14, 21], [21, 16], [21, 30], [27, 27], [28, 48], [17, 54]], X);
      s.mpoly([[2, 62], [4, 78], [12, 70], [14, 80], [20, 68], [22, 76], [26, 62], [17, 54]], X);
      break;
    case 'wolf':
      s.ellipse(32, 46, 29, 38, X);
      s.mpoly([[11, 38], [6, 2], [28, 20]], X);
      break;
    case 'dragon':
      s.mpoly([[31, 64], [10, 74], [13, 56], [2, 56], [8, 40], [0, 32], [16, 29], [16, 13], [31, 33]], X);
      s.mpoly([[22, 16], [14, 13], [11, 4], [16, 4], [18, 11], [24, 14]], X);
      s.poly([[29, 8], [32, 1], [35, 8]], X);
      break;
    default:
      return null;
  }
  const out = translucent(s, trim, 0.2, 0.75);
  if (kind === 'tiger') {
    [[4, 36, 14, 38], [3, 46, 13, 47], [5, 56, 14, 55], [50, 38, 60, 36], [51, 47, 61, 46], [50, 55, 59, 56], [6, 10, 10, 14], [54, 14, 58, 10]]
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
        const d = Math.hypot((x + 0.5 - 32) * 0.95, (y + 0.5 - 50) * 0.62);
        if (d < 17 || d > 36) continue;
        const a = d < 24 ? 0.34 : d < 30 ? 0.26 : ((x + y) % 2 === 0 ? 0.2 : null);
        if (a) p.set(x, y, `${color}@${a}`);
      }
    }
  };
  const flame = (x, y, h, w, outer, inner) => {
    p.poly([[x - w, y], [x - w * 0.55, y - h * 0.5], [x - w * 0.1, y - h * 0.62], [x + w * 0.1, y - h], [x + w * 0.5, y - h * 0.55], [x + w, y]], outer);
    p.poly([[x - w * 0.5, y], [x - w * 0.25, y - h * 0.4], [x + w * 0.05, y - h * 0.68], [x + w * 0.3, y - h * 0.4], [x + w * 0.5, y]], inner);
  };
  if (kind === 'glow') glow(suit);
  if (kind === 'blaze') {
    glow('#ffb020');
    [[8, 76, 20, 4], [56, 76, 20, 4], [4, 56, 16, 3.4], [60, 56, 16, 3.4], [12, 42, 18, 3.6], [52, 42, 18, 3.6], [18, 28, 14, 3], [46, 28, 14, 3],
      [22, 88, 16, 3.4], [42, 88, 16, 3.4], [28, 14, 10, 2.4], [36, 14, 10, 2.4], [32, 10, 12, 3]]
      .forEach((f, i) => flame(f[0], f[1], f[2], f[3], i % 2 ? '#ff8a1f' : '#ffb020', i % 3 === 0 ? '#fff3b0' : '#ffe27a'));
  }
  if (kind === 'bolt') {
    glow('#3aa5d8');
    const bolts = [[[8, 14], [14, 28], [10, 29], [17, 46]], [[4, 40], [10, 54], [7, 55], [13, 70]], [[14, 62], [20, 76], [16, 77], [22, 92]]];
    bolts.forEach((pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#9be3ff', 2);
        p.line(GW - pts[i][0] - 2, pts[i][1], GW - pts[i + 1][0] - 2, pts[i + 1][1], '#9be3ff', 2);
      }
    });
  }
  if (kind === 'legend') {
    glow('#ffd54a');
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI) / 8;
      p.line(32 + Math.cos(ang) * 22, 50 + Math.sin(ang) * 32, 32 + Math.cos(ang) * 40, 50 + Math.sin(ang) * 56, '#fff3b0@0.45');
    }
    [[8, 22], [56, 30], [12, 62], [54, 70], [6, 8], [58, 10], [10, 86]].forEach((s) => {
      [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach((d) => p.set(s[0] + d[0], s[1] + d[1], '#fff3b0'));
    });
  }
  return p;
}

const EMBLEM_SPRITES = {
  tiger: ['c.cccc.c', 'cccccccc', 'cdccccdc', 'cccddccc', 'cccccccc', '.cdccdc.', '..cccc..', '........'],
  hawk: ['c......c', 'cc....cc', 'ccc..ccc', 'cccddccc', '.cccccc.', '..cccc..', '...cc...', '........'],
  wolf: ['cc....cc', 'ccc..ccc', 'cccccccc', 'cdccccdc', 'cccddccc', '.cccccc.', '..cddc..', '...cc...'],
};

// ---- the hero ----

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
  const photo = !morphed && a.facePhoto && typeof Face !== 'undefined' ? Face.pixels() : null;

  const skin = (SKINS.find((s) => s.id === a.skin) || SKINS[2]).color;
  const skinD = shade(skin, -0.18);
  const skinL = shade(skin, 0.12);
  const hair = (HAIR_COLORS.find((c) => c.id === a.hairColor) || HAIR_COLORS[0]).color;
  const hairD = shade(hair, -0.32);
  const hairL = shade(hair, 0.24);
  const ch = CHARS.find((c) => c.id === a.base) || CHARS[0];

  const hero = new PX();
  const layer = (draw, bv) => {
    const t = new PX();
    draw(t);
    if (bv) t.bevel(bv[0], bv[1]);
    hero.paste(t);
  };
  // map the helmet shapes (designed around a 20,17 head) onto the 32,13.5 head
  const hp = (pts) => pts.map((p) => [32 + (p[0] - 20) * 0.85, 13.5 + (p[1] - 17) * 0.85]);
  const he = (cx, cy, rx, ry) => [32 + (cx - 20) * 0.85, 13.5 + (cy - 17) * 0.85, rx * 0.85, ry * 0.85];

  // ---------- weapons behind ----------
  if (a.weapon === 'blade') {
    layer((t) => {
      t.rect(51, 6, 3, 54, '#d9e8ee'); t.rect(51, 6, 1, 54, '#aebfc7'); t.rect(52, 9, 1, 46, '#f6fbfd'); t.set(52, 5, '#d9e8ee'); t.set(52, 4, '#aebfc7');
      t.rect(47, 59, 11, 2, trim); t.rect(47, 60, 11, 1, trimD); t.rect(51, 61, 3, 8, trimD);
    });
  } else if (a.weapon === 'twin') {
    layer((t) => {
      t.line(32, 74, 6, 4, '#d9e8ee', 3); t.line(31, 74, 5, 4, '#aebfc7', 1);
      t.line(32, 74, 58, 4, '#d9e8ee', 3); t.line(35, 74, 61, 4, '#aebfc7', 1);
    });
  } else if (a.weapon === 'staff') {
    layer((t) => {
      t.rect(11, 5, 2, 98, trim);
      t.ellipse(12, 5, 4.2, 4.2, trim); t.ellipse(12, 5, 2.8, 2.8, suitL);
    }, [trimL, trimD]);
  }

  // ---------- cape ----------
  if (a.cape === 'short' || a.cape === 'legend') {
    const cape = [[19, 27], [45, 27], [51, 48], [54, 76], [51, 88], [45, 83], [39, 90], [32, 85], [25, 90], [19, 83], [13, 88], [10, 76], [13, 48]];
    if (a.cape === 'legend') layer((t) => t.poly([[18, 26], [46, 26], [53, 48], [57, 78], [53, 94], [46, 88], [39, 96], [32, 90], [25, 96], [18, 88], [11, 94], [7, 78], [11, 48]], trim));
    layer((t) => t.poly(a.cape === 'legend' ? [[19, 27], [45, 27], [52, 48], [55, 77], [52, 91], [45, 86], [39, 93], [32, 88], [25, 93], [19, 86], [12, 91], [9, 77], [12, 48]] : cape, suitD), [shade(suitD, 0.15), shade(suitD, -0.25)]);
  }

  // ---------- back hair (helmet off) ----------
  if (!morphed && !photo) {
    switch (a.hairStyle) {
      case 'long':
        layer((t) => t.poly([[24.5, 10], [22.5, 22], [23.5, 34], [40.5, 34], [41.5, 22], [39.5, 10], [37, 4], [27, 4]], hair));
        break;
      case 'spiky':
        layer((t) => t.poly([[25, 11], [22, 5], [27, 8], [27.5, 0.5], [31, 6.5], [33, 0], [36, 6.5], [38.5, 0.5], [39, 8], [43, 5], [39.5, 11]], hair));
        break;
      case 'bun':
        layer((t) => t.ellipse(32, 2.5, 3.8, 3.4, hair));
        break;
      case 'afro':
        layer((t) => {
          t.ellipse(32, 9.5, 11, 10, hair);
          for (let k = 0; k < 18; k++) { const ang = (k * Math.PI) / 9; t.ellipse(32 + Math.cos(ang) * 10.4, 9.5 + Math.sin(ang) * 9.4, 2.6, 2.6, hair); }
          t.texture(hair, hairL, hairD);
        });
        break;
      default:
        break;
    }
  }

  // ---------- arms (behind torso) ----------
  const GLOVE = a.gloves === 'power' || a.gloves === 'gauntlet';
  // upper arm + shoulder cap
  layer((t) => { t.mpoly([[9.5, 28.5], [18.5, 27.5], [17.5, 43], [10.5, 44]], suit); t.mellipse(14, 30, 5.6, 4.6, suit); }, [suitL, suitD]);
  // forearm
  layer((t) => t.mpoly([[10.5, 43], [17.5, 43], [16.8, 56], [11.5, 56.5]], suit), [suitL, suitD]);
  // gauntlets / cuffs
  if (GLOVE) {
    layer((t) => t.mpoly([[10.2, 45], [17.8, 45], [17.2, 57], [11, 57.5]], trim), [trimL, trimD]);
    layer((t) => t.mpoly([[11.4, 47], [16.6, 47], [16.2, 55], [11.8, 55.4]], suit), [suitL, suitD]);
    if (a.gloves === 'power') { hero.set(14, 50, suitL); hero.set(50, 50, suitL); hero.set(13, 51, '#fff3b0'); hero.set(51, 51, '#fff3b0'); }
  } else {
    layer((t) => t.mpoly([[10.8, 52], [17.2, 52], [17, 56.4], [11.2, 56.8]], trim), [trimL, trimD]);
  }
  // fists
  layer((t) => t.mellipse(14.2, 61, 3.8, 4.4, WHITE), [WHITE, WHITE_D]);
  if (a.gloves === 'power') { hero.set(14, 61, '#fff3b0'); hero.set(50, 61, '#fff3b0'); }

  // ---------- legs ----------
  layer((t) => t.mpoly([[22, 62], [31, 62], [30.2, 83], [23, 83]], suit), [suitL, suitD]);   // thigh
  layer((t) => t.mpoly([[23, 82], [30.2, 82], [29.6, 96], [24, 96]], suit), [suitL, suitD]); // shin
  layer((t) => t.mpoly([[22, 62], [24.2, 62], [24.7, 83], [23.2, 83]], WHITE), [WHITE, WHITE_D]); // outer thigh stripe
  // boots
  layer((t) => t.mpoly([[23.4, 92], [29.8, 92], [30.4, 97], [31, 99.5], [31, 103], [20.5, 103], [20.5, 100], [23, 97.5]], WHITE), [WHITE, WHITE_D]);
  layer((t) => t.mpoly([[23.2, 92], [30, 92], [29.9, 94.6], [23.3, 94.6]], trim), [trimL, trimD]);
  if (a.boots === 'armored' || a.boots === 'winged') {
    layer((t) => { t.mpoly([[23.4, 86], [29.8, 86], [29.8, 96], [24, 96]], trim); t.mpoly([[24.6, 87.4], [28.8, 87.4], [28.8, 94.8], [25, 94.8]], suit); }, [trimL, trimD]);
    layer((t) => t.mpoly([[20.5, 99.5], [24.5, 99.5], [24, 103], [20.5, 103]], trim), [trimL, trimD]);
  }
  if (a.boots === 'winged') {
    layer((t) => t.mpoly([[22.4, 90], [17.6, 85.5], [18.2, 93.5], [22.6, 94]], trim), [trimL, trimD]);
    layer((t) => t.mpoly([[22.4, 91.4], [19.4, 88.8], [19.8, 93], [22.6, 93.4]], WHITE));
  }
  // hips
  layer((t) => t.poly([[22.5, 56], [41.5, 56], [42, 65], [22, 65]], suit), [suitL, suitD]);
  // knee pads (titan)
  if (a.chest === 'titan') layer((t) => t.mellipse(26.6, 83, 3.8, 2.7, trim), [trimL, trimD]);

  // ---------- torso ----------
  layer((t) => t.poly([[17, 29], [22, 26.5], [28, 25.5], [36, 25.5], [42, 26.5], [47, 29], [45, 38], [42, 46], [41, 55], [23, 55], [22, 46], [19, 38]], suit), [suitL, suitD]);
  layer((t) => t.mpoly([[17, 29], [19, 38], [22, 46], [23, 55], [26, 55], [24, 45], [22, 37], [21, 29]], WHITE), [WHITE, WHITE_D]);
  // muscle definition: pecs + abs
  [[32, 30, 32, 52], [32, 40, 24, 38], [32, 40, 40, 38]].forEach((l) => hero.line(l[0], l[1], l[2], l[3], suitD));
  [[29, 45, 35, 45], [29, 48, 35, 48], [29, 51, 35, 51]].forEach((l) => hero.line(l[0], l[1], l[2], l[3], suitD));
  // neck + collar
  layer((t) => t.rect(29, 20, 6, 7, morphed ? suitD : (photo ? shade(Face.skinTone(), -0.12) : skinD)));
  layer((t) => t.poly([[28, 24.5], [30, 22.5], [34, 22.5], [36, 24.5], [37.5, 28.5], [26.5, 28.5]], WHITE), [WHITE, WHITE_D]);
  // belt
  layer((t) => t.rect(22, 54, 20, 4, trim), [trimL, trimD]);
  layer((t) => t.ellipse(32, 56, 3.6, 3.2, trimD));
  hero.set(31, 56, trimL); hero.set(32, 56, trimL);

  // ---------- chest armor ----------
  const emblemSprite = EMBLEM_SPRITES[a.emblem] || EMBLEM_SPRITES.tiger;
  const pal = { c: trim, d: DARK };
  switch (a.chest) {
    case 'guardian':
    case 'titan':
      layer((t) => t.poly([[16, 30], [22, 26.5], [32, 25.5], [42, 26.5], [48, 30], [43, 43], [32, 51], [21, 43]], trim), [trimL, trimD]);
      layer((t) => t.poly([[19, 31], [23.5, 28.2], [32, 27.3], [40.5, 28.2], [45, 31], [41, 41.5], [32, 47.5], [23, 41.5]], suit), [suitL, suitD]);
      layer((t) => { t.ellipse(32, 37, 6.6, 6.6, trim); t.ellipse(32, 37, 5.4, 5.4, DARK); t.sprite(emblemSprite, 28, 33, pal); });
      if (a.chest === 'titan') {
        layer((t) => t.mpoly([[6, 31], [9, 25.5], [17, 24], [21, 28], [19, 33.5], [9, 34.5]], trim), [trimL, trimD]);
        layer((t) => t.mellipse(12, 29.5, 2, 2, suitL));
      }
      break;
    case 'dragon': {
      layer((t) => t.ellipse(32, 41, 11.5, 11.5, trim), [trimL, trimD]);
      layer((t) => { t.ellipse(32, 41, 8.6, 8.6, trimD); t.ellipse(32, 41, 7.6, 7.6, trim); t.ellipse(32, 41, 5.6, 5.6, DARK); t.sprite(emblemSprite, 28, 37, pal); });
      [[32, 31], [24, 34], [40, 34], [21, 41], [43, 41], [24, 48], [40, 48]].forEach((s) => hero.set(s[0], s[1], trimD));
      break;
    }
    default:
      layer((t) => { t.line(22, 29, 32, 38, trim, 2); t.line(42, 29, 32, 38, trim, 2); t.sprite(emblemSprite, 28, 36, pal); });
  }

  // ---------- head ----------
  if (morphed) {
    // pieces that sit behind the shell
    switch (a.helmet) {
      case 'tiger':
        layer((t) => { t.mpoly(hp([[11, 13], [11, 4], [17, 8]]), suit); t.mpoly(hp([[12.4, 10.5], [12.4, 6.5], [15.4, 8.6]]), trim); });
        break;
      case 'hawk':
        layer((t) => t.mpoly(hp([[11, 17], [3.5, 10.5], [8, 22.5], [11, 24]]), trim), [trimL, trimD]);
        break;
      case 'wolf':
        layer((t) => { t.mpoly(hp([[12, 13], [9.5, 2], [17.5, 8]]), suit); t.mpoly(hp([[12.6, 10.5], [11, 5], [15.4, 8.6]]), trim); });
        break;
      case 'dragon':
        layer((t) => t.mpoly(hp([[14, 11], [8.5, 9], [6.5, 3], [10, 2.5], [11.2, 7], [15, 9]]), trim), [trimL, trimD]);
        break;
      case 'phoenix':
        layer((t) => {
          t.poly(hp([[16, 9], [17, 4.5], [20, 0.5], [23, 4.5], [24, 9]]), '#ffb020');
          t.mpoly(hp([[13, 10], [13, 6], [16, 4], [17, 8.5]]), '#ff8a1f');
          t.poly(hp([[18.2, 9], [19, 5.5], [20, 3.5], [21, 5.5], [21.8, 9]]), '#fff3b0');
        });
        break;
      default:
        break;
    }
    layer((t) => t.ellipse(...he(20, 17, 9, 10.5), suit), [suitL, suitD]);
    // chin guard, then an angular V-brow visor
    layer((t) => t.poly(hp([[15.4, 21.6], [24.6, 21.6], [23.8, 26], [20, 27.6], [16.2, 26]]), WHITE), [WHITE, WHITE_D]);
    layer((t) => t.poly(hp([[12.8, 12.8], [20, 15.2], [27.2, 12.8], [26.7, 18.2], [23.4, 19.9], [20, 20.5], [16.6, 19.9], [13.3, 18.2]]), trim));
    layer((t) => t.poly(hp([[13.9, 13.9], [20, 16.1], [26.1, 13.9], [25.7, 17.6], [22.9, 18.9], [20, 19.3], [17.1, 18.9], [14.3, 17.6]]), '#0a0d10'));
    // mouthguard vents + visor glints
    [[17.6, 23.2, 22.4], [17.9, 24.8, 22.1]].forEach((v) => hero.line(32 + (v[1] === 24.8 ? -2.2 : -2.5), Math.floor(13.5 + (v[1] - 17) * 0.85), 32 + (v[1] === 24.8 ? 2.2 : 2.5), Math.floor(13.5 + (v[1] - 17) * 0.85), WHITE_D));
    [[28, 14], [29, 14], [28, 15]].forEach((g) => hero.set(g[0], g[1], '#ffffff@0.35'));
    switch (a.helmet) {
      case 'tiger':
        [[30, 6], [30, 7], [30, 8], [33, 6], [33, 7], [33, 8], [31, 5], [32, 5], [31, 6], [32, 6]].forEach((s) => hero.set(s[0], s[1], DARK));
        break;
      case 'hawk':
        layer((t) => t.poly(hp([[20, 5.5], [22.5, 11.5], [20, 14.5], [17.5, 11.5]]), trim), [trimL, trimD]);
        break;
      case 'wolf':
        layer((t) => t.poly(hp([[20, 7.5], [21.8, 11.5], [20, 13.8], [18.2, 11.5]]), trim), [trimL, trimD]);
        break;
      case 'dragon':
        layer((t) => t.poly(hp([[20, 4.5], [22.4, 9.5], [20, 12], [17.6, 9.5]]), trim), [trimL, trimD]);
        break;
      case 'phoenix':
        layer((t) => t.poly(hp([[20, 8], [21.8, 11.8], [20, 13.8], [18.2, 11.8]]), trim), [trimL, trimD]);
        break;
      default:
        layer((t) => t.poly(hp([[20, 5.5], [24, 11.5], [20, 9.8], [16, 11.5]]), trim), [trimL, trimD]);
    }
  } else if (photo) {
    layer((t) => {
      for (let j = 0; j < photo.h; j++) {
        for (let i = 0; i < photo.w; i++) {
          const x = 25 + i, y = 5 + j;
          const dx = (x + 0.5 - 32) / 7, dy = (y + 0.5 - 14) / 9;
          if (dx * dx + dy * dy <= 1) t.set(x, y, photo.px[j * photo.w + i]);
        }
      }
    });
  } else {
    // unmasked face: strong jaw, angled brows
    layer((t) => { t.rect(24, 11, 2, 5, skin); t.rect(38, 11, 2, 5, skin); });
    layer((t) => { t.ellipse(32, 13.4, 6.8, 8.2, skin); t.poly([[26, 15], [38, 15], [36.2, 20.6], [32, 22.4], [27.8, 20.6]], skin); });
    hero.set(24, 13, skinD); hero.set(39, 13, skinD);
    [[26, 10], [27, 10], [28, 11], [38, 10], [37, 10], [36, 11]].forEach((s) => hero.set(s[0], s[1], hairD));
    [27, 35].forEach((x) => {
      hero.rect(x, 12, 3, 1, INK);
      hero.rect(x, 13, 3, 2, '#ffffff');
      hero.rect(x + 1, 13, 2, 2, ch.eye);
      hero.set(x + 1, 14, INK);
    });
    hero.set(31, 16, skinD); hero.set(32, 16, skinD);
    hero.rect(30, 19, 4, 1, '#8a3b3b');
    hero.set(26, 19, skinD); hero.set(37, 19, skinD);
    hero.rect(27, 21, 10, 1, skinD);
    // front hair
    const cap = [[25, 12], [24.5, 7.5], [27, 4.5], [32, 3.5], [37, 4.5], [39.5, 7.5], [39, 12], [37.5, 9.5], [35, 8], [32, 9], [29, 8], [26.5, 9.5]];
    switch (a.hairStyle) {
      case 'swept':
        layer((t) => { t.poly([[24.5, 13], [24, 7], [27.5, 3.5], [34, 3], [39.5, 6], [40, 13], [38.5, 9.5], [34, 7.5], [29, 8.5], [26, 11]], hair); t.poly([[27, 7], [33, 4.5], [38, 6.5], [33, 7.5]], hairL); });
        break;
      case 'fade':
        layer((t) => {
          t.mpoly([[25, 13], [25, 8.5], [27, 7], [27, 13]], `${hairD}@0.65`);
          t.ellipse(32, 5.4, 6.6, 3.5, hair);
          [[27, 5, 2.3], [37, 5, 2.3], [29.5, 3, 2.3], [34.5, 3, 2.3], [32, 2.4, 2.5], [25.6, 6.6, 1.8], [38.4, 6.6, 1.8]].forEach((b) => t.ellipse(b[0], b[1], b[2], b[2], hair));
          t.rect(27, 7, 10, 1, hair);
          t.texture(hair, hairL, hairD);
        });
        break;
      case 'coils':
        layer((t) => {
          t.ellipse(32, 7.2, 8, 5, hair);
          for (let k = 0; k <= 12; k++) { const ang = Math.PI + (k * Math.PI) / 12; t.ellipse(32 + Math.cos(ang) * 8, 7.2 + Math.sin(ang) * 5, 1.7, 1.7, hair); }
          t.texture(hair, hairL, hairD);
        });
        break;
      case 'afro':
        layer((t) => { t.poly([[25.5, 10.5], [32, 8.4], [38.5, 10.5], [38.5, 7], [32, 5], [25.5, 7]], hair); t.texture(hair, hairL, hairD); });
        break;
      case 'twists':
        layer((t) => {
          t.poly(cap.map((p) => [p[0], p[1] - 0.8]), hair);
          for (let x = 24; x <= 39; x += 2) {
            const top = Math.max(0, 1 + Math.floor(Math.abs(x - 31.5) * 0.28));
            t.rect(x, top, 1, 7 - top, hair);
            for (let y = top; y < 7; y += 2) t.set(x, y, hairL);
          }
        });
        break;
      case 'locs':
        layer((t) => {
          t.poly(cap, hair);
          [[22, 11, 30], [23, 9, 31], [24, 8, 24]].forEach((s) => { for (let y = s[1]; y < s[2]; y++) t.set(s[0], y, y % 3 === 0 ? hairD : hair); });
          [[41, 11, 30], [40, 9, 31], [39, 8, 24]].forEach((s) => { for (let y = s[1]; y < s[2]; y++) t.set(s[0], y, y % 3 === 0 ? hairD : hair); });
          t.texture(hair, hairL, hairD);
        });
        break;
      case 'braids':
        layer((t) => {
          t.poly(cap, hair);
          for (let x = 27; x <= 37; x += 2) for (let y = 4; y < 9; y++) t.set(x, y, hairD);
          [[22, 9, 27], [23, 9, 26], [41, 9, 27], [40, 9, 26]].forEach((s) => { for (let y = s[1]; y < s[2]; y++) t.set(s[0], y, (y + s[0]) % 2 === 0 ? hairD : hair); });
        });
        break;
      case 'long':
        layer((t) => t.poly([[25, 12], [24.5, 7.5], [27, 4.5], [32, 3.5], [37, 4.5], [39.5, 7.5], [39, 12], [37, 9], [32, 7], [27, 9]], hair));
        break;
      default:
        layer((t) => t.poly(cap, hair));
        [[28, 5], [29, 4], [30, 4]].forEach((s) => hero.set(s[0], s[1], hairL));
    }
  }

  // ---------- weapon in front ----------
  if (a.weapon === 'blaster') {
    layer((t) => { t.rect(48, 60, 11, 4, '#2a3138'); t.rect(48, 59, 8, 1, trim); t.rect(57, 58, 3, 3, '#2a3138'); t.rect(50, 61, 6, 1, suitL); t.set(60, 59, suitL); });
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
