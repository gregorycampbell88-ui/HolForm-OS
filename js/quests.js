// ============================================================
// HolForm Quest — character, XP, business missions, gaming sessions
// Loaded after app.js; shares its global `state`, `el`, `saveState`, `render`.
// ============================================================

// ---- tunable numbers (adjust after the first two weeks) ----
const Q_XP = { mission: 50, block: 3, task: 8 };

// Each milestone grants ONE gaming session (up to `min` minutes) once the
// stated number of main missions is finished. After the last tier the
// 120-minute tier repeats.
const MILESTONES = [
  { min: 20, needs: 1 },
  { min: 30, needs: 2 },
  { min: 45, needs: 2 },
  { min: 60, needs: 3 },
  { min: 90, needs: 4 },
  { min: 120, needs: 5 },
];

const PUBLIC_URL = 'https://gregorycampbell88-ui.github.io/HolForm-OS/';

const EDIT_DEFAULT_FINISH = 'Trim dead space, check audio, add readable captions, review once.';

// `min` = least time needed; `minutes` = default run length.
const MISSIONS = [
  { id: 'start-convo', title: 'Start a conversation', min: 10, minutes: 15, kind: 'convo',
    finish: 'Send one personal, relevant message — not a copy-and-paste sales pitch.' },
  { id: 'continue-convo', title: 'Continue a conversation', min: 10, minutes: 15, kind: 'convo',
    finish: 'Respond thoughtfully to one existing conversation.' },
  { id: 'find-people', title: 'Find your people', min: 10, minutes: 10, kind: null,
    finish: 'Identify three followers, acquaintances, or community members you could naturally talk with.' },
  { id: 'content-idea', title: 'Find a content idea', min: 15, minutes: 20, kind: null,
    finish: 'Turn one real fitness question into a hook and three talking points.' },
  { id: 'film', title: 'Film one useful answer', min: 20, minutes: 30, kind: null,
    finish: 'Record one short video answering that question.' },
  { id: 'edit', title: 'Finish one edit', min: 20, minutes: 45, kind: null, editing: true,
    finish: EDIT_DEFAULT_FINISH },
];
// Revenue-first order. Editing only floats up after a harder mission is done today.
const MISSION_PRIORITY = ['start-convo', 'continue-convo', 'find-people', 'content-idea', 'film', 'edit'];

// ---- character catalogs (lv = level that unlocks the item) ----
const CHARS = [
  { id: 'kai', label: 'Kai', blurb: 'Focused', lv: 1, eye: '#2c6fb5', tilt: 0, iris: [8.5, 11] },
  { id: 'ren', label: 'Ren', blurb: 'Fierce', lv: 1, eye: '#1fa36b', tilt: 4, iris: [8, 11.5] },
  { id: 'mika', label: 'Mika', blurb: 'Bright', lv: 1, eye: '#b5612c', tilt: -1, iris: [9.5, 11.5] },
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
  { id: 'long', label: 'Long', lv: 2 },
  { id: 'spiky', label: 'Spiky', lv: 4 },
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
  { id: 'purple', label: 'Purple', lv: 8, color: '#7a4fd0' },
];
const OUTFITS = [
  { id: 'tee', label: 'HF Tee', lv: 1 },
  { id: 'hoodie', label: 'Hoodie', lv: 1 },
  { id: 'tank', label: 'Gym Tank', lv: 2 },
  { id: 'jacket', label: 'Suit Jacket', lv: 3 },
  { id: 'gi', label: 'Dojo Gi', lv: 5 },
  { id: 'armor', label: 'Armor', lv: 7 },
  { id: 'champion', label: 'Champion', lv: 9 },
];
const ACCESSORIES = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'headband', label: 'Headband', lv: 2 },
  { id: 'glasses', label: 'Glasses', lv: 3 },
  { id: 'headphones', label: 'Headphones', lv: 4 },
  { id: 'cap', label: 'Cap', lv: 6 },
  { id: 'chain', label: 'Gold chain', lv: 8 },
  { id: 'laurel', label: 'Laurel', lv: 11 },
];
const BACKGROUNDS = [
  { id: 'plain', label: 'Plain', lv: 1 },
  { id: 'sunrise', label: 'Sunrise', lv: 2 },
  { id: 'city', label: 'City', lv: 4 },
  { id: 'stars', label: 'Stars', lv: 6 },
  { id: 'forest', label: 'Forest', lv: 8 },
  { id: 'arena', label: 'Arena', lv: 10 },
];
const AURAS = [
  { id: 'none', label: 'None', lv: 1 },
  { id: 'glow', label: 'Green glow', lv: 3 },
  { id: 'ember', label: 'Ember', lv: 5 },
  { id: 'volt', label: 'Volt', lv: 7 },
  { id: 'gold', label: 'Gold', lv: 9 },
];
const CATALOG_SECTIONS = [
  { key: 'base', label: 'Character', items: CHARS, onboarding: true },
  { key: 'skin', label: 'Skin tone', items: SKINS, onboarding: true },
  { key: 'hairStyle', label: 'Hairstyle', items: HAIR_STYLES, onboarding: true },
  { key: 'hairColor', label: 'Hair color', items: HAIR_COLORS, onboarding: true },
  { key: 'outfit', label: 'Outfit', items: OUTFITS, onboarding: true },
  { key: 'accessory', label: 'Accessory', items: ACCESSORIES },
  { key: 'background', label: 'Background', items: BACKGROUNDS },
  { key: 'aura', label: 'Aura effect', items: AURAS },
];

// ---- state helpers ----

const questUI = {
  customizing: false,
  editBudget: 20,
  editFinish: EDIT_DEFAULT_FINISH,
  skipIdx: 0,
  result: null,
  nextAnchor: null,
  fixText: '',
  fixMinutes: 5,
  saveNote: '',
};

