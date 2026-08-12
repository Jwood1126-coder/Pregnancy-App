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

test('every week resolves to a silhouette, and crown-heel weeks have a heelY', () => {
  for (const w of WEEK_NUMBERS) {
    const sil = silhouetteForWeek(w);
    assert.ok(sil, `week ${w}: no silhouette`);
    assert.ok(
      w >= sil.minWeek && w <= sil.maxWeek,
      `week ${w}: matched silhouette "${sil.id}" covering ${sil.minWeek}–${sil.maxWeek}`
    );
    assert.ok(sil.rumpY > sil.crownY, `${sil.id}: rumpY must sit below crownY`);
    assert.ok(typeof sil.path === 'string' && sil.path.length > 0, `${sil.id}: empty path`);
    assert.ok(sil.viewBox?.w > 0 && sil.viewBox?.h > 0, `${sil.id}: bad viewBox`);

    if (SIZE_TABLE[w].basis === 'crown-heel') {
      assert.ok(
        typeof sil.heelY === 'number' && Number.isFinite(sil.heelY),
        `week ${w} is measured crown-heel but silhouette "${sil.id}" has no heelY`
      );
      assert.ok(sil.heelY > sil.rumpY, `${sil.id}: heelY must sit below rumpY`);
      // Pose honesty: crown→heel must be essentially the whole drawing.
      assert.ok(
        sil.heelY - sil.crownY >= 0.9 * sil.viewBox.h,
        `${sil.id}: crown→heel spans only ${(sil.heelY - sil.crownY).toFixed(1)} of ${sil.viewBox.h} viewBox units — legs are too curled for a crown-heel scale`
      );
    }
  }
});

test('silhouette ranges tile weeks 4–42 without gaps or overlaps', () => {
  const ordered = [...SILHOUETTES].sort((a, b) => a.minWeek - b.minWeek);
  assert.equal(ordered.length, 5, 'PLAN specifies five stage silhouettes');
  assert.equal(ordered[0].minWeek, MIN_CONTENT_WEEK);
  assert.equal(ordered[ordered.length - 1].maxWeek, MAX_CONTENT_WEEK);
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
