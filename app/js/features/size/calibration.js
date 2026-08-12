/**
 * Screen calibration — thirty seconds and any bank card.
 *
 * Every phone reports CSS pixels, and every phone means something slightly
 * different by them. To draw the baby at true physical size we need this
 * device's px-per-millimetre. The trick: draw an outline the size of an
 * ISO/IEC 7810 ID-1 card (85.60 × 53.98 mm — every payment, library, and ID
 * card on earth), let the user hold a real one against the glass and slide
 * until the two agree, then store the density that implies.
 *
 * The outline is drawn **upright** (short edge across): a card is 85.6 mm wide
 * and a phone screen is only about 65 mm, so a landscape card physically cannot
 * fit on the screen it is meant to calibrate.
 *
 * The maths lives in `lib/scale.js`; this module is only the sheet.
 */

import { el } from '../../lib/dom.js';
import { updateSettings } from '../../lib/storage.js';
import {
  CREDIT_CARD_MM,
  clampPxPerMm,
  effectivePxPerMm
} from '../../lib/scale.js';

/** @typedef {import('../../lib/types.js').ScreenContext} ScreenContext */

/** Id of the injected `<style>` element. */
export const CALIBRATION_STYLE_ID = 'size-calibration-styles';

/**
 * Lowest density the slider offers. A standard 96 dpi desktop or laptop screen
 * is 3.78 CSS px/mm and low-DPI tablets sit around 4.0–4.4, so the slider has
 * to reach below 4 or those users physically cannot shrink the outline onto
 * their card — and would then save a calibration that is ~19% too big.
 */
export const CAL_MIN_PX_PER_MM = 3.0;

/** Highest density the slider offers — a very dense phone, with headroom. */
export const CAL_MAX_PX_PER_MM = 10.0;

/** Slider granularity, in px per mm. */
export const CAL_STEP = 0.02;

/** Corner radius of an ID-1 card, in millimetres. */
const CARD_RADIUS_MM = 3.18;

const CSS = `
.size-cal__inner {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: calc(var(--safe-top) + 10px) var(--gutter) 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.size-cal__copy {
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-soft);
  text-wrap: pretty;
}

.size-cal__stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-x: auto;
  padding: 2px 0;
  min-height: 180px;
}

.size-cal__card {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed color-mix(in srgb, var(--accent) 60%, transparent);
  background: color-mix(in srgb, var(--accent-soft) 55%, transparent);
  box-shadow: var(--shadow);
}

.size-cal__cardLabel {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--accent);
  text-align: center;
  padding: 0 10px;
  text-wrap: balance;
}

.size-cal__sliderRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-cal__end {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
  flex: none;
}

.size-cal__input {
  -webkit-appearance: none;
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  height: 34px;
  margin: 0;
  background: transparent;
  touch-action: none;
  cursor: grab;
}

.size-cal__input:active { cursor: grabbing; }

.size-cal__input::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--hairline);
}

.size-cal__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 30px;
  height: 30px;
  margin-top: -12px;
  border-radius: var(--radius-pill);
  background: var(--card);
  border: 2px solid var(--accent);
  box-shadow: var(--shadow);
}

.size-cal__input::-moz-range-track {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--hairline);
}

.size-cal__input::-moz-range-thumb {
  width: 26px;
  height: 26px;
  border: 2px solid var(--accent);
  border-radius: var(--radius-pill);
  background: var(--card);
}

.size-cal__readout {
  font-size: 12.5px;
  color: var(--ink-soft);
  text-align: center;
  font-variant-numeric: tabular-nums;
  margin-top: -4px;
}

/* A full-size card outline is taller than most phones once the copy above it
   is counted, so the sheet scrolls — and the one button that matters rides
   along at the bottom instead of hiding under the fold. */
.size-cal__actions {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0 calc(var(--safe-bottom) + 6px);
  /* Translucent, so a tall outline still reads through the bar. */
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
}
`;

/**
 * Ensure the calibration stylesheet is present exactly once.
 * @returns {void}
 */
export function ensureCalibrationStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CALIBRATION_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CALIBRATION_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/**
 * @typedef {Object} CalibrationOptions
 * @property {() => void} [close] Dismiss the sheet (supplied by `open`).
 * @property {(pxPerMm: number) => void} [onSave] Called after a successful save.
 */

/**
 * Render the calibration sheet's contents.
 *
 * Saving goes through `ctx.update` when the screen context provides it (so the
 * whole app re-renders with the new density) and falls back to `updateSettings`
 * directly, which is what actually persists either way.
 *
 * @param {ScreenContext & CalibrationOptions} ctx Screen context plus sheet hooks.
 * @returns {HTMLElement} The sheet body.
 */
