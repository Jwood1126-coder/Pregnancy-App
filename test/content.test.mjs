/**
 * Content validation suite — docs/PLAN.md § "Validation gates", item 2.
 *
 * Everything here reads the shipped data modules directly (no DOM, no network),
 * so it is a true gate on what the app will serve.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  ALL_WEEKS,
  getWeek,
  SAFETY,
  safetyForWeek
} from '../app/js/data/weeks/index.js';
import { SIZE_TABLE } from '../app/js/data/sizes.js';
import { RED_FLAGS_TEXT } from '../app/js/components/today/redFlags.js';
import { DISCLAIMER_TEXT } from '../app/js/components/disclaimer.js';
import { silhouetteForWeek, SILHOUETTES } from '../app/js/features/size/silhouettes.js';
import {
  CRITICAL_WINDOWS,
  ALWAYS_AVOID,
  GENERAL_TIPS,
  windowsForWeek
} from '../app/js/data/guide.js';
import { EVIDENCE_LABEL, evidenceKey } from '../app/js/components/guide/evidence.js';
import { MIN_CONTENT_WEEK, MAX_CONTENT_WEEK, trimesterOf } from '../app/js/lib/weekMath.js';

import { weeks04to12 } from '../app/js/data/weeks/weeks04to12.js';
import { weeks13to20 } from '../app/js/data/weeks/weeks13to20.js';
import { weeks21to28 } from '../app/js/data/weeks/weeks21to28.js';
import { weeks29to35 } from '../app/js/data/weeks/weeks29to35.js';
import { weeks36to42 } from '../app/js/data/weeks/weeks36to42.js';

/** The raw authored chunks, before merging with the size table. */
const CHUNKS = [
  ['weeks04to12', weeks04to12],
  ['weeks13to20', weeks13to20],
  ['weeks21to28', weeks21to28],
  ['weeks29to35', weeks29to35],
  ['weeks36to42', weeks36to42]
];

/** Every authored week record, flattened across chunks (duplicates included). */
const AUTHORED = CHUNKS.flatMap(([name, chunk]) =>
  (chunk ?? []).map((week) => ({ chunk: name, week }))
);

/** Weeks 4–42 inclusive. */
const WEEK_NUMBERS = Array.from(
  { length: MAX_CONTENT_WEEK - MIN_CONTENT_WEEK + 1 },
  (_, i) => MIN_CONTENT_WEEK + i
);

/** Mandatory to-dos: week → required ids (docs/PLAN.md § Content rules). */
const REQUIRED_TODOS = {
  4: ['w4-prenatal-vitamin'],
  8: ['w8-first-visit'],
  10: ['w10-nipt'],
  11: ['w11-nt-scan'],
  18: ['w18-anatomy-scan'],
  24: ['w24-glucose'],
  27: ['w27-tdap'],
  28: ['w28-kick-counts', 'w28-rhogam'],
  30: ['w30-pediatrician'],
  32: ['w32-birth-plan'],
  35: ['w35-hospital-bag'],
  36: ['w36-car-seat', 'w36-gbs']
};

/** Phrases that must never appear anywhere in the content. */
const BANNED_PHRASES = ['guaranteed', 'perfectly safe', 'never worry'];

/**
 * Crude size-leak check: a digit immediately followed by a space and a unit the
 * UI renders itself. Prose must never restate length or weight numbers.
 */
const SIZE_LEAK_RE = /\d\s(in|cm|oz|lb|g)\b/;

/** The diet tags the schema allows. */
const DIET_TAGS = new Set([
  'vegetarian',
  'vegan',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher'
]);

/**
 * Every string a week contributes to the reading experience.
 * @param {any} week
 * @returns {string[]}
 */
function proseOf(week) {
  return [
    ...(week.baby ?? []),
    ...(week.body ?? []),
    week.nutrition?.focus ?? '',
    week.nutrition?.why ?? '',
    ...(week.nutrition?.eat ?? []).map((e) => e?.idea ?? ''),
    week.nutrition?.safety ?? '',
    ...(week.todos ?? []).map((t) => t?.label ?? '')
  ];
}

