/**
 * Guide data access — one safe front door to `app/js/data/guide.js`.
 *
 * The data module is authored separately and is the single source of truth for
 * what the Guide says; this file only guards the *shapes* it hands back, so a
 * missing key or an odd week range degrades into a quieter page rather than a
 * blank screen. Every consumer (the Guide screen and Today's link card) reads
 * the data through here, so "what counts as active" is defined exactly once.
 */

import {
  CRITICAL_WINDOWS,
  ALWAYS_AVOID,
  GENERAL_TIPS,
  windowsForWeek
} from '../../data/guide.js';
import { MIN_CONTENT_WEEK, MAX_CONTENT_WEEK } from '../../lib/weekMath.js';

/** How far ahead "Coming up" looks, in weeks (the data contract's horizon). */
export const UPCOMING_WEEKS = 3;

/** @typedef {'strong'|'good'|'early'} Evidence */

/**
 * One dated window of development, mirrored from the data contract so this
 * screen is type-checked without importing types across the boundary.
 * @typedef {{ id: string, weeks: [number, number], title: string,
 *   developing: string, action: string, evidence: Evidence,
 *   evidenceNote: string }} CriticalWindow
 */

/** @typedef {{ id: string, label: string, detail: string, evidence: Evidence }} AvoidItem */

/** @typedef {{ id: string, label: string, detail: string, evidence?: Evidence }} TipItem */

/**
 * First week of a window, or `NaN` when the entry is malformed.
 * @param {CriticalWindow} w
 * @returns {number}
 */
export function startOf(w) {
  return Array.isArray(w?.weeks) ? Number(w.weeks[0]) : NaN;
}

/**
 * Last week of a window (inclusive); falls back to the start week.
 * @param {CriticalWindow} w
 * @returns {number}
 */
export function endOf(w) {
  const end = Array.isArray(w?.weeks) ? Number(w.weeks[1]) : NaN;
  return Number.isFinite(end) ? end : startOf(w);
}

/** Every authored window, earliest first. @type {CriticalWindow[]} */
export const WINDOWS = (Array.isArray(CRITICAL_WINDOWS) ? [...CRITICAL_WINDOWS] : [])
  .filter((w) => w && Number.isFinite(startOf(w)))
  .sort((a, b) => startOf(a) - startOf(b) || endOf(a) - endOf(b));

/** The ongoing avoid list. @type {AvoidItem[]} */
export const AVOID = Array.isArray(ALWAYS_AVOID) ? ALWAYS_AVOID.filter(Boolean) : [];

/** The everyday habits list. @type {TipItem[]} */
export const TIPS = Array.isArray(GENERAL_TIPS) ? GENERAL_TIPS.filter(Boolean) : [];

/**
 * How many weeks a window covers — the app's measure of how *specific* it is.
 * @param {CriticalWindow} w
 * @returns {number}
 */
export function spanOf(w) {
  return endOf(w) - startOf(w);
}

/**
 * Order windows by how much they are about right now: the tightest window
 * first, and the most recently opened one when two are equally tight. A
 * three-week window is a deadline; a thirty-week one is a background habit,
 * and printing them in data order would bury the deadline under the habit.
 * @param {CriticalWindow[]} windows
 * @returns {CriticalWindow[]} A new, sorted array.
 */
export function rankByUrgency(windows) {
  return [...windows].sort((a, b) => spanOf(a) - spanOf(b) || startOf(b) - startOf(a));
}

/**
 * Human label for a week range.
 *
 * Ranges that run to the end of the book are phrased, not numbered: "Weeks
 * 4–42" is arithmetic, "All the way through" is the thing it means.
 * @param {[number, number]} weeks Inclusive `[start, end]`.
 * @param {boolean} [short] Compact form (`"11–13"`, `"14+"`), for rows.
 * @returns {string}
 */
export function weeksLabel(weeks, short = false) {
  const a = Number(weeks?.[0]);
  if (!Number.isFinite(a)) return '';
  const b = Number(weeks?.[1]);
  const openEnded = Number.isFinite(b) && b >= MAX_CONTENT_WEEK;

  if (openEnded && a <= MIN_CONTENT_WEEK) return short ? 'All' : 'All the way through';
  if (openEnded) return short ? `${a}+` : `Week ${a} onward`;
  if (!Number.isFinite(b) || b === a) return short ? `${a}` : `Week ${a}`;
  return short ? `${a}–${b}` : `Weeks ${a}–${b}`;
}

/**
 * Windows active in — and just ahead of — a gestational week.
 *
 * Delegates to the data module's own `windowsForWeek`, and recomputes locally
 * if that function is missing or hands back something other than two arrays.
 * @param {number} week Gestational week (any number; unclamped).
 * @returns {{ active: CriticalWindow[], upcoming: CriticalWindow[] }}
 */
export function windowsFor(week) {
  if (typeof windowsForWeek === 'function') {
    try {
      const result = windowsForWeek(week);
      if (result && Array.isArray(result.active) && Array.isArray(result.upcoming)) {
        return { active: result.active.filter(Boolean), upcoming: result.upcoming.filter(Boolean) };
      }
    } catch {
      /* fall through to the local computation */
    }
  }
  return {
    active: WINDOWS.filter((w) => week >= startOf(w) && week <= endOf(w)),
    upcoming: WINDOWS.filter((w) => startOf(w) > week && startOf(w) <= week + UPCOMING_WEEKS)
  };
}
