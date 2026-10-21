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

// ---- drawing helpers ----

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

const SHOULDERS = 'M24 240 C24 190 56 168 100 168 C144 168 176 190 176 240 Z';
const FACE = 'M60 100 C60 70 80 58 100 58 C120 58 140 70 140 100 C140 128 124 152 100 152 C76 152 60 128 60 100 Z';
const CAP = 'M56 104 C48 64 72 40 100 40 C128 40 152 64 144 104 C140 92 134 82 124 76 C116 84 104 82 98 72 C90 82 76 84 68 78 C62 84 58 94 56 104 Z';
const MIRROR = 'translate(200 0) scale(-1 1)';

function emblemSVG(kind, cx, cy, scale, color, dark) {
  let inner;
  if (kind === 'hawk') {
    inner = `<path d="M-15 -5 L0 -13 L15 -5 L9 6 L0 15 L-9 6 Z" fill="${color}"/><path d="M-5 -2 L0 -6 L5 -2 L0 8 Z" fill="${dark}"/>`;
  } else if (kind === 'wolf') {
    inner = `<path d="M-13 -11 L-6 -4 L6 -4 L13 -11 L11 6 L0 15 L-11 6 Z" fill="${color}"/><circle cx="-4.5" cy="1" r="1.8" fill="${dark}"/><circle cx="4.5" cy="1" r="1.8" fill="${dark}"/><path d="M-2 8 L2 8 L0 11 Z" fill="${dark}"/>`;
  } else {
    inner = `<circle cx="-9" cy="-9" r="4.5" fill="${color}"/><circle cx="9" cy="-9" r="4.5" fill="${color}"/><circle r="13" fill="${color}"/><path d="M-9 -4 L-4 -1 M9 -4 L4 -1 M0 -12 L0 -7" stroke="${dark}" stroke-width="2" stroke-linecap="round"/><circle cx="-5" cy="1" r="1.8" fill="${dark}"/><circle cx="5" cy="1" r="1.8" fill="${dark}"/><path d="M-3 7 L3 7 L0 10 Z" fill="${dark}"/>`;
  }
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">${inner}</g>`;
}

function bladeSVG(trim, trimD) {
  return `<polygon points="0,0 7,26 7,166 -7,166 -7,26" fill="#d9e8ee" stroke="#8fa9b4" stroke-width="1.5"/>` +
    `<path d="M0 8 L0 160" stroke="#8fa9b4" stroke-width="2"/>` +
    `<rect x="-18" y="166" width="36" height="8" rx="3" fill="${trim}"/>` +
    `<rect x="-4" y="174" width="8" height="28" rx="3" fill="${trimD}"/><circle cx="0" cy="206" r="5" fill="${trim}"/>`;
}