/* ---------------------------------------------------------------- coverage */

test('weeks 4–42 are each authored exactly once across the chunks', () => {
  /** @type {Map<number, string[]>} */
  const seen = new Map();
  for (const { chunk, week } of AUTHORED) {
    assert.equal(typeof week.week, 'number', `${chunk}: entry without a numeric week`);
    const where = seen.get(week.week) ?? [];
    where.push(chunk);
    seen.set(week.week, where);
  }

  const missing = WEEK_NUMBERS.filter((w) => !seen.has(w));
  assert.deepEqual(missing, [], `weeks with no authored content: ${missing.join(', ')}`);

  const duplicated = [...seen.entries()]
    .filter(([, where]) => where.length > 1)
    .map(([w, where]) => `${w} (${where.join(' + ')})`);
  assert.deepEqual(duplicated, [], `weeks authored more than once: ${duplicated.join(', ')}`);

  const stray = [...seen.keys()].filter(
    (w) => w < MIN_CONTENT_WEEK || w > MAX_CONTENT_WEEK
  );
  assert.deepEqual(stray, [], `weeks outside 4–42: ${stray.join(', ')}`);
});

test('getWeek() returns a complete merged record for every week 4–42', () => {
  for (const w of WEEK_NUMBERS) {
    const week = getWeek(w);
    assert.ok(week, `getWeek(${w}) returned null`);
    assert.equal(week.week, w);
    assert.equal(week.trimester, trimesterOf(w), `week ${w}: wrong trimester`);
    assert.equal(typeof week.lengthMm, 'number', `week ${w}: no lengthMm`);
    assert.equal(typeof week.weightG, 'number', `week ${w}: no weightG`);
    assert.ok(
      week.basis === 'crown-rump' || week.basis === 'crown-heel',
      `week ${w}: bad basis ${week.basis}`
    );
    assert.equal(typeof week.comparison?.name, 'string', `week ${w}: no comparison name`);
  }
  assert.equal(ALL_WEEKS.length, WEEK_NUMBERS.length);
  assert.ok(getWeek(3) === null && getWeek(43) === null, 'out-of-range lookups must be null');
});

/* ------------------------------------------------------------------- shape */

test('paragraph counts and non-empty strings', () => {
  for (const { chunk, week } of AUTHORED) {
    const at = `${chunk} week ${week.week}`;

    assert.ok(Array.isArray(week.baby), `${at}: baby must be an array`);
    assert.ok(
      week.baby.length >= 2 && week.baby.length <= 4,
      `${at}: baby has ${week.baby.length} paragraphs (want 2–4)`
    );

    assert.ok(Array.isArray(week.body), `${at}: body must be an array`);
    assert.ok(
      week.body.length >= 1 && week.body.length <= 3,
      `${at}: body has ${week.body.length} paragraphs (want 1–3)`
    );

    for (const [field, paragraphs] of [['baby', week.baby], ['body', week.body]]) {
      paragraphs.forEach((p, i) => {
        assert.equal(typeof p, 'string', `${at}: ${field}[${i}] is not a string`);
        assert.ok(p.trim().length > 0, `${at}: ${field}[${i}] is empty`);
      });
    }
  }
});

