/**
 * Meal-kit catalog validation.
 *
 * Reads the shipped data module directly (no DOM, no network), so it is a true
 * gate on what the app will serve. The honesty assertions matter as much as the
 * shape ones: this feature is only allowed to exist because it never claims to
 * know what is actually on a family's menu.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MEAL_KIT_DISHES,
  MEAL_KIT_TAGS,
  PICKING_GUIDE,
  MEAL_KIT_FOOTNOTE,
  kitHeading,
  kitIntro,
  tagsForFocus,
  dishesForWeek,
  pickingTipForWeek
} from '../app/js/data/mealKits.js';
import { DIET_TAGS, defaultSettings, MEAL_KITS } from '../app/js/lib/storage.js';
import { ALL_WEEKS } from '../app/js/data/weeks/index.js';
import { MIN_CONTENT_WEEK, MAX_CONTENT_WEEK } from '../app/js/lib/weekMath.js';

/** Weeks 4–42 inclusive. */
const WEEK_NUMBERS = Array.from(
  { length: MAX_CONTENT_WEEK - MIN_CONTENT_WEEK + 1 },
  (_, i) => MIN_CONTENT_WEEK + i
);

/** Every string a dish puts on screen. */
function dishText(dish) {
  return [dish.name, dish.gives, dish.safety ?? ''].join(' ');
}

/**
 * Every string the feature renders, including the section's own chrome.
 *
 * The heading and intro used to live inside `components/today/mealKit.js`,
 * where the honesty gate below could not see them — and a heading reading
 * "From your HelloFresh box", sitting under a card titled "On the menu this
 * week", was exactly the claim this module forbids. They are authored in the
 * data module now so this list can cover them.
 */
function everyRenderedString() {
  return [
    ...MEAL_KIT_DISHES.map(dishText),
    ...PICKING_GUIDE,
    MEAL_KIT_FOOTNOTE,
    kitHeading('HelloFresh'),
    kitIntro('HelloFresh')
  ];
}

/* --- Catalog shape -------------------------------------------------------- */

test('the catalog is a sensible size', () => {
  assert.ok(
    MEAL_KIT_DISHES.length >= 30 && MEAL_KIT_DISHES.length <= 40,
    `expected 30–40 dishes, got ${MEAL_KIT_DISHES.length}`
  );
});

test('every dish has a non-empty id, name, and gives line', () => {
  for (const dish of MEAL_KIT_DISHES) {
    for (const field of ['id', 'name', 'gives']) {
      assert.equal(typeof dish[field], 'string', `${dish.id}: ${field} must be a string`);
      assert.ok(dish[field].trim().length > 0, `${dish.id}: ${field} must not be empty`);
    }
    assert.match(dish.id, /^[a-z0-9-]+$/, `${dish.id}: id must be kebab-case`);
    assert.ok(dish.gives.trim().length >= 40, `${dish.id}: gives should be a real line`);
  }
});

test('dish ids are unique', () => {
  const seen = new Set();
  for (const dish of MEAL_KIT_DISHES) {
    assert.ok(!seen.has(dish.id), `duplicate dish id: ${dish.id}`);
    seen.add(dish.id);
  }
});

test('every dish tag comes from the allowed set', () => {
  for (const dish of MEAL_KIT_DISHES) {
    assert.ok(Array.isArray(dish.tags), `${dish.id}: tags must be an array`);
    assert.ok(dish.tags.length > 0, `${dish.id}: needs at least one tag`);
    for (const tag of dish.tags) {
      assert.ok(MEAL_KIT_TAGS.includes(tag), `${dish.id}: unknown tag "${tag}"`);
    }
    assert.equal(new Set(dish.tags).size, dish.tags.length, `${dish.id}: duplicate tags`);
  }
});

test('every dietTag is a real DietTag', () => {
  for (const dish of MEAL_KIT_DISHES) {
    if (dish.dietTags === undefined) continue;
    assert.ok(Array.isArray(dish.dietTags), `${dish.id}: dietTags must be an array`);
    assert.ok(dish.dietTags.length > 0, `${dish.id}: omit dietTags rather than shipping []`);
    for (const tag of dish.dietTags) {
      assert.ok(DIET_TAGS.includes(tag), `${dish.id}: unknown diet tag "${tag}"`);
    }
  }
});

test('a vegan dish is also vegetarian and dairy-free', () => {
  for (const dish of MEAL_KIT_DISHES) {
    if (!dish.dietTags?.includes('vegan')) continue;
    assert.ok(dish.dietTags.includes('vegetarian'), `${dish.id}: vegan implies vegetarian`);
    assert.ok(dish.dietTags.includes('dairy-free'), `${dish.id}: vegan implies dairy-free`);
  }
});

