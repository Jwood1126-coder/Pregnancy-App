/**
 * Settings — presented by main.js as a full-screen sheet from Today's gear.
 *
 * Phase 1 only: due date, nickname, units, dietary preferences, recalibrating
 * true size, how weeks are counted, the full disclaimer, and the version line.
 * (Export / import backup arrives with Phase 2.)
 */

import { el } from '../lib/dom.js';
import { card } from '../components/card.js';
import { disclaimer } from '../components/disclaimer.js';
import { DIET_TAGS } from '../lib/storage.js';
import { DEFAULT_PX_PER_MM } from '../lib/scale.js';
import { openCalibration } from '../features/size/calibration.js';
import { isPlausibleDueDate, dueDateBounds } from '../lib/weekMath.js';

/** @typedef {import('../lib/types.js').ScreenContext} ScreenContext */
/** @typedef {import('../lib/types.js').DietTag} DietTag */

/** Shown on the version line. */
export const APP_VERSION = '0.1.0';

/** Human labels for the diet tags. */
const DIET_LABELS = /** @type {Object<string, string>} */ ({
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'dairy-free': 'Dairy-free',
  'nut-free': 'Nut-free',
  halal: 'Halal',
  kosher: 'Kosher'
});

/**
 * Render the settings sheet contents.
 * @param {ScreenContext & { close?: () => void }} ctx Screen context; `close`
 *   dismisses the sheet when Settings is presented as one.
 * @returns {HTMLElement}
 */
