/**
 * The week browser: two chevrons, plus the "Back to today" pill that appears
 * only while you are looking at a week that isn't yours.
 *
 * Browsing never changes the current week — this control only moves the view.
 */

import { el } from '../../lib/dom.js';
import { chevron } from './icons.js';

/**
 * @typedef {Object} WeekNavOptions
 * @property {boolean} browsing True when the view has left the current week.
 * @property {boolean} canPrev Enable the back chevron.
 * @property {boolean} canNext Enable the forward chevron.
 * @property {string} [prevLabel] Accessible label for the back chevron.
 * @property {string} [nextLabel] Accessible label for the forward chevron.
 * @property {() => void} onPrev
 * @property {() => void} onNext
 * @property {() => void} onBackToToday
 */

/**
 * Build the week-browsing row.
 * @param {WeekNavOptions} options
 * @returns {HTMLElement}
 */
export function weekNav(options) {
  const backPill = options.browsing
    ? el(
        'button',
        {
          class: 'pill today-back',
          type: 'button',
          onClick: () => options.onBackToToday()
        },
        chevron('left', 12),
        'Back to today'
      )
    : null;

  /**
   * One chevron button.
   * @param {'left'|'right'} direction
   * @param {string} label
   * @param {boolean} enabled
   * @param {() => void} onClick
   * @returns {HTMLElement}
   */
  const arrow = (direction, label, enabled, onClick) =>
    /** @type {HTMLElement} */ (
      el(
        'button',
        {
          class: 'btn btn--icon today-nav__btn',
          type: 'button',
          'aria-label': label,
          disabled: !enabled,
          onClick: () => {
            if (enabled) onClick();
          }
        },
        chevron(direction, 15)
      )
    );

  return /** @type {HTMLElement} */ (
    el(
      'nav',
      { class: 'today-nav', 'aria-label': 'Browse weeks' },
      backPill,
      el('span', { class: 'today-nav__spacer' }),
      arrow('left', options.prevLabel ?? 'Previous week', options.canPrev, options.onPrev),
      arrow('right', options.nextLabel ?? 'Next week', options.canNext, options.onNext)
    )
  );
}
