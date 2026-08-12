/**
 * Pure gestational-age math.
 *
 * All dates are handled as **date-only values at local midnight** so that a
 * user in any timezone gets the same answer as their calendar. Nothing here
 * touches storage, the DOM, or the clock except `todayISO()`.
 *
 * Conventions (MASTER_PROMPT § SETUP & THE WEEK ENGINE):
 * - A pregnancy is 280 days: `daysPregnant = 280 − daysUntilDueDate`.
 * - Content is indexed by *completed* weeks: 17w+3d reads week 17 content.
 * - Trimesters: T1 = weeks 1–13, T2 = 14–27, T3 = 28+.
 * - Content exists for weeks 4–42 only; everything else clamps into that range.
 */

/** Length of a full-term pregnancy, in days (LMP-based). */
export const PREGNANCY_DAYS = 280;

/** First week with content. */
export const MIN_CONTENT_WEEK = 4;

/** Last week with content. */
export const MAX_CONTENT_WEEK = 42;

const MS_PER_DAY = 86400000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * True when `iso` is a well-formed, real calendar date in `YYYY-MM-DD` form.
 * @param {unknown} iso
 * @returns {boolean}
 */
export function isValidISODate(iso) {
  if (typeof iso !== 'string') return false;
  const m = ISO_RE.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, mo - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
  );
}

/**
 * Parse a `YYYY-MM-DD` string into a `Date` at **local** midnight.
 * (`new Date('2027-01-17')` would parse as UTC and drift a day in the Americas.)
 * @param {string} iso Date in `YYYY-MM-DD` form.
 * @returns {Date} A Date at local midnight on that day.
 * @throws {TypeError} When `iso` is not a valid calendar date.
 */
export function parseISODate(iso) {
  if (!isValidISODate(iso)) {
    throw new TypeError(`parseISODate: expected YYYY-MM-DD, got ${String(iso)}`);
  }
  const m = /** @type {RegExpExecArray} */ (ISO_RE.exec(/** @type {string} */ (iso)));
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Format a `Date` as a local `YYYY-MM-DD` string.
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date) {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Whole days from `a` to `b` (i.e. `b − a`). Negative when `b` is earlier.
 * Rounds through the local-noon trick so DST shifts never produce 0.96 days.
 * @param {string|Date} a Start date (ISO string or Date).
 * @param {string|Date} b End date (ISO string or Date).
 * @returns {number} Whole days.
 */
export function daysBetween(a, b) {
  const da = typeof a === 'string' ? parseISODate(a) : a;
  const db = typeof b === 'string' ? parseISODate(b) : b;
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((ub - ua) / MS_PER_DAY);
}

/**
 * Today as a local `YYYY-MM-DD` string.
 * @returns {string}
 */
export function todayISO() {
  return toISODate(new Date());
}

/**
 * Days elapsed in the pregnancy: `280 − daysUntilDueDate`.
 * Can exceed 280 once the due date has passed, and can be negative for a due
 * date more than 280 days out.
 * @param {string} dueISO Due date, `YYYY-MM-DD`.
 * @param {string} [todayIso] "Today", `YYYY-MM-DD`. Defaults to the real today.
 * @returns {number} Whole days pregnant.
 */
export function daysPregnant(dueISO, todayIso = todayISO()) {
  return PREGNANCY_DAYS - daysBetween(todayIso, dueISO);
}

/**
 * Days remaining until the due date. Negative once past due.
 * @param {string} dueISO Due date, `YYYY-MM-DD`.
 * @param {string} [todayIso] "Today", `YYYY-MM-DD`. Defaults to the real today.
 * @returns {number}
 */
export function daysToGo(dueISO, todayIso = todayISO()) {
  return daysBetween(todayIso, dueISO);
}

/**
 * Split a day count into completed weeks plus leftover days ("17w + 3d").
 * @param {number} d Days pregnant.
 * @returns {import('./types.js').GestationalAge}
 */
export function gaFromDays(d) {
  const n = Math.trunc(d);
  return { weeks: Math.floor(n / 7), days: ((n % 7) + 7) % 7 };
}

/**
 * Which trimester a gestational week belongs to.
 * T1 = weeks 1–13 · T2 = 14–27 · T3 = 28 and beyond.
 * @param {number} week Gestational week.
 * @returns {1|2|3}
 */
export function trimesterOf(week) {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

/**
 * Clamp a gestational week into the range that has content (4–42).
 * @param {number} weeks Completed gestational weeks.
 * @returns {number} A week in [4, 42].
 */
export function contentWeekFor(weeks) {
  const n = Math.trunc(weeks);
  if (!Number.isFinite(n) || n < MIN_CONTENT_WEEK) return MIN_CONTENT_WEEK;
  if (n > MAX_CONTENT_WEEK) return MAX_CONTENT_WEEK;
  return n;
}

/**
 * "17w + 3d" — the standard shorthand for a gestational age.
 * @param {import('./types.js').GestationalAge} ga
 * @returns {string}
 */
export function formatGA(ga) {
  return `${ga.weeks}w + ${ga.days}d`;
}

/**
 * Due date derived from the first day of the last menstrual period
 * (Naegele's rule: LMP + 280 days).
 * @param {string} lmpISO First day of the last period, `YYYY-MM-DD`.
 * @returns {string} Estimated due date, `YYYY-MM-DD`.
 */
export function dueDateFromLMP(lmpISO) {
  const d = parseISODate(lmpISO);
  d.setDate(d.getDate() + PREGNANCY_DAYS);
  return toISODate(d);
}

/**
 * Everything the UI needs about "where are we today", in one call.
 * @param {string} dueISO Due date, `YYYY-MM-DD`.
 * @param {string} [todayIso] "Today", `YYYY-MM-DD`. Defaults to the real today.
 * @returns {{ days: number, ga: import('./types.js').GestationalAge,
 *   week: number, trimester: 1|2|3, daysToGo: number, isBeforeContent: boolean,
 *   isPastDue: boolean }}
 */
export function pregnancyStatus(dueISO, todayIso = todayISO()) {
  const days = daysPregnant(dueISO, todayIso);
  const ga = gaFromDays(days);
  const week = contentWeekFor(ga.weeks);
  return {
    days,
    ga,
    week,
    trimester: trimesterOf(ga.weeks),
    daysToGo: daysToGo(dueISO, todayIso),
    isBeforeContent: ga.weeks < MIN_CONTENT_WEEK,
    isPastDue: days > PREGNANCY_DAYS
  };
}
