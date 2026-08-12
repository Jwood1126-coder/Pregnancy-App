/**
 * Guide — what matters when, and how sure we are.
 *
 * The owner's brief for this screen was "don't pack too much on one page, it
 * gets lost", so the page is built as one short answer with everything else
 * folded underneath it:
 *
 *   Right now      the windows this week actually sits in — open, in full
 *   Coming up      the next three weeks, one line each
 *   The journey    every window, by trimester — collapsed
 *   Skip these     the ongoing avoid list — collapsed
 *   Good habits    the everyday tips — collapsed
 *
 * A reader who opens the tab and reads nothing but the top of it still gets
 * the right answer for today. The three folded sections are the reference
 * material, and they cost one tap and nothing at all until they're opened —
 * their contents aren't even built until first expand.
 */

import { el } from '../lib/dom.js';
import { card } from '../components/card.js';
import { disclaimer } from '../components/disclaimer.js';
import { disclosure } from '../components/guide/disclosure.js';
import { evidenceLegend } from '../components/guide/evidence.js';
import { nowCard, nothingNowCard } from '../components/guide/nowCard.js';
import { rowGroup, textRow, windowRow } from '../components/guide/rows.js';
import {
  AVOID,
  TIPS,
  WINDOWS,
  rankByUrgency,
  startOf,
  windowsFor
} from '../components/guide/windows.js';
import { pregnancyStatus, trimesterOf } from '../lib/weekMath.js';
import { trimesterLabel } from '../lib/units.js';

/** @typedef {import('../lib/types.js').ScreenContext} ScreenContext */
/** @typedef {import('../components/guide/windows.js').CriticalWindow} CriticalWindow */

/** The screen's one-line promise, under the title. */
export const GUIDE_SUBTITLE = 'What matters when, and how sure we are.';

/**
 * How many active windows get a full card before the rest drop to one-line
 * rows. Some windows run for thirty weeks, so a week can sit inside five at
 * once — and five full cards is exactly the wall of text this screen exists to
 * avoid. The two tightest windows are the ones that are really about *now*.
 */
export const MAX_NOW_CARDS = 2;

/**
 * How many of the remaining active windows stay visible as rows before the
 * lot folds away. By the third trimester nine or ten windows are open at once
 * — nearly all of them long-running habits — and a ten-row "Right now" pushes
 * the rest of the screen off the bottom of the phone.
 */
export const MAX_NOW_ROWS = 3;

/**
 * Render the Guide screen.
 * @param {ScreenContext} ctx Screen context from `main.js`.
 * @returns {HTMLElement}
 */
export function render(ctx) {
  const week = currentWeek(ctx.settings.dueDateISO);
  const { active, upcoming } = week === null ? { active: [], upcoming: [] } : windowsFor(week);
  const activeIds = new Set(active.map((w) => w.id));

  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'screen guide-screen' },

      el(
        'header',
        { class: 'screen-head' },
        el(
          'div',
          {},
          el('h1', { class: 'title' }, 'Guide'),
          el('p', { class: 'screen-head__meta' }, GUIDE_SUBTITLE)
        )
      ),

      week === null ? noWeekCard(ctx) : section('Right now', rightNow(active, upcoming, week)),

      upcoming.length
        ? section(
            'Coming up',
            rowGroup(
              upcoming.map((w) => windowRow(w)),
              { raised: true }
            )
          )
        : null,

      WINDOWS.length
        ? foldedCard('The whole journey', () => timeline(activeIds), WINDOWS.length)
        : null,
      AVOID.length
        ? foldedCard(
            'Skip these — the whole way through',
            () => rowGroup(AVOID.map((item) => textRow(item))),
            AVOID.length
          )
        : null,
      TIPS.length
        ? foldedCard(
            'Good habits',
            () => rowGroup(TIPS.map((item) => textRow(item))),
            TIPS.length
          )
        : null,

      evidenceLegend(),
      disclaimer()
    )
  );
}

/* -------------------------------------------------------------------------
   Pieces
   ------------------------------------------------------------------------- */

/**
 * The contents of "Right now": full cards for the two tightest windows, and
 * one-line rows for any wider ones this week also sits inside.
 * @param {CriticalWindow[]} active
 * @param {CriticalWindow[]} upcoming
 * @param {number} week
 * @returns {any}
 */
