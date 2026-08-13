/**
 * Meal-kit picks — a small curated catalog of *recurring* HelloFresh-style
 * dishes, matched to whatever nutrient the week is focused on.
 *
 * ## What this is, and what it honestly cannot be
 *
 * Little One is offline and serverless, and HelloFresh publishes no public
 * menu feed. This app therefore **cannot know what is on a family's menu in
 * any given week**, and nothing here may pretend otherwise. What it can do is
 * carry a catalog of dishes and archetypes that come around on HelloFresh US
 * menus regularly — firecracker meatballs, creamy dill chicken, salmon with a
 * grain, bulgogi bowls, carnitas tacos — and say, quietly: dishes like these
 * turn up often, and here is which ones suit what your body is working on.
 * The copy in this module and in `components/today/mealKit.js` is written to
 * that rule. No "on your menu this week", ever.
 *
 * The second half of the feature is menu-agnostic on purpose: `PICKING_GUIDE`
 * is a rotation of short how-to-choose tips that work against *any* week's
 * line-up, whatever it turns out to be.
 *
 * ## Content rules
 *
 * Every nutrition and safety claim sits inside MASTER_PROMPT.md Appendix A:
 * the daily targets, the food-safety list (cook meat, poultry and eggs
 * through; pasteurized dairy; heat deli meats and smoked seafood until
 * steaming; low-mercury fish; wash produce; leftovers within two hours), and
 * the trimester arcs. Nothing here diagnoses, prescribes, or scares.
 *
 * ## Why `dietTags` is deliberately narrow
 *
 * A dish is tagged `vegetarian`, `vegan`, or `dairy-free` only when the dish
 * *as described here* contains no meat / no animal products / no dairy. The
 * other three `DietTag`s are left off every entry on purpose: `nut-free`,
 * `halal`, and `kosher` depend on the actual ingredients and certification in
 * the actual box, which this app cannot see. Guessing at an allergen tag is
 * the one mistake in this file that could hurt somebody, so it isn't made.
 * Diet tags only ever *reorder* picks — nothing is hidden from anyone.
 */

/** @typedef {import('../lib/types.js').DietTag} DietTag */
/** @typedef {import('../lib/types.js').MealKitTag} MealKitTag */
/** @typedef {import('../lib/types.js').MealKitDish} MealKitDish */

/** Every nutrition tag a dish may carry, in display order. */
export const MEAL_KIT_TAGS = /** @type {MealKitTag[]} */ ([
  'iron',
  'dha',
  'choline',
  'calcium',
  'folate',
  'fiber',
  'protein',
  'comfort'
]);

/**
 * The catalog: dishes and archetypes that recur on HelloFresh US menus.
 *
 * `gives` is one warm line — what the plate delivers and why it suits a focus.
 * `safety` is the one pregnancy tweak worth making to *this* dish, or `null`
 * when the dish needs nothing beyond ordinary cooking.
 *
 * @type {MealKitDish[]}
 */
