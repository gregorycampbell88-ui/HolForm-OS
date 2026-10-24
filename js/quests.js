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

// ---- state helpers ----

const questUI = {
  customizing: false,
  artOpen: false,
  titlesOpen: false,
  loadoutOpen: false,
  shopOpen: true,
  fx: null,
  editBudget: 20,
  editFinish: EDIT_DEFAULT_FINISH,
  skipIdx: 0,
  result: null,
  nextAnchor: null,
  fixText: '',
  fixMinutes: 5,
  saveNote: '',
};

// v2 = the ranger design. Older saved characters (v1, the cartoon avatar) are
// reset so the player re-picks a ranger; XP and missions are kept.
function qDefaultAvatar() {
  return {
    v: 2, chosen: false, morphed: true, facePhoto: false, useArt: true,
    suit: 'crimson', trim: 'gold', helmet: 'sentinel', emblem: 'tiger',
    chest: 'standard', gloves: 'standard', boots: 'standard', weapon: 'none', cape: 'none', beast: 'none', aura: 'none', background: 'plain',
    base: 'kai', skin: 's3', hairStyle: 'short', hairColor: 'black',
  };
}

function qStatsDefault() {
  return {
    missions: 0, convos: 0, edits: 0, cleanEdits: 0, editsExtended: 0, saves: 0, resumes: 0,
    sessions: 0, tasksDone: 0, blocks: 0, minChecks: 0, parked: 0, morning: 0,
    revenueFirst: 0, morphs: 0, comebacks: 0, days: [],
  };
}