test('safety, when present, is a real non-empty tweak', () => {
  for (const dish of MEAL_KIT_DISHES) {
    if (dish.safety === undefined || dish.safety === null) continue;
    assert.equal(typeof dish.safety, 'string', `${dish.id}: safety must be a string or null`);
    assert.ok(dish.safety.trim().length >= 20, `${dish.id}: safety line is too thin to help`);
  }
  const withSafety = MEAL_KIT_DISHES.filter((d) => d.safety);
  assert.ok(
    withSafety.length >= MEAL_KIT_DISHES.length / 2,
    'most dishes should carry a specific pregnancy tweak'
  );
});

test('every tag is served by at least three dishes', () => {
  for (const tag of MEAL_KIT_TAGS) {
    const count = MEAL_KIT_DISHES.filter((d) => d.tags.includes(tag)).length;
    assert.ok(count >= 3, `only ${count} dish(es) tagged "${tag}" — need at least 3`);
  }
});

/* --- Honesty -------------------------------------------------------------- */

test('no dish, tip, or heading claims to know this week’s menu', () => {
  /* The feature's whole licence to exist: it never pretends to see the box. */
  const banned = [
    /this week[’']?s menu/i,
    /on your menu/i,
    /in your box/i,
    /from your \w+ box/i,
    /your menu this week/i,
    /this week[’']?s line-?up/i
  ];
  for (const text of everyRenderedString()) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(text), `menu-claiming phrasing in: "${text}"`);
    }
  }
});

test('the section heading is conditional, not a statement about the box', () => {
  const head = kitHeading('HelloFresh');
  assert.match(head, /^If you get a HelloFresh box$/);
  assert.match(kitIntro('HelloFresh'), /come around on HelloFresh menus regularly/);
});

test('no banned reassurance language', () => {
  /* "Comes pasteurized" and "a safe regular" are the same mistake in different
     clothes: a verdict on food the app cannot see, in place of the label check
     or the mercury profile the reader can actually act on. */
  const banned = [
    /guarantee/i,
    /perfectly safe/i,
    /never worry/i,
    /completely safe/i,
    /comes pasteurized/i,
    /stop wondering/i,
    /\bsafe (regular|bet|choice)\b/i,
    /easy yes/i
  ];
  for (const text of everyRenderedString()) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(text), `banned phrase in: "${text}"`);
    }
  }
});

test('the whole-cut tweaks let the thermometer carry it, with no color cue', () => {
  /* 145 °F *is* medium-rare-to-medium for a whole cut; "cooked through, not
     medium-rare" pairs a correct number with a contradictory visual. No-pink
     phrasing belongs to ground meat (160 °F) and poultry (165 °F) only. */
  for (const dish of MEAL_KIT_DISHES) {
    if (!dish.safety || !/145/.test(dish.safety)) continue;
    for (const pattern of [/medium-rare/i, /\bno pink\b/i, /blushing/i, /cooked through/i]) {
      assert.ok(
        !pattern.test(dish.safety),
        `${dish.id}: a 145 °F tweak should not carry a color cue — "${dish.safety}"`
      );
    }
    assert.match(dish.safety, /rest/i, `${dish.id}: a 145 °F tweak needs the rest`);
  }
});

test('a vegan or dairy-free dish never describes dairy in its own copy', () => {
  /* The module's own rule (docstring): a dish is tagged from the dish *as
     described here*. A tag conditional on the reader removing an ingredient is
     a tag the reader cannot see the condition for. */
  const dairy = /crema|cheese|yogurt|yoghurt|butter|cream\b|ricotta|parmesan|mozzarella|feta/i;
  for (const dish of MEAL_KIT_DISHES) {
    const tags = dish.dietTags ?? [];
    if (!tags.includes('vegan') && !tags.includes('dairy-free')) continue;
    assert.ok(
      !dairy.test(dishText(dish)),
      `${dish.id}: tagged [${tags.join(', ')}] but its own copy describes dairy`
    );
  }
});

test('allergen and certification diet tags are never guessed', () => {
  /* nut-free / halal / kosher depend on the real box, which this app cannot
     see. Tagging them from a dish name is the one mistake here that could
     hurt somebody. */
  for (const dish of MEAL_KIT_DISHES) {
    for (const tag of dish.dietTags ?? []) {
      assert.ok(
        ['vegetarian', 'vegan', 'dairy-free'].includes(tag),
        `${dish.id}: "${tag}" cannot be known from a dish description`
      );
    }
  }
});

