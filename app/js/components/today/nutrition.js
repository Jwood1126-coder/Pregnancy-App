/**
 * "On the menu this week" — one nutrient spotlight, why it matters *now*, a
 * handful of concrete food ideas, and the week's food-safety reminder as a
 * gentle callout.
 *
 * When dietary preferences are set, the ideas that suit them float to the top
 * and carry a small chip. Nothing is ever hidden — the rest of the ideas stay
 * exactly where they were, just below.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';
import { leafIcon } from './icons.js';

/** @typedef {import('../../lib/types.js').Nutrition} Nutrition */
/** @typedef {import('../../lib/types.js').DietTag} DietTag */
/** @typedef {import('../../lib/types.js').EatIdea} EatIdea */

/** Human labels for the diet tags, for the chips. */
const DIET_LABELS = /** @type {Object<string, string>} */ ({
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'dairy-free': 'Dairy-free',
  'nut-free': 'Nut-free',
  halal: 'Halal',
  kosher: 'Kosher'
});

/**
 * The first of the user's diet tags that an idea carries, or `null`.
 * Tag order follows the user's preferences, so the chip names what *they* care
 * about rather than whatever the content author listed first.
 * @param {EatIdea} idea One food idea.
 * @param {DietTag[]} dietTags The user's preferences.
 * @returns {DietTag|null}
 */
export function matchingTag(idea, dietTags) {
  if (!idea || !Array.isArray(idea.tags) || idea.tags.length === 0) return null;
  for (const tag of dietTags) {
    if (idea.tags.includes(tag)) return tag;
  }
  return null;
}

/**
 * Ideas that suit the user's preferences first, everything else after, each
 * group keeping the order the week's author chose.
 * @param {EatIdea[]} eat Ideas as authored.
 * @param {DietTag[]} dietTags The user's preferences (may be empty).
 * @returns {{ idea: EatIdea, tag: DietTag|null }[]} Ordered, annotated ideas.
 */
export function orderIdeas(eat, dietTags) {
  const ideas = Array.isArray(eat) ? eat.filter((i) => i && typeof i.idea === 'string') : [];
  const tags = Array.isArray(dietTags) ? dietTags : [];
  const annotated = ideas.map((idea) => ({ idea, tag: tags.length ? matchingTag(idea, tags) : null }));
  if (tags.length === 0) return annotated;
  return [...annotated.filter((a) => a.tag), ...annotated.filter((a) => !a.tag)];
}

/**
 * Build the nutrition card.
 * @param {{ nutrition: Nutrition, dietTags: DietTag[] }} options
 * @returns {HTMLElement|null} `null` when the week has no nutrition block yet.
 */
export function menuCard(options) {
  const n = options.nutrition;
  if (!n || typeof n !== 'object') return null;

  const ideas = orderIdeas(n.eat, options.dietTags);

  const list =
    ideas.length > 0
      ? el(
          'ul',
          { class: 'today-eat' },
          ideas.map(({ idea, tag }) =>
            el(
              'li',
              { class: 'today-eat__item' },
              el('span', { class: 'today-eat__dot', 'aria-hidden': 'true' }),
              el(
                'span',
                {},
                idea.idea,
                tag
                  ? el('span', { class: 'today-eat__chip' }, DIET_LABELS[tag] ?? tag)
                  : null
              )
            )
          )
        )
      : null;

  const safety = n.safety
    ? el(
        'div',
        { class: 'today-callout' },
        el('span', { class: 'today-callout__icon' }, leafIcon()),
        el(
          'p',
          { class: 'today-callout__text' },
          el('span', { class: 'today-callout__label' }, 'Keeping food safe'),
          n.safety
        )
      )
    : null;

  return card(
    { title: 'On the menu this week' },
    n.focus ? el('p', { class: 'today-focus' }, n.focus) : null,
    n.why ? el('p', { class: 'today-why' }, n.why) : null,
    list,
    safety
  );
}
