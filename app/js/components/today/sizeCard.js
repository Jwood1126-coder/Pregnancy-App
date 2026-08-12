/**
 * The size headline card — the emotional centre of Today.
 *
 * "🍐  About the size of a pear — 5.1 in, 4.9 oz". Tapping it opens the Size
 * tab, where the baby is drawn at true physical size.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';
import { formatLength, formatWeight, basisLabel } from '../../lib/units.js';
import { chevron } from './icons.js';

/** @typedef {import('../../lib/types.js').WeekSize} WeekSize */
/** @typedef {import('../../lib/types.js').UnitSystem} UnitSystem */

/**
 * The app's own sage heart, used when a week's comparison carries no emoji.
 * Nine of the 39 weeks have none, and letting the slot collapse moved the whole
 * card 56 px left on those weeks.
 * @returns {SVGElement}
 */
function heartMark() {
  return /** @type {SVGElement} */ (
    el(
      'svg',
      /* Sized to the 40 px emoji slot it stands in for, and at full strength:
         this is the app's own mark, not a de-emphasised favourite glyph. */
      { width: '34', height: '31', viewBox: '0 0 38 34', 'aria-hidden': 'true' },
      el('path', {
        d:
          'M19 33C7.5 25.4 1 19.2 1 11.7 1 5.9 5.6 1.5 11.3 1.5c3.2 0 6.1 1.5 7.7 3.9 ' +
          '1.6-2.4 4.5-3.9 7.7-3.9C32.4 1.5 37 5.9 37 11.7 37 19.2 30.5 25.4 19 33z',
        fill: 'var(--accent)',
        opacity: '0.9'
      })
    )
  );
}

/**
 * `"a"` or `"an"` for a comparison name ("an avocado", "a pear").
 * @param {string} name
 * @returns {string}
 */
function article(name) {
  return /^[aeiou]/i.test(name.trim()) ? 'an' : 'a';
}

/**
 * @typedef {Object} SizeCardOptions
 * @property {WeekSize} size Canonical measurements for the week on screen.
 * @property {UnitSystem} units Unit system from settings.
 * @property {string} [nickname] Baby nickname, used warmly when set.
 * @property {() => void} onOpen Jump to the Size tab.
 */

/**
 * Build the size headline card.
 * @param {SizeCardOptions} options
 * @returns {HTMLElement}
 */
export function sizeCard(options) {
  const { size, units, onOpen } = options;
  const name = size.comparison?.name ?? '';
  const emoji = size.comparison?.emoji ?? '';
  const nickname = (options.nickname ?? '').trim();

  const headline = nickname
    ? `${nickname} is about the size of ${article(name)} ${name}`
    : `About the size of ${article(name)} ${name}`;

  const measures = `${formatLength(size.lengthMm, units)}, ${formatWeight(size.weightG, units)}`;

  return card(
    {
      class: 'today-size-card',
      onClick: onOpen,
      ariaLabel: `${headline}. ${measures}. See your baby at true size.`
    },
    el(
      'div',
      { class: 'today-size' },
      el(
        'span',
        { class: 'today-size__emoji', 'aria-hidden': 'true' },
        emoji || heartMark()
      ),
      el(
        'div',
        { class: 'today-size__text' },
        el('p', { class: 'today-size__head' }, headline),
        el('p', { class: 'today-size__meta' }, measures),
        el('p', { class: 'today-size__basis' }, `Measured ${basisLabel(size.basis)}`)
      ),
      el('span', { class: 'today-size__go', 'aria-hidden': 'true' }, chevron('right', 16))
    )
  );
}
