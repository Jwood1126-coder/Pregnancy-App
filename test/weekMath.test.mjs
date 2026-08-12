import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PREGNANCY_DAYS,
  MIN_CONTENT_WEEK,
  MAX_CONTENT_WEEK,
  isValidISODate,
  parseISODate,
  toISODate,
  daysBetween,
  todayISO,
  daysPregnant,
  daysToGo,
  gaFromDays,
  trimesterOf,
  contentWeekFor,
  formatGA,
  dueDateFromLMP,
  pregnancyStatus,
  isPlausibleDueDate,
  dueDateBounds,
  MIN_PLAUSIBLE_DAYS,
  MAX_PLAUSIBLE_DAYS
} from '../app/js/lib/weekMath.js';

test('constants match the spec', () => {
  assert.equal(PREGNANCY_DAYS, 280);
  assert.equal(MIN_CONTENT_WEEK, 4);
  assert.equal(MAX_CONTENT_WEEK, 42);
});

test('isValidISODate accepts real dates and rejects everything else', () => {
  assert.ok(isValidISODate('2027-01-17'));
  assert.ok(isValidISODate('2028-02-29')); // leap year
  assert.equal(isValidISODate('2027-02-29'), false); // not a leap year
  assert.equal(isValidISODate('2027-13-01'), false);
  assert.equal(isValidISODate('2027-04-31'), false);
  assert.equal(isValidISODate('2027-1-7'), false);
  assert.equal(isValidISODate(''), false);
  assert.equal(isValidISODate('yesterday'), false);
  assert.equal(isValidISODate(null), false);
  assert.equal(isValidISODate(20270117), false);
});

test('parseISODate lands on local midnight, not UTC', () => {
  const d = parseISODate('2027-01-17');
  assert.equal(d.getFullYear(), 2027);
  assert.equal(d.getMonth(), 0);
  assert.equal(d.getDate(), 17);
  assert.equal(d.getHours(), 0);
  assert.equal(d.getMinutes(), 0);
  assert.throws(() => parseISODate('2027-02-30'), TypeError);
});

test('toISODate round-trips through parseISODate', () => {
  for (const iso of ['2026-08-12', '2027-01-17', '2028-02-29', '2027-12-31']) {
    assert.equal(toISODate(parseISODate(iso)), iso);
  }
});

test('daysBetween counts whole days in both directions', () => {
  assert.equal(daysBetween('2026-08-12', '2026-08-12'), 0);
  assert.equal(daysBetween('2026-08-12', '2026-08-13'), 1);
  assert.equal(daysBetween('2026-08-13', '2026-08-12'), -1);
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
  // Leap day is counted.
  assert.equal(daysBetween('2028-02-28', '2028-03-01'), 2);
  // Spans a northern-hemisphere DST change without drifting.
  assert.equal(daysBetween('2027-03-01', '2027-04-01'), 31);
  // Spans a southern-hemisphere DST change too.
  assert.equal(daysBetween('2027-09-15', '2027-11-15'), 61);
  assert.equal(daysBetween('2026-08-12', '2027-01-17'), 158);
});

test('todayISO is a well-formed local date', () => {
  assert.ok(isValidISODate(todayISO()));
  assert.equal(daysBetween(todayISO(), todayISO()), 0);
});

test('daysPregnant is 280 minus the days left', () => {
  // The canonical example: 158 days to go → 17w + 3d.
  assert.equal(daysPregnant('2027-01-17', '2026-08-12'), 122);
  assert.equal(daysToGo('2027-01-17', '2026-08-12'), 158);
  assert.deepEqual(gaFromDays(122), { weeks: 17, days: 3 });
  assert.equal(formatGA(gaFromDays(122)), '17w + 3d');
  assert.equal(contentWeekFor(gaFromDays(122).weeks), 17);
  assert.equal(trimesterOf(17), 2);
});

test('the due date itself is 40w + 0d with nothing left to go', () => {
  assert.equal(daysPregnant('2026-08-12', '2026-08-12'), 280);
  assert.equal(daysToGo('2026-08-12', '2026-08-12'), 0);
  assert.deepEqual(gaFromDays(280), { weeks: 40, days: 0 });
  const status = pregnancyStatus('2026-08-12', '2026-08-12');
  assert.equal(status.week, 40);
  assert.equal(status.isPastDue, false);
  assert.equal(status.isBeforeContent, false);
});

test('past due keeps counting up and clamps at week 42', () => {
  // Three days overdue.
  assert.equal(daysPregnant('2026-08-09', '2026-08-12'), 283);
  assert.equal(daysToGo('2026-08-09', '2026-08-12'), -3);
  assert.deepEqual(gaFromDays(283), { weeks: 40, days: 3 });
  assert.equal(pregnancyStatus('2026-08-09', '2026-08-12').isPastDue, true);

  // Two weeks overdue → 42w + 0d, still inside the content range.
  const status = pregnancyStatus('2026-07-29', '2026-08-12');
  assert.equal(status.days, 294);
  assert.deepEqual(status.ga, { weeks: 42, days: 0 });
  assert.equal(status.week, 42);

  // Three weeks overdue → 43w, clamped to week 42 content.
  assert.equal(pregnancyStatus('2026-07-22', '2026-08-12').ga.weeks, 43);
  assert.equal(pregnancyStatus('2026-07-22', '2026-08-12').week, 42);
});

