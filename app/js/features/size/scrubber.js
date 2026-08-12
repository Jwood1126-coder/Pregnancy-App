/**
 * Week scrubber — the control that sweeps weeks 4–42 so growth animates.
 *
 * A native `<input type="range">` underneath (free keyboard support, free
 * VoiceOver, free 60 fps thumb tracking), restyled from the design tokens so it
 * reads as part of the app rather than as a browser widget. The screen listens
 * to `onChange` on every `input` event and re-scales the silhouette with a CSS
 * transform, which is what makes dragging feel like pulling on something real.
 *
 * `app/css/app.css` belongs to the foundation agent, so the handful of rules
 * this control needs ship as a scoped stylesheet built entirely from existing
 * tokens — no new colours, no new fonts. Every selector is prefixed `size-`.
 */

import { el } from '../../lib/dom.js';
import { MIN_CONTENT_WEEK, MAX_CONTENT_WEEK } from '../../lib/weekMath.js';
import { BASIS_SWITCH_WEEK } from '../../data/sizes.js';

/** Id of the injected `<style>` element. */
export const SCRUBBER_STYLE_ID = 'size-scrubber-styles';

/** Half the thumb width, in CSS px — the track inset the fill has to match. */
const THUMB_INSET = 14;

const CSS = `
.size-scrub {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 2px;
}

/* The travel of the thumb centre: inset by half a thumb at each end, so the
   painted fill and the tick labels line up with the knob exactly. */
.size-scrub__input {
  --fill: calc(${THUMB_INSET}px + var(--p, 0) * (100% - ${THUMB_INSET * 2}px));
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 44px; /* the iOS minimum for the screen's primary control */
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: grab;
  touch-action: none; /* the drag belongs to the scrubber, not to the page */
}

.size-scrub__input:active { cursor: grabbing; }

.size-scrub__input::-webkit-slider-runnable-track {
  height: 6px;
  /* Centre the 6 px track in the 44 px hit box. */
  margin-top: 19px;
  border-radius: var(--radius-pill);
  background:
    linear-gradient(to right,
      var(--accent) 0 var(--fill),
      var(--hairline) var(--fill) 100%);
}

.size-scrub__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -11px; /* half the thumb, less half the track */
  border-radius: var(--radius-pill);
  background: var(--card);
  border: 2px solid var(--accent);
  box-shadow: var(--shadow);
  transition: transform 120ms var(--ease);
}

.size-scrub__input:active::-webkit-slider-thumb { transform: scale(1.08); }

.size-scrub__input::-moz-range-track {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--hairline);
}

.size-scrub__input::-moz-range-progress {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--accent);
}

.size-scrub__input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: 2px solid var(--accent);
  border-radius: var(--radius-pill);
  background: var(--card);
  box-shadow: var(--shadow);
}

.size-scrub__ticks {
  position: relative;
  height: 15px;
  margin: 0 ${THUMB_INSET}px;
}

.size-scrub__tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 11px;
  line-height: 15px;
  letter-spacing: 0;
  color: var(--ink-soft);
  white-space: nowrap;
}

.size-scrub__tick--dot {
  width: 3px;
  height: 3px;
  top: 5px;
  border-radius: var(--radius-pill);
  background: var(--hairline-strong);
}

/* The row keeps its height for the life of the screen. Removing it outright
   on the first drag shrank the chrome by 19 px and grew the stage under the
   user's thumb — the picture jumped on the very first scrub, on the screen
   whose motion is supposed to feel physical. */
.size-scrub__hint {
  min-height: 19px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ink-soft);
  text-align: center;
  padding-top: 2px;
  transition: opacity var(--dur) var(--ease);
}
`;

/**
 * Ensure the scrubber stylesheet is present exactly once. Safe to call on every
 * render, and a no-op outside a browser.
 * @returns {void}
 */
export function ensureScrubberStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SCRUBBER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SCRUBBER_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/**
 * The scrubber element, with setters so the screen can move the knob itself
 * (e.g. the "back to this week" button) without echoing a change back, and
 * keep the hint's wording current.
 *
 * It also emits two bubbling events, `scrub-start` and `scrub-end`, so the
 * screen can suppress its own transitions while a drag is live and let the
 * figure track the thumb 1:1.
 * @typedef {HTMLElement & { setWeek: (week: number) => void,
 *   setHint: (text: string) => void }} ScrubberElement
 */

