// ============================================================
// Art kit — your sprites, loaded on demand from the art/ folder.
// Files are found by name (see the sprite checklist): WebP is tried first,
// then PNG. Only the images currently on screen are fetched; anything that
// isn't there yet is skipped and the scene falls back to what does exist
// (older pieces, then the drawn pixel ranger).
// ============================================================

// ?artbase=... lets me test with placeholder sprites from another folder
const ART_BASE = new URLSearchParams(location.search).get('artbase') || 'art/';

// The first six sprites, kept as fallbacks until their replacements arrive.
const ART_LEGACY = {
  legacyRanger: 'art/ranger.png',
  legacyRangerOff: 'art/ranger-off.png',
  legacyPower: 'art/power.webp',
  legacyBeast: 'art/beast.webp',
  legacySword: 'art/sword.png',
};

// Where overlay sprites sit on the 5:6 scene (percent of the scene).
// First guesses; tune these once the real weapon/holster sprites are in.
const WEAPON_PLACE = {
  default: { left: 61, bottom: 29, width: 34, rot: -34, origin: '30% 68%' },
  gun: { left: 62, bottom: 36, width: 24, rot: 0, origin: '30% 60%' },
};
const HOLSTER_PLACE = { left: 55, bottom: 42, width: 16 };

// Images that decide whether art mode is available at all.
const PRIMARY = ['ranger-noshield-helmet-on', 'legacyRanger'];