function qDefaults() {
  return {
    avatar: { chosen: false, base: 'kai', skin: 's3', hairStyle: 'short', hairColor: 'black', outfit: 'tee', accessory: 'none', background: 'plain', aura: 'none' },
    xp: 0,
    xpAwarded: {},
    tier: 0,
    progress: 0,
    pendingSession: null,
    activeSession: null,
    unlockedMinutes: [20],
    activeMission: null,
    savedPlaces: [],
    log: [],
    levelUp: null,
    pickedAvailable: 20,
    calTimes: { business: '09:30', end: '12:00', sunday: '08:30' },
  };
}

function qEnsure() {
  const d = qDefaults();
  const q = state.quest && typeof state.quest === 'object' ? state.quest : {};
  state.quest = Object.assign(d, q);
  state.quest.avatar = Object.assign(qDefaults().avatar, q.avatar || {});
  state.quest.calTimes = Object.assign(qDefaults().calTimes, q.calTimes || {});
  if (!state.weeklyAdjustments) state.weeklyAdjustments = {};
}

function xpToReach(n) { return 25 * (n - 1) * n; }

function levelInfo(xp) {
  let level = 1;
  while (xp >= xpToReach(level + 1)) level++;
  const base = xpToReach(level);
  const need = xpToReach(level + 1) - base;
  const into = xp - base;
  return { level, into, need, pct: Math.min(100, Math.round((into / need) * 100)) };
}

function unlocksAtLevel(lv) {
  const out = [];
  CATALOG_SECTIONS.forEach((s) => s.items.forEach((i) => { if (i.lv === lv && lv > 1) out.push(i.label); }));
  return out;
}

function awardXp(amount, key, date) {
  const q = state.quest;
  if (key) {
    const d = date || todayISO();
    if (!q.xpAwarded[d]) q.xpAwarded[d] = {};
    if (q.xpAwarded[d][key]) return 0;
    q.xpAwarded[d][key] = true;
  }
  const before = levelInfo(q.xp).level;
  q.xp += amount;
  const after = levelInfo(q.xp).level;
  if (after > before) {
    const unlocks = [];
    for (let l = before + 1; l <= after; l++) unlocks.push(...unlocksAtLevel(l));
    q.levelUp = { to: after, unlocks };
  }
  // keep the dedupe map small
  const keys = Object.keys(q.xpAwarded).sort();
  while (keys.length > 21) delete q.xpAwarded[keys.shift()];
  return amount;
}

function qNow() { return Date.now(); }

function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// ---- notifications / sound ----

let _audioCtx = null;
function qBeep() {
  try {
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.frequency.value = 880;
    g.gain.value = 0.08;
    o.connect(g); g.connect(_audioCtx.destination);
    o.start(); o.stop(_audioCtx.currentTime + 0.35);
  } catch (e) { /* sound is optional */ }
}

function qNotify(title, body) {
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* optional */ }
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icons/icon-192.png', tag: 'holform-quest' };
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => {
        try { new Notification(title, opts); } catch (e) { /* optional */ }
      });
      return;
    }
    new Notification(title, opts);
  } catch (e) { /* optional */ }
}

// ---- timers (checked once a second; survives reloads via timestamps) ----

function qTick() {
  if (!state.quest) return;
  const q = state.quest;
  const now = qNow();
  let changed = false;
  let transition = false;

  const m = q.activeMission;
  if (m && m.phase === 'running' && now >= m.endsAt) {
    m.phase = 'landing';
    changed = transition = true;
    qNotify('Time’s up', `${m.title}: where are you?`);
    qBeep();
  }
  const s = q.activeSession;
  if (s) {
    const left = s.endsAt - now;
    if (!s.warned && left > 0 && left <= 5 * 60000 && s.minutes >= 10) {
      s.warned = true;
      changed = transition = true;
      qNotify('Save your game', '5 minutes left in your session.');
      qBeep();
    }
    if (!s.ended && left <= 0) {
      s.ended = true;
      changed = transition = true;
      qNotify('Session ended', 'Time to wrap up — tap “Session finished.”');
      qBeep();
    }
  }
  if (changed) saveState();
  qUpdateActiveBar();
  qUpdateCountdowns();
  if (transition && state.activeTab === 'quest') render();
}

function qUpdateCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach((node) => {
    node.textContent = fmtClock(Number(node.dataset.countdown) - qNow());
  });
}

function qUpdateActiveBar() {
  const bar = document.getElementById('active-bar');
  if (!bar) return;
  const q = state.quest;
  let html = '';
  if (state.activeTab !== 'quest' && q) {
    if (q.activeMission && q.activeMission.phase === 'running') {
      html = `⏱ ${q.activeMission.title} · <span data-countdown="${q.activeMission.endsAt}">${fmtClock(q.activeMission.endsAt - qNow())}</span>`;
    } else if (q.activeMission) {
      html = '⏱ Time’s up — tap to land your mission';
    } else if (q.activeSession) {
      html = q.activeSession.ended
        ? '🎮 Session ended — tap to finish'
        : `🎮 Gaming session · <span data-countdown="${q.activeSession.endsAt}">${fmtClock(q.activeSession.endsAt - qNow())}</span>`;
    }
  }
  if (bar.dataset.html !== html) {
    bar.dataset.html = html;
    bar.innerHTML = html;
  }
  bar.classList.toggle('hidden', !html);
  if (html) qUpdateCountdowns();
}

// ---- core actions ----

function startMission(def, minutes, finishLine) {
  const q = state.quest;
  const now = qNow();
  q.activeMission = {
    id: def.id, title: def.title, kind: def.kind || null, editing: !!def.editing,
    minutes, finishLine, startedAt: now, endsAt: now + minutes * 60000,
    extensions: 0, fixes: [], phase: 'running',
  };
  questUI.result = null;
  questUI.nextAnchor = null;
  saveState();
  render();
}

