// ============================================================
// HolForm Weekly Operating System — app logic
// ============================================================

const STORAGE_KEY = 'holform-os-state-v1';

const DEFAULT_STATE = {
  season: 'transition', // 'transition' | 'driving'
  activeTab: 'today',   // 'today' | 'tasks' | 'dashboard'
  selectedDate: todayISO(),
  checks: {},        // { [dateISO]: { [blockIdx]: true } }
  finishLine: {},     // { [dateISO]: string }
  phoneMission: {},   // { [dateISO]: string }
  parkingLot: {},     // { [dateISO]: [{id,text}] }
  minimumMode: {},    // { [dateISO]: bool }
  weeklyTasks: {},     // { [weekKey]: [{id,text,checked}] }
  dailyTasks: {},      // { [dateISO]: [{id,text,checked}] }
  lastRolloverDate: null,
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
    return Object.assign(structuredClone(DEFAULT_STATE), parsed);
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
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

function getWeekKey(dateISO) {
  const d = new Date(dateISO + 'T12:00:00');
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
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
    const unchecked = list.filter((t) => !t.checked);
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
  else renderDashboard();
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.activeTab);
  });
  document.getElementById('view-today').classList.toggle('hidden', state.activeTab !== 'today');
  document.getElementById('view-tasks').classList.toggle('hidden', state.activeTab !== 'tasks');
  document.getElementById('view-dashboard').classList.toggle('hidden', state.activeTab !== 'dashboard');
}

function renderHeader() {
  const d = new Date(state.selectedDate + 'T12:00:00');
  const weekday = DAY_NAMES[d.getDay()];
  const isToday = state.selectedDate === todayISO();
  document.getElementById('date-label').textContent =
    `${weekday}${isToday ? ' · Today' : ''} — ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  document.getElementById('season-toggle').classList.toggle('season-driving', state.season === 'driving');
  document.getElementById('season-label').textContent =
    state.season === 'transition' ? 'Transition (No Driving)' : 'Driving Season';
}

function renderToday() {
  const container = document.getElementById('view-today');
  container.innerHTML = '';

  const d = new Date(state.selectedDate + 'T12:00:00');
  const weekday = d.getDay();
  const { groupKey, blocks } = getScheduleFor(state.season, weekday);
  const note = getDayNote(state.season, weekday);
  const isToday = state.selectedDate === todayISO();
  const checksForDay = state.checks[state.selectedDate] || {};
  const isMinimum = !!state.minimumMode[state.selectedDate];

  // date nav
  container.appendChild(el('div', { class: 'date-nav' }, [
    el('button', { class: 'nav-btn', onclick: () => shiftDate(-1) }, '‹ Prev'),
    el('button', { class: 'nav-btn today-btn', onclick: () => { state.selectedDate = todayISO(); saveState(); render(); } }, 'Today'),
    el('button', { class: 'nav-btn', onclick: () => shiftDate(1) }, 'Next ›'),
  ]));

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

  // minimum-viable-day toggle
  container.appendChild(el('div', { class: 'min-toggle-row' }, [
    el('button', {
      class: 'min-toggle-btn' + (isMinimum ? ' active' : ''),
      onclick: () => {
        state.minimumMode[state.selectedDate] = !isMinimum;
        saveState(); render();
      }
    }, isMinimum ? '✓ Minimum-Viable Day' : 'Shrink to Minimum-Viable Day'),
  ]));

  if (isMinimum) {
    container.appendChild(renderMinimumList(checksForDay));
  } else {
    const list = el('div', { class: 'block-list' });
    blocks.forEach((b, idx) => {
      list.appendChild(renderBlock(b, idx, checksForDay, nowMinutes(), isToday));
    });
    container.appendChild(list);
  }

  container.appendChild(renderControlPanel());
}

function renderMinimumList(checksForDay) {
  const items = [
    '30 minutes with God',
    'Planned training or a 20-minute walk',
    'One 45-minute money block — follow-ups and conversations',
    'One 20-minute content action',
    'One 15-minute household reset',
    'Present for dinner and bedtime',
    'Five-minute check-in with Ali',
    'Go to bed on time',
  ];
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

function renderBlock(b, idx, checksForDay, nowMin, isToday) {
  const start = parseTimeToMinutes(b.start);
  const end = parseTimeToMinutes(b.end);
  const isCurrent = isToday && start != null && (end != null ? (nowMin >= start && nowMin < end) : Math.abs(nowMin - start) < 30);
  const classes = ['block', `block-${b.category}`];
  if (b.accent) classes.push(`accent-${b.accent}`);
  if (isCurrent) classes.push('block-current');
  const checked = !!checksForDay[idx];

  const timeStr = b.start ? (b.start.toUpperCase() + (b.end ? '–' + b.end.toUpperCase() : '')) : '';

  return el('label', { class: classes.join(' ') }, [
    el('input', {
      type: 'checkbox', class: 'block-check',
      ...(checked ? { checked: 'checked' } : {}),
      onchange: (e) => toggleCheck(idx, e.target.checked),
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

function renderControlPanel() {
  const day = state.selectedDate;
  const finish = state.finishLine[day] || '';
  const phone = state.phoneMission[day] || '';
  const lot = state.parkingLot[day] || [];

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
    if (!state.parkingLot[day]) state.parkingLot[day] = [];
    state.parkingLot[day].push({ id: Date.now(), text: lotInput.value.trim() });
    lotInput.value = '';
    saveState();
    render();
  };
  lotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); parkIt(); }
  });
  const lotRow = el('div', { class: 'lot-input-row' }, [
    lotInput,
    el('button', { class: 'lot-add-btn', onclick: parkIt }, 'Park it'),
  ]);
  lotField.appendChild(lotRow);
  const lotList = el('ul', { class: 'parking-list' });
  lot.forEach(item => {
    lotList.appendChild(el('li', {}, [
      el('span', {}, item.text),
      el('button', {
        class: 'lot-remove', onclick: () => {
          state.parkingLot[day] = state.parkingLot[day].filter(i => i.id !== item.id);
          saveState(); render();
        }
      }, '×'),
    ]));
  });
  lotField.appendChild(lotList);
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

  const weekCol = renderTaskColumn('This Week', state.weeklyTasks[weekKey]);
  const dayCol = renderTaskColumn('Today', state.dailyTasks[dayKey]);

  const grid = el('div', { class: 'tasks-grid' }, [weekCol.node, dayCol.node]);
  container.appendChild(grid);

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
        onchange: (e) => { task.checked = e.target.checked; saveState(); render(); },
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
  document.getElementById('season-toggle').addEventListener('click', () => {
    state.season = state.season === 'transition' ? 'driving' : 'transition';
    saveState();
    render();
  });
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
  rolloverDailyTasks();
  render();
  setInterval(() => {
    rolloverDailyTasks();
    if (state.activeTab === 'today' || state.activeTab === 'tasks') render();
  }, 60000);
}

function onRemoteState(remote) {
  state = Object.assign(structuredClone(DEFAULT_STATE), remote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  rolloverDailyTasks();
  render();
}

document.addEventListener('DOMContentLoaded', init);