function flameSVG(x, y, s, rot, outer, inner) {
  return `<g class="flame" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    `<path d="M0 0 C-12 -14 -7 -28 0 -44 C5 -30 14 -24 11 -9 C9 -2 4 0 0 0 Z" fill="${outer}"/>` +
    `<path d="M0 -2 C-6 -10 -3 -18 0 -28 C3 -19 8 -14 6 -6 C5 -2 2 -2 0 -2 Z" fill="${inner}"/></g>`;
}

function avatarSVG(a) {
  const suit = (SUITS.find((s) => s.id === a.suit) || SUITS[0]).color;
  const suitD = shade(suit, -0.28);
  const suitL = shade(suit, 0.25);
  const trim = (TRIMS.find((t) => t.id === a.trim) || TRIMS[0]).color;
  const trimD = shade(trim, -0.35);
  const dark = '#14181b';
  const id = 'a' + Math.random().toString(36).slice(2, 8);
  let defs = '';

  // ---- background ----
  let bg;
  switch (a.background) {
    case 'sunrise':
      defs += `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb870"/><stop offset=".7" stop-color="#e4604f"/><stop offset="1" stop-color="#5a2d52"/></linearGradient>`;
      bg = `<rect width="200" height="240" fill="url(#${id}-bg)"/><circle cx="100" cy="176" r="48" fill="#ffe7a3" opacity=".9"/><path d="M0 200 Q50 178 100 198 T200 190 L200 240 L0 240 Z" fill="#3a1d3f"/>`;
      break;
    case 'city': {
      defs += `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3b5a"/><stop offset="1" stop-color="#0a121c"/></linearGradient>`;
      const b = [[0, 150, 34, 90], [30, 128, 30, 112], [60, 160, 28, 80], [112, 140, 34, 100], [146, 118, 30, 122], [172, 152, 28, 88]];
      bg = `<rect width="200" height="240" fill="url(#${id}-bg)"/>` +
        b.map((r) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="#0b1520"/>`).join('') +
        [[10, 164], [20, 180], [40, 146], [46, 170], [118, 156], [130, 176], [154, 136], [166, 160], [180, 172]]
          .map((w) => `<rect x="${w[0]}" y="${w[1]}" width="5" height="5" fill="#ffd36a" opacity=".8"/>`).join('');
      break;
    }
    case 'stars':
      bg = `<rect width="200" height="240" fill="#0a0e1c"/>` +
        [[20, 30, 1.6], [60, 18, 1.2], [150, 26, 1.8], [180, 60, 1.2], [30, 90, 1], [170, 100, 1.4], [110, 12, 1], [16, 150, 1.3], [184, 160, 1.1], [100, 40, .8], [46, 54, 1], [136, 70, 1]]
          .map((s) => `<circle cx="${s[0]}" cy="${s[1]}" r="${s[2]}" fill="#fff"/>`).join('');
      break;
    case 'forest':
      defs += `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14473a"/><stop offset="1" stop-color="#0a1f1a"/></linearGradient>`;
      bg = `<rect width="200" height="240" fill="url(#${id}-bg)"/>` +
        [[16, 130], [50, 100], [152, 110], [184, 140]].map((t) => `<polygon points="${t[0]},${t[1]} ${t[0] - 22},${t[1] + 70} ${t[0] + 22},${t[1] + 70}" fill="#0c2e25"/><polygon points="${t[0]},${t[1] - 24} ${t[0] - 17},${t[1] + 30} ${t[0] + 17},${t[1] + 30}" fill="#0f3b2f"/>`).join('');
      break;
    case 'arena':
      bg = `<rect width="200" height="240" fill="#140e24"/><polygon points="40,0 64,0 112,240 0,240" fill="#fff" opacity=".06"/><polygon points="160,0 184,0 200,240 88,240" fill="#fff" opacity=".06"/>`;
      break;
    default:
      bg = `<rect width="200" height="240" fill="#161c20"/>`;
  }

  // ---- guardian beast (big shape behind the hero) ----
  let beast = '';
  const bStyle = `fill="${trim}" fill-opacity=".2" stroke="${trim}" stroke-opacity=".75" stroke-width="2.2" stroke-linejoin="round"`;
  switch (a.beast) {
    case 'tiger':
      beast = `<g ${bStyle}><circle cx="100" cy="120" r="94"/><circle cx="26" cy="42" r="24"/><circle cx="174" cy="42" r="24"/></g>` +
        `<path d="M10 100 L40 110 M8 130 L38 136 M190 100 L160 110 M192 130 L162 136 M30 62 L40 74 M170 62 L160 74" stroke="${trim}" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>`;
      break;
    case 'hawk': {
      const wing = `<path d="M94 156 C60 146 20 114 -8 40 C22 54 40 50 52 36 C58 58 74 70 90 74 C82 90 94 106 102 116 Z" ${bStyle}/><path d="M30 70 L60 100 M18 52 L56 88" stroke="${trim}" stroke-opacity=".6" stroke-width="3"/>`;
      beast = wing + `<g transform="${MIRROR}">${wing}</g>`;
      break;
    }
    case 'wolf':
      beast = `<g ${bStyle}><ellipse cx="100" cy="124" rx="92" ry="100"/><path d="M34 108 L20 4 L88 58 Z"/><path d="M166 108 L180 4 L112 58 Z"/></g>` +
        `<path d="M6 170 L30 146 L22 182 M194 170 L170 146 L178 182" stroke="${trim}" stroke-opacity=".7" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      break;
    case 'dragon': {
      const wing = `<path d="M96 176 L28 196 L38 156 L8 154 L26 114 L0 96 L52 88 L50 40 L98 94 Z" ${bStyle}/>`;
      const horn = `<path d="M72 54 C46 44 38 16 56 4 C52 24 66 38 84 46 Z" ${bStyle}/>`;
      beast = wing + horn + `<g transform="${MIRROR}">${wing}${horn}</g>` +
        `<path d="M92 34 L100 12 L108 34 Z" ${bStyle}/>`;
      break;
    }
    default:
      beast = '';
  }

  // ---- power-up (aura) ----
  let aura = '';
  const auraColor = { glow: suit, blaze: '#ffb020', bolt: '#3aa5d8', legend: '#ffd54a' }[a.aura];
  if (auraColor) {
    defs += `<radialGradient id="${id}-au" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${auraColor}" stop-opacity=".75"/><stop offset=".6" stop-color="${auraColor}" stop-opacity=".35"/><stop offset="1" stop-color="${auraColor}" stop-opacity="0"/></radialGradient>`;
    aura = `<circle class="aura-pulse" cx="100" cy="124" r="108" fill="url(#${id}-au)"/>`;
    if (a.aura === 'blaze') {
      aura += flameSVG(50, 96, 1.3, -18, '#ffb020', '#fff3b0') + flameSVG(150, 96, 1.3, 18, '#ffb020', '#fff3b0') +
        flameSVG(100, 40, 1.5, 0, '#ffb020', '#fff3b0') + flameSVG(66, 52, 1.1, -26, '#ff8a1f', '#ffe27a') + flameSVG(134, 52, 1.1, 26, '#ff8a1f', '#ffe27a') +
        flameSVG(22, 170, 1.2, -10, '#ff8a1f', '#ffe27a') + flameSVG(178, 170, 1.2, 10, '#ff8a1f', '#ffe27a') +
        flameSVG(34, 128, 1, -22, '#ffd54a', '#fff6c8') + flameSVG(166, 128, 1, 22, '#ffd54a', '#fff6c8');
    } else if (a.aura === 'bolt') {
      const bolt = '<polyline points="30,56 44,84 32,88 48,120" stroke="#9be3ff" stroke-width="3" fill="none" stroke-linejoin="round"/><polyline points="18,110 30,128 22,132 34,154" stroke="#9be3ff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>';
      aura += bolt + `<g transform="${MIRROR}">${bolt}</g>`;
    } else if (a.aura === 'legend') {
      let rays = '';
      for (let i = 0; i < 12; i++) rays += `<polygon points="100,124 95,-30 105,-30" fill="#fff3b0" opacity=".16" transform="rotate(${i * 30} 100 124)"/>`;
      const spark = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#fff3b0"/>`;
      aura += rays + spark(30, 70, 1.2) + spark(172, 90, 1) + spark(44, 150, .8) + spark(160, 40, .9) + spark(22, 30, .7);
    }
  }

  // ---- weapons ----
  let weaponBack = '';
  let weaponFront = '';
  switch (a.weapon) {
    case 'blade':
      weaponBack = `<g transform="translate(168 28)">${bladeSVG(trim, trimD)}</g>`;
      break;
    case 'twin':
      weaponBack = `<g transform="translate(100 236) rotate(-34) translate(0 -214)">${bladeSVG(trim, trimD)}</g>` +
        `<g transform="translate(100 236) rotate(34) translate(0 -214)">${bladeSVG(trim, trimD)}</g>`;
      break;
    case 'staff':
      weaponBack = `<rect x="24" y="22" width="7" height="220" rx="3" fill="${trim}" stroke="${trimD}" stroke-width="1.5"/><circle cx="27.5" cy="20" r="10" fill="${suitL}" stroke="${trim}" stroke-width="3.5"/>`;
      break;
    case 'blaster':
      weaponFront = `<path d="M112 228 L168 228 L174 214 L158 208 L146 214 L112 214 Z" fill="#2a3138" stroke="${trim}" stroke-width="2.5" stroke-linejoin="round"/><rect x="118" y="218" width="34" height="5" rx="2" fill="${suitL}"/><circle cx="174" cy="214" r="4" fill="${suitL}"/>`;
      break;
    default:
      break;
  }

  // ---- cape (behind the hero) ----
  let cape = '';
  if (a.cape === 'short' || a.cape === 'legend') {
    const edge = a.cape === 'legend' ? ` stroke="${trim}" stroke-width="3"` : '';
    const reach = a.cape === 'legend' ? 'M34 172 C4 196 -2 228 4 240 L74 240 L66 184 Z' : 'M34 176 C14 196 10 222 14 240 L72 240 L66 186 Z';
    cape = `<path d="${reach}" fill="${suitD}"${edge}/><g transform="${MIRROR}"><path d="${reach}" fill="${suitD}"${edge}/></g>`;
  }

  const morphed = a.morphed !== false;

  // ---- unmasked head (helmet off) ----
  let hairBack = '';
  let hairFront = '';
  let headOff = '';
  let neckSkin = '';
  if (!morphed) {
    const ch = CHARS.find((c) => c.id === a.base) || CHARS[0];
    const skin = (SKINS.find((s) => s.id === a.skin) || SKINS[2]).color;
    const skinD = shade(skin, -0.14);
    const hair = (HAIR_COLORS.find((c) => c.id === a.hairColor) || HAIR_COLORS[0]).color;
    const hairD = shade(hair, -0.25);
    const hairL = shade(hair, 0.18);
    switch (a.hairStyle) {
      case 'swept':
        hairFront = `<path d="M54 106 C44 62 76 38 108 40 C136 42 152 66 144 106 C140 90 130 78 114 72 C98 70 76 80 66 96 C62 100 58 104 54 106 Z" fill="${hair}"/><path d="M70 92 C84 70 112 64 136 74 C116 74 96 82 82 100 Z" fill="${hairL}"/>`;
        break;
      case 'long':
        hairBack = `<path d="M52 98 C42 150 48 200 60 226 L140 226 C152 200 158 150 148 98 C140 60 60 60 52 98 Z" fill="${hair}"/>`;
        hairFront = `<path d="M56 104 C48 64 72 40 100 40 C128 40 152 64 144 104 C138 92 126 78 100 70 C74 78 62 92 56 104 Z" fill="${hair}"/><path d="M62 96 C70 74 90 66 100 66" stroke="${hairL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      case 'spiky':
        hairBack = `<path d="M58 74 L48 42 L76 58 L84 26 L100 52 L116 24 L124 58 L152 40 L142 76 Z" fill="${hair}"/>`;
        hairFront = `<path d="${CAP}" fill="${hair}"/>`;
        break;
      case 'bun':
        hairBack = `<circle cx="100" cy="34" r="16" fill="${hair}"/>`;
        hairFront = `<path d="${CAP}" fill="${hair}"/>`;
        break;
      default:
        hairFront = `<path d="${CAP}" fill="${hair}"/><path d="M70 62 C80 52 96 48 110 50" stroke="${hairL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    neckSkin = `<rect x="88" y="140" width="24" height="36" rx="8" fill="${skinD}"/>`;
    const t = ch.tilt;
    const eyes = [82, 118].map((cx, i) => {
      const flip = i === 0 ? 1 : -1;
      const outer = cx - flip * 13;
      return `<ellipse cx="${cx}" cy="112" rx="11" ry="13" fill="#fff"/>` +
        `<ellipse cx="${cx}" cy="113" rx="${ch.iris[0]}" ry="${ch.iris[1]}" fill="${ch.eye}"/>` +
        `<ellipse cx="${cx}" cy="114" rx="4.5" ry="6.5" fill="#14141a"/>` +
        `<circle cx="${cx - 3}" cy="108" r="3" fill="#fff"/><circle cx="${cx + 3}" cy="118" r="1.5" fill="#fff" opacity=".9"/>` +
        `<path d="M${outer} ${108 - t} Q${cx} 98 ${cx + flip * 12} 107" stroke="#14141a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }).join('');
    headOff =
      `<circle cx="58" cy="108" r="8" fill="${skin}"/><circle cx="142" cy="108" r="8" fill="${skin}"/>` +
      `<circle cx="58" cy="108" r="4" fill="${skinD}"/><circle cx="142" cy="108" r="4" fill="${skinD}"/>` +
      `<path d="${FACE}" fill="${skin}"/>` +
      `<ellipse cx="72" cy="128" rx="8" ry="4" fill="#ff7a7a" opacity=".22"/><ellipse cx="128" cy="128" rx="8" ry="4" fill="#ff7a7a" opacity=".22"/>` +
      eyes +
      `<path d="M70 94 Q82 ${90 - t / 2} 93 93" stroke="${hairD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M107 93 Q118 ${90 - t / 2} 130 94" stroke="${hairD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M99 124 Q100 128 102 128" stroke="${skinD}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M92 137 Q100 144 108 137" stroke="#7a3434" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    hairBack = `<g stroke="${shade(hair, 0.32)}" stroke-width="1.4" stroke-linejoin="round">${hairBack}</g>`;
    hairFront = `<g stroke="${shade(hair, 0.32)}" stroke-width="1.4" stroke-linejoin="round">${hairFront}</g>`;
  }

  // ---- suit body ----
  const body =
    `<path d="${SHOULDERS}" fill="${suit}"/>` +
    `<path d="M24 240 C24 204 38 186 56 178 L72 240 Z" fill="#f2f5f6"/><g transform="${MIRROR}"><path d="M24 240 C24 204 38 186 56 178 L72 240 Z" fill="#f2f5f6"/></g>` +
    (morphed ? `<rect x="86" y="142" width="28" height="36" rx="8" fill="${suitD}"/>` : neckSkin) +
    `<path d="M80 168 L88 160 L112 160 L120 168 L124 182 L76 182 Z" fill="#f2f5f6"/>`;

  // ---- chest armor ----
  const emblem = (cx, cy, s) => emblemSVG(a.emblem, cx, cy, s, trim, dark);
  const belt = `<rect x="30" y="228" width="140" height="12" fill="${trim}"/><circle cx="100" cy="234" r="8" fill="${trimD}" stroke="${trim}" stroke-width="2"/>`;
  let chest;
  switch (a.chest) {
    case 'guardian':
      chest = `<path d="M22 196 C50 170 150 170 178 196 L150 240 L50 240 Z" fill="${trim}"/>` +
        `<path d="M34 198 C58 180 142 180 166 198 L142 236 L58 236 Z" fill="${suit}"/>` +
        `<circle cx="100" cy="210" r="25" fill="#0e1113" stroke="${trim}" stroke-width="3"/>${emblem(100, 210, 1.2)}`;
      break;
    case 'dragon': {
      let rings = '';
      for (let i = 0; i < 12; i++) rings += `<path d="M100 214 L${(100 + Math.cos(i * Math.PI / 6) * 44).toFixed(1)} ${(214 + Math.sin(i * Math.PI / 6) * 44).toFixed(1)}" stroke="${trimD}" stroke-width="1.5"/>`;
      chest = `<circle cx="100" cy="216" r="48" fill="${trim}" stroke="${trimD}" stroke-width="3"/>` +
        `<g transform="translate(0 2)">${rings}</g><circle cx="100" cy="216" r="36" fill="none" stroke="${trimD}" stroke-width="2"/>` +
        `<circle cx="100" cy="216" r="22" fill="#0e1113" stroke="${trim}" stroke-width="3"/>${emblem(100, 216, 1.15)}`;
      break;
    }
    case 'titan':
      chest = `<path d="M22 196 C50 170 150 170 178 196 L150 240 L50 240 Z" fill="${trim}"/>` +
        `<path d="M34 198 C58 180 142 180 166 198 L142 236 L58 236 Z" fill="${suit}"/>` +
        `<circle cx="100" cy="210" r="25" fill="#0e1113" stroke="${trim}" stroke-width="3"/>${emblem(100, 210, 1.2)}` +
        `<ellipse cx="38" cy="192" rx="28" ry="16" fill="${trim}" stroke="${trimD}" stroke-width="2" transform="rotate(-22 38 192)"/>` +
        `<ellipse cx="162" cy="192" rx="28" ry="16" fill="${trim}" stroke="${trimD}" stroke-width="2" transform="rotate(22 162 192)"/>` +
        `<circle cx="38" cy="192" r="5" fill="${suitL}"/><circle cx="162" cy="192" r="5" fill="${suitL}"/>`;
      break;
    default:
      chest = `<path d="M76 182 L100 206 L124 182" fill="none" stroke="${trim}" stroke-width="4" stroke-linejoin="round"/>${emblem(100, 214, .95)}${belt}`;
  }

  // ---- helmet (morphed) ----
  let head = headOff;
  if (morphed) {
    let crest;
    switch (a.helmet) {
      case 'tiger':
        crest = `<path d="M54 74 L56 26 L92 48 Z" fill="${suit}" stroke="${suit}" stroke-width="6" stroke-linejoin="round"/><path d="M62 62 L63 38 L82 50 Z" fill="${trim}"/>` +
          `<path d="M146 74 L144 26 L108 48 Z" fill="${suit}" stroke="${suit}" stroke-width="6" stroke-linejoin="round"/><path d="M138 62 L137 38 L118 50 Z" fill="${trim}"/>` +
          `<path d="M92 40 L92 56 M100 38 L100 58 M108 40 L108 56" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
        break;
      case 'hawk':
        crest = `<path d="M54 96 L22 72 L38 112 L54 124 Z" fill="${trim}"/><path d="M146 96 L178 72 L162 112 L146 124 Z" fill="${trim}"/>` +
          `<path d="M100 34 L110 58 L100 72 L90 58 Z" fill="${trim}"/>`;
        break;
      case 'wolf':
        crest = `<path d="M62 62 L56 24 L88 44 Z" fill="${suit}" stroke="${trim}" stroke-width="2.5" stroke-linejoin="round"/><path d="M138 62 L144 24 L112 44 Z" fill="${suit}" stroke="${trim}" stroke-width="2.5" stroke-linejoin="round"/>` +
          `<path d="M100 40 L108 60 L100 70 L92 60 Z" fill="${trim}"/>`;
        break;
      case 'dragon':
        crest = `<path d="M66 54 C42 44 34 18 50 6 C48 24 62 36 80 44 Z" fill="${trim}"/><path d="M134 54 C158 44 166 18 150 6 C152 24 138 36 120 44 Z" fill="${trim}"/>` +
          `<path d="M100 32 L108 54 L100 62 L92 54 Z" fill="${trim}"/>`;
        break;
      case 'phoenix':
        crest = `<path d="M100 36 C90 24 98 14 100 4 C104 16 112 26 100 36 Z" fill="#ffb020"/><path d="M86 40 C76 30 82 22 84 14 C88 22 96 30 86 40 Z" fill="#ff8a1f"/><path d="M114 40 C124 30 118 22 116 14 C112 22 104 30 114 40 Z" fill="#ff8a1f"/>` +
          `<path d="M100 40 L108 60 L100 68 L92 60 Z" fill="${trim}"/>`;
        break;
      default:
        crest = `<path d="M100 36 L114 62 L100 54 L86 62 Z" fill="${trim}"/><circle cx="100" cy="62" r="3.5" fill="${suitL}"/>` +
          `<path d="M64 76 L84 68 M136 76 L116 68" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>`;
    }
    head = crest +
      `<path d="M54 108 C50 58 72 34 100 34 C128 34 150 58 146 108 C146 136 128 158 100 160 C72 158 54 136 54 108 Z" fill="${suit}"/>` +
      `<path d="M60 92 C62 62 78 46 100 44" stroke="${suitL}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M64 98 C70 90 130 90 136 98 C140 118 124 140 100 144 C76 140 60 118 64 98 Z" fill="#0a0d10" stroke="${trim}" stroke-width="3"/>` +
      `<path d="M72 100 L98 100 L80 126 Z" fill="#fff" opacity=".16"/>` +
      `<path d="M76 142 Q100 158 124 142 L118 158 Q100 166 82 158 Z" fill="#f2f5f6"/>`;
    // crest pieces that sit on top of the helmet shell
    if (a.helmet === 'tiger') head += `<path d="M92 40 L92 56 M100 38 L100 58 M108 40 L108 56" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
    if (!a.helmet || a.helmet === 'sentinel') head += `<path d="M100 36 L114 62 L100 54 L86 62 Z" fill="${trim}"/><circle cx="100" cy="62" r="3.5" fill="${suitL}"/><path d="M64 76 L84 68 M136 76 L116 68" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>`;
    if (a.helmet === 'hawk') head += `<path d="M100 34 L110 58 L100 72 L90 58 Z" fill="${trim}"/>`;
    if (a.helmet === 'wolf' || a.helmet === 'phoenix') head += `<path d="M100 40 L108 60 L100 68 L92 60 Z" fill="${trim}"/>`;
    if (a.helmet === 'dragon') head += `<path d="M100 32 L108 54 L100 62 L92 54 Z" fill="${trim}"/>`;
  }

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="avatar-svg" role="img" aria-label="Your ranger"><defs>${defs}</defs>` +
    bg + beast + aura + weaponBack + cape + hairBack + body + chest + head + hairFront + weaponFront + `</svg>`;
}
