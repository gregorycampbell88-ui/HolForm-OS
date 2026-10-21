// ============================================================
// Art kit — your own ranger art.
// The six default pieces are built into the app (the art/ folder), so every
// device shows them with no setup. A device can also override any piece with
// its own file: overrides live in that browser's IndexedDB (database
// "holform-art"), never in synced state and never uploaded. If a piece can't
// load at all, the drawn pixel ranger is the fallback.
// ============================================================

const BUNDLED_ART = {
  ranger: 'art/ranger.png',
  rangerOff: 'art/ranger-off.png',
  power: 'art/power.webp',
  beast: 'art/beast.webp',
  sword: 'art/sword.png',
  morpher: 'art/morpher.png',
};

const ART_SLOTS = [
  { key: 'ranger', label: 'Ranger — helmet on', hint: 'Required' },
  { key: 'rangerOff', label: 'Ranger — helmet off', hint: 'Same pose as helmet on' },
  { key: 'power', label: 'Power-up pose', hint: 'Shown in Blazing Mode' },
  { key: 'beast', label: 'Guardian beast', hint: 'Tiger — unlocks at Lv 4' },
  { key: 'sword', label: 'Sword', hint: 'Guardian Blade — unlocks at Lv 3' },
  { key: 'morpher', label: 'Morpher', hint: 'Tap it to put the helmet on/off' },
];

const ArtKit = (() => {
  const DB = 'holform-art';
  const STORE = 'images';
  const imgs = {};   // key -> decoded HTMLImageElement
  const urls = {};   // key -> object URL (override) or built-in path
  const bundled = {}; // key -> true while the built-in file is the one in use
  const recolorCache = {};

  function loadBundled(key) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => { imgs[key] = im; urls[key] = BUNDLED_ART[key]; bundled[key] = true; resolve(true); };
      im.onerror = () => resolve(false);
      im.src = BUNDLED_ART[key];
    });
  }

  function dropCurrent(key) {
    if (urls[key] && !bundled[key]) URL.revokeObjectURL(urls[key]);
    delete imgs[key]; delete urls[key]; delete bundled[key];
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function decode(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const im = new Image();
      im.onload = () => resolve({ im, url });
      im.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      im.src = url;
    });
  }

  function clearRecolor(key) {
    Object.keys(recolorCache).forEach((k) => { if (k.startsWith(key + '|')) delete recolorCache[k]; });
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

  return {
    ready: false,

    async init(done) {
      try {
        const db = await openDB();
        const entries = await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE);
          const st = tx.objectStore(STORE);
          const keys = st.getAllKeys();
          const vals = st.getAll();
          tx.oncomplete = () => resolve(keys.result.map((k, i) => [k, vals.result[i]]));
          tx.onerror = () => reject(tx.error);
        });
        for (const [key, blob] of entries) {
          const d = await decode(blob);
          if (d) { imgs[key] = d.im; urls[key] = d.url; }
        }
        db.close();
      } catch (e) { /* IndexedDB unavailable (private mode?) — built-in art still loads */ }
      // built-in art fills in every piece that this device hasn't overridden
      await Promise.all(Object.keys(BUNDLED_ART).filter((k) => !imgs[k]).map(loadBundled));
      this.ready = true;
      if (done) done();
    },

    has(key) { return !!imgs[key]; },
    url(key) { return urls[key] || ''; },
    isBuiltIn(key) { return !!bundled[key]; },

    // art mode is on when this device has the ranger image and the player hasn't switched it off
    active(avatar) { return !!imgs.ranger && avatar.useArt !== false; },

    async put(key, file) {
      if (!file || !file.type.startsWith('image/')) throw new Error('That doesn’t look like an image.');
      if (file.size > 8 * 1024 * 1024) throw new Error('That file is over 8 MB — please use a smaller version.');
      const d = await decode(file);
      if (!d) throw new Error('Could not read that image.');
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(file, key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      dropCurrent(key);
      imgs[key] = d.im; urls[key] = d.url;
      clearRecolor(key);
    },

    async remove(key) {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      dropCurrent(key);
      clearRecolor(key);
      await loadBundled(key); // go back to the built-in piece
    },

    // Suit green -> chosen suit color, gold -> chosen trim color (shading kept).
    recolored(key, suitHex, trimHex) {
      const im = imgs[key];
      if (!im) return '';
      const keepSuit = suitHex === '#14a85f';
      const keepTrim = trimHex === '#f2c14e';
      if (keepSuit && keepTrim) return urls[key];
      const ck = `${key}|${suitHex}|${trimHex}`;
      if (recolorCache[ck]) return recolorCache[ck];
      const c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0);
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
    },

    // the composed scene: background, aura, beast, ranger, sword
    sceneHTML(a) {
      const suitHex = (SUITS.find((s) => s.id === a.suit) || SUITS[0]).color;
      const trimHex = (TRIMS.find((t) => t.id === a.trim) || TRIMS[0]).color;
      const usePower = a.aura === 'blaze' && imgs.power;
      const showFace = a.morphed === false && imgs.rangerOff;
      const main = usePower ? 'power' : (showFace ? 'rangerOff' : 'ranger');
      const slice = (inner) => `viewBox="0 0 ${GW} ${GH}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${inner}`;

      let html = `<div class="art-scene" role="img" aria-label="Your ranger">`;
      html += `<svg class="art-bg" ${slice(pxBackground(a.background).svg())}</svg>`;
      if (a.aura && a.aura !== 'none' && !usePower) {
        const aura = pxAura(a.aura, suitHex);
        if (aura) html += `<svg class="art-aura aura-pulse" ${slice(aura.svg())}</svg>`;
      }
      if (a.beast === 'tiger' && imgs.beast) html += `<img class="art-beast" alt="" src="${urls.beast}">`;
      html += `<img class="art-ranger${usePower ? ' art-power' : ''}" alt="" src="${this.recolored(main, suitHex, trimHex)}">`;
      if (a.weapon === 'blade' && imgs.sword && !usePower) html += `<img class="art-sword" alt="" src="${urls.sword}">`;
      html += `</div>`;
      return html;
    },
  };
})();