function progressReward() {
  const q = state.quest;
  if (q.pendingSession || q.activeSession) {
    return 'Extra mission — earns XP only until you play your current session.';
  }
  const t = MILESTONES[q.tier];
  q.progress += 1;
  if (q.progress >= t.needs) {
    q.pendingSession = { maxMinutes: t.min };
    if (!q.unlockedMinutes.includes(t.min)) q.unlockedMinutes.push(t.min);
    q.unlockedMinutes.sort((a, b) => a - b);
    q.progress = 0;
    if (q.tier < MILESTONES.length - 1) q.tier += 1;
    return `Gaming session earned — up to ${t.min} minutes.`;
  }
  const left = t.needs - q.progress;
  return `${left} more main mission${left > 1 ? 's' : ''} to your ${t.min}-minute session.`;
}

function finishMission() {
  const q = state.quest;
  const m = q.activeMission;
  if (!m) return;
  q.log.unshift({
    id: 'l' + qNow(), date: todayISO(), missionId: m.id, title: m.title, kind: m.kind,
    minutes: m.minutes, extensions: m.extensions, status: 'finished', reply: null,
  });
  if (q.log.length > 400) q.log.length = 400;
  q.savedPlaces = q.savedPlaces.filter((p) => p.missionId !== m.id);
  const xp = awardXp(Q_XP.mission);
  const rewardMsg = progressReward();
  q.activeMission = null;
  questUI.result = { title: m.title, xp, rewardMsg };
  saveState();
  render();
}

function savePlace(note) {
  const q = state.quest;
  const m = q.activeMission;
  if (!m) return;
  q.log.unshift({
    id: 'l' + qNow(), date: todayISO(), missionId: m.id, title: m.title, kind: m.kind,
    minutes: m.minutes, extensions: m.extensions, status: 'saved', reply: null,
  });
  if (q.log.length > 400) q.log.length = 400;
  q.savedPlaces = q.savedPlaces.filter((p) => p.missionId !== m.id);
  q.savedPlaces.unshift({ id: 'p' + qNow(), missionId: m.id, title: m.title, note: note || '', savedAt: qNow() });
  q.activeMission = null;
  questUI.result = { title: m.title, saved: true };
  saveState();
  render();
}

function startSession(minutes) {
  const q = state.quest;
  if (!q.pendingSession || minutes > q.pendingSession.maxMinutes) return;
  const now = qNow();
  q.activeSession = { minutes, startedAt: now, endsAt: now + minutes * 60000, warned: false, ended: false };
  q.pendingSession = null;
  questUI.result = null;
  saveState();
  render();
}

function getNextAnchor() {
  const weekday = new Date().getDay();
  const groupKey = DAY_GROUP[state.season][weekday];
  const blocks = materializeChain(getEffectiveChain(groupKey));
  const nowMin = nowMinutes();
  const next = blocks.find((b) => b.category === 'anchor' && parseTimeToMinutes(b.start) > nowMin);
  return next ? `${next.start.toUpperCase()} · ${next.label}` : 'No more anchors today — you’re free.';
}

function finishSession() {
  const q = state.quest;
  if (!q.activeSession) return;
  questUI.nextAnchor = getNextAnchor();
  q.activeSession = null;
  saveState();
  render();
}

function rankedMissions(available) {
  const q = state.quest;
  const today = todayISO();
  const doneToday = q.log.filter((l) => l.date === today && l.status === 'finished');
  const nonEditDone = doneToday.some((l) => l.missionId !== 'edit');
  return MISSIONS
    .filter((m) => m.min <= available)
    .map((m) => {
      let score = MISSION_PRIORITY.indexOf(m.id) + doneToday.filter((l) => l.missionId === m.id).length * 10;
      if (m.id === 'edit' && !nonEditDone) score += 100;
      return { m, score };
    })
    .sort((a, b) => a.score - b.score)
    .map((x) => x.m);
}

// ---- hooks called from app.js ----

function qOnBlockChecked(key, val, date) {
  if (!val || date !== todayISO()) return;
  qEnsure();
  awardXp(Q_XP.block, 'blk:' + key, date);
}

function qOnTaskChecked(task) {
  qEnsure();
  awardXp(Q_XP.task, 'task:' + task.id, todayISO());
}

// ---- avatar art (layered SVG) ----

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