test('the footnote says menus rotate', () => {
  assert.match(MEAL_KIT_FOOTNOTE, /rotate/i);
  assert.match(MEAL_KIT_FOOTNOTE, /regulars/i);
});

/* --- Picking guide -------------------------------------------------------- */

test('PICKING_GUIDE is 8–12 non-empty strings', () => {
  assert.ok(
    PICKING_GUIDE.length >= 8 && PICKING_GUIDE.length <= 12,
    `expected 8–12 tips, got ${PICKING_GUIDE.length}`
  );
  for (const tip of PICKING_GUIDE) {
    assert.equal(typeof tip, 'string');
    assert.ok(tip.trim().length >= 30, `tip too short: "${tip}"`);
  }
  assert.equal(new Set(PICKING_GUIDE).size, PICKING_GUIDE.length, 'duplicate tips');
});

test('pickingTipForWeek is deterministic, in range, and rotates', () => {
  for (const week of WEEK_NUMBERS) {
    const tip = pickingTipForWeek(week);
    assert.ok(PICKING_GUIDE.includes(tip), `week ${week}: tip is not from the guide`);
    assert.equal(tip, pickingTipForWeek(week), `week ${week}: not deterministic`);
    assert.notEqual(tip, pickingTipForWeek(week + 1), `week ${week}: tip did not rotate`);
  }
  const seen = new Set(WEEK_NUMBERS.map(pickingTipForWeek));
  assert.equal(seen.size, PICKING_GUIDE.length, 'every tip should appear across weeks 4–42');
});

test('pickingTipForWeek never throws on odd input', () => {
  for (const bad of [NaN, undefined, null, -3, 1.7, 'seventeen', {}]) {
    const tip = pickingTipForWeek(/** @type {never} */ (bad));
    assert.ok(PICKING_GUIDE.includes(tip), `pickingTipForWeek(${String(bad)}) fell off the list`);
  }
});

/* --- Focus matching ------------------------------------------------------- */

test('tagsForFocus returns known tags for every authored focus', () => {
  for (const week of ALL_WEEKS) {
    const tags = tagsForFocus(week.nutrition.focus);
    assert.ok(tags.length > 0, `week ${week.week}: "${week.nutrition.focus}" matched nothing`);
    for (const tag of tags) {
      assert.ok(MEAL_KIT_TAGS.includes(tag), `week ${week.week}: unknown tag "${tag}"`);
    }
    assert.equal(new Set(tags).size, tags.length, `week ${week.week}: duplicate tags`);
  }
});

test('tagsForFocus maps the obvious nutrients the obvious way', () => {
  assert.ok(tagsForFocus('Iron with vitamin C').includes('iron'));
  assert.ok(tagsForFocus('DHA for the brain sprint').includes('dha'));
  assert.ok(tagsForFocus('Choline').includes('choline'));
  assert.ok(tagsForFocus('Calcium and vitamin D').includes('calcium'));
  assert.ok(tagsForFocus('Folate').includes('folate'));
  assert.ok(tagsForFocus('Fiber and fluids').includes('fiber'));
  assert.ok(tagsForFocus('Smaller meals for heartburn').includes('comfort'));
  assert.deepEqual(tagsForFocus(''), ['protein', 'fiber'], 'empty focus falls back');
  assert.deepEqual(tagsForFocus(/** @type {never} */ (null)), ['protein', 'fiber']);
});

/* --- Weekly picks --------------------------------------------------------- */

test('dishesForWeek returns 2–3 real dishes for every week, with and without diet tags', () => {
  const byId = new Map(MEAL_KIT_DISHES.map((d) => [d.id, d]));
  /** Every preference set worth checking: none, each tag alone, and a pair. */
  const dietSets = [[], ...DIET_TAGS.map((t) => [t]), ['vegan', 'dairy-free']];

  for (const week of ALL_WEEKS) {
    for (const dietTags of dietSets) {
      const label = `week ${week.week} / [${dietTags.join(',') || 'none'}]`;
      const picks = dishesForWeek({
        week: week.week,
        focus: week.nutrition.focus,
        dietTags
      });
      assert.ok(picks.length >= 2 && picks.length <= 3, `${label}: got ${picks.length} dishes`);
      const ids = picks.map((d) => d.id);
      assert.equal(new Set(ids).size, ids.length, `${label}: repeated a dish`);
      for (const dish of picks) {
        assert.equal(byId.get(dish.id), dish, `${label}: "${dish.id}" is not from the catalog`);
      }
      /* Deterministic: same inputs, same picks. */
      const again = dishesForWeek({ week: week.week, focus: week.nutrition.focus, dietTags });
      assert.deepEqual(again.map((d) => d.id), ids, `${label}: not deterministic`);
    }
  }
});

