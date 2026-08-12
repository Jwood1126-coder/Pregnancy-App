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
 * @property {number} [progress] How far along the pregnancy is, 0–1. Drawn as
 *   a quiet track in the row's spare width when not browsing.
 * @property {string} [progressLabel] What the track says to a screen reader.
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

  /* The spare width earns its keep: a silent sage track showing how far along
     the pregnancy is — the one thing a parent wants at a glance, and the one
     thing the app never drew. */
  const pct = Math.max(0, Math.min(1, options.progress ?? 0)) * 100;
  const track = el(
    'span',
    {
      class: 'today-nav__spacer',
      role: options.progressLabel ? 'img' : null,
      'aria-label': options.progressLabel ?? null,
      'aria-hidden': options.progressLabel ? null : 'true'
    },
    el('span', {
      class: 'today-nav__progress',
      style: `width: ${pct.toFixed(1)}%`
    })
  );

  return /** @type {HTMLElement} */ (
    el(
      'nav',
      { class: 'today-nav', 'aria-label': 'Browse weeks' },
      backPill,
      /* The journey means nothing while you are looking at week 23 instead of
         week 17, and squeezed between the pill and the chevrons it read as a
         broken bar rather than as a measure. The pill takes the room. */
      options.browsing ? null : track,
      arrow('left', options.prevLabel ?? 'Previous week', options.canPrev, options.onPrev),
      arrow('right', options.nextLabel ?? 'Next week', options.canNext, options.onNext)
    )
  );
}