test('nutrition: focus, why, and 4–6 concrete eat ideas', () => {
  for (const { chunk, week } of AUTHORED) {
    const at = `${chunk} week ${week.week}`;
    const n = week.nutrition;
    assert.ok(n && typeof n === 'object', `${at}: no nutrition block`);

    assert.equal(typeof n.focus, 'string', `${at}: nutrition.focus must be a string`);
    assert.ok(n.focus.trim().length > 0, `${at}: nutrition.focus is empty`);
    assert.equal(typeof n.why, 'string', `${at}: nutrition.why must be a string`);
    assert.ok(n.why.trim().length > 0, `${at}: nutrition.why is empty`);

    assert.ok(Array.isArray(n.eat), `${at}: nutrition.eat must be an array`);
    assert.ok(
      n.eat.length >= 4 && n.eat.length <= 6,
      `${at}: ${n.eat.length} eat ideas (want 4–6)`
    );
    for (const [i, idea] of n.eat.entries()) {
      assert.equal(typeof idea?.idea, 'string', `${at}: eat[${i}].idea must be a string`);
      assert.ok(idea.idea.trim().length > 0, `${at}: eat[${i}].idea is empty`);
      if (idea.tags !== undefined) {
        assert.ok(Array.isArray(idea.tags), `${at}: eat[${i}].tags must be an array`);
        for (const tag of idea.tags) {
          assert.ok(DIET_TAGS.has(tag), `${at}: eat[${i}] has unknown diet tag "${tag}"`);
        }
      }
    }
  }
});

/* ------------------------------------------------------------ safety rotation */

test('every safety reminder is exactly SAFETY[(week - 4) % 7]', () => {
  assert.equal(SAFETY.length, 7, 'the rotation must hold exactly 7 reminders');
  for (const { chunk, week } of AUTHORED) {
    const expected = SAFETY[(week.week - MIN_CONTENT_WEEK) % SAFETY.length];
    assert.equal(
      week.nutrition?.safety,
      expected,
      `${chunk} week ${week.week}: safety reminder is off the rotation`
    );
    assert.equal(safetyForWeek(week.week), expected);
  }
});

/* ---------------------------------------------------------------- to-dos */

test('mandatory to-do ids appear in their weeks', () => {
  for (const [weekNo, ids] of Object.entries(REQUIRED_TODOS)) {
    const week = getWeek(Number(weekNo));
    assert.ok(week, `week ${weekNo} is missing entirely`);
    const present = new Set((week.todos ?? []).map((t) => t.id));
    for (const id of ids) {
      assert.ok(present.has(id), `week ${weekNo}: required to-do "${id}" is missing`);
    }
  }
});

test('to-do ids are globally unique, well-formed, and w{week}- prefixed', () => {
  /** @type {Map<string, number[]>} */
  const seen = new Map();
  for (const { chunk, week } of AUTHORED) {
    const at = `${chunk} week ${week.week}`;
    assert.ok(Array.isArray(week.todos), `${at}: todos must be an array`);
    for (const todo of week.todos) {
      assert.equal(typeof todo?.id, 'string', `${at}: a to-do has no id`);
      assert.equal(typeof todo?.label, 'string', `${at}: to-do ${todo?.id} has no label`);
      assert.ok(todo.label.trim().length > 0, `${at}: to-do ${todo.id} has an empty label`);
      assert.match(
        todo.id,
        new RegExp(`^w${week.week}-[a-z0-9]+(?:-[a-z0-9]+)*$`),
        `${at}: to-do id "${todo.id}" must be w${week.week}-{kebab}`
      );
      const where = seen.get(todo.id) ?? [];
      where.push(week.week);
      seen.set(todo.id, where);
    }
  }
  const dupes = [...seen.entries()].filter(([, where]) => where.length > 1);
  assert.deepEqual(
    dupes.map(([id]) => id),
    [],
    `duplicate to-do ids: ${dupes.map(([id, where]) => `${id} (weeks ${where.join(', ')})`).join('; ')}`
  );
});

/* -------------------------------------------------------------- prose rules */

test('prose never restates the length or weight numbers the UI renders', () => {
  for (const { chunk, week } of AUTHORED) {
    for (const paragraph of [...week.baby, ...week.body]) {
      const hit = SIZE_LEAK_RE.exec(paragraph);
      assert.equal(
        hit,
        null,
        `${chunk} week ${week.week}: prose leaks a measurement ("${hit?.[0]}") — ${paragraph.slice(0, 80)}…`
      );
    }
  }
});

