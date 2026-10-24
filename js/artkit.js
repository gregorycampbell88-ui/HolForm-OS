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

  function recolored(key, suitHex, trimHex) {
    const rec = imgs[key];
    if (!rec) return '';
    const keepSuit = suitHex === '#14a85f';
    const keepTrim = trimHex === '#f2c14e';
    if (keepSuit && keepTrim) return rec.url;
    const ck = `${key}|${suitHex}|${trimHex}`;
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
    const suit = hexToRgb(suitHex), trim = hexToRgb(trimHex);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue;
      const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      let out = null;
      if (!keepSuit && h >= 75 && h <= 175 && s > 0.25 && l < 0.7) out = tint(suit, l, 0.27);
      else if (!keepTrim && h >= 36 && h <= 58 && s > 0.45 && l > 0.28) out = tint(trim, l, 0.5);
      if (out) { d[i] = out[0]; d[i + 1] = out[1]; d[i + 2] = out[2]; }
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
    sceneHTML(a, q) {
      const L = q.loadout;
      const suitHex = (SUITS.find((s) => s.id === a.suit) || SUITS[0]).color;
      const trimHex = (TRIMS.find((t) => t.id === a.trim) || TRIMS[0]).color;
      const superOk = L.superOn && modesAvailable(q).includes(L.superMode);
      const helmet = a.morphed !== false ? 'on' : 'off';
      const weapon = L.weaponHeld && L.weapon ? L.weapon : null;

      let mainKeys;
      if (superOk) {
        mainKeys = [`super-${L.superMode}-${weapon || 'unarmed'}`, `super-${L.superMode}-unarmed`, 'legacyPower'];
      } else {
        mainKeys = [];
        if (L.shieldOn && q.owned.shield) mainKeys.push(`ranger-${L.emblem}-helmet-${helmet}`);
        mainKeys.push(`ranger-noshield-helmet-${helmet}`, helmet === 'on' ? 'legacyRanger' : 'legacyRangerOff', 'legacyRanger');
      }
      const main = pick(mainKeys);
      if (main === null) return null;

      const slice = (inner) => `viewBox="0 0 ${GW} ${GH}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${inner}`;
      let html = '<div class="art-scene" role="img" aria-label="Your ranger">';
      html += `<svg class="art-bg" ${slice(pxBackground(a.background).svg())}</svg>`;
      if (a.aura && a.aura !== 'none' && a.aura !== 'blaze') {
        const aura = pxAura(a.aura, suitHex);
        if (aura) html += `<svg class="art-aura aura-pulse" ${slice(aura.svg())}</svg>`;
      }

      // guardian beast / megazord behind
      if (L.beast) {
        const bk = L.beast === 'megazord' ? 'megazord' : L.beast === 'ultra' ? 'ultra-megazord' : `beast-${L.beast}`;
        const bp = pick([bk, L.beast === 'tiger' ? 'legacyBeast' : null].filter(Boolean));
        if (bp && bp !== 'wait') html += `<img class="art-beast" alt="" src="${imgs[bp].url}">`;
      }
      // motorcycle with Battlizer
      if (superOk && L.superMode === 'battlizer') {
        const bike = pick(['motorcycle']);
        if (bike && bike !== 'wait') html += `<img class="art-bike" alt="" src="${imgs.motorcycle.url}">`;
      }

      if (main !== 'wait') {
        const isPower = main === 'legacyPower' || main.startsWith('super-');
        html += `<img class="art-ranger${isPower ? ' art-power' : ''}" alt="" src="${recolored(main, suitHex, trimHex)}">`;
      }

      // holstered blaster + held weapon (regular form only)
      if (!superOk) {
        if (L.holster && q.owned.blaster) {
          const hp = pick(['holster-gun']);
          if (hp && hp !== 'wait') html += `<img class="art-holster" alt="" style="${place(HOLSTER_PLACE)}" src="${imgs['holster-gun'].url}">`;
        }
        if (weapon) {
          const wp = pick([`weapon-${weapon}`, weapon === 'guardian-blade' ? 'legacySword' : null].filter(Boolean));
          if (wp && wp !== 'wait') html += `<img class="art-weapon" alt="" style="${place(WEAPON_PLACE[weapon] || WEAPON_PLACE.default)}" src="${imgs[wp].url}">`;
        }
      }
      html += '</div>';
      return html;
    },
  };
})();
