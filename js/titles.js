// ============================================================
// Titles — hidden until earned. Locked titles are never shown anywhere
// (not even a count); only discovered ones appear, with their description.
// Each test() reads a context built in js/quests.js (level, stats, log, etc.).
// Tone rule: celebrate showing up. Nothing here shames a miss.
// ============================================================

const TITLES = [
  { id: 'recruit', name: 'Recruit', desc: 'Everyone starts somewhere.', test: () => true },

  // ---- levels ----
  { id: 'sparkplug', name: 'Sparkplug', desc: 'Hit Level 3.', test: (c) => c.level >= 3 },
  { id: 'fieldtested', name: 'Field-Tested', desc: 'Hit Level 5.', test: (c) => c.level >= 5 },
  { id: 'trailblazer', name: 'Trailblazer', desc: 'Hit Level 7.', test: (c) => c.level >= 7 },
  { id: 'emerald-heart', name: 'Emerald Heart', desc: 'Unlocked your favorite color.', test: (c) => c.level >= 10 },
  { id: 'veteran', name: 'Veteran', desc: 'Hit Level 15.', test: (c) => c.level >= 15 },
  { id: 'unshakeable', name: 'Unshakeable', desc: 'Hit Level 20.', test: (c) => c.level >= 20 },
  { id: 'living-legend', name: 'Living Legend', desc: 'Hit Level 25.', test: (c) => c.level >= 25 },

  // ---- missions ----
  { id: 'first-light', name: 'First Light', desc: 'Finished your very first mission.', test: (c) => c.s.missions >= 1 },
  { id: 'momentum', name: 'Momentum', desc: '10 missions finished.', test: (c) => c.s.missions >= 10 },
  { id: 'steady-hands', name: 'Steady Hands', desc: '25 missions finished.', test: (c) => c.s.missions >= 25 },
  { id: 'relentless', name: 'Relentless', desc: '50 missions finished.', test: (c) => c.s.missions >= 50 },
  { id: 'centurion', name: 'Centurion', desc: '100 missions. That is not luck.', test: (c) => c.s.missions >= 100 },
  { id: 'hat-trick', name: 'Hat Trick', desc: 'Three missions in one day.', test: (c) => c.maxPerDay >= 3 },
  { id: 'on-fire', name: 'On Fire', desc: 'Five missions in one day.', test: (c) => c.maxPerDay >= 5 },
  { id: 'well-rounded', name: 'Well-Rounded', desc: 'Finished every kind of mission in a single week.', test: (c) => c.wellRounded },
  { id: 'thunder', name: 'Tuesday–Thursday Thunder', desc: 'Finished missions on a Tuesday and a Thursday in the same week.', test: (c) => c.tueThu },

  // ---- conversations ----
  { id: 'ice-breaker', name: 'Ice Breaker', desc: 'Moved your first real conversation forward.', test: (c) => c.s.convos >= 1 },
  { id: 'door-opener', name: 'Door Opener', desc: '10 conversations moved forward.', test: (c) => c.s.convos >= 10 },
  { id: 'people-person', name: 'People Person', desc: '25 conversations moved forward.', test: (c) => c.s.convos >= 25 },
  { id: 'echo', name: 'Echo', desc: 'Someone wrote back.', test: (c) => c.replies >= 1 },
  { id: 'rapport', name: 'Rapport', desc: 'Five people wrote back.', test: (c) => c.replies >= 5 },

  // ---- editing ----
  { id: 'final-cut', name: 'Final Cut', desc: 'Finished your first edit.', test: (c) => c.s.edits >= 1 },
  { id: 'clean-cut', name: 'Clean Cut', desc: 'Landed an edit inside the time budget.', test: (c) => c.s.cleanEdits >= 1 },
  { id: 'the-closer', name: 'The Closer', desc: 'Took the extra minutes, named the fix, and finished it.', test: (c) => c.s.editsExtended >= 1 },
  { id: 'cutting-room', name: 'Cutting Room Regular', desc: '10 edits finished.', test: (c) => c.s.edits >= 10 },
  { id: 'revenue-first', name: 'Revenue First', desc: 'Did the harder thing before the editing. Five times.', test: (c) => c.s.revenueFirst >= 5 },

  // ---- coming back ----
  { id: 'boomerang', name: 'Boomerang', desc: 'Saved your place, came back, and finished.', test: (c) => c.s.resumes >= 1 },
  { id: 'always-back', name: 'Always Comes Back', desc: 'Returned to five saved missions.', test: (c) => c.s.resumes >= 5 },
  { id: 'comeback-kid', name: 'Comeback Kid', desc: 'Took a few days off and picked it right back up. No guilt.', test: (c) => c.s.comebacks >= 1 },

  // ---- sessions, tasks, blocks ----
  { id: 'earned-it', name: 'Earned It', desc: 'Played your first gaming session.', test: (c) => c.s.sessions >= 1 },
  { id: 'player-one', name: 'Player One', desc: '10 well-earned sessions.', test: (c) => c.s.sessions >= 10 },
  { id: 'checkmate', name: 'Checkmate', desc: '25 tasks checked off.', test: (c) => c.s.tasksDone >= 25 },
  { id: 'list-slayer', name: 'List Slayer', desc: '100 tasks checked off.', test: (c) => c.s.tasksDone >= 100 },
  { id: 'anchored', name: 'Anchored', desc: '100 schedule blocks checked off.', test: (c) => c.s.blocks >= 100 },

  // ---- streaks (days with any progress) ----
  { id: 'three-peat', name: 'Three-Peat', desc: 'Three days in a row.', test: (c) => c.bestStreak >= 3 },
  { id: 'seven-strong', name: 'Seven Strong', desc: 'A full week of showing up.', test: (c) => c.bestStreak >= 7 },
  { id: 'locked-in', name: 'Locked In', desc: 'Fourteen days in a row.', test: (c) => c.bestStreak >= 14 },
  { id: 'iron-routine', name: 'Iron Routine', desc: 'Thirty days in a row.', test: (c) => c.bestStreak >= 30 },

  // ---- habits and quirks ----
  { id: 'shrink-the-task', name: 'Shrink the Task', desc: 'Shrank the day and still showed up.', test: (c) => c.s.minChecks >= 3 },
  { id: 'squirrel-whisperer', name: 'Squirrel Whisperer', desc: 'Parked 10 ideas instead of chasing them.', test: (c) => c.s.parked >= 10 },
  { id: 'early-bird', name: 'Early Bird', desc: 'Finished a mission before 9 a.m.', test: (c) => c.s.morning >= 1 },
  { id: 'dawn-patrol', name: 'Dawn Patrol', desc: '10 missions finished before 9 a.m.', test: (c) => c.s.morning >= 10 },
  { id: 'shape-shifter', name: 'Shape-Shifter', desc: 'Morphed ten times.', test: (c) => c.s.morphs >= 10 },

  // ---- Sunday ----
  { id: 'sunday-strategist', name: 'Sunday Strategist', desc: 'Wrote your first weekly reflection.', test: (c) => c.reflections >= 1 },
  { id: 'one-small-change', name: 'One Small Change', desc: 'Chose an adjustment for next week.', test: (c) => c.adjustments >= 1 },
  { id: 'course-corrector', name: 'Course Corrector', desc: 'Reflected on four different weeks.', test: (c) => c.reflections >= 4 },

  // ---- gear and forms ----
  { id: 'power-surge', name: 'Power Surge', desc: 'Powered up into a super mode.', test: (c) => !!(c.q.loadout.superOn && c.q.loadout.superMode) },
  { id: 'beastmaster', name: 'Beastmaster', desc: 'Called your guardian beast.', test: (c) => !!c.q.loadout.beast },
  { id: 'shielded', name: 'Shielded', desc: 'Earned the Chest Shield.', test: (c) => !!c.q.owned.shield },
  { id: 'two-wheels', name: 'On Two Wheels', desc: 'Got the motorcycle.', test: (c) => !!c.q.owned.bike },
  { id: 'sword-bearer', name: 'Sword Bearer', desc: 'Earned the Guardian Blade.', test: (c) => ownedWeapons(c.q).includes('guardian-blade') },
  { id: 'full-arsenal', name: 'Full Arsenal', desc: 'Own every weapon.', test: (c) => ownedWeapons(c.q).length >= 7 },
  { id: 'formation', name: 'Formation Commander', desc: 'Five beasts answered the call.', test: (c) => megazordAvailable(c.q) },
  { id: 'beast-tamer', name: 'Beast Tamer', desc: 'All six guardian beasts. Together.', test: (c) => ultraAvailable(c.q) },
];
