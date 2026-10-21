// ============================================================
// Device-only face photo -> pixel-art face
// The photo is resized and stored in THIS browser's localStorage under its
// own key. It is never part of the synced `state`, never uploaded, and never
// committed to the repo. Each device needs its own upload.
// ============================================================

const FACE_KEY = 'holform-os-face-v1';
const FACE_GW = 16;
const FACE_GH = 20;

const Face = (() => {
  let data = null; // { src, zoom, ox, oy }
  let img = null;  // decoded source (Image or canvas)
  let px = null;   // FACE_GW * FACE_GH hex colors

  function load() {
    try {
      const raw = localStorage.getItem(FACE_KEY);
      data = raw ? JSON.parse(raw) : null;
    } catch (e) { data = null; }
  }

  function persist() {
    try {
      if (data) localStorage.setItem(FACE_KEY, JSON.stringify(data));
      else localStorage.removeItem(FACE_KEY);
      return true;
    } catch (e) { return false; }
  }

  function toHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // contrast bump + posterize to 7 levels per channel for a pixel-art feel
  function quant(v) {
    v = (v - 128) * 1.12 + 128;
    v = Math.min(255, Math.max(0, v));
    return Math.round((Math.round((v / 255) * 6) / 6) * 255);
  }

  function compute() {
    if (!img || !data) { px = null; return; }
    const sw = img.naturalWidth || img.width;
    const sh = img.naturalHeight || img.height;
    const aspect = FACE_GW / FACE_GH;
    const ch0 = Math.min(sh, sw / aspect);
    const cw0 = ch0 * aspect;
    const z = Math.max(1, data.zoom || 1);
    const cw = cw0 / z;
    const ch = ch0 / z;
    const cx = sw / 2 + (data.ox || 0) * ((sw - cw) / 2);
    const cy = sh / 2 + (data.oy || 0) * ((sh - ch) / 2);
    const sx = Math.min(Math.max(cx - cw / 2, 0), sw - cw);
    const sy = Math.min(Math.max(cy - ch / 2, 0), sh - ch);

    const mid = document.createElement('canvas');
    mid.width = FACE_GW * 4; mid.height = FACE_GH * 4;
    const mctx = mid.getContext('2d');
    mctx.imageSmoothingQuality = 'high';
    mctx.drawImage(img, sx, sy, cw, ch, 0, 0, mid.width, mid.height);

    const small = document.createElement('canvas');
    small.width = FACE_GW; small.height = FACE_GH;
    const sctx = small.getContext('2d');
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(mid, 0, 0, FACE_GW, FACE_GH);

    const d = sctx.getImageData(0, 0, FACE_GW, FACE_GH).data;
    const out = [];
    for (let i = 0; i < FACE_GW * FACE_GH; i++) out.push(toHex(quant(d[i * 4]), quant(d[i * 4 + 1]), quant(d[i * 4 + 2])));
    px = out;
  }

  function decode(done) {
    if (!data) { img = null; px = null; return; }
    const im = new Image();
    im.onload = () => { img = im; compute(); if (done) done(); };
    im.src = data.src;
  }

  return {
    init(done) { load(); decode(done); },
    has() { return !!data; },
    pixels() { return px ? { w: FACE_GW, h: FACE_GH, px } : null; },
    skinTone() {
      if (!px) return '#d9a273';
      let r = 0, g = 0, b = 0, n = 0;
      for (let j = 11; j < 15; j++) {
        for (let i = 5; i < 11; i++) {
          const v = parseInt(px[j * FACE_GW + i].slice(1), 16);
          r += (v >> 16) & 255; g += (v >> 8) & 255; b += v & 255; n++;
        }
      }
      return toHex(Math.round(r / n), Math.round(g / n), Math.round(b / n));
    },
    get() { return data ? { zoom: data.zoom, ox: data.ox, oy: data.oy } : null; },
    adjust(part) { if (!data) return; Object.assign(data, part); compute(); },
    save() { return persist(); },
    clear() { data = null; img = null; px = null; persist(); },
    setFromFile(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error('Could not read that file.'));
        fr.onload = () => {
          const im = new Image();
          im.onerror = () => reject(new Error('That doesn’t look like an image.'));
          im.onload = () => {
            const max = 320;
            const s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
            const c = document.createElement('canvas');
            c.width = Math.round(im.naturalWidth * s);
            c.height = Math.round(im.naturalHeight * s);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            data = { src: c.toDataURL('image/jpeg', 0.85), zoom: 1, ox: 0, oy: 0 };
            if (!persist()) { data = null; reject(new Error('Not enough storage on this device for the photo.')); return; }
            img = c;
            compute();
            resolve();
          };
          im.src = fr.result;
        };
        fr.readAsDataURL(file);
      });
    },
  };
})();