function rightNow(active, upcoming, week) {
  if (!active.length) return nothingNowCard({ next: upcoming[0] ?? nextAfter(week) });

  const ranked = rankByUrgency(active);
  const rest = ranked.slice(MAX_NOW_CARDS);
  const rows = () => rest.map((w) => windowRow(w));

  return [
    ranked.slice(0, MAX_NOW_CARDS).map((w) => nowCard(w)),
    /* A short tail stays on the page; a long one gets a door, because hiding
       one row behind a tap is worse than showing it and showing eight is
       worse than hiding them. */
    rest.length === 0
      ? null
      : rest.length <= MAX_NOW_ROWS
        ? rowGroup(rows(), { raised: true })
        : foldedCard('Also running now', () => rowGroup(rows()), rest.length)
  ];
}

/**
 * A titled block on the page — an iOS grouped-list header over its content.
 * @param {string} title
 * @param {any} content
 * @returns {HTMLElement}
 */
function section(title, content) {
  return /** @type {HTMLElement} */ (
    el(
      'section',
      { class: 'guide-section' },
      el('h2', { class: 'section-title guide-section__title' }, title),
      content
    )
  );
}

/**
 * A card that is a closed door until it's tapped. The body is built on first
 * open, so a screen full of these costs nothing to render.
 * @param {string} title
 * @param {() => any} body
 * @param {number} [count] How many items are behind the door.
 * @returns {HTMLElement}
 */
function foldedCard(title, body, count) {
  return /** @type {HTMLElement} */ (
    el(
      'section',
      { class: 'card guide-fold' },
      disclosure({
        toggleClass: 'guide-fold__toggle',
        /* Sentence case, not the app's uppercase section label: these are
           doors, not headings, and "SKIP THESE — THE WHOLE WAY THROUGH" in
           tracked-out caps needs two lines to say what one line says here. */
        head: [
          el('span', { class: 'guide-fold__title' }, title),
          /* The count is what a closed door owes you: how much is behind it. */
          count ? el('span', { class: 'guide-fold__count' }, String(count)) : null
        ],
        label: count ? `${title}, ${count} items` : title,
        body
      })
    )
  );
}

/**
 * Every window, grouped by trimester, with the current one marked.
 * @param {Set<string>} activeIds Ids of the windows covering this week.
 * @returns {HTMLElement[]}
 */
function timeline(activeIds) {
  /** @type {HTMLElement[]} */
  const groups = [];
  for (const trimester of /** @type {(1|2|3)[]} */ ([1, 2, 3])) {
    const windows = WINDOWS.filter((w) => trimesterOf(startOf(w)) === trimester);
    if (!windows.length) continue;
    groups.push(
      /** @type {HTMLElement} */ (
        el(
          'div',
          { class: 'guide-group' },
          el('h3', { class: 'guide-group__title' }, trimesterLabel(trimester)),
          rowGroup(windows.map((w) => windowRow(w, { current: activeIds.has(w.id) })))
        )
      )
    );
  }
  return groups;
}

/**
 * Shown only if the Guide is somehow reached without a usable due date — the
 * welcome gate normally makes this unreachable.
 * @param {ScreenContext} ctx
 * @returns {HTMLElement}
 */
function noWeekCard(ctx) {
  return card(
    { class: 'guide-quiet' },
    el(
      'p',
      { class: 'guide-quiet__text' },
      'Add your due date and this page will follow your weeks. Everything below applies the whole way through.'
    ),
    el(
      'button',
      { class: 'btn btn--quiet guide-quiet__btn', type: 'button', onClick: () => ctx.showSettings() },
      'Open Settings'
    )
  );
}

/* -------------------------------------------------------------------------
   Week
   ------------------------------------------------------------------------- */

/**
 * The gestational week the Guide should answer for: the user's own week, or
 * their raw week count while they are still before week 4 (so "Coming up"
 * looks forward from where they really are).
 * @param {string|null} dueISO
 * @returns {number|null} `null` when there is no usable due date.
 */
function currentWeek(dueISO) {
  if (!dueISO) return null;
  try {
    const status = pregnancyStatus(dueISO);
    return status.isBeforeContent ? status.ga.weeks : status.week;
  } catch {
    return null;
  }
}

/**
 * The first window still ahead of a week, for the quiet "next up" line.
 * @param {number} week
 * @returns {CriticalWindow|undefined}
 */
function nextAfter(week) {
  return WINDOWS.find((w) => startOf(w) > week);
}
