/**
 * Shared type definitions for Little One.
 *
 * This module contains no runtime code beyond a version marker — it exists so
 * every other module can `@import` these shapes via JSDoc:
 *
 *   /** @typedef {import('../lib/types.js').Week} Week *\/
 *
 * Contracts here are binding (docs/PLAN.md § Contracts).
 */

/** @typedef {'vegetarian'|'vegan'|'dairy-free'|'nut-free'|'halal'|'kosher'} DietTag */

/** @typedef {'crown-rump'|'crown-heel'} LengthBasis */

/** @typedef {'us'|'metric'} UnitSystem */

/** @typedef {{ idea: string, tags?: DietTag[] }} EatIdea */

/** @typedef {{ id: string, label: string }} Todo */

/**
 * The week's nutrition block.
 * @typedef {{ focus: string, why: string, eat: EatIdea[], safety: string }} Nutrition
 */

/**
 * Authored prose for one week (owned by the content chunk files).
 * @typedef {{ week: number, baby: string[], body: string[],
 *   nutrition: Nutrition, todos: Todo[] }} WeekText
 */

/**
 * Canonical measurements for one week (owned by `data/sizes.js`).
 * `comparison.emoji` may be an empty string when Appendix B lists no emoji for
 * that comparison — render it conditionally.
 * @typedef {{ lengthMm: number, basis: LengthBasis, weightG: number,
 *   comparison: { name: string, emoji: string } }} WeekSize
 */

/**
 * A fully merged week: authored text + canonical size + derived trimester.
 * @typedef {WeekText & WeekSize & { trimester: 1|2|3 }} Week
 */

/**
 * Persisted app state. localStorage key: `little-one:v1`.
 * `pxPerMm: null` means "not calibrated" — use `DEFAULT_PX_PER_MM`.
 * `todosDone` maps a todo id to whether it is checked off.
 * `version` is `SCHEMA_VERSION` for anything this build writes; a record left
 * by a newer build keeps its own higher number rather than being downgraded.
 * @typedef {{ version: number, dueDateISO: string|null, nickname: string,
 *   units: UnitSystem, dietTags: DietTag[], pxPerMm: number|null,
 *   todosDone: Object<string, boolean> }} Settings
 */

/**
 * Gestational age split into completed weeks plus leftover days.
 * @typedef {{ weeks: number, days: number }} GestationalAge
 */

/**
 * One scalable baby outline. `path` is a single closed SVG path, head at top,
 * expressed in `viewBox` units. `heelY` is required for any silhouette that
 * covers weeks >= 20 (crown-heel measurement basis).
 * @typedef {{ id: string, minWeek: number, maxWeek: number,
 *   viewBox: { w: number, h: number },
 *   path: string,
 *   crownY: number,
 *   rumpY: number,
 *   heelY: number|null }} Silhouette
 */

/**
 * The context object every screen's `render(ctx)` receives from `main.js`.
 * @typedef {{
 *   settings: Settings,
 *   update: (patch: Partial<Settings>) => Settings,
 *   go: (tab: TabId) => void,
 *   showSettings: () => void,
 *   initialWeek: number|null
 * }} ScreenContext
 */

/** @typedef {'today'|'size'|'guide'} TabId */

/** Schema version of the persisted `Settings` object. */
export const SCHEMA_VERSION = 1;
