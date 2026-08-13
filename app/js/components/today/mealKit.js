/**
 * Meal-kit picks — a compact section inside "On the menu this week", shown
 * only when the family has told Settings they get a meal kit.
 *
 * The honesty rule this whole feature is built on: the app is offline and
 * HelloFresh has no public menu feed, so Little One **cannot** know what is on
 * this family's menu. It never claims to. The heading is conditional ("if you
 * get a … box"), the section says these are dishes that come around regularly,
 * shows the ones that suit the week's nutrition focus, adds one tip for
 * choosing well from whatever line-up does turn up, and closes with a hairline
 * footnote saying menus rotate. Every one of those strings is authored in
 * `data/mealKits.js` so the honesty test suite gates the rendered copy too.
 *
 * Design: a bonus, not a billboard. No logos, no brand colour, no card of its
 * own — a hairline, a quiet subhead, and the same type scale as the food ideas
 * above it. Design tokens only.
 */

import { el } from '../../lib/dom.js';
import {
  dishesForWeek,
  pickingTipForWeek,
  kitHeading,
  kitIntro,
  MEAL_KIT_FOOTNOTE
} from '../../data/mealKits.js';

/** @typedef {import('../../lib/types.js').DietTag} DietTag */
/** @typedef {import('../../lib/types.js').MealKit} MealKit */
/** @typedef {import('../../lib/types.js').MealKitDish} MealKitDish */

/** Display name per meal-kit service. */
const KIT_LABELS = /** @type {Object<string, string>} */ ({
  hellofresh: 'HelloFresh'
});

/**
 * Build the meal-kit section, or `null` when there is nothing to show.
 *
 * @param {{ week: number, focus?: string, dietTags?: DietTag[], mealKit?: MealKit }} options
 * @param {number} options.week Content week on screen (4–42) — drives both the
 *   dish rotation and the picking tip.
 * @param {string} [options.focus] The week's `nutrition.focus`, matched to tags.
 * @param {DietTag[]} [options.dietTags] Dietary preferences; compatible dishes
 *   are pulled forward, never used to hide anything.
 * @param {MealKit} [options.mealKit] The stored setting. `null` → no section.
 * @returns {HTMLElement|null}
 */
export function mealKitSection(options) {
  const opts = options && typeof options === 'object' ? options : { week: 0 };
  const kit = opts.mealKit ?? null;
  const label = kit ? KIT_LABELS[kit] : null;
  if (!label) return null;

  const dishes = dishesForWeek({
    week: opts.week,
    focus: opts.focus,
    dietTags: opts.dietTags ?? []
  });
  if (dishes.length === 0) return null;

  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'today-kit' },
      el('h3', { class: 'today-kit__head' }, kitHeading(label)),
      /* The honest framing, said once, right at the top. Both strings live in
         the data module so the honesty tests can scan them. */
      el('p', { class: 'today-kit__intro' }, kitIntro(label)),
      el(
        'ul',
        { class: 'today-kit__list' },
        dishes.map((dish) => dishItem(dish))
      ),
      el(
        'p',
        { class: 'today-kit__tip' },
        el('span', { class: 'today-kit__tip-label' }, 'Picking tip'),
        pickingTipForWeek(opts.week)
      ),
      el('p', { class: 'today-kit__note' }, MEAL_KIT_FOOTNOTE)
    )
  );
}

/**
 * One dish: name, the warm line, and its pregnancy tweak when it has one.
 * @param {MealKitDish} dish
 * @returns {HTMLElement}
 */
function dishItem(dish) {
  return /** @type {HTMLElement} */ (
    el(
      'li',
      { class: 'today-kit__dish' },
      el('p', { class: 'today-kit__name' }, dish.name),
      el('p', { class: 'today-kit__gives' }, dish.gives),
      dish.safety
        ? el(
            'p',
            { class: 'today-kit__tweak' },
            el('span', { class: 'today-kit__tweak-label' }, 'Tweak'),
            dish.safety
          )
        : null
    )
  );
}