test('banned phrases appear nowhere in the content', () => {
  for (const { chunk, week } of AUTHORED) {
    for (const text of proseOf(week)) {
      const lower = String(text).toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        assert.ok(
          !lower.includes(phrase),
          `${chunk} week ${week.week}: banned phrase "${phrase}" in "${String(text).slice(0, 80)}…"`
        );
      }
    }
  }
});

/* ------------------------------------------------- verbatim safety surfaces */

test('the red-flag card is Appendix A, word for word', () => {
  assert.equal(
    RED_FLAGS_TEXT,
    'Call your OB or midwife right away for: vaginal bleeding · severe abdominal pain · ' +
      'severe headache, vision changes, or sudden swelling of your face or hands · ' +
      'fever of 100.4 °F (38 °C) or higher · fluid leaking from the vagina · ' +
      'regular contractions before 37 weeks · a clear drop in your baby\'s movement after 28 weeks. ' +
      'If you have thoughts of harming yourself, call or text 988 — you deserve support, right now.'
  );
});

test('the disclaimer is Appendix A, word for word', () => {
  assert.equal(
    DISCLAIMER_TEXT,
    'For information only — not medical advice. Your OB or midwife knows you and your baby best.'
  );
});

/* ---------------------------------------------------------------- size table */

test('SIZE_TABLE covers weeks 4–42 with complete rows', () => {
  const keys = Object.keys(SIZE_TABLE).map(Number).sort((a, b) => a - b);
  assert.deepEqual(keys, WEEK_NUMBERS, 'SIZE_TABLE must hold exactly weeks 4–42');

  for (const w of WEEK_NUMBERS) {
    const row = SIZE_TABLE[w];
    assert.ok(Number.isFinite(row.lengthMm) && row.lengthMm > 0, `week ${w}: bad lengthMm`);
    assert.ok(Number.isFinite(row.weightG) && row.weightG > 0, `week ${w}: bad weightG`);
    assert.equal(
      row.basis,
      w < 20 ? 'crown-rump' : 'crown-heel',
      `week ${w}: wrong measurement basis`
    );
    assert.equal(typeof row.comparison?.name, 'string', `week ${w}: bad comparison`);
    assert.ok(row.comparison.name.length > 0, `week ${w}: empty comparison name`);
    assert.equal(typeof row.comparison?.emoji, 'string', `week ${w}: bad comparison emoji`);
  }

  // Lengths and weights only ever grow.
  for (let i = 1; i < WEEK_NUMBERS.length; i += 1) {
    const prev = SIZE_TABLE[WEEK_NUMBERS[i - 1]];
    const cur = SIZE_TABLE[WEEK_NUMBERS[i]];
    assert.ok(cur.weightG > prev.weightG || cur.weightG === prev.weightG,
      `week ${WEEK_NUMBERS[i]}: weight goes backwards`);
    if (prev.basis === cur.basis) {
      assert.ok(cur.lengthMm > prev.lengthMm, `week ${WEEK_NUMBERS[i]}: length goes backwards`);
    }
  }
});

test('SIZE_TABLE matches Appendix B spot-checks', () => {
  assert.deepEqual(
    { ...SIZE_TABLE[17], comparison: undefined },
    { lengthMm: 130, basis: 'crown-rump', weightG: 140, comparison: undefined }
  );
  assert.deepEqual(
    { ...SIZE_TABLE[20], comparison: undefined },
    { lengthMm: 256, basis: 'crown-heel', weightG: 300, comparison: undefined }
  );
  assert.deepEqual(
    { ...SIZE_TABLE[40], comparison: undefined },
    { lengthMm: 512, basis: 'crown-heel', weightG: 3460, comparison: undefined }
  );
  // "<1 g" rows are stored as 0.5.
  assert.equal(SIZE_TABLE[4].weightG, 0.5);
  assert.equal(SIZE_TABLE[4].lengthMm, 1);
  assert.equal(SIZE_TABLE[42].lengthMm, 517);
  assert.equal(SIZE_TABLE[42].weightG, 3700);
});