export function render(ctx) {
  const settings = ctx.settings;
  const close = ctx.close ?? (() => {});

  /* --- Your pregnancy ---------------------------------------------------- */

  const dueError = el('p', { class: 'error-text', role: 'alert' }, '');

  const bounds = dueDateBounds();

  const dueInput = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'input',
      type: 'date',
      id: 'settings-due',
      /* Only dates that could describe a pregnancy happening now: a mistyped
         year would otherwise produce a negative gestational age on Today. */
      min: bounds.min,
      max: bounds.max,
      value: settings.dueDateISO ?? '',
      onChange: (/** @type {Event} */ e) => {
        const value = /** @type {HTMLInputElement} */ (e.target).value;
        if (isPlausibleDueDate(value)) {
          dueError.textContent = '';
          ctx.update({ dueDateISO: value });
        } else {
          dueError.textContent = 'That date doesn’t look quite right — could you check it?';
          dueInput.value = settings.dueDateISO ?? '';
        }
      }
    })
  );

  const nicknameInput = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'input',
      type: 'text',
      id: 'settings-nickname',
      maxlength: '40',
      autocomplete: 'off',
      placeholder: 'Peanut, Bean, Little One…',
      value: settings.nickname,
      onChange: (/** @type {Event} */ e) => {
        ctx.update({ nickname: /** @type {HTMLInputElement} */ (e.target).value.trim() });
      }
    })
  );

  const pregnancyCard = card(
    { title: 'Your pregnancy' },
    el(
      'div',
      { class: 'field' },
      el('label', { class: 'field__label', for: 'settings-due' }, 'Due date'),
      dueInput,
      dueError
    ),
    el(
      'div',
      { class: 'field' },
      el('label', { class: 'field__label', for: 'settings-nickname' }, 'Baby nickname'),
      nicknameInput
    )
  );

  /* --- Units ------------------------------------------------------------- */

  const unitsGroup = el(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': 'Units' },
    [
      { id: 'us', label: 'in · oz' },
      { id: 'metric', label: 'cm · g' }
    ].map((option) =>
      el(
        'button',
        {
          class: 'segmented__option',
          type: 'button',
          'data-units': option.id,
          'aria-pressed': String(settings.units === option.id),
          onClick: () => {
            for (const node of unitsGroup.querySelectorAll('.segmented__option')) {
              node.setAttribute(
                'aria-pressed',
                String(node.getAttribute('data-units') === option.id)
              );
            }
            ctx.update({ units: /** @type {'us'|'metric'} */ (option.id) });
          }
        },
        option.label
      )
    )
  );

  const unitsCard = card(
    { title: 'Units' },
    unitsGroup,
    el('p', { class: 'field__hint' }, 'Used for every length and weight in the app.')
  );

  /* --- Dietary preferences ----------------------------------------------- */

  const chips = el(
    'div',
    { class: 'chips', role: 'group', 'aria-label': 'Dietary preferences' },
    DIET_TAGS.map((tag) =>
      el(
        'button',
        {
          class: 'chip',
          type: 'button',
          'data-tag': tag,
          'aria-pressed': String(settings.dietTags.includes(tag)),
          onClick: (/** @type {Event} */ e) => {
            const node = /** @type {HTMLElement} */ (e.currentTarget);
            const on = node.getAttribute('aria-pressed') !== 'true';
            node.setAttribute('aria-pressed', String(on));
            const current = new Set(ctx.settings.dietTags);
            if (on) current.add(tag);
            else current.delete(tag);
            ctx.update({ dietTags: /** @type {DietTag[]} */ ([...current]) });
          }
        },
        DIET_LABELS[tag] ?? tag
      )
    )
  );

  const dietCard = card(
    { title: 'Dietary preferences' },
    chips,
    el(
      'p',
      { class: 'field__hint' },
      'We’ll highlight the food ideas that suit you. Pick as many as you like.'
    )
  );

  /* --- True size --------------------------------------------------------- */

  const calibrated = typeof settings.pxPerMm === 'number';

  const sizeCard = card(
    { title: 'True size' },
    el(
      'p',
      { class: 'field__hint' },
      calibrated
        ? 'This screen is calibrated, so the baby appears at real physical size.'
        : `Not calibrated yet — we’re assuming about ${DEFAULT_PX_PER_MM} pixels per millimetre, ` +
            'which is close for most phones. Calibrating takes about thirty seconds and a bank card.'
    ),
    el(
      'button',
      {
        class: 'btn btn--block',
        type: 'button',
        /* Open the sheet; never clear the stored value first. Calibration
           seeds its slider from the current density and only persists on
           save, so backing out leaves an existing calibration untouched. */
        onClick: () => {
          close();
          openCalibration(ctx);
        }
      },
      calibrated ? 'Recalibrate true size' : 'Calibrate true size'
    )
  );

  /* --- How weeks are counted --------------------------------------------- */

  const weeksCard = card(
    { title: 'How weeks are counted' },
    el(
      'p',
      { class: 'small muted' },
      'Pregnancy is counted from the first day of your last period, so week 1 ' +
        'starts before conception — that’s the convention your provider uses too.'
    ),
    el(
      'p',
      { class: 'small muted' },
      'We show your progress as completed weeks plus days. At 17 weeks and 3 days ' +
        'you’ll read week 17 — the week you’re living through, not the one ahead.'
    )
  );

  /* --- About ------------------------------------------------------------- */

  const aboutCard = card(
    { title: 'About' },
    el(
      'p',
      { class: 'small muted' },
      'Little One is a private keepsake, not a medical device. Everything lives on ' +
        'this phone: no account, no server, no analytics. Add it to your Home Screen ' +
        'so it stays put and works offline.'
    ),
    el(
      'p',
      { class: 'small muted' },
      'The weekly notes are general information for a typical single-baby pregnancy. ' +
        'They can’t know your history, your labs, or how you feel today, and nothing ' +
        'here diagnoses a condition or prescribes a treatment. If something feels off, ' +
        'trust that feeling and call your care team — that is always the right move.'
    ),
    disclaimer({ class: 'small' }),
    el('p', { class: 'small muted center' }, `Little One · Phase 1 · v${APP_VERSION}`)
  );

  /* --- Sheet ------------------------------------------------------------- */

  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'sheet__inner' },
      el(
        'header',
        { class: 'sheet__head' },
        el('h1', { class: 'title' }, 'Settings'),
        el(
          'button',
          { class: 'btn btn--quiet', type: 'button', onClick: () => close() },
          'Done'
        )
      ),
      pregnancyCard,
      unitsCard,
      dietCard,
      sizeCard,
      weeksCard,
      aboutCard
    )
  );
}
