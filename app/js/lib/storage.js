/**
 * Versioned settings persistence on `localStorage`, plus a tiny subscribe hook.
 *
 * Everything stays on the device — no network, no accounts. All access is
 * wrapped in try/catch so a private-mode or quota-blocked browser degrades to
 * in-memory state rather than throwing.
 */

import { isValidISODate } from './weekMath.js';

/** @typedef {import('./types.js').Settings} Settings */
/** @typedef {import('./types.js').DietTag} DietTag */
/** @typedef {import('./types.js').MealKit} MealKit */

/** localStorage key holding the whole settings blob. */
export const STORAGE_KEY = 'little-one:v1';

/** Current schema version written to disk. */
export const SCHEMA_VERSION = 1;

/** Every diet tag the UI may offer, in display order. */
export const DIET_TAGS = /** @type {DietTag[]} */ ([
  'vegetarian',
  'vegan',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher'
]);

/** Every meal-kit service the Settings toggle can store. */
export const MEAL_KITS = /** @type {NonNullable<MealKit>[]} */ (['hellofresh']);

/**
 * A fresh, empty settings object.
 *
 * `mealKit` was added after v1 shipped. It needs no version bump because
 * `sanitize` builds every result from these defaults and only overwrites the
 * fields it recognises on disk — so a stored v1 blob that predates the field
 * comes back with `mealKit: null` and everything else intact.
 *
 * @returns {Settings}
 */
export function defaultSettings() {
  return {
    version: SCHEMA_VERSION,
    dueDateISO: null,
    nickname: '',
    units: 'us',
    dietTags: [],
    pxPerMm: null,
    mealKit: null,
    todosDone: {}
  };
}

/** @type {Settings|null} In-memory cache; also the fallback when storage fails. */
let cache = null;

/** @type {Array<(s: Settings) => void>} */
let listeners = [];

/**
 * The backing store, or `null` when unavailable (SSR, private mode, tests).
 * @returns {Storage|null}
 */
function store() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Bring a persisted blob of any older shape up to the current schema.
 * Add a `case` per version as the schema grows; each case falls through to the
 * next so an old record is upgraded step by step.
 *
 * A record written by a *newer* build is left completely alone: stamping it
 * back down to this schema would let `sanitize` drop the fields that build
 * added, deleting data this version simply doesn't understand yet.
 *
 * @param {any} raw Parsed JSON from storage.
 * @returns {any} A blob at the current `version`, or an untouched future one.
 */
function migrate(raw) {
  const data = raw && typeof raw === 'object' ? { ...raw } : {};
  if (typeof data.version === 'number' && data.version > SCHEMA_VERSION) return data;
  switch (data.version) {
    case undefined:
    case null:
      // Pre-versioned records: adopt v1 defaults for anything missing.
      data.version = 1;
    // falls through
    case 1:
    default:
      data.version = SCHEMA_VERSION;
      break;
  }
  return data;
}

/**
 * Coerce an arbitrary blob into a valid `Settings`, field by field, so a
 * corrupted or hand-edited record can never crash the UI.
 *
 * Keys this schema doesn't know about ride along untouched, so opening an older
 * build of the app cannot quietly delete a newer build's data. Recognised
 * fields always win over whatever was on disk.
 *
 * @param {any} raw
 * @returns {Settings}
 */
function sanitize(raw) {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;

  /** @type {Object<string, unknown>} Fields written by some other schema. */
  const passthrough = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in base)) passthrough[key] = value;
  }

  /* A record from a newer build keeps its own version number, so that build
     still recognises its data after a trip through this one. */
  if (typeof raw.version === 'number' && raw.version > SCHEMA_VERSION) {
    base.version = raw.version;
  }

  /* weekMath is the single authority on what a date is: '2027-02-31' matches
     the shape of an ISO date but is not one, and must not reach the screens. */
  if (isValidISODate(raw.dueDateISO)) {
    base.dueDateISO = /** @type {string} */ (raw.dueDateISO);
  }
  if (typeof raw.nickname === 'string') base.nickname = raw.nickname.slice(0, 40);
  if (raw.units === 'us' || raw.units === 'metric') base.units = raw.units;
  if (Array.isArray(raw.dietTags)) {
    base.dietTags = raw.dietTags.filter((t) => DIET_TAGS.includes(t));
  }
  if (typeof raw.pxPerMm === 'number' && Number.isFinite(raw.pxPerMm) && raw.pxPerMm > 0) {
    base.pxPerMm = raw.pxPerMm;
  }
  /* Anything unrecognised — including a record written before this field
     existed — leaves the default `null` in place, i.e. no meal kit. */
  if (MEAL_KITS.includes(raw.mealKit)) base.mealKit = raw.mealKit;
  if (raw.todosDone && typeof raw.todosDone === 'object' && !Array.isArray(raw.todosDone)) {
    /** @type {Object<string, boolean>} */
    const done = {};
    for (const [k, v] of Object.entries(raw.todosDone)) {
      if (v === true) done[k] = true;
    }
    base.todosDone = done;
  }
  return Object.keys(passthrough).length === 0
    ? base
    : /** @type {Settings} */ (Object.assign(passthrough, base));
}

/**
 * Read the current settings (cached after the first call).
 * @returns {Settings} Always a complete, valid object.
 */
export function loadSettings() {
  if (cache) return cache;
  const s = store();
  if (!s) {
    cache = defaultSettings();
    return cache;
  }
  try {
    const raw = s.getItem(STORAGE_KEY);
    cache = raw ? sanitize(migrate(JSON.parse(raw))) : defaultSettings();
  } catch {
    cache = defaultSettings();
  }
  return cache;
}

/**
 * Persist a complete settings object and notify subscribers.
 * @param {Settings} settings
 * @returns {Settings} The stored settings.
 */
export function saveSettings(settings) {
  cache = sanitize(settings);
  const s = store();
  if (s) {
    try {
      s.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* quota or private mode — keep going with the in-memory copy */
    }
  }
  notify();
  return cache;
}

/**
 * Merge a partial patch into the settings, persist, and notify.
 * @param {Partial<Settings>} patch Fields to change.
 * @returns {Settings} The new settings.
 */
export function updateSettings(patch) {
  return saveSettings({ ...loadSettings(), ...patch });
}

/**
 * Mark one to-do done or not done without rewriting the rest of the object.
 * @param {string} id Todo id (e.g. `w24-glucose`).
 * @param {boolean} done
 * @returns {Settings} The new settings.
 */
export function setTodoDone(id, done) {
  const todosDone = { ...loadSettings().todosDone };
  if (done) todosDone[id] = true;
  else delete todosDone[id];
  return updateSettings({ todosDone });
}

/**
 * Wipe stored settings (used by `?reset=1` and a future "start over").
 * @returns {Settings} Fresh defaults.
 */
export function clearSettings() {
  const s = store();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  cache = defaultSettings();
  notify();
  return cache;
}

/**
 * Subscribe to settings changes. The callback fires after every save.
 * @param {(s: Settings) => void} fn Listener.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Fire every listener with the current settings, isolating listener errors.
 * @returns {void}
 */
function notify() {
  const current = loadSettings();
  for (const fn of listeners.slice()) {
    try {
      fn(current);
    } catch (err) {
      console.error('settings listener failed', err);
    }
  }
}
