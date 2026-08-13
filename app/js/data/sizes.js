/**
 * Canonical fetal size table — weeks 4–42.
 *
 * Copied exactly from MASTER_PROMPT.md Appendix B (population averages).
 * Lengths are **crown-rump through week 19** and **crown-heel from week 20**;
 * the apparent jump at week 20 is a change of ruler, not a growth spurt.
 *
 * Weights listed as "<1 g" in the appendix are stored as `0.5`.
 * Comparison emoji: the appendix leaves nine rows without one, and a heart
 * fallback beside "about the size of a grapefruit" reads as a missing image
 * one week in four. Appendix B explicitly allows swapping a comparison for a
 * better emoji fit (lengths and weights are untouched), so eight of the nine
 * now carry one. Week 5's sesame seed keeps the app's own mark: as the single
 * exception, at the very start, it reads as "too small to picture".
 *
 * Lengths and weights are fixed; comparisons live here (never in the content
 * chunks) so a single edit changes every surface.
 */

/** @typedef {import('../lib/types.js').WeekSize} WeekSize */

const CR = /** @type {import('../lib/types.js').LengthBasis} */ ('crown-rump');
const CH = /** @type {import('../lib/types.js').LengthBasis} */ ('crown-heel');

/**
 * Week number → canonical measurements.
 * @type {Object<number, WeekSize>}
 */