function avatarSVG(a) {
  const ch = CHARS.find((c) => c.id === a.base) || CHARS[0];
  const skin = (SKINS.find((s) => s.id === a.skin) || SKINS[2]).color;
  const skinD = shade(skin, -0.14);
  const hair = (HAIR_COLORS.find((c) => c.id === a.hairColor) || HAIR_COLORS[0]).color;
  const hairD = shade(hair, -0.25);
  const hairL = shade(hair, 0.18);
  const id = 'a' + Math.random().toString(36).slice(2, 8);
  let defs = '';

  // background
  let bg = '';
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

  // aura
  let aura = '';
  const auraColor = { glow: '#00bb79', ember: '#ff7a2f', volt: '#3aa5d8', gold: '#ffd54a' }[a.aura];
  if (auraColor) {
    defs += `<radialGradient id="${id}-au" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${auraColor}" stop-opacity=".75"/><stop offset=".6" stop-color="${auraColor}" stop-opacity=".35"/><stop offset="1" stop-color="${auraColor}" stop-opacity="0"/></radialGradient>`;
    aura = `<circle class="aura-pulse" cx="100" cy="124" r="104" fill="url(#${id}-au)"/>`;
    if (a.aura === 'ember') {
      const flame = '<path d="M26 200 C12 178 30 170 24 146 C44 164 46 186 38 202 Z" fill="#ff9d4a" opacity=".85"/><path d="M44 214 C36 198 46 192 44 176 C56 188 56 202 52 214 Z" fill="#ffd27a" opacity=".85"/>';
      aura += flame + `<g transform="translate(200 0) scale(-1 1)">${flame}</g>`;
    } else if (a.aura === 'volt') {
      const bolt = '<polyline points="30,56 44,84 32,88 48,120" stroke="#9be3ff" stroke-width="3" fill="none" stroke-linejoin="round"/><polyline points="18,110 30,128 22,132 34,154" stroke="#9be3ff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>';
      aura += bolt + `<g transform="translate(200 0) scale(-1 1)">${bolt}</g>`;
    } else if (a.aura === 'gold') {
      const spark = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#fff3b0"/>`;
      aura += spark(30, 70, 1.2) + spark(172, 90, 1) + spark(44, 150, .8) + spark(160, 40, .9) + spark(22, 30, .7);
    }
  }

  // hair layers
  let hairBack = '';
  let hairFront = '';
  const CAP = `M56 104 C48 64 72 40 100 40 C128 40 152 64 144 104 C140 92 134 82 124 76 C116 84 104 82 98 72 C90 82 76 84 68 78 C62 84 58 94 56 104 Z`;
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
      hairBack = `<circle cx="100" cy="34" r="16" fill="${hair}"/><circle cx="100" cy="34" r="16" fill="none" stroke="${hairD}" stroke-width="2"/>`;
      hairFront = `<path d="${CAP}" fill="${hair}"/>`;
      break;
    default:
      hairFront = `<path d="${CAP}" fill="${hair}"/><path d="M70 62 C80 52 96 48 110 50" stroke="${hairL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  // outfit
  let base = `<path d="${SHOULDERS}" fill="#2d3a40"/>`;
  let details = '';
  switch (a.outfit) {
    case 'hoodie':
      base = `<path d="${SHOULDERS}" fill="#00925e"/>`;
      details = `<path d="M66 172 Q100 204 134 172 L142 186 Q100 218 58 186 Z" fill="#00774d"/><path d="M92 196 L90 226 M108 196 L110 226" stroke="#e8ecef" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'tank':
      base = `<path d="${SHOULDERS}" fill="${skin}"/>`;
      details = `<path d="M50 240 L56 192 Q74 174 88 172 Q100 190 112 172 Q126 174 144 192 L150 240 Z" fill="#00bb79"/>`;
      break;
    case 'jacket':
      base = `<path d="${SHOULDERS}" fill="#1e2a3a"/>`;
      details = `<path d="M84 168 L100 204 L116 168 Z" fill="#f4f6f7"/><path d="M84 168 L96 214 L70 232 L58 196 Z M116 168 L104 214 L130 232 L142 196 Z" fill="#162030"/><path d="M97 190 L103 190 L106 226 L100 234 L94 226 Z" fill="#00bb79"/>`;
      break;
    case 'gi':
      base = `<path d="${SHOULDERS}" fill="#eef1f2"/>`;
      details = `<path d="M72 170 L100 218 L128 170" fill="none" stroke="#c9d0d4" stroke-width="7" stroke-linejoin="round"/><rect x="32" y="226" width="136" height="10" fill="#111"/>`;
      break;
    case 'armor':
      base = `<path d="${SHOULDERS}" fill="#394650"/>`;
      details = `<ellipse cx="46" cy="198" rx="26" ry="15" fill="#00bb79" transform="rotate(-18 46 198)"/><ellipse cx="154" cy="198" rx="26" ry="15" fill="#00bb79" transform="rotate(18 154 198)"/><path d="M72 178 L128 178 L120 226 L80 226 Z" fill="#2b353d" stroke="#00bb79" stroke-width="2"/>`;
      break;
    case 'champion':
      base = `<path d="${SHOULDERS}" fill="#0e1113"/>`;
      details = `<path d="M26 236 C26 196 52 172 76 170 L82 176 C58 182 40 204 40 238 Z" fill="#00bb79"/><g transform="translate(200 0) scale(-1 1)"><path d="M26 236 C26 196 52 172 76 170 L82 176 C58 182 40 204 40 238 Z" fill="#00bb79"/></g><path d="M78 168 L100 190 L122 168 L128 160 L100 176 L72 160 Z" fill="#ffd54a"/><path d="M100 190 L100 240" stroke="#ffd54a" stroke-width="3"/>`;
      break;
    default:
      details = `<path d="M82 168 Q100 188 118 168" fill="none" stroke="#46565d" stroke-width="5" stroke-linecap="round"/><text x="100" y="222" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="#00bb79">HF</text>`;
  }
  const neck = `<rect x="88" y="140" width="24" height="36" rx="8" fill="${skinD}"/>`;

  // face
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
  const face =
    `<circle cx="58" cy="108" r="8" fill="${skin}"/><circle cx="142" cy="108" r="8" fill="${skin}"/>` +
    `<circle cx="58" cy="108" r="4" fill="${skinD}"/><circle cx="142" cy="108" r="4" fill="${skinD}"/>` +
    `<path d="${FACE}" fill="${skin}"/>` +
    `<ellipse cx="72" cy="128" rx="8" ry="4" fill="#ff7a7a" opacity=".22"/><ellipse cx="128" cy="128" rx="8" ry="4" fill="#ff7a7a" opacity=".22"/>` +
    eyes +
    `<path d="M70 94 Q82 ${90 - t / 2} 93 93" stroke="${hairD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M107 93 Q118 ${90 - t / 2} 130 94" stroke="${hairD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M99 124 Q100 128 102 128" stroke="${skinD}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<path d="M92 137 Q100 144 108 137" stroke="#7a3434" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

  // accessory
  let acc = '';
  switch (a.accessory) {
    case 'headband':
      acc = `<path d="M57 80 Q100 64 143 80 L143 91 Q100 77 57 91 Z" fill="#00bb79"/><circle cx="143" cy="86" r="5" fill="#00925e"/>`;
      break;
    case 'glasses':
      acc = `<rect x="68" y="99" width="28" height="26" rx="10" fill="#fff" fill-opacity=".14" stroke="#14141a" stroke-width="3"/><rect x="104" y="99" width="28" height="26" rx="10" fill="#fff" fill-opacity=".14" stroke="#14141a" stroke-width="3"/><path d="M96 110 L104 110" stroke="#14141a" stroke-width="3"/>`;
      break;
    case 'headphones':
      acc = `<path d="M55 102 C50 40 150 40 145 102" stroke="#20262a" stroke-width="7" fill="none"/><rect x="46" y="96" width="15" height="30" rx="6" fill="#20262a"/><rect x="139" y="96" width="15" height="30" rx="6" fill="#20262a"/><rect x="50" y="104" width="4" height="14" fill="#00bb79"/><rect x="146" y="104" width="4" height="14" fill="#00bb79"/>`;
      break;
    case 'cap':
      acc = `<path d="M54 84 C54 44 146 44 146 84 Z" fill="#0e1113" stroke="#00bb79" stroke-width="2"/><path d="M50 86 Q100 96 156 82 L156 90 Q100 104 48 94 Z" fill="#00925e"/><text x="100" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="14" fill="#00bb79">HF</text>`;
      break;
    case 'chain':
      acc = `<path d="M78 170 Q100 198 122 170" stroke="#ffd54a" stroke-width="3.5" fill="none"/><circle cx="100" cy="193" r="6" fill="#ffd54a"/>`;
      break;
    case 'laurel': {
      const leaves = [];
      for (let i = 0; i < 7; i++) {
        const ang = Math.PI * (0.18 + 0.64 * (i / 6));
        const x = 100 + Math.cos(Math.PI + ang) * 50 * -1;
        const y = 80 - Math.sin(ang) * 36;
        leaves.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="4" fill="#ffd54a" transform="rotate(${(-60 + i * 20)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
      }
      acc = leaves.join('');
      break;
    }
    default:
      acc = '';
  }

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="avatar-svg" role="img" aria-label="Your character"><defs>${defs}</defs>` +
    bg + aura +
    `<g stroke="${shade(hair, 0.32)}" stroke-width="1.4" stroke-linejoin="round">${hairBack}</g>` +
    base + neck + details + face +
    `<g stroke="${shade(hair, 0.32)}" stroke-width="1.4" stroke-linejoin="round">${hairFront}</g>` +
    acc + `</svg>`;
}