const ArtKit = (() => {
  const imgs = {};   // key -> { im, url }
  const status = {}; // key -> 'loading' | 'missing'
  const recolorCache = {};
  let timer = null;

  function candidates(key) {
    return ART_LEGACY[key] ? [ART_LEGACY[key]] : [`${ART_BASE}${key}.webp`, `${ART_BASE}${key}.png`];
  }

  function tryLoad(urls) {
    return urls.reduce((p, u) => p.then((found) => found || new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ im, url: u });
      im.onerror = () => resolve(null);
      im.src = u;
    })), Promise.resolve(null));
  }

  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof render === 'function' && typeof state !== 'undefined' && state.activeTab === 'quest') render();
    }, 60);
  }

  function request(key) {
    if (imgs[key] || status[key]) return;
    status[key] = 'loading';
    tryLoad(candidates(key)).then((found) => {
      if (found) { imgs[key] = found; delete status[key]; } else status[key] = 'missing';
      scheduleRender();
    });
  }

  // First loaded key wins. 'wait' = a better candidate is still loading; null = none exist.
  function pick(keys) {
    for (const k of keys) {
      if (imgs[k]) return k;
      request(k);
      if (status[k] === 'loading') return 'wait';
    }
    return null;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  // keep the art's shading: scale the target color by the pixel's lightness
  function tint(target, l, ref) {
    const f = l / ref;
    return target.map((c) => {
      const v = f <= 1 ? c * f : c + (255 - c) * Math.min(1, (f - 1) * 0.7);
      return Math.max(0, Math.min(255, Math.round(v)));
    });
  }

  function recolored(key, suitHex, trimHex, accentHex = null) {
    const rec = imgs[key];
    if (!rec) return '';
    const keepSuit = suitHex === '#14a85f';
    const keepTrim = trimHex === '#f2c14e';
    if (keepSuit && keepTrim && !accentHex) return rec.url;
    const ck = `${key}|${suitHex}|${trimHex}|${accentHex || ""}`;
    if (recolorCache[ck]) return recolorCache[ck];
    const im = rec.im;
    // big sprites are only shown a few hundred pixels tall, so recolor a smaller copy (faster on phones)
    const scale = Math.min(1, 900 / im.naturalHeight);
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * scale); c.height = Math.round(im.naturalHeight * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    const suit = hexToRgb(suitHex), trim = hexToRgb(trimHex), accent = accentHex ? hexToRgb(accentHex) : null;
    const W = c.width;
    // trim 2 leaves some white alone: with the helmet off the face area (skin, eyes, teeth),
    // with the helmet on the white mouthpiece
    const faceRows = /helmet-off$|^legacyRangerOff$/.test(key) ? Math.round(c.height * 0.21) : 0;
    const mouth = /helmet-on$|^legacyRanger$/.test(key)
      ? { x0: W * 0.44, x1: W * 0.58, y0: c.height * 0.125, y1: c.height * 0.163 } : null;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      let out = null;
      if (!keepSuit && h >= 75 && h <= 175 && s > 0.25 && l < 0.7) out = tint(suit, l, 0.27);
      else {
        // Gold trim vs white: judged by how colorful the pixel is (HSL saturation is unreliable near white),
        // and blended across the in-between pixels so the two recolors never leave blotchy edges.
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        const px = i / 4, y = Math.floor(px / W), x = px % W;
        // hue 26+ catches the dark orange-ish shading of the gold; skin-orange hues (below 36) are skipped in the face area
        const wGold = h >= 26 && h <= 58 && l > 0.2 && (h >= 36 || y >= faceRows) ? clamp01((chroma - 30) / 40) : 0;
        const inMouth = mouth && x >= mouth.x0 && x <= mouth.x1 && y >= mouth.y0 && y <= mouth.y1;
        const canAccent = accent && l > 0.58 && chroma < 70 && y >= faceRows && !inMouth;
        const tOut = wGold > 0 ? (keepTrim ? [r, g, b] : tint(trim, l, 0.5)) : null;
        const aOut = canAccent ? tint(accent, l, 0.92) : [r, g, b];
        if (wGold >= 1) out = tOut;
        else if (wGold > 0) out = aOut.map((v, k) => Math.round(v + (tOut[k] - v) * wGold));
        else if (canAccent) out = aOut;
      }
      if (out) { d[i] = out[0]; d[i + 1] = out[1]; d[i + 2] = out[2]; }
    }
    ctx.putImageData(data, 0, 0);
    const url = c.toDataURL('image/png');
    recolorCache[ck] = url;
    return url;
  }

  function hslToRgb(h, s, l) {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
  }

  // Whole-image recolor for effects: swaps the hue to `rgb` and keeps the art's light and shade.
  function tinted(key, rgb) {
    const rec = imgs[key];
    if (!rec) return '';
    const ck = `${key}|all|${rgb.join(',')}`;
    if (recolorCache[ck]) return recolorCache[ck];
    const im = rec.im;
    const scale = Math.min(1, 900 / im.naturalHeight);
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * scale); c.height = Math.round(im.naturalHeight * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    const [th, ts] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const satScale = Math.min(1, ts / 0.7); // pale targets (white, silver) give a pale aura
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 4) continue;
      const [, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      const out = hslToRgb(th, Math.min(1, s * satScale), l);
      d[i] = out[0]; d[i + 1] = out[1]; d[i + 2] = out[2];
    }
    ctx.putImageData(data, 0, 0);
    const url = c.toDataURL('image/png');
    recolorCache[ck] = url;
    return url;
  }

  const place = (p) => `left:${p.left}%;bottom:${p.bottom}%;width:${p.width}%`
    + (p.rot ? `;transform:rotate(${p.rot}deg);transform-origin:${p.origin}` : '');

  return {
    ready: true,
    init(done) { if (done) done(); },

    // loaded image url for a key (starts loading it if needed); '' until available
    url(key) { request(key); return imgs[key] ? imgs[key].url : ''; },
    has(key) { request(key); return !!imgs[key]; },
    // is any ranger art present at all? (otherwise the drawn ranger is used)
    hasAny() {
      PRIMARY.forEach(request);
      request('aura-powerup'); // warm up the power-up burst so it's ready on first use
      return PRIMARY.some((k) => !!imgs[k]);
    },
    // true once we know whether the primary ranger images exist (loaded or confirmed missing)
    settled() {
      PRIMARY.forEach(request);
      return PRIMARY.every((k) => imgs[k] || status[k] === 'missing');
    },

    active(avatar) { return avatar.useArt !== false && this.hasAny(); },

    // Compose the scene. Returns null when no art exists at all (caller falls back
    // to the drawn ranger); returns the frame without a ranger while it is loading.
    // `fx` ('powerup' | 'morph' | 'power' | 'pop') plays a one-shot effect on this render.
    sceneHTML(a, q, fx) {
      const L = q.loadout;
      const suitHex = (SUITS.find((s) => s.id === a.suit) || SUITS[0]).color;
      const trimHex = (TRIMS.find((t) => t.id === a.trim) || TRIMS[0]).color;
      const accentOpt = TRIMS2.find((t) => t.id === a.trim2) || TRIMS2[0];
      const accentHex = accentOpt.id === 'white' ? null : accentOpt.color; // white = the art as drawn
      const superOk = L.superOn && modesAvailable(q).includes(L.superMode);
      const helmet = a.morphed !== false ? 'on' : 'off';
      const weapon = L.weaponHeld && L.weapon ? L.weapon : null;

      const holsterWanted = !superOk && !!(L.holster && q.owned.blaster);
      // Regular form: a ready-made photo that already holds the weapon / holster is best
      // (nothing floats on top); if it doesn't exist the plain ranger + overlays are used.
      // name = ranger-<emblem|noshield>[-<weapon>][-holster]-helmet-<on|off>
      const baked = {}; // key -> what that image already includes
      let mainKeys;
      if (superOk) {
        mainKeys = [`super-${L.superMode}-${weapon || 'unarmed'}`, `super-${L.superMode}-unarmed`, 'legacyPower'];
      } else {
        mainKeys = [];
        const add = (b, w, h) => {
          const key = ['ranger', b, w, h ? 'holster' : null, `helmet-${helmet}`].filter(Boolean).join('-');
          if (!baked[key]) { baked[key] = { weapon: !!w, holster: !!h }; mainKeys.push(key); }
        };
        const bases = L.shieldOn && q.owned.shield ? [L.emblem, 'noshield'] : ['noshield'];
        bases.forEach((b) => {
          if (weapon && holsterWanted) add(b, weapon, true);
          if (weapon) add(b, weapon, false);
          if (holsterWanted) add(b, null, true);
          add(b, null, false);
        });
        mainKeys.push(helmet === 'on' ? 'legacyRanger' : 'legacyRangerOff', 'legacyRanger');
      }
      mainKeys.forEach(request); // ask for every candidate at once instead of one after another
      const main = pick(mainKeys);
      if (main === null) return null;
      const has = (main && baked[main]) || { weapon: false, holster: false };

      const slice = (inner) => `viewBox="0 0 ${GW} ${GH}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${inner}`;
      // power-up aura: the suit color, brightened enough to show on a dark scene, with a pale core
      const mix = (rgb, to, t) => rgb.map((c, i) => Math.round(c + (to[i] - c) * t));
      const suitRgb = hexToRgb(suitHex);
      const lum = (0.299 * suitRgb[0] + 0.587 * suitRgb[1] + 0.114 * suitRgb[2]) / 255;
      const auraRgb = lum < 0.35 ? mix(suitRgb, [255, 255, 255], 0.4) : suitRgb;
      const coreRgb = mix(auraRgb, [255, 255, 255], 0.65);
      const auraVars = `--aura:rgb(${auraRgb});--aura-core:rgb(${coreRgb})`;
      let html = `<div class="art-scene${fx ? ' fx-' + fx : ''}" style="${auraVars}" role="img" aria-label="Your ranger">`;
      html += `<svg class="art-bg" ${slice(pxBackground(a.background).svg())}</svg>`;
      if (a.aura && a.aura !== 'none' && a.aura !== 'blaze') {
        const aura = pxAura(a.aura, suitHex);
        if (aura) html += `<svg class="art-aura aura-pulse" ${slice(aura.svg())}</svg>`;
      }

      // guardian beast / megazord behind
      if (L.beast) {
        const bk = L.beast === 'megazord' ? 'megazord' : L.beast === 'ultra' ? 'ultra-megazord' : `beast-${L.beast}`;
        const bp = pick([bk, L.beast === 'tiger' ? 'legacyBeast' : null].filter(Boolean));
        // beasts and zords wear your suit + trim colors too
        if (bp && bp !== 'wait') html += `<img class="art-beast" alt="" src="${recolored(bp, suitHex, trimHex)}">`;
      }
      // motorcycle with Battlizer
      if (superOk && L.superMode === 'battlizer') {
        const bike = pick(['motorcycle']);
        if (bike && bike !== 'wait') html += `<img class="art-bike" alt="" src="${imgs.motorcycle.url}">`;
      }

      // Back to Action: your aura art bursts up behind the ranger (only rendered for that one-shot effect)
      if (fx === 'powerup' && imgs['aura-powerup']) {
        html += `<img class="art-powerup" alt="" src="${tinted('aura-powerup', auraRgb)}">`;
      }

      // the ranger and what he holds move together (effects on art-figure, idle breathing on art-bob)
      html += '<div class="art-figure"><div class="art-bob">';
      if (main !== 'wait') {
        const isPower = main === 'legacyPower' || main.startsWith('super-');
        html += `<img class="art-ranger${isPower ? ' art-power' : ''}" alt="" src="${recolored(main, suitHex, trimHex, accentHex)}">`;
      }

      // holstered blaster + held weapon, only when the ranger photo doesn't already include them
      if (!superOk) {
        if (holsterWanted && !has.holster) {
          const hp = pick(['holster-gun']);
          if (hp && hp !== 'wait') html += `<img class="art-holster" alt="" style="${place(HOLSTER_PLACE)}" src="${imgs['holster-gun'].url}">`;
        }
        if (weapon && !has.weapon) {
          const wp = pick([`weapon-${weapon}`, weapon === 'guardian-blade' ? 'legacySword' : null].filter(Boolean));
          if (wp && wp !== 'wait') html += `<img class="art-weapon" alt="" style="${place(WEAPON_PLACE[weapon] || WEAPON_PLACE.default)}" src="${imgs[wp].url}">`;
        }
      }
      html += '</div></div></div>';
      return html;
    },
  };
})();
