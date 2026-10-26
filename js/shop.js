// ============================================================
// Power Points + forms: what you own, what's available, what it costs.
// Level-ups grant Power Points; spending them never lowers your level.
// All the numbers below are first guesses. Tune them here.
// ============================================================

// Power Points granted for reaching each level (level 1 grants nothing).
function ppForLevel(lv) { return lv <= 10 ? 3 : lv <= 20 ? 4 : 5; }

// Each emblem brings a weapon, a guardian beast, and a super mode.
// Tiger is yours from the start; its pack unlocks free at TIGER_PACK_LEVEL.
const TIGER_PACK_LEVEL = 2;
const FORMS = [
  { id: 'tiger', name: 'Tiger', weapon: 'short-swords', beast: 'tiger', mode: 'tiger', modeName: 'Blazing Tiger Mode', cost: 0 },
  { id: 'bison', name: 'Bison', weapon: 'battle-axe', beast: 'bison', mode: 'bison', modeName: 'Raging Bison Mode', cost: 6 },
  { id: 'lion', name: 'Lion', weapon: 'short-staff', beast: 'lion', mode: 'lion', modeName: 'Roaring Lion Mode', cost: 8 },
  { id: 'wolf', name: 'Wolf', weapon: 'daggers', beast: 'wolf', mode: 'wolf', modeName: 'Alpha Wolf Mode', cost: 10 },
  { id: 'dragon', name: 'Dragon', weapon: 'bo-staff', beast: 'dragon', mode: 'dragon', modeName: 'Legendary Dragon Mode', cost: 12 },
  { id: 'phoenix', name: 'Phoenix', weapon: 'guardian-blade', beast: 'phoenix', mode: 'phoenix', modeName: 'Burning Phoenix Mode', cost: 15 },
];
const WEAPON_NAMES = {
  gun: 'Guardian Blaster',
  'short-swords': 'Short Swords',
  'battle-axe': 'Battle Axe',
  'short-staff': 'Short Staff / Scepter',
  daggers: 'Daggers',
  'bo-staff': 'Bo Staff / Lance',
  'guardian-blade': 'Guardian Blade',
};
const BATTLIZER_NAME = 'Guardian Battlizer Mode';

// What can be bought with Power Points. Emblems must be bought in order.
const SHOP = [
  { id: 'shield', name: 'Chest Shield', desc: 'The shield. Super Modes need it.', cost: 3 },
  { id: 'blaster', name: 'Guardian Blaster', desc: 'A blaster and its holster.', cost: 2 },
  { id: 'bike', name: 'Motorcycle', desc: 'Comes with Guardian Battlizer Mode (the shield is required too).', cost: 6 },
  ...FORMS.filter((f) => f.id !== 'tiger').map((f) => ({
    id: 'emblem-' + f.id, name: `${f.name} Emblem`,
    desc: `Brings the ${WEAPON_NAMES[f.weapon]}, the ${f.name} guardian beast, and ${f.modeName}.`,
    cost: f.cost,
  })),
];

function shopDefaultLoadout() {
  return {
    emblem: 'tiger', shieldOn: false, holster: false, weapon: null, weaponHeld: false,
    superOn: false, superMode: null, beast: null,
  };
}

function ppTotal(level) { let t = 0; for (let l = 2; l <= level; l++) t += ppForLevel(l); return t; }
function ppBalance(q) { return ppTotal(levelInfo(q.xp).level) - (q.ppSpent || 0); }

function tigerPackOwned(q) { return levelInfo(q.xp).level >= TIGER_PACK_LEVEL; }
function emblemOwned(q, id) { return id === 'tiger' || !!q.owned['emblem-' + id]; }
function formOwned(q, id) { return id === 'tiger' ? tigerPackOwned(q) : emblemOwned(q, id); }

function ownedWeapons(q) {
  const out = [];
  if (q.owned.blaster) out.push('gun');
  FORMS.forEach((f) => { if (formOwned(q, f.id)) out.push(f.weapon); });
  return out;
}
function ownedBeasts(q) { return FORMS.filter((f) => formOwned(q, f.id)).map((f) => f.beast); }
// Megazord needs every beast except the Phoenix; the Ultra Megazord needs the Phoenix on top of those.
function megazordAvailable(q) { const b = ownedBeasts(q); return FORMS.filter((f) => f.id !== 'phoenix').every((f) => b.includes(f.beast)); }
function ultraAvailable(q) { return megazordAvailable(q) && ownedBeasts(q).includes('phoenix'); }

// Super modes need the shield. Battlizer also needs the motorcycle; each emblem's mode comes with its emblem.
function modesAvailable(q) {
  if (!q.owned.shield) return [];
  const out = [];
  if (q.owned.bike) out.push('battlizer');
  FORMS.forEach((f) => { if (emblemOwned(q, f.id)) out.push(f.mode); });
  return out;
}
function modeName(id) {
  if (id === 'battlizer') return BATTLIZER_NAME;
  const f = FORMS.find((x) => x.id === id);
  return f ? f.modeName : id;
}

function shopCanBuy(q, id) {
  const item = SHOP.find((i) => i.id === id);
  if (!item) return { ok: false, reason: 'Unknown item' };
  if (q.owned[id]) return { ok: false, reason: 'Owned' };
  const m = /^emblem-(.+)$/.exec(id);
  if (m) {
    const idx = FORMS.findIndex((f) => f.id === m[1]);
    const prev = FORMS[idx - 1];
    if (prev && !emblemOwned(q, prev.id)) return { ok: false, reason: `Get the ${prev.name} emblem first` };
  }
  const bal = ppBalance(q);
  if (bal < item.cost) return { ok: false, reason: `Need ${item.cost - bal} more point${item.cost - bal === 1 ? '' : 's'}` };
  return { ok: true, reason: '' };
}

function shopBuy(q, id) {
  const c = shopCanBuy(q, id);
  if (!c.ok) return false;
  const item = SHOP.find((i) => i.id === id);
  q.owned[id] = true;
  q.ppSpent = (q.ppSpent || 0) + item.cost;
  if (id === 'shield') q.loadout.shieldOn = true;
  if (id === 'blaster') q.loadout.holster = true;
  shopSanitize(q);
  return true;
}

// Keep the selections consistent with what's actually owned.
function shopSanitize(q) {
  const L = q.loadout;
  if (!emblemOwned(q, L.emblem)) L.emblem = 'tiger';
  if (!q.owned.shield) { L.shieldOn = false; L.superOn = false; }
  if (!q.owned.blaster) L.holster = false;
  const weapons = ownedWeapons(q);
  if (L.weapon && !weapons.includes(L.weapon)) L.weapon = null;
  if (!L.weapon) L.weaponHeld = false;
  const modes = modesAvailable(q);
  if (!modes.length) { L.superMode = null; L.superOn = false; }
  else if (!modes.includes(L.superMode)) L.superMode = modes.includes(L.emblem) ? L.emblem : modes[0];
  const beasts = ownedBeasts(q);
  const beastOk = L.beast && (beasts.includes(L.beast) || (L.beast === 'megazord' && megazordAvailable(q)) || (L.beast === 'ultra' && ultraAvailable(q)));
  if (!beastOk) L.beast = null;
}