/* --------------------------------------------------------------- PWA shell */

test('the service worker precaches every shipped asset', () => {
  const appDir = fileURLToPath(new URL('../app/', import.meta.url));

  /**
   * Every file under `app/`, as a `./`-relative URL.
   * @param {string} dir
   * @param {string} prefix
   * @returns {string[]}
   */
  function walk(dir, prefix) {
    /** @type {string[]} */
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) out.push(...walk(`${dir}${entry.name}/`, `${prefix}${entry.name}/`));
      else out.push(`${prefix}${entry.name}`);
    }
    return out;
  }

  const sw = readFileSync(`${appDir}sw.js`, 'utf8');
  const block = /const PRECACHE = \[([\s\S]*?)\];/.exec(sw);
  assert.ok(block, 'sw.js must declare a PRECACHE array');
  const precached = new Set(
    [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  );

  assert.ok(precached.has('./'), 'the start URL must be precached');

  /* sw.js registers itself; everything else the browser fetches must be listed. */
  const shipped = walk(appDir, './').filter((f) => f !== './sw.js');
  const missing = shipped.filter((f) => !precached.has(f));
  assert.deepEqual(missing, [], `assets missing from the sw.js precache: ${missing.join(', ')}`);

  const stale = [...precached].filter((f) => f !== './' && !shipped.includes(f));
  assert.deepEqual(stale, [], `sw.js precaches files that do not exist: ${stale.join(', ')}`);
});

test('the service-worker cache generation tracks the app version', () => {
  const appDir = fileURLToPath(new URL('../app/', import.meta.url));
  const sw = readFileSync(`${appDir}sw.js`, 'utf8');
  const settings = readFileSync(`${appDir}js/screens/settings.js`, 'utf8');

  const swVersion = /const CACHE_VERSION = '([^']+)'/.exec(sw);
  assert.ok(swVersion, 'sw.js must declare CACHE_VERSION');

  const appVersion = /export const APP_VERSION = '([^']+)'/.exec(settings);
  assert.ok(appVersion, 'settings.js must declare APP_VERSION');

  assert.equal(
    swVersion[1],
    appVersion[1],
    'sw.js CACHE_VERSION must match APP_VERSION — otherwise a release reuses the old cache'
  );

  const pkg = JSON.parse(
    readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')
  );
  assert.equal(pkg.version, appVersion[1], 'package.json version must match APP_VERSION');

  assert.match(sw, /const CACHE_NAME = `little-one-v\$\{CACHE_VERSION\}`/,
    'CACHE_NAME must be derived from CACHE_VERSION, not written out by hand');
});

/* -------------------------------------------------------------- silhouettes */

/**
 * The `spanFraction` acceptance bands from docs/PLAN.md § "Curled-pose honesty
 * rule". Crown-rump stages are measured on the very curl that is drawn, so
 * their fraction sits at ~1; crown-heel stages quote a *stretched* length that
 * a curled figure cannot span, and a curled fetus occupies ~66–72% of it.
 */
const SPAN_FRACTION_BANDS = {
  embryo: [0.95, 1.1],
  early: [0.95, 1.1],
  mid: [0.6, 0.75],
  late: [0.6, 0.75],
  term: [0.6, 0.75]
};

test('every week resolves to a silhouette covering it', () => {
  for (const w of WEEK_NUMBERS) {
    const sil = silhouetteForWeek(w);
    assert.ok(sil, `week ${w}: no silhouette`);
    assert.ok(
      w >= sil.minWeek && w <= sil.maxWeek,
      `week ${w}: matched silhouette "${sil.id}" covering ${sil.minWeek}–${sil.maxWeek}`
    );
  }
});

