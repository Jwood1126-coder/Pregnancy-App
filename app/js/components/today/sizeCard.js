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
      emoji ? el('span', { class: 'today-size__emoji', 'aria-hidden': 'true' }, emoji) : null,
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
