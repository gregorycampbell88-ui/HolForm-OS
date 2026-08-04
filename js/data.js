// ============================================================
// HolForm Weekly Operating System — schedule data model
// Categories: anchor (locked), primary (main outcome), flex,
// call (call-if-booked), buffer. Accent: family, spirit (optional tint).
// ============================================================

const CATEGORIES = {
  anchor:  { label: 'Locked Anchor',    style: 'solid'   },
  primary: { label: 'Primary Outcome',  style: 'solid'   },
  flex:    { label: 'Flex Lane',        style: 'outline' },
  call:    { label: 'Call If Booked',   style: 'dashed'  },
  buffer:  { label: 'Buffer',           style: 'dotted'  },
};

// day groups: which schedule template applies to which weekday
const DAY_GROUP = {
  transition: { 1: 'transition-mwf', 3: 'transition-mwf', 5: 'transition-mwf', 2: 'transition-tth', 4: 'transition-tth', 6: 'saturday', 0: 'sunday' },
  driving:    { 1: 'driving-mwf',    3: 'driving-mwf',    5: 'driving-mwf',    2: 'driving-tth',    4: 'driving-tth',    6: 'saturday', 0: 'sunday' },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---- Transition season (no driving job) ----

const TRANSITION_MWF = [
  { start: '5:45a',  end: '5:50a',  label: 'Wake', category: 'anchor' },
  { start: '5:50a',  end: '6:30a',  label: 'Bible, prayer, silence, time with God', category: 'anchor', accent: 'spirit' },
  { start: '6:30a',  end: '6:45a',  label: 'Help kids, breakfast prep, leave', category: 'anchor' },
  { start: '6:45a',  end: '7:10a',  label: 'School drop-off + drive to gym', category: 'anchor' },
  { start: '7:20a',  end: '8:50a',  label: 'Gym, shower, optional recovery', category: 'anchor', accent: 'spirit' },
  { start: '8:50a',  end: '9:30a',  label: 'Return home, post-workout meal, medication, setup', category: 'anchor' },
  { start: '9:30a',  end: '12:00p', label: 'Primary HolForm work', category: 'primary' },
  { start: '12:00p', end: '12:30p', label: 'Lunch', category: 'buffer' },
  { start: '12:30p', end: '2:00p',  label: 'HolForm production, sales, or client calls', category: 'flex' },
  { start: '2:00p',  end: '2:40p',  label: 'Solo walk and breathing room', category: 'buffer', accent: 'spirit' },
  { start: '3:00p',  end: '5:00p',  label: 'Family, client calls, special time, or flex lane', category: 'flex', accent: 'family' },
  { start: '6:00p',  end: '6:30p',  label: 'Dinner', category: 'anchor', accent: 'family' },
  { start: '6:30p',  end: '7:15p',  label: 'Kitchen, bath, kids’ bedtime', category: 'anchor', accent: 'family' },
  { start: '7:20p',  end: '7:40p',  label: 'Daily check-in with Ali', category: 'anchor', accent: 'family' },
  { start: '7:40p',  end: null,     label: 'Breathing room and wind-down', category: 'buffer' },
];

const TRANSITION_TTH = [
  { start: '4:45a',  end: '4:50a',  label: 'Wake', category: 'anchor' },
  { start: '4:50a',  end: '5:35a',  label: 'Bible, prayer, silence, time with God', category: 'anchor', accent: 'spirit' },
  { start: '5:35a',  end: '6:15a',  label: 'Outdoor run', category: 'anchor', accent: 'spirit' },
  { start: '6:15a',  end: '6:45a',  label: 'Shower, breakfast, medication', category: 'anchor' },
  { start: '6:45a',  end: '7:15a',  label: 'School drop-off', category: 'anchor' },
  { start: '7:15a',  end: '8:45a',  label: 'Laundry, light chores, prep, or quiet margin', category: 'flex' },
  { start: '9:30a',  end: '12:00p', label: 'Primary HolForm work', category: 'primary' },
  { start: '12:00p', end: '12:30p', label: 'Lunch', category: 'buffer' },
  { start: '12:30p', end: '2:00p',  label: 'HolForm revenue and completion work', category: 'primary' },
  { start: '2:00p',  end: '2:30p',  label: 'Breathing room', category: 'buffer' },
  { start: '3:00p',  end: null,     label: 'Get kids from Ali', category: 'anchor', accent: 'family' },
  { start: '3:30p',  end: '3:45p',  label: 'Arrive home', category: 'anchor', accent: 'family' },
  { start: '4:15p',  end: '4:50p',  label: 'Family walk', category: 'anchor', accent: 'family' },
  { start: '4:30p',  end: null,     label: 'Potential-client call (if booked) — snack, bathroom, show, headphones', category: 'call' },
  { start: '5:00p',  end: '6:00p',  label: 'Kids and dinner prep', category: 'anchor', accent: 'family' },
  { start: '6:00p',  end: '7:15p',  label: 'Dinner, bath, bedtime', category: 'anchor', accent: 'family' },
  { start: '7:15p',  end: '8:00p',  label: 'Kitchen reset and breathing room', category: 'buffer' },
  { start: '8:00p',  end: '8:20p',  label: 'Daily check-in with Ali', category: 'anchor', accent: 'family' },
  { start: '10:00p', end: null,     label: 'Lights out', category: 'anchor' },
];

// ---- Driving season (begins in a few weeks) ----

const DRIVING_MWF = [
  { start: '5:45a',  end: '6:30a',  label: 'Wake and time with God', category: 'anchor', accent: 'spirit' },
  { start: '6:30a',  end: '6:45a',  label: 'Kids, preparation, and leave', category: 'anchor' },
  { start: '7:00a',  end: '9:15a',  label: 'Driving job', category: 'anchor' },
  { start: '9:25a',  end: '10:50a', label: 'Gym and shower', category: 'anchor', accent: 'spirit' },
  { start: '10:50a', end: '11:10a', label: 'Meal and medication', category: 'anchor' },
  { start: '11:10a', end: '1:10p',  label: 'Protected HolForm block or booked call', category: 'primary' },
  { start: '1:30p',  end: '3:00p',  label: 'Driving job', category: 'anchor' },
  { start: '3:00p',  end: null,     label: 'Family, walk, special time, calls, or flex', category: 'flex', accent: 'family' },
];

const DRIVING_TTH = [
  { start: '4:45a',  end: '6:45a',  label: 'God, run, shower, breakfast, medication', category: 'anchor', accent: 'spirit' },
  { start: '7:00a',  end: '9:15a',  label: 'Driving job', category: 'anchor' },
  { start: '9:30a',  end: '1:10p',  label: 'Protected HolForm block or booked calls', category: 'primary' },
  { start: '1:30p',  end: '3:00p',  label: 'Driving job', category: 'anchor' },
  { start: '3:30p',  end: '3:45p',  label: 'Arrive home with kids', category: 'anchor', accent: 'family' },
  { start: '4:15p',  end: '4:50p',  label: 'Family walk', category: 'anchor', accent: 'family' },
  { start: '4:30p',  end: null,     label: 'Potential-client call (if booked) — kids safely set up', category: 'call' },
  { start: '6:00p',  end: '7:15p',  label: 'Dinner, bath, bedtime', category: 'anchor', accent: 'family' },
  { start: '7:30p',  end: null,     label: 'Potential-client call (if booked)', category: 'call' },
  { start: '8:00p',  end: '8:20p',  label: 'Check-in with Ali (when no call interferes)', category: 'anchor', accent: 'family' },
  { start: '10:00p', end: null,     label: 'Lights out', category: 'anchor' },
];

// ---- Weekend (same both seasons) ----

const SATURDAY = [
  { start: '6:00a',  end: null,     label: 'Wake', category: 'anchor' },
  { start: '6:00a',  end: '6:30a',  label: 'Time with God', category: 'anchor', accent: 'spirit' },
  { start: '6:30a',  end: '9:30a',  label: 'Gym, sauna, and shower', category: 'anchor', accent: 'spirit' },
  { start: '9:30a',  end: '12:00p', label: 'Flex block — check Friday’s Red / Yellow / Green', category: 'flex' },
  { start: '12:00p', end: '4:00p',  label: 'Family and open time', category: 'flex', accent: 'family' },
  { start: '4:00p',  end: '8:00p',  label: 'Protected date window (2–4 hrs)', category: 'anchor', accent: 'family' },
];

const SUNDAY = [
  { start: '7:00a',  end: null,     label: 'Wake after 7½–8 hrs sleep', category: 'anchor' },
  { start: '7:00a',  end: '9:00a',  label: 'Longer, Spirit-led time with God', category: 'anchor', accent: 'spirit' },
  { start: '9:00a',  end: null,     label: 'Arrive at church', category: 'anchor', accent: 'spirit' },
  { start: '9:00a',  end: '11:30a', label: 'Worship and service', category: 'anchor', accent: 'spirit' },
  { start: '11:30a', end: '12:15p', label: 'Lunch', category: 'buffer' },
  { start: '12:15p', end: '1:00p',  label: 'Easy run', category: 'flex', accent: 'spirit' },
  { start: '1:00p',  end: '7:30p',  label: 'Family and rest', category: 'flex', accent: 'family' },
  { start: '7:30p',  end: '8:30p',  label: 'Weekly marriage check-in', category: 'anchor', accent: 'family' },
  { start: '8:30p',  end: '8:50p',  label: 'Post scheduling only if necessary — max 20 min', category: 'flex' },
];

const SCHEDULES = {
  'transition-mwf': TRANSITION_MWF,
  'transition-tth': TRANSITION_TTH,
  'driving-mwf': DRIVING_MWF,
  'driving-tth': DRIVING_TTH,
  'saturday': SATURDAY,
  'sunday': SUNDAY,
};

const DAY_NOTES = {
  transition: {
    1: 'Individual time with daughter, 30–60 min, after special time begins (~15 min after home).',
    3: 'Flex, walking, client calls. Small group at 7:00 p.m. two Wednesdays a month — Thursday wake shifts to 5:30 a.m. that week. Sauna preferred today.',
    5: 'Individual time with son, 30–60 min, after special time begins (~15 min after home).',
    2: 'Ali works until 8:00 p.m. — Greg has the kids.',
    4: 'Ali works until 8:00 p.m. — Greg has the kids.',
    6: 'Sauna preferred today.',
  },
  driving: {
    1: 'Special time protected after Greg gets home.',
    3: 'Preferred solo-walk and flex window this afternoon.',
    5: 'Special time protected after Greg gets home.',
    2: 'Strongest business day — enters the 9:30 block trained, medicated, and activated.',
    4: 'Strongest business day — enters the 9:30 block trained, medicated, and activated.',
  },
};

function getScheduleFor(season, weekday) {
  const groupKey = DAY_GROUP[season][weekday];
  return { groupKey, blocks: SCHEDULES[groupKey] || [] };
}

function getDayNote(season, weekday) {
  return (DAY_NOTES[season] && DAY_NOTES[season][weekday]) || null;
}

const GROUP_LABELS = {
  'transition-mwf': 'Mon / Wed / Fri — Transition',
  'transition-tth': 'Tue / Thu — Transition',
  'driving-mwf': 'Mon / Wed / Fri — Driving',
  'driving-tth': 'Tue / Thu — Driving',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// ---- duration-chain derivation ----
// Every block gets a fixed durationMin so that reordering keeps each
// block's length intact while the displayed clock times shift to match
// its new position. Duration is inferred as the gap to the NEXT block's
// start (so travel/dead time between blocks is folded into the block
// before it); the last block falls back to its own end time, or 20 min.

function _chainParseTime(t) {
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

function deriveBaseChain(blocks) {
  const anchorMinutes = _chainParseTime(blocks[0].start);
  const items = blocks.map((b, idx) => {
    const start = _chainParseTime(b.start);
    const nextStart = idx < blocks.length - 1 ? _chainParseTime(blocks[idx + 1].start) : null;
    const end = _chainParseTime(b.end);
    let durationMin;
    if (nextStart != null && start != null) durationMin = Math.max(0, nextStart - start);
    else if (end != null && start != null) durationMin = Math.max(0, end - start);
    else durationMin = 20;
    return {
      id: `base-${idx}`,
      label: b.label,
      category: b.category,
      accent: b.accent || null,
      durationMin,
    };
  });
  return { anchorMinutes, items };
}

const BASE_CHAINS = {};
Object.keys(SCHEDULES).forEach((key) => {
  BASE_CHAINS[key] = deriveBaseChain(SCHEDULES[key]);
});