test('silhouette ranges tile weeks 4–42 without gaps or overlaps', () => {
  const ordered = [...SILHOUETTES].sort((a, b) => a.minWeek - b.minWeek);
  assert.equal(ordered.length, 5, 'PLAN specifies five stage silhouettes');
  assert.deepEqual(
    ordered.map((s) => s.id),
    ['embryo', 'early', 'mid', 'late', 'term'],
    'stage ids must be the five PLAN stages, in week order'
  );
  assert.equal(ordered[0].minWeek, MIN_CONTENT_WEEK);
  assert.equal(ordered[ordered.length - 1].maxWeek, MAX_CONTENT_WEEK);
  for (const s of ordered) {
    assert.ok(s.maxWeek >= s.minWeek, `${s.id}: empty week range`);
  }
  for (let i = 1; i < ordered.length; i += 1) {
    assert.equal(
      ordered[i].minWeek,
      ordered[i - 1].maxWeek + 1,
      `silhouettes "${ordered[i - 1].id}" and "${ordered[i].id}" do not tile cleanly`
    );
  }
  const ids = new Set(ordered.map((s) => s.id));
  assert.equal(ids.size, ordered.length, 'silhouette ids must be unique');
});

test('silhouette landmarks are ordered and inside the viewBox', () => {
  for (const sil of SILHOUETTES) {
    assert.ok(sil.viewBox?.w > 0 && sil.viewBox?.h > 0, `${sil.id}: bad viewBox`);
    assert.ok(sil.crownY < sil.rumpY, `${sil.id}: crownY must sit above rumpY`);
    /* `lowestY` is the lowest point of the whole figure, which may be the rump
       itself (a tucked-in term baby) or a little past it (an embryo's tail, a
       tucked heel) — never above it, and never outside the box. */
    assert.ok(sil.crownY < sil.lowestY, `${sil.id}: crownY must sit above lowestY`);
    assert.ok(
      sil.lowestY <= sil.viewBox.h,
      `${sil.id}: lowestY ${sil.lowestY} falls outside a ${sil.viewBox.h}-unit viewBox`
    );
    assert.ok(sil.crownY >= 0, `${sil.id}: crownY must sit inside the viewBox`);
  }
});

test('spanFraction is honest for each stage', () => {
  for (const sil of SILHOUETTES) {
    const band = SPAN_FRACTION_BANDS[sil.id];
    assert.ok(band, `${sil.id}: no spanFraction band declared for this stage`);
    const [lo, hi] = band;
    assert.equal(typeof sil.spanFraction, 'number', `${sil.id}: spanFraction must be a number`);
    assert.ok(
      sil.spanFraction >= lo && sil.spanFraction <= hi,
      `${sil.id}: spanFraction ${sil.spanFraction} outside [${lo}, ${hi}]`
    );
  }

  /* The bands are not arbitrary: they follow the measurement basis of the
     weeks each stage covers. A stage whose weeks are quoted crown-heel
     (stretched) must be the curled ~0.7 kind, and vice versa. */
  for (const w of WEEK_NUMBERS) {
    const sil = silhouetteForWeek(w);
    const stretched = SIZE_TABLE[w].basis === 'crown-heel';
    assert.equal(
      sil.spanFraction < 0.9,
      stretched,
      `week ${w} (${SIZE_TABLE[w].basis}) and silhouette "${sil.id}" ` +
        `(spanFraction ${sil.spanFraction}) disagree about whether the quoted ` +
        'length is a stretched one'
    );
  }
});

test('every silhouette path is a non-empty closed path', () => {
  for (const sil of SILHOUETTES) {
    assert.equal(typeof sil.path, 'string', `${sil.id}: path must be a string`);
    const d = sil.path.trim();
    assert.ok(d.length > 0, `${sil.id}: empty path`);
    assert.ok(d.startsWith('M'), `${sil.id}: path must start with an absolute moveto`);
    assert.ok(
      d.endsWith('Z') || d.endsWith('z'),
      `${sil.id}: path must be closed — it ends "${d.slice(-1)}"`
    );
    /* One subpath: a second `M` would be a second shape, and the fill rule,
       the crown landmark and the ghost outline all assume a single contour. */
    assert.equal(
      (d.match(/[Mm]/g) ?? []).length,
      1,
      `${sil.id}: path must be a single subpath`
    );
  }
});