test('every pick carries the week’s leading focus tag', () => {
  /* The strong version of "matches the focus". The weak version — "shares any
     focus tag" — passed while a DHA week was quietly serving three beef
     dishes, because they all carried the secondary `protein` tag. Every tag
     has at least three dishes, so the leading tag can always fill the picks. */
  for (const week of ALL_WEEKS) {
    const focusTags = tagsForFocus(week.nutrition.focus);
    const lead = focusTags[0];
    const picks = dishesForWeek({ week: week.week, focus: week.nutrition.focus });
    for (const dish of picks) {
      assert.ok(
        dish.tags.includes(lead),
        `week ${week.week} ("${week.nutrition.focus}"): "${dish.id}" [${dish.tags.join(', ')}] ` +
          `does not serve the lead tag "${lead}"`
      );
    }
  }
});

test('a thin category shows two distinct picks rather than three near-duplicates', () => {
  /* Only four dishes are honestly DHA dishes, three of them salmon. */
  for (const week of WEEK_NUMBERS) {
    assert.equal(
      dishesForWeek({ week, focus: 'DHA for the brain sprint' }).length,
      2,
      `week ${week}: the DHA pool is thin and should show two`
    );
    assert.equal(
      dishesForWeek({ week, focus: 'Iron with vitamin C' }).length,
      3,
      `week ${week}: the iron pool is deep and should show three`
    );
  }
});

test('a vitamin-D week surfaces fish, which is where the vitamin D is', () => {
  /* Fatty fish and fortified dairy are the dietary sources. `poolForFocus`
     stops as soon as the lead tag fills, so ordering this rule `calcium` first
     made the fish structurally unreachable and served cheese instead. */
  for (const focus of ['Vitamin D', 'Calcium and vitamin D']) {
    for (const week of WEEK_NUMBERS) {
      const picks = dishesForWeek({ week, focus });
      assert.ok(
        picks.some((d) => d.tags.includes('dha')),
        `week ${week} ("${focus}"): no fish dish among [${picks.map((d) => d.id).join(', ')}]`
      );
    }
  }
});

test('a fiber week serves legumes and whole grains, not incidental veg', () => {
  /* `fiber` used to hang off a cabbage slaw and a bowl of white-rice fried
     rice, so the constipation week (30) served salmon burgers and pork bánh
     mì while the lentils and chickpeas sat unused. */
  const realFiber = /bean|lentil|chickpea|tofu|couscous|burrito|taco/i;
  for (const focus of ['Fiber', 'Fiber and fluids', 'Whole grains']) {
    for (const week of WEEK_NUMBERS) {
      for (const dish of dishesForWeek({ week, focus })) {
        assert.ok(
          realFiber.test(`${dish.name} ${dish.gives}`),
          `week ${week} ("${focus}"): "${dish.id}" leads with no legume or grain`
        );
      }
    }
  }
});

test('a DHA week shows fish, not whatever else has protein', () => {
  for (const week of WEEK_NUMBERS) {
    const picks = dishesForWeek({ week, focus: 'DHA from low-mercury fish' });
    for (const dish of picks) {
      assert.ok(dish.tags.includes('dha'), `week ${week}: "${dish.id}" is not a DHA dish`);
    }
  }
});

test('the rotation reaches the whole pool for a focus, over weeks 4–42', () => {
  for (const focus of ['Iron', 'Choline', 'DHA from low-mercury fish', 'Calcium', 'Fiber']) {
    const lead = tagsForFocus(focus)[0];
    const eligible = MEAL_KIT_DISHES.filter((d) => d.tags.includes(lead)).map((d) => d.id);
    const shown = new Set(WEEK_NUMBERS.flatMap((w) => dishesForWeek({ week: w, focus }).map((d) => d.id)));
    for (const id of eligible) {
      assert.ok(shown.has(id), `"${focus}": "${id}" never appears across weeks 4–42`);
    }
  }
});

