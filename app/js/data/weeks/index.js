/**
 * The weekly content library: five authored chunks merged with the canonical
 * size table into complete `Week` records.
 *
 * Content chunks are written by separate agents and may be empty or partial
 * while the build is in flight — every lookup here degrades to `null` rather
 * than throwing, and the UI must handle that.
 */

import { SIZE_TABLE } from '../sizes.js';
import { trimesterOf, MIN_CONTENT_WEEK, MAX_CONTENT_WEEK } from '../../lib/weekMath.js';
import { weeks04to12 } from './weeks04to12.js';
import { weeks13to20 } from './weeks13to20.js';
import { weeks21to28 } from './weeks21to28.js';
import { weeks29to35 } from './weeks29to35.js';
import { weeks36to42 } from './weeks36to42.js';

/** @typedef {import('../../lib/types.js').Week} Week */
/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * The rotating food-safety reminders, verbatim from docs/PLAN.md.
 * A week's `nutrition.safety` must be exactly `SAFETY[(week - 4) % 7]`.
 * @type {string[]}
 */
export const SAFETY = [
  "There's no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game.",
  'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.',
  'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.',
  'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.',
  'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.',
  'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.',
  'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
];

/**
 * The safety reminder a given week must carry.
 * @param {number} week Gestational week (4–42).
 * @returns {string}
 */
export function safetyForWeek(week) {
  return SAFETY[(((week - MIN_CONTENT_WEEK) % SAFETY.length) + SAFETY.length) % SAFETY.length];
}

/** Every authored chunk, in week order. */
const CHUNKS = [weeks04to12, weeks13to20, weeks21to28, weeks29to35, weeks36to42];

/**
 * Build the merged week map once at module load.
 * @returns {Map<number, Week>}
 */
function buildIndex() {
  /** @type {Map<number, Week>} */
  const map = new Map();
  for (const chunk of CHUNKS) {
    if (!Array.isArray(chunk)) continue;
    for (const text of chunk) {
      if (!text || typeof text.week !== 'number') continue;
      const size = SIZE_TABLE[text.week];
      if (!size) continue;
      if (map.has(text.week)) {
        console.warn(`weeks/index.js: duplicate content for week ${text.week}`);
      }
      map.set(text.week, {
        ...text,
        ...size,
        trimester: trimesterOf(text.week)
      });
    }
  }
  return map;
}

const INDEX = buildIndex();

/**
 * Every week that has authored content, ascending by week number.
 * @type {Week[]}
 */
export const ALL_WEEKS = [...INDEX.values()].sort((a, b) => a.week - b.week);

/**
 * Look up one complete week.
 * @param {number} n Gestational week.
 * @returns {Week|null} The merged week, or `null` when it has no content yet
 *   or falls outside weeks 4–42.
 */
export function getWeek(n) {
  if (!Number.isFinite(n)) return null;
  const week = Math.trunc(n);
  if (week < MIN_CONTENT_WEEK || week > MAX_CONTENT_WEEK) return null;
  return INDEX.get(week) ?? null;
}

/**
 * Whether any content has been authored yet (false during early build stages).
 * @returns {boolean}
 */
export function hasContent() {
  return ALL_WEEKS.length > 0;
}
