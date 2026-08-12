/**
 * Welcome — the first-run screen.
 *
 * One warm question: when is the baby due? If that's unknown, the first day of
 * the last period works just as well (due date = LMP + 280 days). A nickname is
 * optional. Both are editable later in Settings.
 */

import { el } from '../lib/dom.js';
import { disclaimer } from '../components/disclaimer.js';
import { card } from '../components/card.js';
import {
  dueDateFromLMP,
  isValidISODate,
  isPlausibleDueDate,
  contentWeekFor,
  dueDateBounds,
  parseISODate,
  toISODate,
  todayISO,
  daysPregnant,
  gaFromDays,
  formatGA,
  PREGNANCY_DAYS
} from '../lib/weekMath.js';

/** @typedef {import('../lib/types.js').ScreenContext} ScreenContext */

/** Shown when the date entered can't describe a pregnancy happening now. */
export const IMPLAUSIBLE_DATE_TEXT =
  'That date doesn’t look quite right — could you check it?';

/**
 * Shift an ISO date by whole days.
 * @param {string} iso `YYYY-MM-DD`.
 * @param {number} days Days to add (may be negative).
 * @returns {string} `YYYY-MM-DD`.
 */
function shiftISO(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Format an ISO date as a warm, readable line ("Sunday, January 17, 2027").
 * @param {string} iso
 * @returns {string}
 */
function friendlyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * A small sage heart — the app's only ornament.
 * @returns {SVGElement}
 */
function mark() {
  return /** @type {SVGElement} */ (
    el(
      'svg',
      /* Paired with the title rather than floating above it as a stray glyph. */
      { width: '44', height: '40', viewBox: '0 0 38 34', 'aria-hidden': 'true' },
      el('path', {
        d:
          'M19 33C7.5 25.4 1 19.2 1 11.7 1 5.9 5.6 1.5 11.3 1.5c3.2 0 6.1 1.5 7.7 3.9 ' +
          '1.6-2.4 4.5-3.9 7.7-3.9C32.4 1.5 37 5.9 37 11.7 37 19.2 30.5 25.4 19 33z',
        fill: 'var(--accent)'
      })
    )
  );
}

/**
 * Render the welcome screen.
 * @param {ScreenContext} ctx
 * @returns {HTMLElement}
 */
export function render(ctx) {
  /** @type {'due'|'lmp'} */
  let mode = 'due';
  let dateValue = '';

  const preview = el('p', { class: 'field__hint', id: 'welcome-date-hint' });

  const startBtn = /** @type {HTMLElement} */ (
    el('button', { class: 'btn btn--primary btn--block', type: 'button' }, 'Start')
  );
  const error = el('p', { class: 'error-text', role: 'alert' });

  /* A question, not a category: the segmented control directly above already
     says "Due date", and the same two words twice makes the app's first screen
     look machine-assembled. */
  const dateLabel = el('span', { class: 'field__label' }, 'When is your baby due?');

  const dateInput = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'input',
      type: 'date',
      id: 'welcome-date',
      'aria-describedby': 'welcome-date-hint',
      onInput: (/** @type {Event} */ e) => {
        dateValue = /** @type {HTMLInputElement} */ (e.target).value;
        error.textContent = '';
        refresh();
        refreshStart();
      }
    })
  );

  const nickname = /** @type {HTMLInputElement} */ (
    el('input', {
      class: 'input',
      type: 'text',
      id: 'welcome-nickname',
      maxlength: '40',
      autocomplete: 'off',
      placeholder: 'Peanut, Bean, Little One…'
    })
  );

  /**
   * The due date implied by the current input, or null when incomplete.
   * @returns {string|null}
   */
  function resolvedDue() {
    if (!isValidISODate(dateValue)) return null;
    return mode === 'lmp' ? dueDateFromLMP(dateValue) : dateValue;
  }

  /**
   * Update labels, constraints, and the live preview after any change.
   * @returns {void}
   */
  function refresh() {
    const isLmp = mode === 'lmp';
    dateLabel.textContent = isLmp
      ? 'When did your last period start?'
      : 'When is your baby due?';
    /* An empty date control prints "mm/dd/yyyy" in full ink, which makes the
       one required field look like the one already filled in. */
    dateInput.classList.toggle('input--empty', !dateValue);

    /* Bound the picker to dates that could describe a pregnancy happening now,
       so a mistyped year is caught by the control rather than turning into a
       negative gestational age downstream. */
    const bounds = dueDateBounds();
    dateInput.setAttribute('min', isLmp ? shiftISO(bounds.min, -PREGNANCY_DAYS) : bounds.min);
    dateInput.setAttribute('max', isLmp ? todayISO() : bounds.max);

    const due = resolvedDue();
    if (!due) {
      preview.textContent = isLmp
        ? 'We’ll count 280 days from that day to estimate your due date.'
        : 'The date your provider gave you — an estimate is fine.';
      return;
    }
    if (!isPlausibleDueDate(due)) {
      preview.textContent = isLmp
        ? 'That is further back than a pregnancy runs — could you check the year?'
        : 'That is outside the range of a pregnancy happening now — could you check the year?';
      return;
    }
    const ga = gaFromDays(daysPregnant(due));
    const when = isLmp ? `Estimated due date: ${friendlyDate(due)}. ` : '';
    preview.textContent = `${when}That puts you at about ${formatGA(ga)} today.`;
  }

  /**
   * The button knows what it is about to reveal, so it may as well say so —
   * "Start" is the flattest possible word on the most emotional tap in the app.
   * @returns {void}
   */
  function refreshStart() {
    const due = resolvedDue();
    const ready = Boolean(due) && isPlausibleDueDate(/** @type {string} */ (due));
    startBtn.textContent = ready
      ? `Meet week ${contentWeekFor(gaFromDays(daysPregnant(/** @type {string} */ (due))).weeks)}`
      : 'Start';
  }

  /**
   * Switch between due-date and last-period entry.
   * @param {'due'|'lmp'} next
   * @returns {void}
   */
  function setMode(next) {
    mode = next;
    for (const option of segmented.querySelectorAll('.segmented__option')) {
      option.setAttribute('aria-pressed', String(option.getAttribute('data-mode') === next));
    }
    refresh();
    refreshStart();
  }

  const segmented = el(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': 'How would you like to start?' },
    el(
      'button',
      {
        class: 'segmented__option',
        type: 'button',
        'data-mode': 'due',
        'aria-pressed': 'true',
        onClick: () => setMode('due')
      },
      /* The sentence above already asks the question and the field label
         restates the choice — the long form only crowded the control. */
      'Due date'
    ),
    el(
      'button',
      {
        class: 'segmented__option',
        type: 'button',
        'data-mode': 'lmp',
        'aria-pressed': 'false',
        onClick: () => setMode('lmp')
      },
      'Last period'
    )
  );

  /**
   * Save and enter the app.
   * @returns {void}
   */
  function begin() {
    const due = resolvedDue();
    if (!due || !isPlausibleDueDate(due)) {
      error.textContent = dateValue
        ? IMPLAUSIBLE_DATE_TEXT
        : 'Pop in a date and we’ll take it from there.';
      dateInput.focus();
      return;
    }
    ctx.update({ dueDateISO: due, nickname: nickname.value.trim() });
  }

  startBtn.addEventListener('click', begin);
  refresh();
  refreshStart();

  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'screen welcome' },
      el(
        'div',
        { class: 'stack stack--tight' },
        mark(),
        el('h1', { class: 'title' }, 'Hello, little one.'),
        el(
          'p',
          { class: 'lede muted' },
          'A quiet place to follow your baby week by week. Everything you write ' +
            'stays on this phone — no account, no cloud, no one else.'
        )
      ),
      el(
        'div',
        { class: 'stack' },
        segmented,
        /* The same grouped form surface Settings uses, so the two screens
           agree on what a form looks like. */
        card(
          {},
          el(
            'div',
            { class: 'field' },
            el('label', { for: 'welcome-date' }, dateLabel),
            dateInput,
            preview,
            error
          ),
          el(
            'div',
            { class: 'field' },
            el(
              'label',
              { class: 'field__label', for: 'welcome-nickname' },
              'Nickname (optional)'
            ),
            nickname,
            el(
              'p',
              { class: 'field__hint' },
              'What are you calling them for now? You can change it any time.'
            )
          )
        ),
        startBtn
      ),
      disclaimer()
    )
  );
}
