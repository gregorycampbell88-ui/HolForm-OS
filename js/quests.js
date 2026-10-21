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
    v: 2, chosen: false, morphed: true,
    suit: 'emerald', trim: 'gold', helmet: 'sentinel', emblem: 'tiger',
    chest: 'standard', weapon: 'none', cape: 'none', beast: 'none', aura: 'none', background: 'plain',
    base: 'kai', skin: 's3', hairStyle: 'short', hairColor: 'black',
  };
}

function qDefaults() {
  return {
    avatar: qDefaultAvatar(),
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
  const savedAvatar = q.avatar && q.avatar.v === 2 ? q.avatar : {};
  state.quest.avatar = Object.assign(qDefaultAvatar(), savedAvatar);
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
  wrap.appendChild(el('div', { class: 'q-section-title' }, onboarding ? 'Build your ranger' : 'Customize your ranger'));
  if (onboarding) wrap.appendChild(el('div', { class: 'q-sub' }, 'Pick your suit, helmet, and emblem to start. Level up to unlock chest shields, weapons, capes, guardian beasts, and power-ups.'));
  wrap.appendChild(el('div', { class: 'avatar-wrap avatar-preview', html: avatarSVG(q.avatar) }));
  wrap.appendChild(el('div', { class: 'chip-row chip-row-center' }, [
    el('button', { class: 'chip' + (q.avatar.morphed ? ' chip-on' : ''), onclick: () => { q.avatar.morphed = true; saveState(); render(); } }, 'Helmet on'),
    el('button', { class: 'chip' + (!q.avatar.morphed ? ' chip-on' : ''), onclick: () => { q.avatar.morphed = false; saveState(); render(); } }, 'Helmet off'),
  ]));

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