export function render(ctx) {
  ensureCalibrationStyles();

  const close = typeof ctx.close === 'function' ? ctx.close : () => {};
  const settings = ctx.settings ?? /** @type {any} */ ({});
  const startValue = Math.min(
    CAL_MAX_PX_PER_MM,
    Math.max(CAL_MIN_PX_PER_MM, effectivePxPerMm(settings.pxPerMm))
  );

  let value = startValue;

  const cardLabel = el(
    'p',
    { class: 'size-cal__cardLabel' },
    'Hold your card here'
  );

  const cardOutline = /** @type {HTMLElement} */ (
    el('div', { class: 'size-cal__card', 'aria-hidden': 'true' }, cardLabel)
  );

  const stage = el('div', { class: 'size-cal__stage' }, cardOutline);

  const readout = el('p', { class: 'size-cal__readout', 'aria-live': 'polite' }, '');

  const input = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'size-cal__input',
      type: 'range',
      min: String(CAL_MIN_PX_PER_MM),
      max: String(CAL_MAX_PX_PER_MM),
      step: String(CAL_STEP),
      value: String(startValue),
      'aria-label': 'Card size',
      onInput: () => {
        const next = Number(input.value);
        if (!Number.isFinite(next)) return;
        value = next;
        paint();
      }
    })
  );

  /**
   * Draw the outline at the candidate density: the card's real millimetres
   * times the pixels-per-millimetre currently under the user's thumb.
   * @returns {void}
   */
  function paint() {
    /* The outline stands the card on its end: 85.6 mm across is wider than a
       phone once pxPerMm climbs, so the long side runs down the screen and the
       copy asks for an upright card. The millimetres are the card's real ones
       either way, so the density the slider reports stays honest. */
    const shortSide = CREDIT_CARD_MM.h * value;
    const longSide = CREDIT_CARD_MM.w * value;
    cardOutline.style.width = `${shortSide}px`;
    cardOutline.style.height = `${longSide}px`;
    cardOutline.style.borderRadius = `${CARD_RADIUS_MM * value}px`;
    /* The step is finer than one decimal place, so a one-decimal readout would
       repeat itself for four nudges out of five and the control would feel
       dead — to a screen reader especially. Describe the thing being matched,
       and print the density to the precision the slider actually has. */
    input.setAttribute(
      'aria-valuetext',
      `Card outline ${Math.round(longSide)} pixels tall, ${value.toFixed(2)} pixels per millimetre`
    );
    readout.textContent = `About ${value.toFixed(2)} pixels per millimetre`;
  }

  const save = el(
    'button',
    {
      class: 'btn btn--primary btn--block',
      type: 'button',
      onClick: () => {
        const px = clampPxPerMm(value);
        close();
        const persist = typeof ctx.update === 'function' ? ctx.update : updateSettings;
        persist({ pxPerMm: px });
        if (typeof ctx.onSave === 'function') ctx.onSave(px);
      }
    },
    'That matches — save'
  );

  paint();

  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'size-cal__inner' },
      el(
        'header',
        { class: 'sheet__head' },
        el('h1', { class: 'title' }, 'Actual size'),
        el(
          'button',
          { class: 'btn btn--quiet', type: 'button', onClick: () => close() },
          'Not now'
        )
      ),
      el(
        'p',
        { class: 'size-cal__copy' },
        'Hold any bank or library card upright against the screen and slide until ' +
          'the outline matches it. Every card is the same size, so any one will do.'
      ),
      stage,
      /* The outline can be taller than the phone, so the sheet scrolls — but
         the slider and the save button ride along the bottom, always in reach. */
      el(
        'div',
        { class: 'size-cal__actions' },
        el(
          'div',
          { class: 'size-cal__sliderRow' },
          el('span', { class: 'size-cal__end' }, '−'),
          input,
          el('span', { class: 'size-cal__end' }, '+')
        ),
        readout,
        save,
        el(
          'p',
          { class: 'field__hint center' },
          'Stored on this phone only — change it any time in Settings.'
        )
      )
    )
  );
}

/**
 * Present calibration as a full-screen sheet sliding up from the bottom, the
 * same presentation Settings uses.
 * @param {ScreenContext & { onSave?: (pxPerMm: number) => void }} ctx Screen context.
 * @returns {() => void} A function that dismisses the sheet.
 */
export function open(ctx) {
  ensureCalibrationStyles();

  /** @type {HTMLElement|null} */
  let sheet = null;
  let closed = false;

  const previousOverflow = document.body.style.overflow;

  /**
   * Dismiss the sheet, removing it once the slide-down has finished.
   * @returns {void}
   */
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKeyDown, true);
    document.body.style.overflow = previousOverflow;
    const node = sheet;
    if (!node) return;
    node.classList.remove('sheet--open');
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      node.remove();
    };
    node.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 400);
  }

  /**
   * Escape dismisses, matching every other sheet on the platform.
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  function onKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  }

  const body = render(
    /** @type {any} */ (Object.assign(Object.create(ctx), { close }))
  );

  sheet = /** @type {HTMLElement} */ (
    el(
      'div',
      {
        class: 'sheet',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Calibrate true size'
      },
      body
    )
  );

  document.body.appendChild(sheet);
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeyDown, true);
  requestAnimationFrame(() => {
    if (sheet) sheet.classList.add('sheet--open');
  });

  return close;
}

/** @see open — named export kept explicit for readers of the Size screen. */
export const openCalibration = open;