/* -------------------------------------------------------------------- guide */

/**
 * Guide data gates. The Guide's whole promise is calibrated honesty — "what
 * matters when, and how sure we are" — so its data has to be structurally
 * sound (unique ids, real week ranges, a valid grade on every entry) and free
 * of the borrowed precision that makes soft evidence look hard.
 */

/** Every graded Guide entry, flattened with the set it came from. */
const GUIDE_ENTRIES = [
  ...CRITICAL_WINDOWS.map((e) => ['CRITICAL_WINDOWS', e]),
  ...ALWAYS_AVOID.map((e) => ['ALWAYS_AVOID', e]),
  ...GENERAL_TIPS.map((e) => ['GENERAL_TIPS', e])
];

test('guide ids are present and globally unique', () => {
  const seen = new Map();
  for (const [set, entry] of GUIDE_ENTRIES) {
    assert.ok(
      typeof entry.id === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id),
      `${set}: id "${entry.id}" must be a non-empty kebab-case string`
    );
    assert.ok(!seen.has(entry.id), `duplicate guide id "${entry.id}" (${seen.get(entry.id)} and ${set})`);
    seen.set(entry.id, set);
  }
  assert.equal(seen.size, GUIDE_ENTRIES.length);
});

test('every critical window covers a real span inside weeks 4–42', () => {
  for (const w of CRITICAL_WINDOWS) {
    assert.ok(Array.isArray(w.weeks) && w.weeks.length === 2, `${w.id}: weeks must be [start, end]`);
    const [start, end] = w.weeks;
    for (const [name, value] of [['start', start], ['end', end]]) {
      assert.ok(Number.isInteger(value), `${w.id}: ${name} week must be an integer, got ${value}`);
      assert.ok(
        value >= MIN_CONTENT_WEEK && value <= MAX_CONTENT_WEEK,
        `${w.id}: ${name} week ${value} is outside ${MIN_CONTENT_WEEK}–${MAX_CONTENT_WEEK}`
      );
    }
    assert.ok(start <= end, `${w.id}: start week ${start} must not be after end week ${end}`);
  }
});

test('every guide entry carries a valid evidence grade', () => {
  const grades = Object.keys(EVIDENCE_LABEL);
  for (const [set, entry] of GUIDE_ENTRIES) {
    assert.ok(
      grades.includes(entry.evidence),
      `${set} → ${entry.id}: evidence "${entry.evidence}" is not one of ${grades.join(', ')}`
    );
  }
});

test('an unknown evidence grade fails safe to the weakest tier', () => {
  /* The badge must never overstate on a typo: understate, never overstate. */
  for (const bad of [undefined, null, '', 'STRONG', 'excellent', 42, {}]) {
    assert.equal(evidenceKey(bad), 'early', `evidenceKey(${JSON.stringify(bad)}) must fail safe`);
  }
  for (const good of Object.keys(EVIDENCE_LABEL)) {
    assert.equal(evidenceKey(good), good);
  }
});

test('every guide entry has the prose the UI renders', () => {
  /** @param {string} label @param {unknown} value */
  const filled = (label, value) => {
    assert.equal(typeof value, 'string', `${label} must be a string`);
    assert.ok(String(value).trim().length > 0, `${label} must not be empty`);
  };
  for (const w of CRITICAL_WINDOWS) {
    for (const field of ['title', 'developing', 'action', 'evidenceNote']) {
      filled(`window ${w.id}.${field}`, w[field]);
    }
  }
  for (const item of [...ALWAYS_AVOID, ...GENERAL_TIPS]) {
    for (const field of ['label', 'detail']) filled(`${item.id}.${field}`, item[field]);
  }
});