function qDefaults() {
  return {
    avatar: qDefaultAvatar(),
    titles: { unlocked: {}, equipped: 'recruit' },
    newTitles: [],
    stats: qStatsDefault(),
    owned: {},          // shop purchases (see js/shop.js)
    ppSpent: 0,         // Power Points spent; balance = earned from levels - spent
    loadout: shopDefaultLoadout(),
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

// Fill in anything missing, IN PLACE. The quest object and its parts keep their
// identity, so button handlers that captured them never write to a stale copy.
function qFill(target, defaults) {
  Object.keys(defaults).forEach((k) => { if (target[k] === undefined) target[k] = defaults[k]; });
  return target;
}

function qEnsure() {
  if (!state.quest || typeof state.quest !== 'object') state.quest = {};
  const q = state.quest;
  qFill(q, qDefaults());
  // the old cartoon-avatar format (v1) is reset; the ranger format (v2) is topped up
  if (!q.avatar || typeof q.avatar !== 'object' || q.avatar.v !== 2) q.avatar = qDefaultAvatar();
  else qFill(q.avatar, qDefaultAvatar());
  ['calTimes', 'stats', 'titles', 'loadout', 'owned'].forEach((k) => {
    if (!q[k] || typeof q[k] !== 'object') q[k] = qDefaults()[k];
  });
  qFill(q.calTimes, qDefaults().calTimes);
  qFill(q.stats, qStatsDefault());
  qFill(q.titles, { unlocked: {}, equipped: 'recruit' });
  qFill(q.loadout, shopDefaultLoadout());
  if (!Array.isArray(q.newTitles)) q.newTitles = [];
  if (typeof q.ppSpent !== 'number') q.ppSpent = 0;
  if (!state.weeklyAdjustments) state.weeklyAdjustments = {};
  qSanitizeAvatar();
  shopSanitize(q);
}

// ---- titles (catalog lives in js/titles.js; locked ones are never displayed) ----

function bestStreak(days) {
  const sorted = [...new Set(days)].sort();
  let best = 0, cur = 0, prev = null;
  sorted.forEach((d) => {
    if (prev) {
      const diff = Math.round((new Date(d + 'T12:00:00') - new Date(prev + 'T12:00:00')) / 86400000);
      cur = diff === 1 ? cur + 1 : 1;
    } else cur = 1;
    best = Math.max(best, cur);
    prev = d;
  });
  return best;
}

function qTitleContext() {
  const q = state.quest;
  const done = q.log.filter((l) => l.status === 'finished');
  const perDay = {};
  const weeks = {};
  done.forEach((l) => {
    perDay[l.date] = (perDay[l.date] || 0) + 1;
    const wk = getWeekKey(l.date);
    if (!weeks[wk]) weeks[wk] = { ids: new Set(), dows: new Set() };
    weeks[wk].ids.add(l.missionId);
    weeks[wk].dows.add(new Date(l.date + 'T12:00:00').getDay());
  });
  const wk = Object.values(weeks);
  return {
    q, state, s: q.stats, level: levelInfo(q.xp).level,
    replies: done.filter((l) => l.reply === true).length,
    maxPerDay: Math.max(0, ...Object.values(perDay)),
    wellRounded: wk.some((w) => MISSIONS.every((m) => w.ids.has(m.id))),
    tueThu: wk.some((w) => w.dows.has(2) && w.dows.has(4)),
    reflections: Object.values(state.weeklyReflections || {}).filter((t) => t && t.trim()).length,
    adjustments: Object.values(state.weeklyAdjustments || {}).filter((t) => t && t.trim()).length,
    bestStreak: bestStreak(q.stats.days),
  };
}

// Unlocks any newly earned titles. Returns true if something changed.
function qCheckTitles() {
  const q = state.quest;
  const ctx = qTitleContext();
  let added = false;
  TITLES.forEach((t) => {
    if (q.titles.unlocked[t.id]) return;
    let ok = false;
    try { ok = !!t.test(ctx); } catch (e) { ok = false; }
    if (!ok) return;
    q.titles.unlocked[t.id] = todayISO();
    if (t.id !== 'recruit') q.newTitles.push(t.id);
    added = true;
  });
  return added;
}

function titleById(id) { return TITLES.find((t) => t.id === id); }

function equipTitle(id) {
  if (!state.quest.titles.unlocked[id]) return;
  state.quest.titles.equipped = id;
  saveState();
  render();
}

// A locked item can't stay selected (e.g. Emerald, now a late unlock): fall back
// to the default, or the first item that is unlocked at the current level.
function qSanitizeAvatar() {
  const a = state.quest.avatar;
  const level = levelInfo(state.quest.xp).level;
  const def = qDefaultAvatar();
  CATALOG_SECTIONS.forEach((s) => {
    const cur = s.items.find((i) => i.id === a[s.key]);
    if (cur && cur.lv <= level) return;
    const fallback = s.items.find((i) => i.id === def[s.key] && i.lv <= level)
      || s.items.find((i) => i.lv <= level) || s.items[0];
    a[s.key] = fallback.id;
  });
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
  const suffix = { suit: ' suit', trim: ' trim', hairColor: ' hair', background: ' background' };
  CATALOG_SECTIONS.forEach((s) => s.items.forEach((i) => { if (i.lv === lv && lv > 1) out.push(i.label + (suffix[s.key] || '')); }));
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
  // any progress counts as an active day (for streaks and "comeback" titles)
  const today = todayISO();
  const days = q.stats.days;
  if (!days.includes(today)) {
    const last = days.length ? days.slice().sort().pop() : null;
    if (last && Math.round((new Date(today + 'T12:00:00') - new Date(last + 'T12:00:00')) / 86400000) >= 4) q.stats.comebacks += 1;
    days.push(today);
    if (days.length > 120) days.splice(0, days.length - 120);
  }
  const before = levelInfo(q.xp).level;
  q.xp += amount;
  const after = levelInfo(q.xp).level;
  if (after > before) {
    const unlocks = [];
    let pp = 0;
    for (let l = before + 1; l <= after; l++) { unlocks.push(...unlocksAtLevel(l)); pp += ppForLevel(l); }
    if (before < TIGER_PACK_LEVEL && after >= TIGER_PACK_LEVEL) unlocks.push('Tiger pack: Short Swords + Tiger beast');
    q.levelUp = { to: after, unlocks, pp };
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

  // stats that feed titles
  const s = q.stats;
  s.missions += 1;
  if (m.kind === 'convo') s.convos += 1;
  if (m.id === 'edit') {
    s.edits += 1;
    if (m.extensions > 0) s.editsExtended += 1; else s.cleanEdits += 1;
    const today = todayISO();
    if (q.log.some((l) => l.date === today && l.status === 'finished' && l.missionId !== 'edit')) s.revenueFirst += 1;
  }
  if (q.savedPlaces.some((p) => p.missionId === m.id)) s.resumes += 1;
  if (new Date().getHours() < 9) s.morning += 1;

  q.savedPlaces = q.savedPlaces.filter((p) => p.missionId !== m.id);
  const xp = awardXp(Q_XP.mission);
  const rewardMsg = progressReward();
  q.activeMission = null;
  questUI.result = { title: m.title, xp, rewardMsg };
  qCheckTitles();
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
  q.stats.saves += 1;
  q.activeMission = null;
  questUI.result = { title: m.title, saved: true };
  qCheckTitles();
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
  q.stats.sessions += 1;
  qCheckTitles();
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
  if (awardXp(Q_XP.block, 'blk:' + key, date)) {
    state.quest.stats.blocks += 1;
    if (String(key).startsWith('min-')) state.quest.stats.minChecks += 1;
    qCheckTitles();
  }
}

function qOnTaskChecked(task) {
  qEnsure();
  if (awardXp(Q_XP.task, 'task:' + task.id, todayISO())) {
    state.quest.stats.tasksDone += 1;
    qCheckTitles();
  }
}

function qOnParked() {
  qEnsure();
  state.quest.stats.parked += 1;
  qCheckTitles();
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

  // pick up titles that depend on level, gear, or Sunday reflections
  if (qCheckTitles()) saveState();

  c.appendChild(renderCharacterCard());
  if (q.levelUp) c.appendChild(renderLevelUp());
  if (q.newTitles.length) c.appendChild(renderNewTitle());
  if (questUI.result) c.appendChild(renderResult());
  if (questUI.nextAnchor) c.appendChild(renderNextAnchor());
  if (artActive()) c.appendChild(renderFormToggles());
  c.appendChild(renderSessionPanel());
  c.appendChild(renderMissionPanel());
  const extras = renderSavedAndConvos();
  if (extras) c.appendChild(extras);
  if (artActive()) { c.appendChild(renderLoadout()); c.appendChild(renderShop()); }
  c.appendChild(renderTitles());
  c.appendChild(renderCalendarCard());
  c.appendChild(renderRecentLog());
  qUpdateCountdowns();
}

function renderNewTitle() {
  const q = state.quest;
  const t = titleById(q.newTitles[0]);
  if (!t) { q.newTitles.shift(); return el('div', {}); }
  const more = q.newTitles.length - 1;
  return el('div', { class: 'q-card q-levelup q-newtitle' }, [
    el('div', { class: 'q-kicker' }, 'NEW TITLE'),
    el('div', { class: 'q-big' }, t.name),
    el('div', { class: 'q-sub' }, t.desc),
    more > 0 ? el('div', { class: 'q-sub q-dim' }, `+${more} more waiting`) : null,
    el('div', { class: 'q-row q-row-tight' }, [
      el('button', { class: 'q-btn', onclick: () => { q.titles.equipped = t.id; q.newTitles.shift(); saveState(); render(); } }, 'Equip it'),
      el('button', { class: 'q-btn q-btn-ghost', onclick: () => { q.newTitles.shift(); saveState(); render(); } }, 'Nice'),
    ]),
  ]);
}

// Only discovered titles are listed. Locked ones (and how many exist) stay hidden.
function renderTitles() {
  const q = state.quest;
  const mine = TITLES.filter((t) => q.titles.unlocked[t.id]);
  const det = el('details', { class: 'q-card q-titles', ...(questUI.titlesOpen ? { open: 'open' } : {}) });
  det.addEventListener('toggle', () => { questUI.titlesOpen = det.open; });
  det.appendChild(el('summary', {}, `Titles · ${mine.length} discovered`));
  det.appendChild(el('div', { class: 'q-sub q-dim' }, 'Some titles stay hidden until you earn them. Keep playing and see what turns up.'));
  mine.forEach((t) => {
    const on = q.titles.equipped === t.id;
    det.appendChild(el('div', { class: 'q-title-row' }, [
      el('div', { class: 'q-title-text' }, [el('div', { class: 'q-title-name' }, t.name), el('div', { class: 'q-dim' }, t.desc)]),
      el('button', {
        class: 'q-btn q-btn-small' + (on ? '' : ' q-btn-ghost'),
        ...(on ? { disabled: 'disabled' } : {}),
        onclick: () => equipTitle(t.id),
      }, on ? 'Equipped' : 'Equip'),
    ]));
  });
  return det;
}

// Your sprites from the art/ folder when present, otherwise the drawn pixel ranger.
function artActive() { return typeof ArtKit !== 'undefined' && ArtKit.active(state.quest.avatar); }
function avatarHTML(a, fx) {
  // hold an empty frame until we know whether art exists, so the drawn ranger doesn't flash
  if (typeof ArtKit !== 'undefined' && !ArtKit.settled()) return '<div class="art-scene" aria-hidden="true"></div>';
  if (artActive()) {
    const h = ArtKit.sceneHTML(a, state.quest, fx);
    if (h !== null) return h;
  }
  return avatarSVG(a);
}

function renderCharacterCard() {
  const q = state.quest;
  const info = levelInfo(q.xp);
  const art = artActive();
  const buttons = [
    el('button', { class: 'q-btn q-btn-ghost', onclick: () => { questUI.customizing = true; render(); } }, 'Customize'),
  ];
  // one-shot effect for whatever the player just toggled (consumed so it plays once)
  const fx = questUI.fx;
  questUI.fx = null;
  if (art) {
    buttons.push(el('button', {
      class: 'morpher-btn', 'aria-label': q.avatar.morphed === false ? 'Helmet on' : 'Helmet off',
      onclick: () => { q.avatar.morphed = q.avatar.morphed === false; q.stats.morphs += 1; questUI.fx = 'morph'; qCheckTitles(); saveState(); render(); },
    }, [
      ArtKit.url('morpher') ? el('img', { src: ArtKit.url('morpher'), alt: '' }) : null,
      el('span', {}, q.avatar.morphed === false ? 'Morph' : 'Unmorph'),
    ]));
  }
  const pp = ppBalance(q);
  return el('div', { class: 'q-card q-character' }, [
    el('div', { class: 'avatar-wrap' + (art ? ' art-wrap' : ''), html: avatarHTML(q.avatar, fx) }),
    el('div', { class: 'q-char-info' }, [
      el('div', { class: 'q-level' }, `Level ${info.level}`),
      el('div', { class: 'q-title' }, (titleById(q.titles.equipped) || titleById('recruit')).name),
      el('div', { class: 'xp-bar' }, [el('div', { class: 'xp-fill', style: `width:${info.pct}%` })]),
      el('div', { class: 'q-sub' }, `${info.into} / ${info.need} XP to Level ${info.level + 1}`),
      el('div', { class: 'pp-badge' }, `⚡ ${pp} Power Point${pp === 1 ? '' : 's'}`),
      el('div', { class: 'q-row q-row-tight' }, buttons),
    ]),
  ]);
}

// ---- form toggles, loadout, and shop ----

function chipBtn(label, { on = false, locked = false, onclick = null, title = '' } = {}) {
  return el('button', {
    class: 'chip' + (on ? ' chip-on' : '') + (locked ? ' chip-locked' : ''),
    ...(locked ? { disabled: 'disabled' } : {}),
    ...(title ? { title } : {}),
    ...(onclick ? { onclick } : {}),
  }, label);
}

function setLoadout(change) {
  const q = state.quest;
  questUI.fx = ('superOn' in change || 'superMode' in change) ? 'power' : 'pop';
  Object.assign(q.loadout, change);
  shopSanitize(q);
  saveState();
  render();
}

// The toggles under the character: helmet, shield, holstered blaster, weapon in hand, super mode.
function renderFormToggles() {
  const q = state.quest;
  const L = q.loadout;
  const superOn = L.superOn && modesAvailable(q).includes(L.superMode);
  const modes = modesAvailable(q);
  const wname = L.weapon ? WEAPON_NAMES[L.weapon] : null;
  const row = el('div', { class: 'chip-row chip-row-center form-toggles' });

  row.appendChild(chipBtn(q.avatar.morphed === false ? 'Helmet off' : 'Helmet on', {
    on: q.avatar.morphed !== false, locked: superOn,
    onclick: () => { q.avatar.morphed = q.avatar.morphed === false; questUI.fx = 'morph'; saveState(); render(); },
  }));
  row.appendChild(q.owned.shield
    ? chipBtn('Shield', { on: L.shieldOn, locked: superOn, onclick: () => setLoadout({ shieldOn: !L.shieldOn }) })
    : chipBtn('Shield 🔒', { locked: true, title: 'Buy it in the shop' }));
  row.appendChild(q.owned.blaster
    ? chipBtn('Holstered blaster', { on: L.holster, locked: superOn, onclick: () => setLoadout({ holster: !L.holster }) })
    : chipBtn('Blaster 🔒', { locked: true, title: 'Buy it in the shop' }));
  row.appendChild(wname
    ? chipBtn(`Weapon: ${wname}`, { on: L.weaponHeld, onclick: () => setLoadout({ weaponHeld: !L.weaponHeld }) })
    : chipBtn('Weapon 🔒', { locked: true, title: 'Unlock a weapon first' }));
  row.appendChild(modes.length
    ? chipBtn(superOn ? `Super: ${modeName(L.superMode)}` : 'Super Mode', { on: superOn, onclick: () => setLoadout({ superOn: !L.superOn }) })
    : chipBtn('Super Mode 🔒', { locked: true, title: 'Buy the Chest Shield first' }));
  const motion = el('button', {
    class: 'motion-toggle',
    onclick: () => { setMotionOff(!motionOff()); render(); },
  }, motionOff() ? 'Motion: off' : 'Motion: on');
  return el('div', { class: 'q-card' }, [row, el('div', { class: 'motion-row' }, [motion])]);
}

// ---- motion preference (this device only; follows the phone's "reduce motion" setting by default) ----
const MOTION_KEY = 'holform-motion';
function motionOff() {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    if (v === 'off') return true;
    if (v === 'on') return false;
  } catch (e) { /* storage unavailable */ }
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function setMotionOff(off) {
  try { localStorage.setItem(MOTION_KEY, off ? 'off' : 'on'); } catch (e) { /* storage unavailable */ }
  applyMotion();
}
function applyMotion() { document.documentElement.classList.toggle('reduce-motion', motionOff()); }

function renderLoadout() {
  const q = state.quest;
  const L = q.loadout;
  const det = el('details', { class: 'q-card q-loadout', ...(questUI.loadoutOpen ? { open: 'open' } : {}) });
  det.addEventListener('toggle', () => { questUI.loadoutOpen = det.open; });
  det.appendChild(el('summary', {}, 'Loadout'));

  det.appendChild(el('div', { class: 'q-custom-label' }, 'Emblem'));
  det.appendChild(el('div', { class: 'chip-row' }, FORMS.filter((f) => emblemOwned(q, f.id)).map((f) =>
    chipBtn(f.name, { on: L.emblem === f.id, onclick: () => setLoadout({ emblem: f.id, ...(modesAvailable(q).includes(f.mode) ? { superMode: f.mode } : {}) }) }))));

  det.appendChild(el('div', { class: 'q-custom-label' }, 'Weapon'));
  const wchips = [chipBtn('None', { on: !L.weapon, onclick: () => setLoadout({ weapon: null, weaponHeld: false }) })];
  ownedWeapons(q).forEach((w) => wchips.push(chipBtn(WEAPON_NAMES[w], { on: L.weapon === w, onclick: () => setLoadout({ weapon: w, weaponHeld: true }) })));
  det.appendChild(el('div', { class: 'chip-row' }, wchips));

  det.appendChild(el('div', { class: 'q-custom-label' }, 'Super mode'));
  const modes = modesAvailable(q);
  det.appendChild(modes.length
    ? el('div', { class: 'chip-row' }, modes.map((m) => chipBtn(modeName(m), { on: L.superMode === m, onclick: () => setLoadout({ superMode: m, superOn: true }) })))
    : el('div', { class: 'q-sub q-dim' }, 'Buy the Chest Shield to unlock super modes.'));

  det.appendChild(el('div', { class: 'q-custom-label' }, 'Guardian beast'));
  const bchips = [chipBtn('None', { on: !L.beast, onclick: () => setLoadout({ beast: null }) })];
  ownedBeasts(q).forEach((b) => bchips.push(chipBtn(b[0].toUpperCase() + b.slice(1), { on: L.beast === b, onclick: () => setLoadout({ beast: b }) })));
  if (megazordAvailable(q)) bchips.push(chipBtn('Megazord', { on: L.beast === 'megazord', onclick: () => setLoadout({ beast: 'megazord' }) }));
  if (ultraAvailable(q)) bchips.push(chipBtn('Ultra Megazord', { on: L.beast === 'ultra', onclick: () => setLoadout({ beast: 'ultra' }) }));
  det.appendChild(el('div', { class: 'chip-row' }, bchips));
  det.appendChild(el('div', { class: 'q-sub q-dim' }, `Beasts: ${ownedBeasts(q).length} of 6. Five unlock the Megazord; all six unlock the Ultra Megazord.`));
  return det;
}

function renderShop() {
  const q = state.quest;
  const bal = ppBalance(q);
  const det = el('details', { class: 'q-card q-shop', ...(questUI.shopOpen ? { open: 'open' } : {}) });
  det.addEventListener('toggle', () => { questUI.shopOpen = det.open; });
  det.appendChild(el('summary', {}, `Power shop · ⚡ ${bal}`));
  det.appendChild(el('div', { class: 'q-sub q-dim' }, 'Level-ups give Power Points. Spending them never lowers your level.'));

  // free unlock (not bought with points)
  const packOwned = tigerPackOwned(q);
  det.appendChild(el('div', { class: 'q-shop-row' }, [
    el('div', { class: 'q-shop-text' }, [
      el('div', { class: 'q-title-name' }, 'Tiger pack'),
      el('div', { class: 'q-dim' }, `Short Swords + Tiger guardian beast. Free at Level ${TIGER_PACK_LEVEL}.`),
    ]),
    el('span', { class: 'q-shop-state' }, packOwned ? 'Unlocked ✓' : `Level ${TIGER_PACK_LEVEL}`),
  ]));

  SHOP.forEach((item) => {
    const owned = !!q.owned[item.id];
    const c = shopCanBuy(q, item.id);
    det.appendChild(el('div', { class: 'q-shop-row' }, [
      el('div', { class: 'q-shop-text' }, [
        el('div', { class: 'q-title-name' }, item.name),
        el('div', { class: 'q-dim' }, item.desc),
        !owned && !c.ok ? el('div', { class: 'q-shop-reason' }, c.reason) : null,
      ]),
      owned
        ? el('span', { class: 'q-shop-state' }, 'Owned ✓')
        : el('button', {
          class: 'q-btn q-btn-small',
          ...(c.ok ? {} : { disabled: 'disabled' }),
          onclick: () => { if (shopBuy(q, item.id)) { questUI.fx = 'pop'; qCheckTitles(); saveState(); render(); } },
        }, `⚡ ${item.cost}`),
    ]));
  });

  det.appendChild(el('div', { class: 'q-shop-row' }, [
    el('div', { class: 'q-shop-text' }, [
      el('div', { class: 'q-title-name' }, 'Megazord · Ultra Megazord'),
      el('div', { class: 'q-dim' }, 'Unlock automatically: five beasts for the Megazord, all six for the Ultra.'),
    ]),
    el('span', { class: 'q-shop-state' }, ultraAvailable(q) ? 'Ultra ✓' : megazordAvailable(q) ? 'Megazord ✓' : `${ownedBeasts(q).length}/6`),
  ]));
  return det;
}

function renderLevelUp() {
  const lu = state.quest.levelUp;
  return el('div', { class: 'q-card q-levelup' }, [
    el('div', { class: 'q-kicker' }, 'LEVEL UP'),
    el('div', { class: 'q-big' }, `You reached Level ${lu.to}`),
    lu.pp ? el('div', { class: 'q-sub' }, `+${lu.pp} Power Point${lu.pp === 1 ? '' : 's'} to spend in the shop`) : null,
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

// Private, on-device face photo (see js/face.js). Nothing here touches synced state
// except the harmless `facePhoto` on/off flag.
function renderFaceControls(preview) {
  const q = state.quest;
  const box = el('div', { class: 'q-face' });
  box.appendChild(el('div', { class: 'q-custom-label' }, 'Your face (helmet off) — private'));

  const refresh = () => { preview.innerHTML = avatarHTML(q.avatar); };
  const msg = el('div', { class: 'q-sub q-dim' }, 'Photos are turned into pixel art on this device. Nothing is uploaded or synced; add it again on any other device.');

  const fileInput = el('input', {
    type: 'file', accept: 'image/*', class: 'hidden',
    onchange: (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      Face.setFromFile(f).then(() => {
        q.avatar.facePhoto = true;
        q.avatar.morphed = false;
        saveState();
        render();
      }).catch((err) => { msg.textContent = err.message; msg.classList.remove('q-dim'); });
    },
  });
  box.appendChild(fileInput);

  const row = el('div', { class: 'chip-row' });
  row.appendChild(el('button', { class: 'chip', onclick: () => fileInput.click() }, Face.has() ? 'Replace photo' : 'Upload headshot'));
  if (Face.has()) {
    row.appendChild(el('button', {
      class: 'chip' + (q.avatar.facePhoto ? ' chip-on' : ''),
      onclick: () => { q.avatar.facePhoto = !q.avatar.facePhoto; if (q.avatar.facePhoto) q.avatar.morphed = false; saveState(); render(); },
    }, q.avatar.facePhoto ? 'Using my photo' : 'Use my photo'));
    row.appendChild(el('button', {
      class: 'chip',
      onclick: () => { Face.clear(); q.avatar.facePhoto = false; saveState(); render(); },
    }, 'Remove photo'));
  }
  box.appendChild(row);

  if (Face.has()) {
    const cur = Face.get();
    const slider = (label, key, min, max, step) => el('label', { class: 'q-slider' }, [
      el('span', {}, label),
      el('input', {
        type: 'range', min: String(min), max: String(max), step: String(step), value: String(cur[key]),
        oninput: (e) => { Face.adjust({ [key]: Number(e.target.value) }); refresh(); },
        onchange: () => { Face.save(); },
      }),
    ]);
    box.appendChild(slider('Zoom', 'zoom', 1, 2.5, 0.05));
    box.appendChild(slider('Left / right', 'ox', -1, 1, 0.05));
    box.appendChild(slider('Up / down', 'oy', -1, 1, 0.05));
  }
  box.appendChild(msg);
  return box;
}

// With your art, gear comes from the shop/loadout. The customizer keeps the
// color and look options that still apply: suit, trim, background, and glow effects.
const ART_ALLOWED = { suit: null, trim: null, aura: ['none', 'glow', 'bolt', 'legend'], background: null };

function customizerSections(onboarding) {
  const art = artActive();
  const out = [];
  CATALOG_SECTIONS.forEach((s) => {
    if (onboarding && !s.onboarding) return;
    if (!art) { out.push(s); return; }
    if (!(s.key in ART_ALLOWED)) return;
    const allow = ART_ALLOWED[s.key];
    const items = allow ? s.items.filter((i) => allow.includes(i.id)) : s.items;
    if (items.length > 1 || s.key === 'suit' || s.key === 'trim') out.push({ ...s, items });
  });
  return out;
}


function renderCustomizer(onboarding) {
  const q = state.quest;
  const level = levelInfo(q.xp).level;
  const art = artActive();
  const wrap = el('div', { class: 'q-customizer' });
  wrap.appendChild(el('div', { class: 'q-section-title' }, onboarding ? 'Build your ranger' : 'Customize your ranger'));
  if (onboarding) wrap.appendChild(el('div', { class: 'q-sub' }, art
    ? 'Pick your suit and trim colors to start. Level up to earn Power Points for the shield, weapons, emblems, and super modes.'
    : 'Pick your suit, helmet, and emblem to start. Level up to unlock chest shields, weapons, capes, guardian beasts, and power-ups.'));
  const preview = el('div', { class: 'avatar-wrap avatar-preview' + (art ? ' art-wrap' : ''), html: avatarHTML(q.avatar) });
  wrap.appendChild(preview);
  wrap.appendChild(el('div', { class: 'chip-row chip-row-center' }, [
    el('button', { class: 'chip' + (q.avatar.morphed ? ' chip-on' : ''), onclick: () => { q.avatar.morphed = true; saveState(); render(); } }, 'Helmet on'),
    el('button', { class: 'chip' + (!q.avatar.morphed ? ' chip-on' : ''), onclick: () => { q.avatar.morphed = false; saveState(); render(); } }, 'Helmet off'),
  ]));
  if (!art) wrap.appendChild(renderFaceControls(preview));

  customizerSections(onboarding).forEach((sec) => {
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
  applyMotion();
  if (typeof Face !== 'undefined') Face.init(() => render());
  if (typeof ArtKit !== 'undefined') ArtKit.init(() => render());
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
  onParked: qOnParked,
};
