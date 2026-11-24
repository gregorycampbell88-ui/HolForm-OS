// ============================================================
// HolForm Weekly Operating System — app logic
// ============================================================

const STORAGE_KEY = 'holform-os-state-v1';

const DEFAULT_STATE = {
  activeTab: 'today',   // 'today' | 'tasks' | 'dashboard'
  selectedDate: todayISO(),
  checks: {},        // { [dateISO]: { [blockIdx]: true } }
  finishLine: {},     // { [dateISO]: string }
  phoneMission: {},   // { [dateISO]: string }
  parkingLot: {},     // { [dateISO]: [{id,text}] }
  minimumMode: {},    // { [dateISO]: bool }
  weeklyTasks: {},     // { [weekKey]: [{id,text,checked,carriedCount}] }
  dailyTasks: {},      // { [dateISO]: [{id,text,checked,carriedCount}] }
  lastRolloverDate: null,
  dayMeta: {},          // { [dateISO]: {groupKey} } — locks in which template a day used
  weeklyReflections: {}, // { [weekKey]: string }
  scheduleOverrides: {}, // { [groupKey]: {anchorMinutes, items:[{id,label,category,accent,durationMin}]} }
  quest: {},             // character, XP, missions, gaming sessions — shape lives in js/quests.js
  weeklyAdjustments: {}, // { [weekKey]: string } — the one adjustment chosen at the Sunday review
  toolLinks: {},         // { leads, posts } — the claude.ai links to the Lead Tracker and Post Log (saved with your data, never in the repo)
  parkedIdeas: [],       // [{id,text,note,date}] — the parking lot: ideas kept until you move them to your brain dump
  dayOverrides: {},      // { [dateISO]: {anchorMinutes, items} } — a schedule just for one date
  weekdayOverrides: {},  // { [0-6]: {anchorMinutes, items} } — a schedule for every Monday, every Tuesday, ...
  dayNotes: {},          // { [dateISO]: string } — pinned note for one date ('' = no note)
  weekdayNotes: {},      // { [0-6]: string } — pinned note for every Monday, ...
  minimumItems: null,    // the Minimum-Viable Day checklist (null = the built-in list)
};

let state = loadState();
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    const s = Object.assign(structuredClone(DEFAULT_STATE), parsed);
    s.selectedDate = todayISO();   // each launch starts on today, never on a stale day
    return s;
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}

// The day and tab you are looking at belong to THIS device. They are saved with
// the rest of the data, but a synced copy from another device never changes them.
function adoptRemoteState(remote) {
  const keepDate = state.selectedDate;
  const keepTab = state.activeTab;
  state = Object.assign(structuredClone(DEFAULT_STATE), remote);
  state.selectedDate = keepDate;
  state.activeTab = keepTab;
}

// Parked ideas used to be kept per day; they now live in one list.
function migrateParking() {
  const old = state.parkingLot;
  if (!old || typeof old !== 'object' || !Object.keys(old).length) return;
  if (!Array.isArray(state.parkedIdeas)) state.parkedIdeas = [];
  const have = new Set(state.parkedIdeas.map((p) => p.id));
  Object.keys(old).sort().forEach((date) => {
    (old[date] || []).forEach((item) => {
      if (!have.has(item.id)) state.parkedIdeas.push({ id: item.id, text: item.text, note: '', date });
    });
  });
  state.parkingLot = {};
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (window.HolformSync) window.HolformSync.push(state);
}

function parseTimeToMinutes(t) {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})([ap])$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toLowerCase();
  if (ap === 'p' && h !== 12) h += 12;
  if (ap === 'a' && h === 12) h = 0;
  return h * 60 + min;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = ((mins % 60) + 60) % 60;
  const ap = h < 12 ? 'a' : 'p';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')}${ap}`;
}

function minutesToInputTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = ((mins % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function inputTimeToMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function getEffectiveChain(groupKey) {
  groupKey = LEGACY_GROUP[groupKey] || groupKey;
  return state.scheduleOverrides[groupKey] || BASE_CHAINS[groupKey];
}

// ---- which schedule a given date uses ----
// Layers, most specific first: this date only, then every <weekday>, then the
// whole group (Mon/Wed/Fri ...), then the built-in default.

function weekdayOf(dateISO) { return new Date(dateISO + 'T12:00:00').getDay(); }

// the template a date follows (a day can be switched to another template)
function templateFor(dateISO) {
  const m = state.dayMeta[dateISO];
  const g = m && (LEGACY_GROUP[m.groupKey] || m.groupKey);
  return g && SCHEDULES[g] ? g : DAY_GROUP[weekdayOf(dateISO)];
}

function chainLayer(dateISO, scope) {
  const wd = weekdayOf(dateISO);
  const g = templateFor(dateISO);
  const groupChain = state.scheduleOverrides[g] || BASE_CHAINS[g];
  if (scope === 'group') return groupChain;
  const weekdayChain = g === DAY_GROUP[wd] ? state.weekdayOverrides[wd] : null;
  if (scope === 'weekday') return weekdayChain || groupChain;
  return state.dayOverrides[dateISO] || weekdayChain || groupChain;
}

function chainFor(dateISO) { return chainLayer(dateISO, 'day'); }

// pinned note: this date, else every <weekday>, else the built-in note
function noteFor(dateISO, scope) {
  const wd = weekdayOf(dateISO);
  if (scope !== 'weekday' && state.dayNotes[dateISO] !== undefined) return state.dayNotes[dateISO];
  if (state.weekdayNotes[wd] !== undefined) return state.weekdayNotes[wd];
  return getDayNote(wd) || '';
}

const DEFAULT_MINIMUM_ITEMS = [
  '30 minutes with God',
  'Planned training or a 20-minute walk',
  'One 45-minute money block — follow-ups and conversations',
  'One 20-minute content action',
  'One 15-minute household reset',
  'Present for dinner and bedtime',
  'Five-minute check-in with Ali',
  'Go to bed on time',
];
function minimumItems() {
  return Array.isArray(state.minimumItems) && state.minimumItems.length ? state.minimumItems : DEFAULT_MINIMUM_ITEMS;
}

function materializeChain(chain) {
  let cursor = chain.anchorMinutes;
  return chain.items.map((item) => {
    const startMin = cursor;
    const endMin = item.durationMin > 0 ? cursor + item.durationMin : null;
    cursor += item.durationMin;
    return {
      id: item.id,
      label: item.label,
      category: item.category,
      accent: item.accent,
      durationMin: item.durationMin,
      start: formatMinutes(startMin),
      end: endMin != null ? formatMinutes(endMin) : null,
    };
  });
}

function getWeekKey(dateISO) {
  const d = new Date(dateISO + 'T12:00:00');
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

function shiftWeekKey(weekKey, deltaWeeks) {
  const d = new Date(weekKey + 'T12:00:00');
  d.setDate(d.getDate() + deltaWeeks * 7);
  return d.toISOString().slice(0, 10);
}

function getWeekDates(weekKey) {
  const dates = [];
  const d = new Date(weekKey + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// Unchecked daily tasks from any past day roll forward onto today;
// completed tasks stay on the day they were finished.
function rolloverDailyTasks() {
  const today = todayISO();
  if (state.lastRolloverDate === today) return;
  const carried = [];
  Object.keys(state.dailyTasks).forEach((dateKey) => {
    if (dateKey >= today) return;
    const list = state.dailyTasks[dateKey];
    const unchecked = list.filter((t) => !t.checked).map((t) => ({ ...t, carriedCount: (t.carriedCount || 0) + 1 }));
    const checked = list.filter((t) => t.checked);
    if (unchecked.length) carried.push(...unchecked);
    if (checked.length) state.dailyTasks[dateKey] = checked;
    else delete state.dailyTasks[dateKey];
  });
  if (carried.length) {
    const existing = state.dailyTasks[today] || [];
    state.dailyTasks[today] = carried.concat(existing);
  }
  state.lastRolloverDate = today;
  saveState();
}

// ---------- rendering ----------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function render() {
  renderHeader();
  if (state.activeTab === 'today') renderToday();
  else if (state.activeTab === 'tasks') renderTasks();
  else if (state.activeTab === 'trends') renderTrends();
  else if (state.activeTab === 'quest') renderQuest();
  else renderDashboard();
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.activeTab);
  });
  document.getElementById('view-today').classList.toggle('hidden', state.activeTab !== 'today');
  document.getElementById('view-tasks').classList.toggle('hidden', state.activeTab !== 'tasks');
  document.getElementById('view-trends').classList.toggle('hidden', state.activeTab !== 'trends');
  document.getElementById('view-quest').classList.toggle('hidden', state.activeTab !== 'quest');
  if (window.Quest) qUpdateActiveBar();
  document.getElementById('view-dashboard').classList.toggle('hidden', state.activeTab !== 'dashboard');
}

function renderHeader() {
  const d = new Date(state.selectedDate + 'T12:00:00');
  const weekday = DAY_NAMES[d.getDay()];
  const isToday = state.selectedDate === todayISO();
  document.getElementById('date-label').textContent =
    `${weekday}${isToday ? ' · Today' : ''} — ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function renderToday() {
  const container = document.getElementById('view-today');
  container.innerHTML = '';
  if (scheduleEditSortable) { scheduleEditSortable.destroy(); scheduleEditSortable = null; }

  if (editing) {
    container.appendChild(renderScheduleEditor());
    return;
  }

  if (!state.dayMeta[state.selectedDate]) {
    state.dayMeta[state.selectedDate] = { groupKey: templateFor(state.selectedDate) };
    saveState();
  }
  const blocks = materializeChain(chainFor(state.selectedDate));
  const note = noteFor(state.selectedDate);
  const isToday = state.selectedDate === todayISO();
  const checksForDay = state.checks[state.selectedDate] || {};
  const isMinimum = !!state.minimumMode[state.selectedDate];
  const customDay = !!state.dayOverrides[state.selectedDate];

  // date nav
  container.appendChild(el('div', { class: 'date-nav' }, [
    el('button', { class: 'nav-btn', onclick: () => shiftDate(-1) }, '‹ Prev'),
    el('button', { class: 'nav-btn today-btn', onclick: () => { state.selectedDate = todayISO(); saveState(); render(); } }, 'Today'),
    el('button', { class: 'nav-btn', onclick: () => shiftDate(1) }, 'Next ›'),
  ]));

  // finish line, phone mission, parking lot — the first thing you see
  container.appendChild(renderControlPanel());

  if (note) {
    container.appendChild(el('div', { class: 'day-note' }, `📌 ${note}`));
  }

  // next-anchor reminder
  if (isToday) {
    const nowMin = nowMinutes();
    const next = blocks.find(b => {
      const start = parseTimeToMinutes(b.start);
      return b.category === 'anchor' && start != null && start > nowMin;
    });
    if (next) {
      container.appendChild(el('div', { class: 'return-banner' },
        `IF DERAILED → RETURN TO: ${next.start.toUpperCase()} · ${next.label}`));
    }
  }

  // minimum-viable-day toggle + edit
  container.appendChild(el('div', { class: 'min-toggle-row' }, [
    el('button', {
      class: 'min-toggle-btn' + (isMinimum ? ' active' : ''),
      onclick: () => {
        state.minimumMode[state.selectedDate] = !isMinimum;
        saveState(); render();
      }
    }, isMinimum ? '✓ Minimum-Viable Day' : 'Shrink to Minimum-Viable Day'),
    el('button', { class: 'edit-schedule-btn', onclick: () => startEditingSchedule() }, customDay ? '✎ Edit Schedule · custom day' : '✎ Edit Schedule'),
  ]));

  if (isToday && typeof renderToolsCard === 'function') container.appendChild(renderToolsCard());

  if (isMinimum) {
    container.appendChild(renderMinimumList(checksForDay));
  } else {
    const list = el('div', { class: 'block-list' });
    blocks.forEach((b) => {
      list.appendChild(renderBlock(b, checksForDay, nowMinutes(), isToday));
    });
    container.appendChild(list);
  }
}

function renderMinimumList(checksForDay) {
  const items = minimumItems();
  const wrap = el('div', { class: 'block-list minimum-list' });
  items.forEach((text, idx) => {
    const key = 'min-' + idx;
    const checked = !!checksForDay[key];
    wrap.appendChild(el('label', { class: 'block block-anchor' }, [
      el('input', {
        type: 'checkbox', class: 'block-check',
        ...(checked ? { checked: 'checked' } : {}),
        onchange: (e) => toggleCheck(key, e.target.checked),
      }),
      el('span', { class: 'block-label' }, text),
    ]));
  });
  wrap.appendChild(el('div', { class: 'cue-line' }, 'SHRINK THE TASK. DO NOT ABANDON THE DAY.'));
  return wrap;
}

function renderBlock(b, checksForDay, nowMin, isToday) {
  const start = parseTimeToMinutes(b.start);
  const end = parseTimeToMinutes(b.end);
  const isCurrent = isToday && start != null && (end != null ? (nowMin >= start && nowMin < end) : Math.abs(nowMin - start) < 30);
  const classes = ['block', `block-${b.category}`];
  if (b.accent) classes.push(`accent-${b.accent}`);
  if (isCurrent) classes.push('block-current');
  const checked = !!checksForDay[b.id];

  const timeStr = b.start ? (b.start.toUpperCase() + (b.end ? '–' + b.end.toUpperCase() : '')) : '';

  return el('label', { class: classes.join(' ') }, [
    el('input', {
      type: 'checkbox', class: 'block-check',
      ...(checked ? { checked: 'checked' } : {}),
      onchange: (e) => toggleCheck(b.id, e.target.checked),
    }),
    el('div', { class: 'block-body' }, [
      timeStr ? el('div', { class: 'block-time' }, timeStr) : null,
      el('div', { class: 'block-label' }, b.label),
      el('div', { class: 'block-cat-tag' }, CATEGORIES[b.category].label.toUpperCase()),
    ]),
  ]);
}

function toggleCheck(idx, val) {
  const day = state.selectedDate;
  if (!state.checks[day]) state.checks[day] = {};
  state.checks[day][idx] = val;
  if (window.Quest) Quest.onBlockChecked(idx, val, day);
  saveState();
  render();
}

function shiftDate(delta) {
  const d = new Date(state.selectedDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  state.selectedDate = d.toISOString().slice(0, 10);
  saveState();
  render();
}

// ---------- schedule editor ----------
// Edits are saved as you type, into one "layer": just this date, every
// <weekday>, or the whole group (Mon / Wed / Fri ...). See chainLayer().

let editing = false;
let editDate = null;
let editScope = 'group';   // 'day' | 'weekday' | 'group'
let editDraft = null;
let scheduleEditSortable = null;

function groupWeekdays(group) {
  return Object.keys(DAY_GROUP).filter((k) => DAY_GROUP[k] === group);
}

// "Every Wednesday" only makes sense when the group has more than one weekday
// and this date is still following its own weekday's template.
function scopeAvailable(scope) {
  if (scope !== 'weekday') return true;
  return templateFor(editDate) === DAY_GROUP[weekdayOf(editDate)] && groupWeekdays(templateFor(editDate)).length > 1;
}

function loadEditDraft() {
  const base = chainLayer(editDate, editScope);
  editDraft = { anchorMinutes: base.anchorMinutes, items: base.items.map((i) => ({ ...i })) };
}

function startEditingSchedule() {
  editDate = state.selectedDate;
  const wd = weekdayOf(editDate);
  if (state.dayOverrides[editDate]) editScope = 'day';
  else if (state.weekdayOverrides[wd] && scopeAvailable('weekday')) editScope = 'weekday';
  else editScope = 'group';
  loadEditDraft();
  editing = true;
  render();
}

function stopEditingSchedule() {
  editing = false;
  editDraft = null;
  editDate = null;
  if (scheduleEditSortable) { scheduleEditSortable.destroy(); scheduleEditSortable = null; }
  render();
}

function saveEditDraft() {
  const data = { anchorMinutes: editDraft.anchorMinutes, items: editDraft.items.map((i) => ({ ...i })) };
  if (editScope === 'day') state.dayOverrides[editDate] = data;
  else if (editScope === 'weekday') state.weekdayOverrides[weekdayOf(editDate)] = data;
  else state.scheduleOverrides[templateFor(editDate)] = data;
  saveState();
}

function renderScheduleEditor() {
  const wd = weekdayOf(editDate);
  const dayName = DAY_NAMES[wd];
  const dateLabel = new Date(editDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const group = templateFor(editDate);
  const single = groupWeekdays(group).length <= 1;
  const groupLabel = single ? `Every ${dayName}` : `All ${GROUP_LABELS[group]}`;
  const scopes = [
    { id: 'day', label: `Just ${dayName}, ${dateLabel}` },
    { id: 'weekday', label: `Every ${dayName}` },
    { id: 'group', label: groupLabel },
  ].filter((s) => scopeAvailable(s.id));
  if (!scopes.some((s) => s.id === editScope)) editScope = 'group';

  const wrap = el('div', { class: 'schedule-editor' });
  const hint = {
    day: 'Only this date changes. Every other ' + dayName + ' stays as it is.',
    weekday: `Every ${dayName} changes (days you made custom keep their own schedule).`,
    group: single ? `Every ${dayName} changes.` : `${GROUP_LABELS[group]} all change together.`,
  }[editScope];
  wrap.appendChild(el('div', { class: 'editor-header' }, [
    el('h3', {}, 'Edit the schedule'),
    el('div', { class: 'edit-scope' }, scopes.map((s) => el('button', {
      class: 'edit-scope-btn' + (s.id === editScope ? ' active' : ''),
      onclick: () => { editScope = s.id; loadEditDraft(); render(); },
    }, s.label))),
    el('p', { class: 'trend-sub' }, hint + ' Drag ⠿ to reorder — each block keeps its length, times shift to match.'),
  ]));

  // a single day can follow a different template (e.g. a Wednesday that runs like a Tue / Thu)
  if (editScope === 'day') {
    const sel = el('select', {
      class: 'text-input',
      onchange: (e) => {
        state.dayMeta[editDate] = { groupKey: e.target.value };
        delete state.dayOverrides[editDate];
        if (editScope === 'weekday' && !scopeAvailable('weekday')) editScope = 'day';
        loadEditDraft();
        saveState();
        render();
      },
    }, Object.keys(SCHEDULES).map((k) => el('option', { value: k, ...(k === group ? { selected: 'selected' } : {}) }, GROUP_LABELS[k] || k)));
    wrap.appendChild(el('div', { class: 'control-field' }, [
      el('label', {}, 'THIS DAY RUNS LIKE (switching starts it fresh from that template)'),
      sel,
    ]));
  }

  // pinned note — per date or per weekday (never for a whole multi-day group)
  const noteScope = editScope === 'day' ? 'day' : (single || editScope === 'weekday' ? 'weekday' : null);
  if (noteScope) {
    wrap.appendChild(el('div', { class: 'control-field' }, [
      el('label', {}, noteScope === 'day' ? 'PINNED NOTE FOR THIS DAY' : `PINNED NOTE FOR EVERY ${dayName.toUpperCase()}`),
      el('input', {
        type: 'text', class: 'text-input', placeholder: 'Optional — shows at the top of the day',
        value: noteFor(editDate, noteScope),
        oninput: (e) => {
          if (noteScope === 'day') state.dayNotes[editDate] = e.target.value;
          else state.weekdayNotes[wd] = e.target.value;
          saveState();
        },
      }),
    ]));
  } else {
    wrap.appendChild(el('p', { class: 'trend-sub' }, 'Pinned notes are per day — pick "Just this day" or "Every ' + dayName + '" above to change one.'));
  }

  const list = el('ul', { class: 'edit-block-list' });

  wrap.appendChild(el('div', { class: 'control-field' }, [
    el('label', {}, 'STARTS AT'),
    el('input', {
      type: 'time', class: 'text-input', value: minutesToInputTime(editDraft.anchorMinutes),
      oninput: (e) => {
        const v = inputTimeToMinutes(e.target.value);
        if (!isNaN(v)) { editDraft.anchorMinutes = v; saveEditDraft(); updateEditorTimeBadges(list); }
      },
    }),
  ]));

  wrap.appendChild(list);
  renderEditorListInto(list);

  const addInput = el('input', { type: 'text', class: 'text-input', placeholder: 'New block label, then Add' });
  const addBlock = () => {
    if (!addInput.value.trim()) return;
    editDraft.items.push({ id: 'blk-' + Date.now(), label: addInput.value.trim(), category: 'flex', accent: null, durationMin: 30 });
    addInput.value = '';
    saveEditDraft();
    renderEditorListInto(list);
  };
  addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); addBlock(); } });
  wrap.appendChild(el('div', { class: 'lot-input-row' }, [
    addInput,
    el('button', { class: 'lot-add-btn', onclick: addBlock }, 'Add'),
  ]));

  wrap.appendChild(renderMinimumEditor());

  const resetLabel = { day: 'Reset this day', weekday: `Reset every ${dayName}`, group: 'Reset to default' }[editScope];
  wrap.appendChild(el('div', { class: 'editor-footer' }, [
    el('button', {
      class: 'nav-btn', onclick: () => {
        if (editScope === 'day') {
          delete state.dayOverrides[editDate];
          delete state.dayNotes[editDate];
          state.dayMeta[editDate] = { groupKey: DAY_GROUP[wd] };   // back to its own weekday's template
        }
        else if (editScope === 'weekday') { delete state.weekdayOverrides[wd]; delete state.weekdayNotes[wd]; }
        else delete state.scheduleOverrides[group];
        saveState();
        loadEditDraft();
        render();
      }
    }, resetLabel),
    el('button', { class: 'nav-btn today-btn', onclick: stopEditingSchedule }, 'Done'),
  ]));

  return wrap;
}

// the Minimum-Viable Day checklist, editable
function renderMinimumEditor() {
  const box = el('details', { class: 'edit-extra' });
  box.appendChild(el('summary', {}, 'Minimum-Viable Day checklist'));
  const body = el('div', {});
  box.appendChild(body);
  const draw = () => {
    body.innerHTML = '';
    const items = minimumItems().slice();
    const save = () => { state.minimumItems = items.slice(); saveState(); };
    items.forEach((text, idx) => {
      body.appendChild(el('div', { class: 'lot-input-row edit-min-row' }, [
        el('input', { type: 'text', class: 'text-input', value: text, oninput: (e) => { items[idx] = e.target.value; save(); } }),
        el('button', {
          class: 'lot-remove', ...(items.length <= 1 ? { disabled: 'disabled' } : {}),
          onclick: () => { items.splice(idx, 1); save(); draw(); },
        }, '×'),
      ]));
    });
    const addInput = el('input', { type: 'text', class: 'text-input', placeholder: 'New item, then Add' });
    const add = () => { if (!addInput.value.trim()) return; items.push(addInput.value.trim()); save(); draw(); };
    addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    body.appendChild(el('div', { class: 'lot-input-row' }, [addInput, el('button', { class: 'lot-add-btn', onclick: add }, 'Add')]));
    body.appendChild(el('button', {
      class: 'q-tool-change', onclick: () => { state.minimumItems = null; saveState(); draw(); },
    }, 'Reset checklist to the original'));
  };
  draw();
  return box;
}

function updateEditorTimeBadges(list) {
  let cursor = editDraft.anchorMinutes;
  const rows = list.querySelectorAll('.edit-block-row');
  editDraft.items.forEach((item, idx) => {
    const startMin = cursor;
    const endMin = item.durationMin > 0 ? cursor + item.durationMin : null;
    cursor += item.durationMin;
    const timeStr = formatMinutes(startMin) + (endMin != null ? '–' + formatMinutes(endMin) : '');
    const badge = rows[idx] && rows[idx].querySelector('.edit-block-time');
    if (badge) badge.textContent = timeStr;
  });
}

function renderEditorListInto(list) {
  list.innerHTML = '';
  if (scheduleEditSortable) { scheduleEditSortable.destroy(); scheduleEditSortable = null; }

  let cursor = editDraft.anchorMinutes;
  editDraft.items.forEach((item) => {
    const startMin = cursor;
    const endMin = item.durationMin > 0 ? cursor + item.durationMin : null;
    cursor += item.durationMin;
    const timeStr = formatMinutes(startMin) + (endMin != null ? '–' + formatMinutes(endMin) : '');
    const isAnchor = item.category === 'anchor';

    const row = el('li', { class: 'edit-block-row' + (isAnchor ? ' edit-anchor' : '') });
    row.appendChild(el('div', { class: 'edit-block-top' }, [
      el('span', { class: 'drag-handle' }, '⠿'),
      el('span', { class: 'edit-block-time' }, timeStr),
      el('button', {
        class: 'lot-remove', onclick: () => {
          editDraft.items = editDraft.items.filter((i) => i.id !== item.id);
          saveEditDraft();
          renderEditorListInto(list);
        }
      }, '×'),
    ]));
    row.appendChild(el('input', {
      type: 'text', class: 'text-input edit-block-label', value: item.label,
      oninput: (e) => { item.label = e.target.value; saveEditDraft(); },
    }));
    row.appendChild(el('div', { class: 'edit-block-duration-row' }, [
      el('input', {
        type: 'number', class: 'duration-input', min: '0', step: '5', value: String(item.durationMin),
        oninput: (e) => {
          item.durationMin = Math.max(0, parseInt(e.target.value, 10) || 0);
          saveEditDraft();
          updateEditorTimeBadges(list);
        },
      }),
      el('span', { class: 'duration-unit' }, 'min'),
    ]));
    row.appendChild(el('div', { class: 'edit-opts' }, [
      el('button', {
        class: 'lock-btn' + (isAnchor ? ' on' : ''),
        onclick: () => {
          if (isAnchor) item.category = item.prevCategory && item.prevCategory !== 'anchor' ? item.prevCategory : 'flex';
          else { item.prevCategory = item.category; item.category = 'anchor'; }
          saveEditDraft();
          renderEditorListInto(list);
        },
      }, isAnchor ? '🔒 Locked anchor' : '🔓 Make it an anchor'),
      el('select', {
        class: 'edit-type',
        onchange: (e) => { item.category = e.target.value; saveEditDraft(); renderEditorListInto(list); },
      }, Object.keys(CATEGORIES).map((k) => el('option', { value: k, ...(k === item.category ? { selected: 'selected' } : {}) }, CATEGORIES[k].label))),
      ...['family', 'spirit'].map((a) => el('button', {
        class: 'edit-tag edit-tag-' + a + (item.accent === a ? ' on' : ''),
        onclick: () => { item.accent = item.accent === a ? null : a; saveEditDraft(); renderEditorListInto(list); },
      }, a === 'family' ? 'Family' : 'Spirit')),
    ]));
    list.appendChild(row);
  });

  if (window.Sortable) {
    scheduleEditSortable = new Sortable(list, {
      handle: '.drag-handle', animation: 150,
      onEnd: (evt) => {
        const [moved] = editDraft.items.splice(evt.oldIndex, 1);
        editDraft.items.splice(evt.newIndex, 0, moved);
        saveEditDraft();
        renderEditorListInto(list);
      },
    });
  }
}

let pendingScroll = null;

// finish line, phone mission and the parking lot's quick-add live at the top of Today
function renderControlPanel() {
  const day = state.selectedDate;
  const finish = state.finishLine[day] || '';
  const phone = state.phoneMission[day] || '';
  if (!Array.isArray(state.parkedIdeas)) state.parkedIdeas = [];

  const panel = el('div', { class: 'control-panel' });

  panel.appendChild(el('div', { class: 'control-field' }, [
    el('label', {}, "TODAY'S FINISH LINE"),
    el('input', {
      type: 'text', class: 'text-input', placeholder: 'What must be true by tonight?', value: finish,
      oninput: (e) => { state.finishLine[day] = e.target.value; saveState(); },
    }),
  ]));

  panel.appendChild(el('div', { class: 'control-field' }, [
    el('label', {}, 'PHONE MISSION'),
    el('input', {
      type: 'text', class: 'text-input', placeholder: 'Post. Reply to 5. Start 3 conversations. Exit in 15.', value: phone,
      oninput: (e) => { state.phoneMission[day] = e.target.value; saveState(); },
    }),
  ]));

  const lotField = el('div', { class: 'control-field' }, [
    el('label', {}, 'PARKING LOT — distracting ideas for later'),
  ]);
  const lotInput = el('input', { type: 'text', class: 'text-input', placeholder: 'Type an idea, then Park it' });
  const parkIt = () => {
    if (!lotInput.value.trim()) return;
    state.parkedIdeas.push({ id: Date.now(), text: lotInput.value.trim(), note: '', date: day });
    lotInput.value = '';
    if (window.Quest) Quest.onParked();
    saveState();
    render();
  };
  lotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); parkIt(); }
  });
  lotField.appendChild(el('div', { class: 'lot-input-row' }, [
    lotInput,
    el('button', { class: 'lot-add-btn', onclick: parkIt }, 'Park it'),
  ]));
  const n = state.parkedIdeas.length;
  if (n) {
    lotField.appendChild(el('button', {
      class: 'parked-link',
      onclick: () => { pendingScroll = 'parked'; state.activeTab = 'tasks'; saveState(); render(); },
    }, `💡 ${n} parked idea${n === 1 ? '' : 's'} — review, add details, or clear →`));
  }
  panel.appendChild(lotField);

  return panel;
}

// ---------- dashboard ----------

const ACTIVATION_CARDS = [
  { key: 'urgency', title: '1 · Urgency', body: 'Always give the block a deadline and visible finish line.', examples: ['Seven posts selected by noon.', 'Camera closes at 11:30.', 'Five follow-ups before the timer ends.'], cue: 'WHAT MUST BE FINISHED BEFORE THIS TIMER ENDS?' },
  { key: 'interest', title: '2 · Interest', body: 'Connect the task to something you currently care about.', examples: ['A real conversation', 'Something you disagree with', 'A story involving family or clients'], cue: 'WHAT FEELS ALIVE OR IMPORTANT TO ME RIGHT NOW?' },
  { key: 'entertainment', title: '3 · Entertainment & Pleasure', body: 'Make the environment enjoyable without letting pleasure become escape.', examples: ['Favorite coffee', 'Music', 'Coffee shop or library', 'Walk while voice-noting ideas'], cue: 'HOW CAN I MAKE THIS BLOCK FEEL BETTER WITHOUT AVOIDING THE WORK?' },
  { key: 'challenge', title: '4 · Challenge', body: 'Turn vague work into a measurable game.', examples: ['Seven hooks in 20 minutes', 'Four videos before 11:30', 'Three takes maximum per video'], cue: 'WHAT IS THE SCORE, AND CAN I BEAT THE CLOCK?' },
  { key: 'novelty', title: '5 · Novelty', body: 'Use novelty to restart attention, not rebuild the entire system.', examples: ['Change location', 'Stand instead of sit', 'Talk the idea aloud'], cue: 'CHANGE THE ENVIRONMENT OR METHOD—NOT THE WHOLE PLAN.' },
];

function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  if (container.dataset.built) { updateTimerDisplay(); return; }
  container.dataset.built = '1';
  container.innerHTML = '';

  container.appendChild(el('div', { class: 'reminder-banner' }, 'MOVE FLEXIBLE TASKS — NOT THE ANCHORS.'));

  // timer
  const timerBox = el('div', { class: 'timer-box' }, [
    el('div', { class: 'timer-display', id: 'timer-display' }, '20:00'),
    el('div', { class: 'timer-buttons' }, [
      el('button', { class: 'timer-preset', onclick: () => setTimer(20) }, '20 min'),
      el('button', { class: 'timer-preset', onclick: () => setTimer(45) }, '45 min'),
      el('button', { class: 'timer-preset', onclick: () => setTimer(60) }, '60 min'),
    ]),
    el('div', { class: 'timer-controls' }, [
      el('button', { class: 'timer-start', id: 'timer-start-btn', onclick: toggleTimer }, 'Start'),
      el('button', { class: 'timer-reset', onclick: resetTimer }, 'Reset'),
    ]),
  ]);
  container.appendChild(timerBox);

  const grid = el('div', { class: 'activation-grid' });
  ACTIVATION_CARDS.forEach(card => {
    grid.appendChild(el('div', { class: `activation-card card-${card.key}` }, [
      el('h3', {}, card.title),
      el('p', { class: 'card-body' }, card.body),
      el('ul', { class: 'card-examples' }, card.examples.map(ex => el('li', {}, ex))),
      el('div', { class: 'card-cue' }, card.cue),
    ]));
  });
  container.appendChild(grid);
}

// ---------- tasks ----------

let weeklySortable = null;
let dailySortable = null;

function renderTasks() {
  const container = document.getElementById('view-tasks');
  container.innerHTML = '';
  if (weeklySortable) { weeklySortable.destroy(); weeklySortable = null; }
  if (dailySortable) { dailySortable.destroy(); dailySortable = null; }

  const weekKey = getWeekKey(todayISO());
  const dayKey = todayISO();
  if (!state.weeklyTasks[weekKey]) state.weeklyTasks[weekKey] = [];
  if (!state.dailyTasks[dayKey]) state.dailyTasks[dayKey] = [];

  const dayCol = renderTaskColumn("Today's Tasks", state.dailyTasks[dayKey]);
  const weekCol = renderTaskColumn('This Week', state.weeklyTasks[weekKey]);

  const grid = el('div', { class: 'tasks-grid' }, [dayCol.node, weekCol.node]);
  container.appendChild(grid);
  container.appendChild(renderParkedIdeas());
  if (pendingScroll === 'parked') {
    pendingScroll = null;
    const target = document.getElementById('parked-ideas');
    if (target) target.scrollIntoView({ block: 'start' });
  }

  if (window.Sortable) {
    weeklySortable = new Sortable(weekCol.listEl, {
      handle: '.drag-handle', animation: 150,
      onEnd: (evt) => reorderTasks(state.weeklyTasks[weekKey], evt.oldIndex, evt.newIndex),
    });
    dailySortable = new Sortable(dayCol.listEl, {
      handle: '.drag-handle', animation: 150,
      onEnd: (evt) => reorderTasks(state.dailyTasks[dayKey], evt.oldIndex, evt.newIndex),
    });
  }
}

// Parked ideas wait here until you move them to your brain dump / ideas document.
function renderParkedIdeas() {
  if (!Array.isArray(state.parkedIdeas)) state.parkedIdeas = [];
  const wrap = el('div', { class: 'parked-section', id: 'parked-ideas' });
  wrap.appendChild(el('h3', { class: 'task-column-title' }, `💡 Parked ideas${state.parkedIdeas.length ? ' (' + state.parkedIdeas.length + ')' : ''}`));
  wrap.appendChild(el('p', { class: 'trend-sub' }, 'Add details while you remember them. When an idea is in your brain dump / ideas document, delete it here.'));
  if (!state.parkedIdeas.length) {
    wrap.appendChild(el('p', { class: 'trend-sub' }, 'Nothing parked right now. Ideas you park on the Today tab land here.'));
    return wrap;
  }
  state.parkedIdeas.slice().reverse().forEach((p) => {
    const dateLabel = p.date ? new Date(p.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';
    const del = el('button', { class: 'parked-del' }, 'In my brain dump — delete');
    let armed = false;
    let timer = null;
    del.onclick = () => {
      if (!armed) {
        armed = true;
        del.textContent = 'Tap again to delete';
        del.classList.add('armed');
        timer = setTimeout(() => { armed = false; del.textContent = 'In my brain dump — delete'; del.classList.remove('armed'); }, 4000);
        return;
      }
      clearTimeout(timer);
      state.parkedIdeas = state.parkedIdeas.filter((i) => i.id !== p.id);
      saveState();
      render();
    };
    wrap.appendChild(el('div', { class: 'parked-card' }, [
      el('input', { type: 'text', class: 'text-input parked-text', value: p.text, oninput: (e) => { p.text = e.target.value; saveState(); } }),
      el('textarea', {
        class: 'text-input parked-note', rows: '3', placeholder: 'Add details so future-you remembers what this was…',
        oninput: (e) => { p.note = e.target.value; saveState(); },
      }, p.note || ''),
      el('div', { class: 'parked-foot' }, [el('span', { class: 'parked-date' }, dateLabel ? 'Parked ' + dateLabel : ''), del]),
    ]));
  });
  return wrap;
}

function reorderTasks(list, oldIndex, newIndex) {
  if (oldIndex === newIndex) return;
  const [moved] = list.splice(oldIndex, 1);
  list.splice(newIndex, 0, moved);
  saveState();
}

function renderTaskColumn(title, list) {
  const column = el('div', { class: 'task-column' }, [
    el('h3', { class: 'task-column-title' }, title),
  ]);

  const input = el('input', { type: 'text', class: 'text-input', placeholder: 'Type a task, then Add' });
  const addIt = () => {
    if (!input.value.trim()) return;
    list.push({ id: Date.now() + Math.random(), text: input.value.trim(), checked: false });
    input.value = '';
    saveState();
    render();
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); addIt(); }
  });
  column.appendChild(el('div', { class: 'lot-input-row' }, [
    input,
    el('button', { class: 'lot-add-btn', onclick: addIt }, 'Add'),
  ]));

  const listEl = el('ul', { class: 'task-list' });
  list.forEach((task) => {
    listEl.appendChild(el('li', { class: 'task-row' + (task.checked ? ' task-checked' : '') }, [
      el('span', { class: 'drag-handle' }, '⠿'),
      el('input', {
        type: 'checkbox', class: 'block-check',
        ...(task.checked ? { checked: 'checked' } : {}),
        onchange: (e) => {
          task.checked = e.target.checked;
          if (task.checked && window.Quest) Quest.onTaskChecked(task);
          saveState(); render();
        },
      }),
      el('span', { class: 'task-text' }, task.text),
      el('button', {
        class: 'lot-remove', onclick: () => {
          const idx = list.indexOf(task);
          if (idx > -1) list.splice(idx, 1);
          saveState(); render();
        }
      }, '×'),
    ]));
  });
  column.appendChild(listEl);

  return { node: column, listEl };
}

// ---------- trends ----------

let trendsWeekKey = null;

function computeWeekStats(weekDates) {
  const today = todayISO();
  const days = weekDates.map((dateISO) => {
    const blocks = materializeChain(chainFor(dateISO));
    const checksForDay = state.checks[dateISO] || {};
    const total = blocks.length;
    const checkedCount = blocks.reduce((n, b) => n + (checksForDay[b.id] ? 1 : 0), 0);
    const isFuture = dateISO > today;
    return { dateISO, total, checkedCount, isFuture, blocks, checksForDay };
  });

  const skipCounts = {};
  const appearCounts = {};
  days.filter((d) => !d.isFuture).forEach((d) => {
    d.blocks.forEach((b) => {
      appearCounts[b.label] = (appearCounts[b.label] || 0) + 1;
      if (!d.checksForDay[b.id]) skipCounts[b.label] = (skipCounts[b.label] || 0) + 1;
    });
  });
  const leaderboard = Object.keys(skipCounts)
    .map((label) => ({ label, skipped: skipCounts[label], of: appearCounts[label] }))
    .sort((a, b) => b.skipped - a.skipped)
    .slice(0, 6);

  const weekKey = getWeekKey(weekDates[0]);
  const weeklyList = state.weeklyTasks[weekKey] || [];
  const dailyLists = weekDates.flatMap((dateISO) => state.dailyTasks[dateISO] || []);
  const allTasks = weeklyList.concat(dailyLists);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.checked).length;
  const stuckTasks = allTasks.filter((t) => !t.checked && (t.carriedCount || 0) >= 2);

  const log = ((state.quest && state.quest.log) || []).filter((l) => weekDates.includes(l.date));
  const finished = log.filter((l) => l.status === 'finished');
  const missions = {
    started: log.length,
    finished: finished.length,
    saved: log.filter((l) => l.status === 'saved').length,
    editExtended: log.filter((l) => l.missionId === 'edit' && l.extensions > 0).length,
    convoActions: finished.filter((l) => l.kind === 'convo').length,
    replies: finished.filter((l) => l.kind === 'convo' && l.reply === true).length,
  };

  return { days, leaderboard, totalTasks, completedTasks, stuckTasks, missions };
}

function renderTrends() {
  const container = document.getElementById('view-trends');
  container.innerHTML = '';
  if (!trendsWeekKey) trendsWeekKey = getWeekKey(todayISO());
  const weekDates = getWeekDates(trendsWeekKey);
  const currentWeekKey = getWeekKey(todayISO());
  const atLatest = trendsWeekKey === currentWeekKey;

  container.appendChild(el('div', { class: 'date-nav' }, [
    el('button', { class: 'nav-btn', onclick: () => { trendsWeekKey = shiftWeekKey(trendsWeekKey, -1); renderTrends(); } }, '‹ Prev Week'),
    el('button', { class: 'nav-btn today-btn', onclick: () => { trendsWeekKey = currentWeekKey; renderTrends(); } }, 'This Week'),
    el('button', {
      class: 'nav-btn', ...(atLatest ? { disabled: 'disabled' } : {}),
      onclick: () => { if (!atLatest) { trendsWeekKey = shiftWeekKey(trendsWeekKey, 1); renderTrends(); } },
    }, 'Next Week ›'),
  ]));

  const weekLabel = formatWeekLabel(weekDates[0], weekDates[6]);
  const isSunday = new Date().getDay() === 0;
  container.appendChild(el('div', { class: 'trends-week-label' },
    weekLabel + (atLatest && isSunday ? ' — it’s Sunday, good day to reflect' : '')));

  const stats = computeWeekStats(weekDates);

  container.appendChild(renderDayCompletionRow(stats));
  container.appendChild(renderSkippedBlocks(stats));
  container.appendChild(renderMissionStats(stats));
  container.appendChild(renderStuckTasks(stats));
  container.appendChild(renderReflectionBox(trendsWeekKey));
  container.appendChild(renderAdjustmentBox(trendsWeekKey));

  container.appendChild(el('div', { class: 'trend-hint' },
    'Notice something that needs to change? Tell your assistant and it’ll update your schedule.'));
}

function formatWeekLabel(startISO, endISO) {
  const s = new Date(startISO + 'T12:00:00');
  const e = new Date(endISO + 'T12:00:00');
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function renderDayCompletionRow(stats) {
  const wrap = el('div', { class: 'trend-section' }, [el('h3', {}, 'Daily Completion')]);
  const row = el('div', { class: 'day-bar-row' });
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  stats.days.forEach((d, i) => {
    const pct = d.total ? Math.round((d.checkedCount / d.total) * 100) : 0;
    row.appendChild(el('div', { class: 'day-bar' + (d.isFuture ? ' day-bar-future' : '') }, [
      el('div', { class: 'day-bar-track' }, [
        el('div', { class: 'day-bar-fill', style: `height:${d.isFuture ? 0 : pct}%` }),
      ]),
      el('div', { class: 'day-bar-pct' }, d.isFuture ? '—' : pct + '%'),
      el('div', { class: 'day-bar-label' }, dayLabels[i]),
    ]));
  });
  wrap.appendChild(row);
  return wrap;
}

function renderSkippedBlocks(stats) {
  const wrap = el('div', { class: 'trend-section' }, [
    el('h3', {}, 'Not Checked Off This Week'),
    el('p', { class: 'trend-sub' }, 'Unrecorded isn’t the same as avoided — look for patterns, not blame.'),
  ]);
  if (!stats.leaderboard.length) {
    wrap.appendChild(el('p', { class: 'trend-empty' }, 'Everything so far is checked off.'));
    return wrap;
  }
  const list = el('div', { class: 'skip-list' });
  stats.leaderboard.forEach((item) => {
    list.appendChild(el('div', { class: 'skip-row' }, [
      el('span', { class: 'skip-label' }, item.label),
      el('span', { class: 'skip-count' }, `${item.skipped}/${item.of}`),
    ]));
  });
  wrap.appendChild(list);
  return wrap;
}

function renderMissionStats(stats) {
  const m = stats.missions;
  const wrap = el('div', { class: 'trend-section' }, [el('h3', {}, 'Missions')]);
  const rows = [
    ['Started', m.started],
    ['Finished', m.finished],
    ['Saved for later', m.saved],
    ['Edits that needed an extension', m.editExtended],
    ['Conversation actions', m.convoActions],
    ['Replies you recorded', m.replies],
  ];
  const list = el('div', { class: 'skip-list' });
  rows.forEach(([label, n]) => {
    list.appendChild(el('div', { class: 'skip-row' }, [
      el('span', {}, label),
      el('span', { class: 'stat-num' }, String(n)),
    ]));
  });
  wrap.appendChild(list);
  return wrap;
}

function renderAdjustmentBox(weekKey) {
  const wrap = el('div', { class: 'trend-section' }, [
    el('h3', {}, 'One adjustment for next week'),
    el('p', { class: 'trend-sub' }, 'Just one. Small and specific beats a full reset.'),
  ]);
  wrap.appendChild(el('input', {
    type: 'text', class: 'text-input', placeholder: 'e.g. Start the business block with a conversation',
    value: state.weeklyAdjustments[weekKey] || '',
    oninput: (e) => { state.weeklyAdjustments[weekKey] = e.target.value; saveState(); },
  }));
  return wrap;
}

function renderStuckTasks(stats) {
  const wrap = el('div', { class: 'trend-section' }, [
    el('h3', {}, 'Tasks'),
    el('p', { class: 'trend-sub' }, `${stats.completedTasks} of ${stats.totalTasks} checked off`),
  ]);
  if (stats.stuckTasks.length) {
    wrap.appendChild(el('div', { class: 'stuck-callout' }, [
      el('strong', {}, 'Carried forward 2+ days — unfinished or unrecorded:'),
      el('ul', {}, stats.stuckTasks.map((t) => el('li', {}, `${t.text} (${t.carriedCount}×)`))),
    ]));
  }
  return wrap;
}

function renderReflectionBox(weekKey) {
  const wrap = el('div', { class: 'trend-section reflection-box' }, [
    el('h3', {}, 'Sunday Reflection'),
    el('p', { class: 'trend-sub' }, 'What helped? What got in the way? What will I change?'),
  ]);
  const textarea = el('textarea', {
    class: 'reflection-textarea',
    placeholder: 'Write your weekly reflection here...',
    oninput: (e) => { state.weeklyReflections[weekKey] = e.target.value; saveState(); },
  });
  textarea.value = state.weeklyReflections[weekKey] || '';
  wrap.appendChild(textarea);
  return wrap;
}

function setTimer(minutes) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = minutes * 60;
  document.getElementById('timer-start-btn').textContent = 'Start';
  updateTimerDisplay();
}

function toggleTimer() {
  if (!timerRemaining) setTimer(20);
  const btn = document.getElementById('timer-start-btn');
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    btn.textContent = 'Resume';
  } else {
    timerRunning = true;
    btn.textContent = 'Pause';
    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();
      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('timer-display').classList.add('timer-done');
        btn.textContent = 'Start';
        try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); } catch (e) {}
        if (Notification && Notification.permission === 'granted') {
          new Notification('Timer done', { body: 'Block finished — check your finish line.' });
        }
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = 0;
  document.getElementById('timer-display').classList.remove('timer-done');
  document.getElementById('timer-start-btn').textContent = 'Start';
  document.getElementById('timer-display').textContent = '--:--';
}

function updateTimerDisplay() {
  const disp = document.getElementById('timer-display');
  if (!disp) return;
  if (!timerRemaining) { disp.textContent = '--:--'; return; }
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  disp.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------- init ----------

function init() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      saveState();
      render();
    });
  });
  if (window.Notification && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
  if (window.HolformSync) window.HolformSync.init(onRemoteState);
  if (window.Quest) Quest.ensure();
  migrateParking();
  rolloverDailyTasks();
  applyHashTab();
  window.addEventListener('hashchange', () => { applyHashTab(); render(); });
  render();
  if (window.Quest) Quest.init();

  // When a new day starts (or the app wakes up on a new day) jump to today.
  let lastToday = todayISO();
  const checkNewDay = () => {
    const now = todayISO();
    if (now === lastToday) return false;
    if (state.selectedDate === lastToday) state.selectedDate = now;
    lastToday = now;
    rolloverDailyTasks();
    saveState();
    render();
    return true;
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkNewDay(); });
  window.addEventListener('pageshow', checkNewDay);
  window.addEventListener('focus', checkNewDay);

  setInterval(() => {
    if (checkNewDay()) return;
    rolloverDailyTasks();
    // don't rebuild the page while you are typing in it
    const ae = document.activeElement;
    const typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.closest('#view-today, #view-tasks');
    if (!typing && (state.activeTab === 'today' || state.activeTab === 'tasks')) render();
  }, 60000);
}

// Calendar links open the app at #quest / #trends etc.
function applyHashTab() {
  const tab = location.hash.replace('#', '');
  if (['today', 'tasks', 'trends', 'quest', 'dashboard'].includes(tab)) {
    state.activeTab = tab;
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function onRemoteState(remote) {
  adoptRemoteState(remote);
  if (window.Quest) Quest.ensure();
  migrateParking();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  rolloverDailyTasks();
  render();
}

document.addEventListener('DOMContentLoaded', init);
