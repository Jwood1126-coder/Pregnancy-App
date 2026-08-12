/**
 * The Guide's compact rows.
 *
 * One line each — weeks, what it is, how sure we are — that opens in place for
 * the two or three sentences behind it. Everything longer than a line lives
 * inside the expansion, which is what keeps the page scannable no matter how
 * much the data grows.
 */

import { el } from '../../lib/dom.js';
import { disclosure } from './disclosure.js';
import { evidenceBadge } from './evidence.js';
import { weeksLabel } from './windows.js';

/** @typedef {import('./windows.js').CriticalWindow} CriticalWindow */
/** @typedef {import('./windows.js').AvoidItem} AvoidItem */
/** @typedef {import('./windows.js').TipItem} TipItem */

/**
 * The accent panel carrying the concrete move. Shared by the rows and by the
 * full "Right now" cards, so the advice always looks like advice.
 * @param {string} text
 * @returns {HTMLElement|null}
 */
export function actionPanel(text) {
  if (!text) return null;
  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'guide-action' },
      el('span', { class: 'guide-action__label' }, 'What helps'),
      el('p', { class: 'guide-action__text' }, text)
    )
  );
}

/**
 * The honest paragraph about the evidence behind a window.
 * @param {string} note
 * @returns {HTMLElement|null}
 */
export function evidenceNote(note) {
  return note ? /** @type {HTMLElement} */ (el('p', { class: 'guide-note' }, note)) : null;
}

/**
 * The same note, folded away behind one quiet line.
 *
 * Used on the full "Right now" cards, where the note is the third paragraph in
 * a row and pushes the thing you actually came for — what's happening and what
 * to do — off the screen. It is never removed, only folded: the honesty about
 * evidence strength is the point of this screen.
 * @param {string} note
 * @returns {HTMLElement|null}
 */
export function evidenceFold(note) {
  if (!note) return null;
  return disclosure({
    class: 'guide-why',
    head: el('span', { class: 'guide-why__label' }, 'Where this comes from'),
    body: () => evidenceNote(note)
  });
}

/**
 * A window as a one-line row that expands in place.
 * @param {CriticalWindow} w
 * @param {{ current?: boolean }} [options] `current` highlights the row the
 *   user's own week sits inside.
 * @returns {HTMLElement}
 */
export function windowRow(w, options = {}) {
  return disclosure({
    class: `guide-row${options.current ? ' guide-row--current' : ''}`,
    label: `${w.title}, ${weeksLabel(w.weeks)}`,
    /* Title on its own line, weeks and badge under it. Three columns in a
       350 px phone left the titles a 110 px gutter to wrap in — this is the
       standard iOS cell, and it gives the words the width they need. */
    head: el(
      'span',
      { class: 'guide-row__head' },
      el('span', { class: 'guide-row__title' }, w.title),
      el(
        'span',
        { class: 'guide-row__meta' },
        el('span', { class: 'guide-row__weeks' }, weeksLabel(w.weeks)),
        evidenceBadge(w.evidence)
      )
    ),
    body: () => [
      el('p', { class: 'guide-detail' }, w.developing),
      actionPanel(w.action),
      evidenceNote(w.evidenceNote)
    ]
  });
}

/**
 * An avoid-list or habit row: a label, an optional badge, and the detail
 * behind it.
 * @param {{ label: string, detail: string, evidence?: unknown }} item
 * @returns {HTMLElement}
 */
export function textRow(item) {
  return disclosure({
    class: 'guide-row guide-row--text',
    label: item.label,
    /* No badge on the closed row here. Nine of the eleven things to skip are
       "Well studied", and a column of identical pills is decoration, not
       information — the badge waits inside, with the detail it qualifies. */
    head: el(
      'span',
      { class: 'guide-row__head' },
      el('span', { class: 'guide-row__title' }, item.label)
    ),
    body: () => [
      item.evidence ? el('div', { class: 'guide-detail__ev' }, evidenceBadge(item.evidence)) : null,
      el('p', { class: 'guide-detail' }, item.detail)
    ]
  });
}

/**
 * A group of rows.
 * @param {(HTMLElement|null)[]} rows
 * @param {{ raised?: boolean }} [options] `raised` gives the group its own card
 *   surface (used when it sits directly on the page, not inside a card).
 * @returns {HTMLElement}
 */
export function rowGroup(rows, options = {}) {
  return /** @type {HTMLElement} */ (
    el('div', { class: `guide-rows${options.raised ? ' guide-rows--raised' : ''}` }, rows)
  );
}
