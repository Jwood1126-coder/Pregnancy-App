/**
 * Evidence badges.
 *
 * Three strengths, three quiet treatments — and never an alarming one. The
 * badge says how sure the field is, not how worried you should be, so the
 * strongest evidence gets the app's own sage and the weakest gets an outline.
 */

import { el } from '../../lib/dom.js';

/** @typedef {import('./windows.js').Evidence} Evidence */

/** What each strength is called on screen. */
export const EVIDENCE_LABEL = /** @type {Record<Evidence, string>} */ ({
  strong: 'Well studied',
  good: 'Good evidence',
  early: 'Early research'
});

/** One-line gloss for each strength, used in the legend. */
export const EVIDENCE_GLOSS = /** @type {Record<Evidence, string>} */ ({
  strong: 'trials and guideline consensus',
  good: 'large, consistent studies',
  early: 'a few small studies so far'
});

/**
 * Normalise anything the data hands us to a known strength. An unrecognised or
 * missing grade falls to the *weakest* tier: on a screen whose whole promise is
 * calibrated honesty, a typo must never be able to print "large, consistent
 * studies" over content nobody graded. Understate, never overstate. (A content
 * test asserts every shipped entry carries a valid grade, so this default is
 * a backstop rather than a working path.)
 * @param {unknown} evidence
 * @returns {Evidence}
 */
export function evidenceKey(evidence) {
  return typeof evidence === 'string' && evidence in EVIDENCE_LABEL
    ? /** @type {Evidence} */ (evidence)
    : 'early';
}

/**
 * A small evidence pill.
 * @param {unknown} evidence One of `'strong' | 'good' | 'early'`.
 * @returns {HTMLElement}
 */
export function evidenceBadge(evidence) {
  const key = evidenceKey(evidence);
  return /** @type {HTMLElement} */ (
    el(
      'span',
      { class: `evidence evidence--${key}` },
      /* Read aloud, "Well studied" on its own is ambiguous next to a title. */
      el('span', { class: 'visually-hidden' }, 'Evidence: '),
      EVIDENCE_LABEL[key]
    )
  );
}

/**
 * The quiet line that explains all three badges, for the foot of the screen.
 * @returns {HTMLElement}
 */
export function evidenceLegend() {
  /** @type {Evidence[]} */
  const order = ['strong', 'good', 'early'];
  return /** @type {HTMLElement} */ (
    el(
      'p',
      { class: 'guide-legend' },
      order.map((key, i) => [
        el('span', { class: 'guide-legend__term' }, EVIDENCE_LABEL[key]),
        ` — ${EVIDENCE_GLOSS[key]}`,
        i < order.length - 1 ? '. ' : '.'
      ])
    )
  );
}