test('guide prose never borrows precision it has not earned', () => {
  /* No study years, no author citations, no effect-size percentages: the file
     names bodies (ACOG, CDC, Cochrane…) and nothing more specific. */
  const BANNED = [
    [/\b(?:19|20)\d{2}\b/, 'a study year'],
    [/\bet\s+al\b/i, 'an author citation'],
    [/\d+(?:\.\d+)?\s?%/, 'an effect-size percentage'],
    [/\bpercent\b/i, 'an effect-size percentage']
  ];
  /** @type {[string, string][]} */
  const strings = [
    ...CRITICAL_WINDOWS.flatMap((w) => [
      [`${w.id}.evidenceNote`, w.evidenceNote],
      [`${w.id}.developing`, w.developing],
      [`${w.id}.action`, w.action]
    ]),
    ...ALWAYS_AVOID.map((a) => [`${a.id}.detail`, a.detail]),
    ...GENERAL_TIPS.map((t) => [`${t.id}.detail`, t.detail])
  ];
  for (const [where, text] of strings) {
    for (const [pattern, what] of BANNED) {
      assert.ok(!pattern.test(text), `${where} contains ${what}: "${text}"`);
    }
  }
});

test('windowsForWeek answers sensibly for every week 4–42', () => {
  for (const week of WEEK_NUMBERS) {
    const { active, upcoming } = windowsForWeek(week);
    assert.ok(Array.isArray(active) && Array.isArray(upcoming), `week ${week}: expected two arrays`);

    assert.ok(active.length > 0, `week ${week}: the Guide has nothing to say`);

    for (const w of active) {
      assert.ok(
        w.weeks[0] <= week && week <= w.weeks[1],
        `week ${week}: "${w.id}" (${w.weeks.join('–')}) is not actually active`
      );
    }
    for (const w of upcoming) {
      assert.ok(
        w.weeks[0] > week && w.weeks[0] <= week + 3,
        `week ${week}: "${w.id}" opens at ${w.weeks[0]}, outside the three-week lookahead`
      );
    }

    const activeIds = new Set(active.map((w) => w.id));
    for (const w of upcoming) {
      assert.ok(!activeIds.has(w.id), `week ${week}: "${w.id}" is both active and upcoming`);
    }
    assert.equal(activeIds.size, active.length, `week ${week}: active list repeats a window`);

    for (const list of [active, upcoming]) {
      for (let i = 1; i < list.length; i += 1) {
        assert.ok(
          list[i - 1].weeks[0] <= list[i].weeks[0],
          `week ${week}: results are not ordered by opening week`
        );
      }
    }

    /* Every window must be reachable: active on its own weeks. */
    for (const w of CRITICAL_WINDOWS) {
      const covers = w.weeks[0] <= week && week <= w.weeks[1];
      assert.equal(
        activeIds.has(w.id),
        covers,
        `week ${week}: "${w.id}" (${w.weeks.join('–')}) ${covers ? 'should' : 'should not'} be active`
      );
    }
  }
});

test('windowsForWeek clamps out-of-range weeks and never throws', () => {
  const low = windowsForWeek(MIN_CONTENT_WEEK);
  const high = windowsForWeek(MAX_CONTENT_WEEK);

  assert.deepEqual(
    windowsForWeek(1).active.map((w) => w.id),
    low.active.map((w) => w.id),
    'weeks before 4 clamp to week 4'
  );
  assert.deepEqual(
    windowsForWeek(60).active.map((w) => w.id),
    high.active.map((w) => w.id),
    'weeks after 42 clamp to week 42'
  );
  assert.deepEqual(
    windowsForWeek(17.8).active.map((w) => w.id),
    windowsForWeek(17).active.map((w) => w.id),
    'partial weeks floor to completed weeks'
  );

  for (const bad of [NaN, undefined, null, 'seventeen', {}]) {
    const result = windowsForWeek(/** @type {never} */ (bad));
    assert.deepEqual(
      result,
      { active: [], upcoming: [] },
      `windowsForWeek(${JSON.stringify(bad)}) must degrade to empty, not throw`
    );
  }
});