// ---- UI ----

function qSection(title, kicker) {
  return el('div', { class: 'q-section-title' }, [kicker ? el('span', { class: 'q-kicker' }, kicker) : null, title]);
}

function renderQuest() {
  const c = document.getElementById('view-quest');
  c.innerHTML = '';
  qEnsure();
  const q = state.quest;

  if (!q.avatar.chosen) { c.appendChild(renderCustomizer(true)); return; }
  if (questUI.customizing) { c.appendChild(renderCustomizer(false)); return; }

  c.appendChild(renderCharacterCard());
  if (q.levelUp) c.appendChild(renderLevelUp());
  if (questUI.result) c.appendChild(renderResult());
  if (questUI.nextAnchor) c.appendChild(renderNextAnchor());
  c.appendChild(renderSessionPanel());
  c.appendChild(renderMissionPanel());
  const extras = renderSavedAndConvos();
  if (extras) c.appendChild(extras);
  c.appendChild(renderCalendarCard());
  c.appendChild(renderRecentLog());
  qUpdateCountdowns();
}

function renderCharacterCard() {
  const q = state.quest;
  const info = levelInfo(q.xp);
  return el('div', { class: 'q-card q-character' }, [
    el('div', { class: 'avatar-wrap', html: avatarSVG(q.avatar) }),
    el('div', { class: 'q-char-info' }, [
      el('div', { class: 'q-level' }, `Level ${info.level}`),
      el('div', { class: 'xp-bar' }, [el('div', { class: 'xp-fill', style: `width:${info.pct}%` })]),
      el('div', { class: 'q-sub' }, `${info.into} / ${info.need} XP to Level ${info.level + 1}`),
      el('div', { class: 'q-sub q-dim' }, 'XP is permanent — spending sessions never lowers it.'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { questUI.customizing = true; render(); } }, 'Customize'),
    ]),
  ]);
}

function renderLevelUp() {
  const lu = state.quest.levelUp;
  return el('div', { class: 'q-card q-levelup' }, [
    el('div', { class: 'q-kicker' }, 'LEVEL UP'),
    el('div', { class: 'q-big' }, `You reached Level ${lu.to}`),
    lu.unlocks.length ? el('div', { class: 'q-sub' }, 'New to try: ' + lu.unlocks.join(', ')) : null,
    el('button', { class: 'q-btn', onclick: () => { state.quest.levelUp = null; saveState(); render(); } }, 'Nice'),
  ]);
}

function renderResult() {
  const r = questUI.result;
  if (r.saved) {
    return el('div', { class: 'q-card q-result' }, [
      el('div', { class: 'q-kicker' }, 'SAVED'),
      el('div', { class: 'q-big' }, `Your place in “${r.title}” is saved.`),
      el('div', { class: 'q-sub' }, 'No penalty. Pick it back up whenever you’re ready.'),
      el('button', { class: 'q-btn', onclick: () => { questUI.result = null; render(); } }, 'Got it'),
    ]);
  }
  return el('div', { class: 'q-card q-result' }, [
    el('div', { class: 'q-kicker' }, 'MISSION COMPLETE'),
    el('div', { class: 'q-big' }, `${r.title} — done`),
    el('div', { class: 'q-sub' }, `+${r.xp} XP · ${r.rewardMsg}`),
    el('button', { class: 'q-btn', onclick: () => { questUI.result = null; render(); } }, 'Got it'),
  ]);
}