export const MEAL_KIT_DISHES = [
  {
    id: 'firecracker-meatballs',
    name: 'Firecracker meatballs with jasmine rice',
    gives: 'Beef meatballs bring easy-to-absorb iron, and the rice underneath turns it into a full, filling plate.',
    tags: ['iron', 'protein'],
    safety: 'Ground meat goes all the way to 160 °F — no pink in the middle of a meatball.'
  },
  {
    id: 'creamy-dill-chicken',
    name: 'Creamy dill chicken with roasted potatoes',
    gives: 'Gentle, herby and mild — a gets-eaten dinner on the evenings when nothing sharp or spicy appeals.',
    tags: ['protein', 'comfort'],
    safety: 'Chicken to 165 °F, with the juices running clear.'
  },
  {
    id: 'salmon-lemony-couscous',
    name: 'Salmon with lemony couscous',
    gives: 'Salmon carries a lot of DHA and sits low on the mercury scale, and the lemon keeps the plate light.',
    tags: ['dha', 'protein'],
    safety: 'Cook the salmon until it flakes easily with a fork.'
  },
  {
    id: 'teriyaki-salmon-bowl',
    name: 'Teriyaki salmon rice bowls',
    gives: 'Sweet-savory salmon over rice: DHA for your baby’s brain in a form that tastes like takeout.',
    tags: ['dha', 'protein', 'comfort'],
    safety: 'Cooked through until opaque and flaking — salmon is a low-mercury pick either way.'
  },
  {
    id: 'trout-herbed-rice',
    name: 'Rainbow trout with herbed rice',
    gives: 'Trout is another low-mercury oily fish — the same DHA as salmon, with a milder flavor.',
    tags: ['dha', 'protein'],
    safety: 'Cook it through until it flakes. Trout is low in mercury, so it fits the weekly fish target.'
  },
  {
    id: 'salmon-burgers-slaw',
    name: 'Salmon burgers with crunchy slaw',
    gives: 'DHA in handheld form, with a crunchy cabbage slaw keeping the whole plate light.',
    tags: ['dha', 'protein'],
    safety: 'Cook the patties through to the center, and rinse the slaw veg before it is shredded.'
  },
  {
    id: 'beef-bulgogi-bowls',
    name: 'Beef bulgogi bowls',
    gives: 'Thin-sliced beef brings iron in the form the body absorbs most easily, and it cooks in minutes.',
    tags: ['iron', 'protein'],
    safety: 'Sear the strips until no pink is left — thin beef gets there fast. If a fried egg goes on top, cook that one firm too.'
  },
  {
    id: 'beef-and-broccoli',
    name: 'Beef and broccoli with garlic rice',
    gives: 'Iron from the beef, folate and fiber from the broccoli — the pairing does two jobs at once.',
    tags: ['iron', 'protein', 'folate'],
    safety: 'Cook the beef through, and give the broccoli a good rinse first.'
  },
  {
    id: 'steakhouse-sirloin',
    name: 'Garlic-butter sirloin with roasted potatoes',
    gives: 'A steak night is an iron night — and iron is what the second and third trimesters lean on hardest.',
    tags: ['iron', 'protein'],
    safety: 'Whole cuts are a thermometer job — 145 °F, then a three-minute rest before it is cut.'
  },
  {
    id: 'beef-ragu-rigatoni',
    name: 'Beef ragù with rigatoni',
    gives: 'Slow-simmered comfort that happens to be a solid plate of iron and protein.',
    tags: ['iron', 'protein'],
    safety: 'Ground beef to 160 °F before the pasta goes in. If the recipe calls for a splash of wine, stock and a squeeze of lemon do the same job.'
  },
  {
    id: 'seasoned-beef-tacos',
    name: 'Seasoned beef tacos with lime crema',
    gives: 'Iron, protein, and a dinner you can eat with one hand — a good one for a low-energy evening.',
    tags: ['iron', 'protein'],
    safety: 'Ground beef to 160 °F, and a glance at the crema and cheese for the word pasteurized.'
  },
  {
    id: 'pork-carnitas-tacos',
    name: 'Pork carnitas tacos',
    gives: 'Pork brings steady protein and B vitamins, and the citrus alongside keeps the whole plate bright.',
    tags: ['protein'],
    safety: 'Cooked through, no pink — and wash the limes and cilantro before they are cut.'
  },
  {
    id: 'bbq-pork-chops-mash',
    name: 'BBQ pork chops with mashed potatoes',
    gives: 'A proper plated dinner: steady protein, and mash for the nights that call for mash.',
    tags: ['protein'],
    safety: 'Chops are a thermometer job — 145 °F, then a three-minute rest before they are cut.'
  },
  {
    id: 'pork-banh-mi-bowls',
    name: 'Pork bánh mì bowls',
    gives: 'Bright, crunchy and quick, with pickled veg cutting through the richness of the pork.',
    tags: ['protein'],
    safety: 'Cook the pork through, wash the raw veg well, and leave off a raw sprout garnish if one comes with it.'
  },
  {
    id: 'turkey-burgers-wedges',
    name: 'Turkey burgers with sweet potato wedges',
    gives: 'Lean protein plus a sweet potato — the wedges bring color and a little fiber alongside.',
    tags: ['protein'],
    safety: 'Ground turkey goes to 165 °F, all the way through.'
  },
  {
    id: 'chicken-sausage-gnocchi',
    name: 'Chicken sausage gnocchi with spinach',
    gives: 'Pillowy and quick, with a whole bag of spinach wilting in for folate.',
    tags: ['protein', 'folate', 'comfort'],
    safety: 'Sausage cooked through to 165 °F before the gnocchi joins the pan.'
  },
  {
    id: 'chicken-parm-spaghetti',
    name: 'Chicken parm with spaghetti',
    gives: 'Melted mozzarella adds calcium on top of the obvious protein, and it reheats well the next day.',
    tags: ['calcium', 'protein'],
    safety: 'Chicken to 165 °F under the cheese, and pasteurized mozzarella and parmesan on top.'
  },
  {
    id: 'thai-basil-chicken',
    name: 'Thai basil chicken with jasmine rice',
    gives: 'Fragrant rather than fiery, and one of the easiest plates to make milder if heartburn has moved in.',
    tags: ['protein', 'comfort'],
    safety: 'Chicken to 165 °F — and if you crown it with a fried egg, cook that one firm too. Half the chili if your stomach is having a rough week.'
  },
  {
    id: 'chicken-fajitas',
    name: 'Chicken fajitas with charred peppers',
    gives: 'Peppers are loaded with vitamin C, which is exactly what helps iron from the rest of the week land.',
    tags: ['protein'],
    safety: 'Chicken to 165 °F, and rinse the peppers before they are sliced.'
  },
  {
    id: 'greek-chicken-bowls',
    name: 'Greek chicken bowls with tzatziki',
    gives: 'Yogurt in the sauce quietly adds calcium, and the whole bowl sits light.',
    tags: ['protein', 'calcium'],
    safety: 'Chicken to 165 °F, with pasteurized yogurt in the tzatziki — standard on a US label, worth the glance.'
  },
  {
    id: 'lemon-orzo-chicken-spinach',
    name: 'Lemony chicken orzo with spinach',
    gives: 'Spinach for folate, lemon for brightness, orzo for the kind of dinner that goes down easily.',
    tags: ['folate', 'protein', 'comfort'],
    safety: 'Chicken to 165 °F. Bagged spinach marked ready-to-eat needs no rewashing — a loose bunch does.'
  },
  {
    id: 'shrimp-scampi-spaghetti',
    name: 'Shrimp scampi spaghetti',
    gives: 'Shrimp is on the best-picks list for low-mercury seafood, and this cooks faster than the pasta water boils.',
    tags: ['protein', 'comfort'],
    safety: 'Cook the shrimp until opaque and curled — no translucent centers. If the recipe calls for a splash of wine, stock and a squeeze of lemon do the same job.'
  },
  {
    id: 'baked-cod-crushed-potatoes',
    name: 'Baked cod with crushed potatoes',
    gives: 'Cod is another low-mercury best pick — mild, flaky, and kind to a queasy week.',
    tags: ['protein', 'comfort'],
    safety: 'Bake until it flakes. Cod is low in mercury, so it fits the two-to-three servings a week comfortably.'
  },
  {
    id: 'lemon-garlic-tilapia',
    name: 'Lemon-garlic tilapia with rice pilaf',
    gives: 'A gentle white fish from the best-picks list, for the weeks when salmon feels like too much.',
    tags: ['protein', 'comfort'],
    safety: 'Cook until opaque and flaking — tilapia is a low-mercury choice.'
  },
  {
    id: 'veggie-fried-rice-egg',
    name: 'Veggie fried rice with egg',
    gives: 'Eggs are the choline star, and choline is doing quiet work on your baby’s growing brain.',
    tags: ['choline', 'protein'],
    dietTags: ['vegetarian'],
    safety: 'Let the egg set firm all the way through before it gets folded in.'
  },
  {
    id: 'shakshuka-feta',
    name: 'Shakshuka with spinach and feta',
    gives: 'Eggs poached in tomato: choline, folate from the greens, and dinner in one pan.',
    tags: ['choline', 'folate'],
    dietTags: ['vegetarian'],
    safety: 'Cook until the yolks are firm, not jammy — and feta only if the label says pasteurized.'
  },
  {
    id: 'sweet-potato-hash-eggs',
    name: 'Sweet potato hash with fried eggs',
    gives: 'Breakfast-for-dinner that lands a real dose of choline — and it is easy on an unsettled stomach.',
    tags: ['choline', 'comfort'],
    dietTags: ['vegetarian'],
    safety: 'Fry the eggs firm on both sides — set whites, set yolks.'
  },
  {
    id: 'egg-veggie-breakfast-burritos',
    name: 'Cheesy egg and veggie breakfast burritos',
    gives: 'Choline from the eggs, calcium from the cheese, wrapped up and portable for a hungry afternoon.',
    tags: ['choline', 'calcium', 'protein'],
    dietTags: ['vegetarian'],
    safety: 'Scramble the eggs until fully set, and use pasteurized cheese.'
  },
  {
    id: 'spinach-ricotta-stuffed-shells',
    name: 'Spinach and ricotta stuffed shells',
    gives: 'Ricotta for calcium, a lot of spinach for folate, and leftovers that reheat beautifully.',
    tags: ['calcium', 'folate'],
    dietTags: ['vegetarian'],
    safety: 'Ricotta and mozzarella only if the label says pasteurized — in the US it almost always does.'
  },
  {
    id: 'broccoli-mac-and-cheese',
    name: 'Broccoli mac and cheese',
    gives: 'Cheese sauce is an easy way toward the day’s calcium, and the broccoli brings folate along with it.',
    tags: ['calcium', 'comfort'],
    dietTags: ['vegetarian'],
    safety: 'Pasteurized cheese, and wash the broccoli before it is chopped.'
  },
  {
    id: 'mushroom-risotto',
    name: 'Creamy mushroom risotto',
    gives: 'Slow, savory and soothing, with parmesan quietly topping up the day’s calcium.',
    tags: ['calcium', 'comfort'],
    dietTags: ['vegetarian'],
    safety: 'Parmesan from a pasteurized label, and cook the mushrooms through. If the recipe calls for a splash of wine, stock and a squeeze of lemon do the same job.'
  },
  {
    id: 'butternut-ravioli-brown-butter',
    name: 'Butternut squash ravioli with brown butter',
    gives: 'Sweet, soft and quick — the plate to reach for when appetite is small but dinner still has to happen.',
    tags: ['comfort'],
    dietTags: ['vegetarian'],
    safety: null
  },
  {
    id: 'veggie-quesadillas',
    name: 'Veggie and black bean quesadillas',
    gives: 'Beans for iron and fiber, cheese for calcium, and it is on the table in fifteen minutes.',
    tags: ['calcium', 'fiber', 'iron'],
    dietTags: ['vegetarian'],
    safety: 'Pasteurized cheese, and give the peppers a wash before slicing.'
  },
  {
    id: 'sweet-potato-black-bean-tacos',
    name: 'Sweet potato and black bean tacos',
    gives: 'Plant iron, folate and fiber in one warm tortilla — pair it with the lime and the iron absorbs better.',
    tags: ['fiber', 'folate', 'iron'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: 'Wash the limes and cilantro well before they are cut into the pan.'
  },
  {
    id: 'coconut-curry-lentils',
    name: 'Coconut curry lentils with basmati',
    gives: 'Lentils bring plant iron and folate together, and the coconut milk makes it feel like a treat.',
    tags: ['iron', 'folate', 'fiber'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: null
  },
  {
    id: 'chickpea-shawarma-bowls',
    name: 'Crispy chickpea shawarma bowls',
    gives: 'Chickpeas do double duty on fiber and plant iron, and the bowl keeps well as tomorrow’s lunch.',
    tags: ['fiber', 'folate', 'protein', 'iron'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: 'Wash the tomatoes and cucumber, and leave off a raw sprout garnish if one is included.'
  },
  {
    id: 'tuscan-white-bean-kale-soup',
    name: 'Tuscan white bean and kale soup',
    gives: 'Beans and greens together: folate, fiber, iron, and a bowl that counts toward the day’s fluids.',
    tags: ['folate', 'fiber', 'iron', 'comfort'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: 'Wash the kale well, and refrigerate the leftovers within two hours.'
  },
  {
    id: 'sesame-tofu-broccoli-bowls',
    name: 'Sesame tofu bowls with broccoli',
    gives: 'Tofu and broccoli make a light, steady plate — protein and fiber without anything heavy.',
    tags: ['protein', 'fiber'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: 'Rinse the broccoli before it hits the pan.'
  },
  {
    id: 'chickpea-feta-couscous',
    name: 'Chickpea and feta couscous bowl',
    gives: 'Herby and cool, with chickpeas for fiber and feta for a little calcium on top.',
    tags: ['fiber', 'folate', 'calcium'],
    dietTags: ['vegetarian'],
    safety: 'Feta only if the label says pasteurized, and wash the herbs and cucumber.'
  },
  {
    id: 'veggie-burrito-bowl',
    name: 'Loaded veggie burrito bowl',
    gives: 'Rice, beans, corn and avocado — slow-burn energy that holds you until morning.',
    tags: ['fiber', 'folate', 'protein'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    safety: 'Wash the avocado skin before it is cut, and the tomatoes too.'
  }
];

/**
 * How to choose well from *any* week's line-up, whatever it turns out to be.
 * One of these is shown per week, rotated. Every line sits inside Appendix A.
 * @type {string[]}
 */
export const PICKING_GUIDE = [
  'Whatever protein lands in the box, get a thermometer into it: poultry to 165 °F, ground meat to 160 °F, steak and chops to 145 °F with a three-minute rest.',
  'When a recipe finishes with an egg, go for the fully-set version — firm whites, firm yolks. Everything else about the dish stays the same.',
  'Soft cheese — feta, goat, blue, fresh mozzarella — is a label check: the word “pasteurized” is what you are looking for. US boxes almost always are.',
  'Skip a raw sprout or microgreen garnish — it is the one thing on the card that never gets cooked.',
  'Give the loose produce a proper wash, herbs included. Bagged greens marked ready-to-eat do not need rewashing.',
  'A salmon or trout week is worth grabbing — two or three servings of low-mercury fish a week is the target.',
  'If heartburn has moved in, pick the smaller, milder plate and use half the spice packet — the dish still works, and so does the evening.',
  'In the third trimester, take the extra-protein option when it is offered. Appetite gets smaller while the job gets bigger.',
  'Prosciutto, salami, or smoked salmon on top? Heat it until steaming first, and then it is a yes.',
  'Bean, lentil, and leafy-green nights are quiet iron and folate wins. Squeeze on the lemon or lime that comes with them — the vitamin C helps the iron land.',
  'Leftovers are a gift on a tired week: get them into the fridge within two hours and they will be waiting for you.',
  'Raw chicken or beef gets its own board and its own corner — the slaw, herbs and tortillas stay well clear of it.'
];

/** The one-line honesty footnote shown under the picks. */
export const MEAL_KIT_FOOTNOTE =
  'Menus rotate weekly — these are regulars; check your week’s card.';

/**
 * The section heading shown above the picks.
 *
 * It lives here, with the rest of the copy, so the honesty tests in
 * `test/mealkits.test.mjs` can scan it alongside the dish and tip strings — the
 * render layer is exactly where a menu-claiming phrase would otherwise slip
 * past the guardrail. Conditional by construction: "if you get" cannot be read
 * as knowledge of what is in the box.
 *
 * @param {string} label Display name of the service (e.g. `"HelloFresh"`).
 * @returns {string}
 */
export function kitHeading(label) {
  return `If you get a ${label} box`;
}

/**
 * The one-line framing under the heading — said once, right at the top.
 * @param {string} label Display name of the service.
 * @returns {string}
 */
export function kitIntro(label) {
  return `Dishes like these come around on ${label} menus regularly — these are the ones that suit what this week is working on.`;
}

/**
 * Focus-text → nutrition tags. Rules are checked in order and their tags are
 * unioned, so "Calcium and vitamin D" picks up both, and an unfamiliar focus
 * still lands on something sensible rather than nothing.
 * @type {{ match: RegExp, tags: MealKitTag[] }[]}
 */
const FOCUS_RULES = [
  { match: /iron/i, tags: ['iron', 'protein'] },
  { match: /dha|omega|fish/i, tags: ['dha', 'protein'] },
  { match: /choline|egg/i, tags: ['choline', 'protein'] },
  /* DHA leads a vitamin-D week on purpose: fatty fish is the food source that
     actually carries vitamin D. `poolForFocus` fills tier by tier and stops as
     soon as the lead tag satisfies `minSize`, so putting `calcium` first meant
     the fish were never reached and a vitamin-D week served cheese dishes. */
  { match: /vitamin d/i, tags: ['dha', 'calcium'] },
  { match: /calcium|dairy/i, tags: ['calcium'] },
  { match: /folate|leafy|greens|produce|colou?rful/i, tags: ['folate', 'fiber'] },
  { match: /fiber|fibre|whole grain|grains|constipation|fluids/i, tags: ['fiber'] },
  { match: /protein/i, tags: ['protein', 'iron'] },
  { match: /magnesium/i, tags: ['fiber', 'folate'] },
  { match: /blood sugar/i, tags: ['fiber', 'protein'] },
  { match: /prenatal vitamin/i, tags: ['folate', 'iron'] },
  { match: /heartburn|small|easy|gentle|queasy|nausea/i, tags: ['comfort'] },
  { match: /appetite/i, tags: ['protein', 'comfort'] },
  { match: /energy|snack|freezer/i, tags: ['protein', 'comfort', 'fiber'] },
  { match: /water|hydration/i, tags: ['fiber', 'comfort'] },
  { match: /days after|first days/i, tags: ['iron', 'protein', 'comfort'] }
];

/** Where a focus lands when no rule recognises it. */
const DEFAULT_FOCUS_TAGS = /** @type {MealKitTag[]} */ (['protein', 'fiber']);

/** Dishes shown per week. */
const DEFAULT_COUNT = 3;

/**
 * Below this many eligible dishes, a week shows two picks instead of three.
 *
 * DHA is the honest example: what recurs on a real menu is salmon, salmon, and
 * trout, so a third pick would be a third salmon dish. Two distinct ones read
 * as a suggestion; three near-identical ones read as filler.
 */
const NARROW_POOL = 6;

/**
 * The nutrition tags a week's focus line is about.
 * @param {string} focus The week's `nutrition.focus` (e.g. `"Iron with vitamin C"`).
 * @returns {MealKitTag[]} Ordered, de-duplicated tags; never empty.
 */
export function tagsForFocus(focus) {
  if (typeof focus !== 'string' || focus.trim() === '') return [...DEFAULT_FOCUS_TAGS];
  /** @type {MealKitTag[]} */
  const out = [];
  for (const rule of FOCUS_RULES) {
    if (!rule.match.test(focus)) continue;
    for (const tag of rule.tags) {
      if (!out.includes(tag)) out.push(tag);
    }
  }
  return out.length > 0 ? out : [...DEFAULT_FOCUS_TAGS];
}

/**
 * The dishes a week may draw from, best tag first.
 *
 * Tier by tier, not by score: a DHA week must show salmon, not the beef dish
 * that also happens to carry `protein`. The first tag alone fills the pool
 * whenever it can (every tag has at least three dishes, asserted in
 * `test/mealkits.test.mjs`), and later tags are only reached for a focus whose
 * lead tag is thin.
 *
 * @param {MealKitTag[]} focusTags Ordered tags from {@link tagsForFocus}.
 * @param {number} minSize Stop widening once the pool is at least this big.
 * @returns {MealKitDish[]} Never empty (falls back to catalog order).
 */
function poolForFocus(focusTags, minSize) {
  /** @type {MealKitDish[]} */
  const pool = [];
  for (const tag of focusTags) {
    if (pool.length >= minSize) break;
    for (const dish of MEAL_KIT_DISHES) {
      if (dish.tags.includes(tag) && !pool.includes(dish)) pool.push(dish);
    }
  }
  for (const dish of MEAL_KIT_DISHES) {
    if (pool.length >= minSize) break;
    if (!pool.includes(dish)) pool.push(dish);
  }
  return pool;
}

/**
 * Greatest common divisor, for choosing a rotation stride.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * A step size that walks the whole pool as the weeks pass.
 *
 * Striding by the number of dishes shown would give adjacent weeks completely
 * different picks — but only when that stride is coprime with the pool size;
 * otherwise the rotation gets stuck on a handful of windows and most of the
 * catalog never appears. So: the largest stride at or below `want` that is
 * coprime with `size`.
 *
 * @param {number} size Pool size.
 * @param {number} want Preferred stride (the number of dishes shown).
 * @returns {number} At least 1.
 */
function strideFor(size, want) {
  for (let s = Math.min(want, size); s >= 2; s--) {
    if (gcd(s, size) === 1) return s;
  }
  return 1;
}

/**
 * True when a dish suits at least one of the user's dietary preferences.
 * @param {MealKitDish} dish
 * @param {DietTag[]} dietTags The user's preferences (may be empty).
 * @returns {boolean} Always `false` when no preferences are set — nothing to prefer.
 */
function fitsDiet(dish, dietTags) {
  if (!Array.isArray(dietTags) || dietTags.length === 0) return false;
  if (!Array.isArray(dish.dietTags) || dish.dietTags.length === 0) return false;
  return dish.dietTags.some((t) => dietTags.includes(t));
}

/**
 * The dishes to show for one week.
 *
 * Deterministic: the same week and preferences always produce the same picks.
 * Every pick genuinely serves the week's focus (see {@link poolForFocus}), and
 * the rotation strides through that pool so adjacent weeks differ rather than
 * shuffling one dish along. Dishes that suit the user's dietary preferences are
 * pulled forward within the picks; nothing is filtered out, because a
 * preference is not an allergy and the catalog is small.
 *
 * @param {{ week: number, focus?: string, dietTags?: DietTag[], count?: number }} options
 * @returns {MealKitDish[]} Between 2 and `count` dishes (fewer only if the
 *   catalog itself were smaller); never throws on odd input.
 */
export function dishesForWeek(options) {
  const opts = options && typeof options === 'object' ? options : { week: 0 };
  const week = Number.isFinite(opts.week) ? Math.floor(Number(opts.week)) : 0;
  const dietTags = Array.isArray(opts.dietTags) ? opts.dietTags : [];
  const wanted = Number.isFinite(opts.count) ? Math.floor(Number(opts.count)) : DEFAULT_COUNT;
  const count = Math.max(1, Math.min(wanted, MEAL_KIT_DISHES.length));

  const focusTags = tagsForFocus(opts.focus ?? '');
  const pool = poolForFocus(focusTags, count);
  if (pool.length === 0) return [];

  /* A thin category shows fewer, more distinct picks — see NARROW_POOL. */
  const shown = pool.length < NARROW_POOL ? Math.min(count, 2) : count;

  const stride = strideFor(pool.length, shown);
  const offset = (((week * stride) % pool.length) + pool.length) % pool.length;
  const rotated = pool.map((_, i) => pool[(offset + i) % pool.length]);

  const preferred = rotated.filter((dish) => fitsDiet(dish, dietTags));
  const rest = rotated.filter((dish) => !fitsDiet(dish, dietTags));
  return [...preferred, ...rest].slice(0, shown);
}

/**
 * The picking tip for a week, rotated so it changes as the weeks do.
 * @param {number} week Content week (4–42); anything else is coerced sensibly.
 * @returns {string} One tip from {@link PICKING_GUIDE}.
 */
export function pickingTipForWeek(week) {
  const n = Number.isFinite(week) ? Math.floor(Number(week)) : 0;
  const i = ((n % PICKING_GUIDE.length) + PICKING_GUIDE.length) % PICKING_GUIDE.length;
  return PICKING_GUIDE[i];
}