export const SIZE_TABLE = {
  4: { lengthMm: 1, basis: CR, weightG: 0.5, comparison: { name: 'poppy seed', emoji: '🌱' } },
  5: { lengthMm: 2, basis: CR, weightG: 0.5, comparison: { name: 'sesame seed', emoji: '' } },
  6: { lengthMm: 6, basis: CR, weightG: 0.5, comparison: { name: 'sweet pea', emoji: '🫛' } },
  7: { lengthMm: 12, basis: CR, weightG: 0.5, comparison: { name: 'blueberry', emoji: '🫐' } },
  8: { lengthMm: 16, basis: CR, weightG: 1, comparison: { name: 'grape', emoji: '🍇' } },
  9: { lengthMm: 23, basis: CR, weightG: 2, comparison: { name: 'cherry', emoji: '🍒' } },
  10: { lengthMm: 31, basis: CR, weightG: 4, comparison: { name: 'kumquat', emoji: '🍊' } },
  11: { lengthMm: 41, basis: CR, weightG: 7, comparison: { name: 'strawberry', emoji: '🍓' } },
  12: { lengthMm: 54, basis: CR, weightG: 14, comparison: { name: 'lime', emoji: '🍋‍🟩' } },
  13: { lengthMm: 74, basis: CR, weightG: 23, comparison: { name: 'lemon', emoji: '🍋' } },
  14: { lengthMm: 87, basis: CR, weightG: 43, comparison: { name: 'peach', emoji: '🍑' } },
  15: { lengthMm: 101, basis: CR, weightG: 70, comparison: { name: 'apple', emoji: '🍎' } },
  16: { lengthMm: 116, basis: CR, weightG: 100, comparison: { name: 'avocado', emoji: '🥑' } },
  17: { lengthMm: 130, basis: CR, weightG: 140, comparison: { name: 'pear', emoji: '🍐' } },
  18: { lengthMm: 142, basis: CR, weightG: 190, comparison: { name: 'bell pepper', emoji: '🫑' } },
  19: { lengthMm: 153, basis: CR, weightG: 240, comparison: { name: 'mango', emoji: '🥭' } },
  20: { lengthMm: 256, basis: CH, weightG: 300, comparison: { name: 'banana', emoji: '🍌' } },
  21: { lengthMm: 267, basis: CH, weightG: 360, comparison: { name: 'carrot', emoji: '🥕' } },
  22: { lengthMm: 278, basis: CH, weightG: 430, comparison: { name: 'corn on the cob', emoji: '🌽' } },
  23: { lengthMm: 289, basis: CH, weightG: 500, comparison: { name: 'grapefruit', emoji: '🍊' } },
  24: { lengthMm: 300, basis: CH, weightG: 600, comparison: { name: 'cantaloupe', emoji: '🍈' } },
  25: { lengthMm: 346, basis: CH, weightG: 660, comparison: { name: 'head of broccoli', emoji: '🥦' } },
  26: { lengthMm: 356, basis: CH, weightG: 760, comparison: { name: 'head of lettuce', emoji: '🥬' } },
  27: { lengthMm: 366, basis: CH, weightG: 875, comparison: { name: 'sweet potato', emoji: '🍠' } },
  28: { lengthMm: 376, basis: CH, weightG: 1005, comparison: { name: 'eggplant', emoji: '🍆' } },
  29: { lengthMm: 386, basis: CH, weightG: 1150, comparison: { name: 'zucchini', emoji: '🥒' } },
  30: { lengthMm: 399, basis: CH, weightG: 1320, comparison: { name: 'cabbage', emoji: '🥬' } },
  31: { lengthMm: 411, basis: CH, weightG: 1500, comparison: { name: 'coconut', emoji: '🥥' } },
  32: { lengthMm: 424, basis: CH, weightG: 1700, comparison: { name: 'jicama', emoji: '🥔' } },
  33: { lengthMm: 437, basis: CH, weightG: 1920, comparison: { name: 'pineapple', emoji: '🍍' } },
  34: { lengthMm: 450, basis: CH, weightG: 2150, comparison: { name: 'large cantaloupe', emoji: '🍈' } },
  35: { lengthMm: 462, basis: CH, weightG: 2380, comparison: { name: 'honeydew melon', emoji: '🍈' } },
  36: { lengthMm: 474, basis: CH, weightG: 2620, comparison: { name: 'romaine lettuce', emoji: '🥬' } },
  37: { lengthMm: 486, basis: CH, weightG: 2860, comparison: { name: 'winter melon', emoji: '🍈' } },
  38: { lengthMm: 498, basis: CH, weightG: 3080, comparison: { name: 'mini pumpkin', emoji: '🎃' } },
  39: { lengthMm: 507, basis: CH, weightG: 3290, comparison: { name: 'mini watermelon', emoji: '🍉' } },
  40: { lengthMm: 512, basis: CH, weightG: 3460, comparison: { name: 'small pumpkin', emoji: '🎃' } },
  41: { lengthMm: 515, basis: CH, weightG: 3600, comparison: { name: 'watermelon', emoji: '🍉' } },
  42: { lengthMm: 517, basis: CH, weightG: 3700, comparison: { name: 'watermelon', emoji: '🍉' } }
};

/** The week at which the measurement basis switches from crown-rump to crown-heel. */
export const BASIS_SWITCH_WEEK = 20;

/**
 * Friendly note shown at the 19 → 20 transition, where two things change at
 * once: the ruler (so the number jumps without the baby growing overnight) and
 * what the number describes relative to the picture (the length is now taken
 * with the legs straightened, while the drawing keeps the curl your baby is
 * actually in). Both need saying, or the picture looks too small for the stat.
 */
export const BASIS_SWITCH_NOTE =
  'From here the length is head to heel, not head to bottom — that jump is ' +
  'the ruler changing, not a growth spurt. It’s measured with the legs ' +
  'straightened out, so the picture stays curled up, the way your baby ' +
  'really lies.';

/**
 * Footer reminder for the Size view: these are population averages.
 */
export const AVERAGES_NOTE =
  'These are averages — every baby grows at their own pace.';

/**
 * Look up one week's canonical measurements.
 * @param {number} week Gestational week (4–42).
 * @returns {WeekSize|null} The row, or `null` outside the table.
 */
export function sizeForWeek(week) {
  return SIZE_TABLE[week] ?? null;
}