function renderNextAnchor() {
  return el('div', { class: 'q-card q-anchor' }, [
    el('div', { class: 'q-kicker' }, 'NEXT ANCHOR'),
    el('div', { class: 'q-big' }, questUI.nextAnchor),
    el('div', { class: 'q-sub' }, 'Session over. Return to the schedule.'),
    el('button', { class: 'q-btn', onclick: () => { questUI.nextAnchor = null; state.activeTab = 'today'; saveState(); render(); } }, 'Go to Today'),
  ]);
}

function renderSessionPanel() {
  const q = state.quest;
  const wrap = el('div', { class: 'q-card' });
  wrap.appendChild(qSection('Gaming session', 'REWARD'));

  if (q.activeSession) {
    const s = q.activeSession;
    if (s.ended) {
      wrap.appendChild(el('div', { class: 'q-big' }, 'Session ended'));
      wrap.appendChild(el('div', { class: 'q-sub' }, 'Wrap up where you are.'));
    } else {
      wrap.appendChild(el('div', { class: 'q-big-clock', 'data-countdown': String(s.endsAt) }, fmtClock(s.endsAt - qNow())));
      wrap.appendChild(el('div', { class: 'q-sub' }, s.warned ? 'Save your game — 5 minutes or less.' : `${s.minutes}-minute session. Enjoy it.`));
    }
    wrap.appendChild(el('button', { class: 'q-btn', onclick: finishSession }, 'Session finished'));
    return wrap;
  }

  if (q.pendingSession) {
    const lengths = q.unlockedMinutes.filter((m) => m <= q.pendingSession.maxMinutes);
    wrap.appendChild(el('div', { class: 'q-big' }, 'Session earned'));
    wrap.appendChild(el('div', { class: 'q-sub' }, 'Play whenever it suits you. Pick one length — it can’t be extended or combined.'));
    wrap.appendChild(el('div', { class: 'chip-row' }, lengths.map((m) =>
      el('button', { class: 'chip', onclick: () => startSession(m) }, `Start ${m} min`))));
    wrap.appendChild(el('div', { class: 'q-sub q-dim' }, 'More missions earn XP only until you play this one.'));
    return wrap;
  }

  const t = MILESTONES[q.tier];
  const left = t.needs - q.progress;
  wrap.appendChild(el('div', { class: 'q-big' }, `Next reward: ${t.min}-minute gaming session`));
  wrap.appendChild(el('div', { class: 'q-sub' }, `Complete ${left} more main mission${left > 1 ? 's' : ''}.`));
  wrap.appendChild(el('div', { class: 'meter-dots' }, Array.from({ length: t.needs }, (_, i) =>
    el('span', { class: 'meter-dot' + (i < q.progress ? ' on' : '') }))));
  wrap.appendChild(el('div', { class: 'q-sub q-dim' }, 'The timer can remind you — it can’t close your game. That part’s on you.'));
  return wrap;
}

function renderMissionPanel() {
  const q = state.quest;
  const m = q.activeMission;
  if (m) return renderActiveMission(m);

  const wrap = el('div', { class: 'q-card' });
  wrap.appendChild(qSection('Your next mission', 'MISSION'));

  // saved places first
  if (q.savedPlaces.length) {
    const p = q.savedPlaces[0];
    const def = MISSIONS.find((x) => x.id === p.missionId);
    if (def) {
      wrap.appendChild(el('div', { class: 'q-resume' }, [
        el('div', { class: 'q-kicker' }, 'PICK UP WHERE YOU LEFT OFF'),
        el('div', { class: 'q-big' }, def.title),
        p.note ? el('div', { class: 'q-sub' }, `Note: ${p.note}`) : null,
        el('button', {
          class: 'q-btn',
          onclick: () => startMission(def, def.editing ? questUI.editBudget : def.minutes, def.editing ? questUI.editFinish : def.finish),
        }, `Resume (${def.editing ? questUI.editBudget : def.minutes} min)`),
      ]));
    }
  }

  wrap.appendChild(el('div', { class: 'q-sub' }, 'How much time do you have?'));
  wrap.appendChild(el('div', { class: 'chip-row' }, [10, 20, 30, 45, 60].map((n) =>
    el('button', {
      class: 'chip' + (q.pickedAvailable === n ? ' chip-on' : ''),
      onclick: () => { q.pickedAvailable = n; questUI.skipIdx = 0; saveState(); render(); },
    }, `${n} min`))));

  const ranked = rankedMissions(q.pickedAvailable);
  const def = ranked[questUI.skipIdx % ranked.length];
  const card = el('div', { class: 'q-mission' });
  card.appendChild(el('div', { class: 'q-big' }, def.title));

  let minutes = Math.min(def.minutes, q.pickedAvailable);
  let finishLine = def.finish;

  if (def.editing) {
    const budgets = [20, 45, 60].filter((b) => b <= q.pickedAvailable);
    if (!budgets.includes(questUI.editBudget)) questUI.editBudget = budgets[budgets.length - 1];
    minutes = questUI.editBudget;
    card.appendChild(el('div', { class: 'q-sub' }, 'Pick a time budget and a finish line before you start.'));
    card.appendChild(el('div', { class: 'chip-row' }, budgets.map((b) =>
      el('button', {
        class: 'chip' + (questUI.editBudget === b ? ' chip-on' : ''),
        onclick: () => { questUI.editBudget = b; render(); },
      }, `${b}-minute edit`))));
    card.appendChild(el('input', {
      type: 'text', class: 'text-input', value: questUI.editFinish, placeholder: 'Finish line',
      oninput: (e) => { questUI.editFinish = e.target.value; },
    }));
    finishLine = null;
  } else {
    card.appendChild(el('div', { class: 'q-finish' }, [el('strong', {}, 'Finish line: '), def.finish]));
  }

  card.appendChild(el('div', { class: 'q-row' }, [
    el('button', {
      class: 'q-btn',
      onclick: () => startMission(def, minutes, def.editing ? (questUI.editFinish.trim() || EDIT_DEFAULT_FINISH) : finishLine),
    }, `Start · ${minutes} min`),
    ranked.length > 1 ? el('button', { class: 'q-btn q-btn-ghost', onclick: () => { questUI.skipIdx += 1; render(); } }, 'Different mission') : null,
  ]));
  if (def.id === 'edit' && !q.log.some((l) => l.date === todayISO() && l.status === 'finished' && l.missionId !== 'edit')) {
    card.appendChild(el('div', { class: 'q-sub q-dim' }, 'Tip: do one conversation or filming mission first — editing is the reward, not the warm-up.'));
  }
  wrap.appendChild(card);
  return wrap;
}

