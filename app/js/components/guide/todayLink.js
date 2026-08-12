/**
 * Today's one-line door to the Guide.
 *
 * A single slim row under the size card: what this week is critical for, how
 * sure we are, and a chevron. It is deliberately one line — Today is already a
 * long screen, and the Guide is where the depth lives.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';
import { chevron } from '../today/icons.js';
import { evidenceBadge } from './evidence.js';
import { rankByUrgency, windowsFor } from './windows.js';

/**
 * @typedef {Object} GuideLinkOptions
 * @property {number} week The week on screen.
 * @property {boolean} [browsing] True when this is not the user's own week.
 * @property {() => void} onOpen Opens the Guide tab.
 */

/**
 * Build the link card, or `null` when this week has nothing to point at.
 * @param {GuideLinkOptions} options
 * @returns {HTMLElement|null}
 */
export function guideLinkCard(options) {
  const { active, upcoming } = windowsFor(options.week);
  /* The tightest window is the one worth one line of Today. */
  const entry = rankByUrgency(active)[0] ?? upcoming[0] ?? null;
  if (!entry) return null;

  /* "Now" is only true on the user's own week; while browsing, the same row
     has to say which week it is talking about. */
  const label = active.length
    ? options.browsing
      ? 'Critical this week'
      : 'Critical now'
    : 'Coming up';

  return card(
    {
      class: 'today-guide',
      onClick: options.onOpen,
      ariaLabel: `${label}: ${entry.title}. Open the Guide.`
    },
    el(
      'span',
      { class: 'today-guide__row' },
      el(
        'span',
        { class: 'today-guide__text' },
        el('span', { class: 'today-guide__label' }, label),
        el('span', { class: 'today-guide__title' }, entry.title)
      ),
      evidenceBadge(entry.evidence),
      el('span', { class: 'today-guide__go', 'aria-hidden': 'true' }, chevron('right', 14))
    )
  );
}
