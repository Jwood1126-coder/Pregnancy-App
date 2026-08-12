/**
 * Human-readable length and weight formatting for both unit systems.
 *
 * Pure module — no DOM, no storage. `u` is `'us'` (inches / ounces / pounds) or
 * `'metric'` (centimetres / grams / kilograms).
 */

const MM_PER_INCH = 25.4;
const G_PER_OUNCE = 28.349523125;
const OUNCES_PER_POUND = 16;

/**
 * Format a length.
 *
 * - `'us'`: inches to one decimal — `"5.1 in"`. Below one inch two decimals are
 *   used so the earliest weeks don't all read `"0.0 in"` (week 4 → `"0.04 in"`).
 * - `'metric'`: centimetres to one decimal — `"13.0 cm"`.
 *
 * @param {number} mm Length in millimetres.
 * @param {import('./types.js').UnitSystem} [u] Unit system (default `'us'`).
 * @returns {string} Formatted length, or `"—"` for missing/invalid input.
 */
export function formatLength(mm, u = 'us') {
  if (!Number.isFinite(mm) || mm < 0) return '—';
  if (u === 'metric') {
    return `${(mm / 10).toFixed(1)} cm`;
  }
  const inches = mm / MM_PER_INCH;
  return inches < 1 ? `${inches.toFixed(2)} in` : `${inches.toFixed(1)} in`;
}

/**
 * Format a weight.
 *
 * - `'us'`: under an ounce → `"less than an ounce"`; under a pound → ounces to
 *   one decimal (`"4.9 oz"`); a pound or more → `"7 lb 10 oz"` (whole ounces,
 *   carrying to the next pound when they round to 16, and dropping a trailing
 *   `"0 oz"`).
 * - `'metric'`: under a gram → `"less than a gram"`; under a kilo → whole grams
 *   (`"140 g"`); a kilo or more → `"3.46 kg"`.
 *
 * @param {number} g Weight in grams.
 * @param {import('./types.js').UnitSystem} [u] Unit system (default `'us'`).
 * @returns {string} Formatted weight, or `"—"` for missing/invalid input.
 */
export function formatWeight(g, u = 'us') {
  if (!Number.isFinite(g) || g < 0) return '—';

  /* Round first, then choose the unit, so the printed number and the unit it
     is printed in can never disagree (999.6 g must not render as "1000 g"). */
  if (u === 'metric') {
    if (g < 1) return 'less than a gram';
    const grams = Math.round(g);
    if (grams < 1000) return `${grams} g`;
    return `${(Math.round(g / 10) / 100).toFixed(2)} kg`;
  }

  const ounces = g / G_PER_OUNCE;
  if (ounces < 1) return 'less than an ounce';
  const oz1 = Math.round(ounces * 10) / 10;
  if (oz1 < OUNCES_PER_POUND) return `${oz1.toFixed(1)} oz`;

  let pounds = Math.floor(ounces / OUNCES_PER_POUND);
  let rest = Math.round(ounces - pounds * OUNCES_PER_POUND);
  if (rest >= OUNCES_PER_POUND) {
    pounds += 1;
    rest = 0;
  }
  return rest === 0 ? `${pounds} lb` : `${pounds} lb ${rest} oz`;
}

/**
 * The label for a measurement basis, for the "always say which" rule.
 * @param {import('./types.js').LengthBasis} basis
 * @returns {string} `"head to bottom"` or `"head to heel"`.
 */
export function basisLabel(basis) {
  return basis === 'crown-heel' ? 'head to heel' : 'head to bottom';
}

/**
 * Ordinal name of a trimester, for headers ("2nd trimester").
 * @param {1|2|3} trimester
 * @returns {string}
 */
export function trimesterLabel(trimester) {
  const names = { 1: '1st trimester', 2: '2nd trimester', 3: '3rd trimester' };
  return names[trimester] ?? '';
}

/**
 * A gentle countdown phrase: "158 days to go", "Due today", "3 days past your
 * due date".
 * @param {number} days Days remaining (negative once past due).
 * @returns {string}
 */
export function formatDaysToGo(days) {
  if (!Number.isFinite(days)) return '';
  const n = Math.trunc(days);
  if (n === 0) return 'Due today';
  if (n === 1) return '1 day to go';
  if (n > 1) return `${n} days to go`;
  const past = Math.abs(n);
  return past === 1 ? '1 day past your due date' : `${past} days past your due date`;
}