function renderActiveMission(m) {
  const wrap = el('div', { class: 'q-card q-active' });
  wrap.appendChild(el('div', { class: 'q-kicker' }, m.phase === 'running' ? 'MISSION IN PROGRESS' : 'LANDING'));
  wrap.appendChild(el('div', { class: 'q-big' }, m.title));
  wrap.appendChild(el('div', { class: 'q-finish' }, [el('strong', {}, 'Finish line: '), m.finishLine]));

  if (m.phase === 'running') {
    wrap.appendChild(el('div', { class: 'q-big-clock', 'data-countdown': String(m.endsAt) }, fmtClock(m.endsAt - qNow())));
    if (m.extensions) wrap.appendChild(el('div', { class: 'q-sub' }, `Extension ${m.extensions} — fix: ${m.fixes[m.fixes.length - 1] || ''}`));
    wrap.appendChild(el('div', { class: 'q-row' }, [
      el('button', { class: 'q-btn', onclick: finishMission }, m.editing ? 'Ready to publish' : 'Finish line met'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { state.quest.activeMission = null; saveState(); render(); } }, 'Cancel'),
    ]));
    return wrap;
  }

  if (m.phase === 'landing') {
    wrap.appendChild(el('div', { class: 'q-sub' }, 'Time’s up. Where are you?'));
    wrap.appendChild(el('div', { class: 'landing-btns' }, [
      el('button', { class: 'q-btn', onclick: finishMission }, m.editing ? 'Ready to publish' : 'Finish line met'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { m.phase = 'fixing'; saveState(); render(); } }, 'One specific fix left'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { m.phase = 'saving'; saveState(); render(); } }, 'Save my place'),
    ]));
    return wrap;
  }

  if (m.phase === 'fixing') {
    wrap.appendChild(el('div', { class: 'q-sub' }, 'Name the one fix, then take a short extension.'));
    wrap.appendChild(el('input', {
      type: 'text', class: 'text-input', placeholder: 'e.g. fix the caption on line 2', value: questUI.fixText,
      oninput: (e) => { questUI.fixText = e.target.value; },
    }));
    wrap.appendChild(el('div', { class: 'chip-row' }, [5, 10].map((n) =>
      el('button', {
        class: 'chip' + (questUI.fixMinutes === n ? ' chip-on' : ''),
        onclick: () => { questUI.fixMinutes = n; render(); },
      }, `${n} min`))));
    wrap.appendChild(el('div', { class: 'q-row' }, [
      el('button', {
        class: 'q-btn',
        onclick: () => {
          if (!questUI.fixText.trim()) return;
          m.fixes.push(questUI.fixText.trim());
          m.extensions += 1;
          m.endsAt = qNow() + questUI.fixMinutes * 60000;
          m.phase = 'running';
          questUI.fixText = '';
          saveState(); render();
        },
      }, 'Start extension'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { m.phase = 'landing'; saveState(); render(); } }, 'Back'),
    ]));
    return wrap;
  }

  // saving
  wrap.appendChild(el('div', { class: 'q-sub' }, 'Leave yourself a note for the next time (optional).'));
  wrap.appendChild(el('input', {
    type: 'text', class: 'text-input', placeholder: 'Where did you stop?', value: questUI.saveNote,
    oninput: (e) => { questUI.saveNote = e.target.value; },
  }));
  wrap.appendChild(el('div', { class: 'q-row' }, [
    el('button', { class: 'q-btn', onclick: () => { const n = questUI.saveNote.trim(); questUI.saveNote = ''; savePlace(n); } }, 'Save my place'),
    el('button', { class: 'q-btn q-btn-ghost', onclick: () => { m.phase = 'landing'; saveState(); render(); } }, 'Back'),
  ]));
  return wrap;
}

function renderSavedAndConvos() {
  const q = state.quest;
  const waiting = q.log.filter((l) => l.kind === 'convo' && l.status === 'finished' && l.reply == null).slice(0, 5);
  if (!waiting.length) return null;
  const wrap = el('div', { class: 'q-card' });
  wrap.appendChild(qSection('Conversations awaiting a reply', 'TRACK'));
  waiting.forEach((l) => {
    wrap.appendChild(el('div', { class: 'q-line' }, [
      el('span', {}, `${l.title} · ${l.date}`),
      el('button', {
        class: 'q-btn q-btn-small',
        onclick: () => { l.reply = true; saveState(); render(); },
      }, 'They replied'),
    ]));
  });
  wrap.appendChild(el('div', { class: 'q-sub q-dim' }, 'Just a record for your Sunday review — no reply isn’t a failure.'));
  return wrap;
}