test('gaFromDays splits days into completed weeks plus remainder', () => {
  assert.deepEqual(gaFromDays(0), { weeks: 0, days: 0 });
  assert.deepEqual(gaFromDays(6), { weeks: 0, days: 6 });
  assert.deepEqual(gaFromDays(7), { weeks: 1, days: 0 });
  assert.deepEqual(gaFromDays(27), { weeks: 3, days: 6 });
  assert.deepEqual(gaFromDays(28), { weeks: 4, days: 0 });
  assert.deepEqual(gaFromDays(279), { weeks: 39, days: 6 });
  assert.deepEqual(gaFromDays(122.9), { weeks: 17, days: 3 });
});

test('trimester boundaries fall at 13/14 and 27/28', () => {
  assert.equal(trimesterOf(1), 1);
  assert.equal(trimesterOf(4), 1);
  assert.equal(trimesterOf(13), 1);
  assert.equal(trimesterOf(14), 2);
  assert.equal(trimesterOf(27), 2);
  assert.equal(trimesterOf(28), 3);
  assert.equal(trimesterOf(40), 3);
  assert.equal(trimesterOf(42), 3);
});

test('contentWeekFor clamps below 4 and above 42', () => {
  assert.equal(contentWeekFor(-10), 4);
  assert.equal(contentWeekFor(0), 4);
  assert.equal(contentWeekFor(3), 4);
  assert.equal(contentWeekFor(4), 4);
  assert.equal(contentWeekFor(17), 17);
  assert.equal(contentWeekFor(42), 42);
  assert.equal(contentWeekFor(43), 42);
  assert.equal(contentWeekFor(100), 42);
  assert.equal(contentWeekFor(17.9), 17);
  assert.equal(contentWeekFor(Number.NaN), 4);
});

test('before week 4 is flagged as the early days', () => {
  // Due 280 days out → day zero of the pregnancy.
  const status = pregnancyStatus('2027-05-19', '2026-08-12');
  assert.equal(status.days, 0);
  assert.equal(status.isBeforeContent, true);
  assert.equal(status.week, 4);
});

test('dueDateFromLMP adds 280 days', () => {
  assert.equal(dueDateFromLMP('2026-04-12'), '2027-01-17');
  assert.equal(daysBetween('2026-04-12', dueDateFromLMP('2026-04-12')), 280);
  // Across a leap day.
  assert.equal(daysBetween('2027-06-01', dueDateFromLMP('2027-06-01')), 280);
});

test('pregnancyStatus reports the whole picture at once', () => {
  const status = pregnancyStatus('2027-01-17', '2026-08-12');
  assert.deepEqual(status, {
    days: 122,
    ga: { weeks: 17, days: 3 },
    week: 17,
    trimester: 2,
    daysToGo: 158,
    isBeforeContent: false,
    isPastDue: false
  });
});

test('isPlausibleDueDate fences off dates no pregnancy could have', () => {
  const today = '2026-08-12';
  // The demo date: 17w + 3d.
  assert.ok(isPlausibleDueDate('2027-01-17', today));
  // Due today, and the edges of the window.
  assert.ok(isPlausibleDueDate(today, today));
  assert.ok(isPlausibleDueDate('2027-06-02', today)); // 294 days out → 0w − 14d
  assert.ok(isPlausibleDueDate('2026-07-15', today)); // 28 days past due
  // A one-digit year typo — the bug this exists to catch.
  assert.equal(isPlausibleDueDate('2028-01-17', today), false);
  assert.equal(isPlausibleDueDate('2025-01-17', today), false);
  assert.equal(isPlausibleDueDate('2027-06-03', today), false);
  assert.equal(isPlausibleDueDate('2026-07-14', today), false);
  // Junk never passes.
  assert.equal(isPlausibleDueDate('2027-02-31', today), false);
  assert.equal(isPlausibleDueDate('', today), false);
  assert.equal(isPlausibleDueDate(null, today), false);
});

test('dueDateBounds matches the window isPlausibleDueDate enforces', () => {
  const today = '2026-08-12';
  const { min, max } = dueDateBounds(today);
  assert.ok(isPlausibleDueDate(min, today), 'the min bound must itself be allowed');
  assert.ok(isPlausibleDueDate(max, today), 'the max bound must itself be allowed');
  assert.equal(daysPregnant(max, today), MIN_PLAUSIBLE_DAYS);
  assert.equal(daysPregnant(min, today), MAX_PLAUSIBLE_DAYS);
});

test('formatGA never prints a negative gestational age', () => {
  assert.equal(formatGA({ weeks: 17, days: 3 }), '17w + 3d');
  assert.equal(formatGA({ weeks: 0, days: 0 }), '0w + 0d');
  // A far-future due date floors to zero rather than rendering "-35w + 2d".
  assert.equal(formatGA(gaFromDays(daysPregnant('2028-01-17', '2026-08-12'))), '0w + 0d');
  assert.equal(formatGA({ weeks: -1, days: 5 }), '0w + 0d');
  assert.equal(formatGA(null), '0w + 0d');
});
