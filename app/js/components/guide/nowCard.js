/**
 * "Right now" — the only part of the Guide that is fully open by default.
 *
 * Whatever the baby is building this week gets a whole card: what's happening,
 * the one concrete move, and an honest word about how sure the evidence is.
 * Everything else on the screen stays folded away behind it.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';
import { evidenceBadge } from './evidence.js';
import { actionPanel, evidenceFold } from './rows.js';
import { weeksLabel } from './windows.js';

/** @typedef {import('./windows.js').CriticalWindow} CriticalWindow */

/**
 * A full card for one active window.
 * @param {CriticalWindow} w
 * @returns {HTMLElement}
 */
export function nowCard(w) {
  return card(
    { class: 'guide-now' },
    el(
      'div',
      { class: 'guide-now__head' },
      el('span', { class: 'guide-now__weeks' }, weeksLabel(w.weeks)),
      evidenceBadge(w.evidence)
    ),
    el('h3', { class: 'guide-now__title' }, w.title),
    el('p', { class: 'guide-now__developing' }, w.developing),
    actionPanel(w.action),
    evidenceFold(w.evidenceNote)
  );
}

/**
 * What "Right now" says on a week with no dated window — most weeks, and not a
 * gap to apologise for.
 * @param {{ next?: CriticalWindow }} [options] The next window, when there is one.
 * @returns {HTMLElement}
 */
export function nothingNowCard(options = {}) {
  const next = options.next;
  return card(
    { class: 'guide-quiet' },
    el(
      'p',
      { class: 'guide-quiet__text' },
      'No dated milestone this week — the everyday habits below are what matter most.'
    ),
    next
      ? el(
          'p',
          { class: 'guide-quiet__next' },
          `Next up: ${next.title}, ${weeksLabel(next.weeks).toLowerCase()}.`
        )
      : null
  );
}