test('adjacent weeks vary, for every focus the content actually uses', () => {
  const focuses = [...new Set(ALL_WEEKS.map((w) => w.nutrition.focus))];
  for (const focus of focuses) {
    for (const week of WEEK_NUMBERS.slice(0, -1)) {
      const here = new Set(dishesForWeek({ week, focus }).map((d) => d.id));
      const next = dishesForWeek({ week: week + 1, focus }).map((d) => d.id);
      assert.ok(
        next.some((id) => !here.has(id)),
        `"${focus}": weeks ${week} and ${week + 1} show the same three dishes`
      );
    }
  }
});

test('dietary preferences pull compatible dishes forward without hiding anything', () => {
  for (const week of WEEK_NUMBERS) {
    const picks = dishesForWeek({ week, focus: 'Fiber', dietTags: ['vegan'] });
    assert.ok(picks.length >= 2, `week ${week}: preferences must not empty the list`);
    const veganCount = picks.filter((d) => d.dietTags?.includes('vegan')).length;
    assert.ok(veganCount >= 1, `week ${week}: no vegan-compatible dish was preferred`);
    /* Preferred dishes lead. */
    const firstNonVegan = picks.findIndex((d) => !d.dietTags?.includes('vegan'));
    const lastVegan = picks.map((d) => !!d.dietTags?.includes('vegan')).lastIndexOf(true);
    if (firstNonVegan !== -1) {
      assert.ok(lastVegan < firstNonVegan, `week ${week}: compatible dishes are not first`);
    }
  }
});

test('dishesForWeek never throws on odd input', () => {
  for (const bad of [
    undefined,
    null,
    {},
    { week: NaN },
    { week: 'seventeen' },
    { week: 17, focus: null },
    { week: 17, dietTags: 'vegan' },
    { week: -5, count: 0 },
    { week: 17, count: 999 }
  ]) {
    const picks = dishesForWeek(/** @type {never} */ (bad));
    assert.ok(Array.isArray(picks), `dishesForWeek(${JSON.stringify(bad)}) must return an array`);
    assert.ok(picks.length >= 1, 'should still find something to show');
  }
});

/* --- Settings integration ------------------------------------------------- */

test('mealKit defaults to null and is a known value when set', () => {
  assert.equal(defaultSettings().mealKit, null);
  assert.deepEqual(MEAL_KITS, ['hellofresh']);
});

test('a stored v1 blob written before mealKit existed still loads, with the default merged in', async () => {
  /* The additive-field claim, actually exercised: seed storage with a record
     that has no `mealKit` key at all and make sure `loadSettings` merges the
     default without disturbing anything else — no version bump required. */
  const legacy = {
    version: 1,
    dueDateISO: '2027-01-17',
    nickname: 'Peanut',
    units: 'metric',
    dietTags: ['vegetarian'],
    pxPerMm: 6.4,
    todosDone: { 'w24-glucose': true }
  };

  const fresh = await withFakeStorage(legacy, (mod) => mod.loadSettings());
  assert.equal(fresh.mealKit, null, 'missing mealKit must default to null');
  assert.equal(fresh.version, 1, 'no version bump for an additive field');
  assert.equal(fresh.dueDateISO, '2027-01-17');
  assert.equal(fresh.nickname, 'Peanut');
  assert.equal(fresh.units, 'metric');
  assert.deepEqual(fresh.dietTags, ['vegetarian']);
  assert.equal(fresh.pxPerMm, 6.4);
  assert.deepEqual(fresh.todosDone, { 'w24-glucose': true });

  const on = await withFakeStorage({ ...legacy, mealKit: 'hellofresh' }, (m) => m.loadSettings());
  assert.equal(on.mealKit, 'hellofresh', 'a stored kit survives the round trip');

  for (const junk of ['blueapron', '', 0, true, {}]) {
    const bad = await withFakeStorage({ ...legacy, mealKit: junk }, (m) => m.loadSettings());
    assert.equal(bad.mealKit, null, `unknown mealKit ${JSON.stringify(junk)} must fall back`);
  }
});

/**
 * Run `fn` against a *fresh* instance of the storage module backed by an
 * in-memory localStorage seeded with `blob`. The query string defeats the ESM
 * module cache, so each call gets its own settings cache.
 * @param {object} blob The record to place under the storage key.
 * @param {(mod: any) => any} fn
 * @returns {Promise<any>}
 */
let freshCounter = 0;
async function withFakeStorage(blob, fn) {
  const data = new Map([['little-one:v1', JSON.stringify(blob)]]);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
      removeItem: (k) => data.delete(k)
    }
  });
  try {
    const mod = await import(`../app/js/lib/storage.js?fresh=${freshCounter++}`);
    return fn(mod);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete (/** @type {any} */ (globalThis).localStorage);
  }
}
