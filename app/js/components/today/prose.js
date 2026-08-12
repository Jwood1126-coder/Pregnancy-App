/**
 * The two reading cards — "Your baby this week" and "Your body" — are the same
 * shape: a section title over a few short paragraphs.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';

/**
 * A card of paragraphs. Renders nothing when there is no prose to show.
 * @param {string} title Section title (rendered in small caps by the system).
 * @param {string[]} paragraphs Authored paragraphs for this week.
 * @returns {HTMLElement|null}
 */
export function proseCard(title, paragraphs) {
  const text = Array.isArray(paragraphs)
    ? paragraphs.filter((p) => typeof p === 'string' && p.trim() !== '')
    : [];
  if (text.length === 0) return null;

  return card(
    { title },
    el(
      'div',
      { class: 'prose' },
      text.map((paragraph) => el('p', {}, paragraph))
    )
  );
}