/**
 * @typedef {Object} ScrubberOptions
 * @property {number} week Week to start on.
 * @property {(week: number) => void} onChange Called on every step of the drag.
 * @property {number} [min] First selectable week (default 4).
 * @property {number} [max] Last selectable week (default 42).
 * @property {string} [hint] One-line hint under the track; hidden after the
 *   first interaction so it teaches once and then gets out of the way.
 */

/**
 * Build the week scrubber.
 * @param {ScrubberOptions} options
 * @returns {ScrubberElement}
 */
export function scrubber(options) {
  ensureScrubberStyles();

  const min = clampInt(options.min ?? MIN_CONTENT_WEEK, MIN_CONTENT_WEEK, MAX_CONTENT_WEEK);
  const max = clampInt(options.max ?? MAX_CONTENT_WEEK, min, MAX_CONTENT_WEEK);
  const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
  let value = clampInt(options.week, min, max);

  const input = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'size-scrub__input',
      type: 'range',
      min: String(min),
      max: String(max),
      step: '1',
      value: String(value),
      'aria-label': 'Week',
      'aria-valuetext': `Week ${value}`,
      onInput: () => {
        const next = clampInt(Number(input.value), min, max);
        /* Teach once, then get out of the way — without moving anything. */
        if (hint && hint.style.visibility !== 'hidden') hint.style.visibility = 'hidden';
        if (next === value) return;
        value = next;
        reflect();
        onChange(value);
      }
    })
  );

  const hint = options.hint
    ? el('p', { class: 'size-scrub__hint' }, options.hint)
    : null;

  /* Only the ends are labelled. A bold sage "20" sitting mid-track was the one
     emphasised thing on the row and it is not the value — at week 17 the eye
     landed on it and read it as the current week, which the header already
     says. The change of ruler it marked is explained where it bites, by the
     note the Size screen shows on week 20 and on any crossing. */
  const ticks = el(
    'div',
    { class: 'size-scrub__ticks', 'aria-hidden': 'true' },
    tick(min, String(min), min, max),
    dot(14, min, max),
    dot(BASIS_SWITCH_WEEK, min, max),
    dot(28, min, max),
    tick(max, String(max), min, max)
  );

  const node = /** @type {ScrubberElement} */ (
    el('div', { class: 'size-scrub' }, input, ticks, hint)
  );

  /**
   * Push `value` into the DOM: the knob, the painted fill, and the label a
   * screen reader announces.
   * @returns {void}
   */
  function reflect() {
    const span = max - min || 1;
    input.value = String(value);
    input.setAttribute('aria-valuetext', `Week ${value}`);
    input.style.setProperty('--p', String((value - min) / span));
  }

  node.setWeek = (week) => {
    const next = clampInt(week, min, max);
    if (next === value) return;
    value = next;
    reflect();
  };

  node.setHint = (text) => {
    if (hint && typeof text === 'string') hint.textContent = text;
  };

  /* Drag state, announced rather than inferred: the screen turns its own
     transitions off between these two so the figure never lags the thumb. */
  const emit = (/** @type {string} */ name) => {
    node.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  };
  input.addEventListener('pointerdown', () => emit('scrub-start'));
  input.addEventListener('pointerup', () => emit('scrub-end'));
  input.addEventListener('pointercancel', () => emit('scrub-end'));

  reflect();
  return node;
}

/**
 * A labelled tick under the track.
 * @param {number} week Week the tick sits at.
 * @param {string} label Text to show.
 * @param {number} min Track minimum.
 * @param {number} max Track maximum.
 * @returns {HTMLElement|null} `null` when the week is off the track.
 */
function tick(week, label, min, max) {
  if (week < min || week > max) return null;
  return /** @type {HTMLElement} */ (
    el(
      'span',
      { class: 'size-scrub__tick', style: `left: ${percent(week, min, max)}%` },
      label
    )
  );
}

/**
 * A tiny unlabelled tick (the trimester boundaries).
 * @param {number} week
 * @param {number} min
 * @param {number} max
 * @returns {HTMLElement|null}
 */
function dot(week, min, max) {
  if (week <= min || week >= max) return null;
  return /** @type {HTMLElement} */ (
    el('span', {
      class: 'size-scrub__tick size-scrub__tick--dot',
      style: `left: ${percent(week, min, max)}%`
    })
  );
}

/**
 * Position of a week along the track, as a percentage of the thumb's travel.
 * @param {number} week
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function percent(week, min, max) {
  const span = max - min || 1;
  return ((week - min) / span) * 100;
}

/**
 * Clamp to a whole number inside `[lo, hi]`.
 * @param {number} n
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
function clampInt(n, lo, hi) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}
