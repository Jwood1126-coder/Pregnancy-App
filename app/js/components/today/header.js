/**
 * Today's header: an oversized week numeral, the gestational-age line beneath
 * it, an optional warm eyebrow (the baby's nickname), and the settings gear.
 */

import { el } from '../../lib/dom.js';
import { gearIcon } from './icons.js';

/**
 * @typedef {Object} HeaderOptions
 * @property {string} title Headline text — normally `"Week 17"`.
 * @property {string} meta Line beneath it, e.g. `"17w + 3d · 2nd trimester · 158 days to go"`.
 * @property {string} [eyebrow] Small line above the headline (nickname, browse state).
 * @property {boolean} [big] Render the headline as the oversized numeral (default true).
 * @property {() => void} onSettings Opens the Settings sheet.
 */

/**
 * Build the Today header.
 * @param {HeaderOptions} options
 * @returns {HTMLElement}
 */
export function todayHeader(options) {
  const big = options.big !== false;

  return /** @type {HTMLElement} */ (
    el(
      'header',
      { class: 'screen-head' },
      el(
        'div',
        {},
        options.eyebrow ? el('p', { class: 'today-eyebrow' }, options.eyebrow) : null,
        el('h1', { class: big ? 'week-numeral' : 'title' }, options.title),
        el('p', { class: 'screen-head__meta' }, options.meta)
      ),
      el(
        'button',
        {
          class: 'btn btn--icon',
          type: 'button',
          'aria-label': 'Settings',
          onClick: () => options.onSettings()
        },
        gearIcon()
      )
    )
  );
}