function calUrl(title, details, timeStr, bydays, durMin, hash) {
  const dayIdx = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
  const d = new Date();
  for (let i = 0; i < 8; i++) {
    if (bydays.some((b) => dayIdx[b] === d.getDay())) break;
    d.setDate(d.getDate() + 1);
  }
  const [h, m] = timeStr.split(':').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m + durMin);
  const endYmd = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;
  const dates = `${ymd}T${pad(h)}${pad(m)}00/${endYmd}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: title, details: `${details}\n${PUBLIC_URL}#${hash}`,
    dates, recur: `RRULE:FREQ=WEEKLY;BYDAY=${bydays.join(',')}`,
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

function renderCalendarCard() {
  const q = state.quest;
  const det = el('details', { class: 'q-card q-cal' });
  det.appendChild(el('summary', {}, 'Calendar launch points'));
  det.appendChild(el('div', { class: 'q-sub' }, 'Each link opens Google Calendar with a recurring event that links back here. Calendar reminders fire even when the app is closed; in-app timers only run while it’s open.'));
  const items = [
    { key: 'business', label: 'Business block start', title: 'Open your next mission', details: 'Open HolForm OS and start your next mission.', days: ['MO', 'TU', 'WE', 'TH', 'FR'], dur: 15, hash: 'quest' },
    { key: 'end', label: 'End of block', title: 'Finish or save your next step', details: 'Finish your mission or save your place.', days: ['MO', 'TU', 'WE', 'TH', 'FR'], dur: 15, hash: 'quest' },
    { key: 'sunday', label: 'Sunday review', title: 'Review your week and choose one adjustment', details: 'Open Trends, write your reflection, pick one adjustment.', days: ['SU'], dur: 30, hash: 'trends' },
  ];
  items.forEach((it) => {
    det.appendChild(el('div', { class: 'q-cal-row' }, [
      el('div', { class: 'q-cal-label' }, it.label),
      el('input', {
        type: 'time', class: 'duration-input q-time', value: q.calTimes[it.key],
        onchange: (e) => { if (e.target.value) { q.calTimes[it.key] = e.target.value; saveState(); render(); } },
      }),
      el('a', {
        class: 'q-btn q-btn-small', target: '_blank', rel: 'noopener',
        href: calUrl(it.title, it.details, q.calTimes[it.key], it.days, it.dur, it.hash),
      }, 'Add ↗'),
    ]));
  });
  if ('Notification' in window && Notification.permission === 'default') {
    det.appendChild(el('button', {
      class: 'q-btn q-btn-ghost',
      onclick: () => { Notification.requestPermission().then(() => render()); },
    }, 'Enable in-app reminders'));
  }
  return det;
}

function renderRecentLog() {
  const q = state.quest;
  const wrap = el('div', { class: 'q-card' });
  wrap.appendChild(qSection('Recent missions', 'LOG'));
  if (!q.log.length) {
    wrap.appendChild(el('div', { class: 'q-sub' }, 'Nothing yet — your first mission earns your first gaming session.'));
    return wrap;
  }
  q.log.slice(0, 6).forEach((l) => {
    wrap.appendChild(el('div', { class: 'q-line' }, [
      el('span', {}, `${l.title}${l.extensions ? ` (+${l.extensions} ext)` : ''}`),
      el('span', { class: 'q-dim' }, `${l.status === 'finished' ? 'Done' : 'Saved'} · ${l.date}`),
    ]));
  });
  return wrap;
}

// ---- customizer / onboarding ----

function renderCustomizer(onboarding) {
  const q = state.quest;
  const level = levelInfo(q.xp).level;
  const wrap = el('div', { class: 'q-customizer' });
  wrap.appendChild(el('div', { class: 'q-section-title' }, onboarding ? 'Choose your character' : 'Customize your character'));
  if (onboarding) wrap.appendChild(el('div', { class: 'q-sub' }, 'Pick a look to start. Level up to unlock outfits, hairstyles, accessories, backgrounds, and auras.'));
  wrap.appendChild(el('div', { class: 'avatar-wrap avatar-preview', html: avatarSVG(q.avatar) }));

  CATALOG_SECTIONS.filter((s) => !onboarding || s.onboarding).forEach((sec) => {
    wrap.appendChild(el('div', { class: 'q-custom-label' }, sec.label));
    wrap.appendChild(el('div', { class: 'chip-row' }, sec.items.map((item) => {
      const locked = item.lv > level;
      const on = q.avatar[sec.key] === item.id;
      return el('button', {
        class: 'chip' + (on ? ' chip-on' : '') + (locked ? ' chip-locked' : ''),
        ...(locked ? { disabled: 'disabled' } : {}),
        onclick: () => { q.avatar[sec.key] = item.id; saveState(); render(); },
      }, [
        item.color ? el('span', { class: 'chip-swatch', style: `background:${item.color}` }) : null,
        item.label + (item.blurb ? ` · ${item.blurb}` : '') + (locked ? ` 🔒 Lv ${item.lv}` : ''),
      ]);
    })));
  });

  wrap.appendChild(el('button', {
    class: 'q-btn q-btn-wide',
    onclick: () => { q.avatar.chosen = true; questUI.customizing = false; saveState(); render(); },
  }, onboarding ? 'Start my journey' : 'Done'));
  return wrap;
}

// ---- init ----

function qInit() {
  qEnsure();
  const bar = document.getElementById('active-bar');
  if (bar) bar.addEventListener('click', () => { state.activeTab = 'quest'; saveState(); render(); });
  setInterval(qTick, 1000);
  qTick();
}

window.Quest = {
  ensure: qEnsure,
  init: qInit,
  onBlockChecked: qOnBlockChecked,
  onTaskChecked: qOnTaskChecked,
};
