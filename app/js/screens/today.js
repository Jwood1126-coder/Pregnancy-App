/**
 * Today — the home screen.
 *
 * A single scrollable column: the week header, the size headline, what's
 * happening with your baby and your body, what to eat, what to do, and the
 * always-present "when to call your provider" card. Any week from 4 to 42 can
 * be browsed with the chevrons or a horizontal swipe; browsing never changes
 * which week is *yours*, and a "Back to today" pill is always one tap away.
 *
 * Two rules shape the wiring:
 * - Ticking a to-do writes to storage and updates that row only. No re-render,
 *   no scroll jump.
 * - Nothing here may crash on missing content: a week whose prose hasn't been
 *   authored yet still renders a header, a size card, and a calm explanation.
 */

import { el, mount } from '../lib/dom.js';
import {
  pregnancyStatus,
  formatGA,
  trimesterOf,
  contentWeekFor,
  MIN_CONTENT_WEEK,
  MAX_CONTENT_WEEK,
  PREGNANCY_DAYS
} from '../lib/weekMath.js';
import { trimesterLabel, formatDaysToGo } from '../lib/units.js';
import { getWeek } from '../data/weeks/index.js';
import { SIZE_TABLE } from '../data/sizes.js';
import { disclaimer } from '../components/disclaimer.js';
import { ensureTodayStyles } from '../components/today/styles.js';
import { todayHeader } from '../components/today/header.js';
import { weekNav } from '../components/today/weekNav.js';
import { sizeCard } from '../components/today/sizeCard.js';
import { proseCard } from '../components/today/prose.js';
import { menuCard } from '../components/today/nutrition.js';
import { todosCard } from '../components/today/todos.js';
import { redFlagsCard } from '../components/today/redFlags.js';
import {
  earlyDaysCard,
  anyDayNowCard,
  missingWeekCard,
  noDueDateCard
} from '../components/today/edge.js';
import { attachSwipe } from '../components/today/swipe.js';

/** @typedef {import('../lib/types.js').ScreenContext} ScreenContext */
/** @typedef {import('../lib/types.js').Week} Week */

/** First week that gets the "any day now" framing. */
const ANY_DAY_NOW_WEEK = 41;

/**
 * The week the user has chevroned or swiped to, kept across re-renders the
 * same way the Size screen keeps its scrubbed week: changing units, diet chips
 * or the nickname rebuilds this screen, and snapping back to "your week" from
 * under the Settings sheet would leave the user somewhere they never navigated.
 *
 * Held with the due date it was browsed under, so correcting the due date
 * starts again from the user's own week. `null` means "today".
 *
 * @type {{ week: number, forDue: string|null }|null}
 */
let browseSession = null;

/**
 * Forget the browsed week — called by `main.js` when storage is cleared.
 * @returns {void}
 */
export function resetBrowseWeek() {
  browseSession = null;
}

/**
 * How a browsed week relates to the user's own week.
 * @param {number} delta Browsed week minus current week.
 * @returns {string} e.g. `"next week"`, `"3 weeks ahead"`, `"2 weeks back"`.
 */
export function relativeWeekLabel(delta) {
  if (delta === 0) return 'your week';
  if (delta === 1) return 'next week';
  if (delta === -1) return 'last week';
  return delta > 0 ? `${delta} weeks ahead` : `${-delta} weeks back`;
}

/**
 * Render the Today screen.
 * @param {ScreenContext} ctx Screen context from `main.js`.
 * @returns {HTMLElement}
 */
export function render(ctx) {
  ensureTodayStyles();

  const due = ctx.settings.dueDateISO;
  const status = due ? safeStatus(due) : null;
  if (!status) return withoutDueDate(ctx);

  /** True before week 4 — there is no week content to show yet. */
  const early = status.isBeforeContent;

  /** The user's own content week (4–42). */
  const homeWeek = status.week;

  /** What "ahead" and "back" are measured from. */
  const referenceWeek = early ? status.ga.weeks : homeWeek;

  /* A browsed week only survives while the due date it was chosen under does. */
  if (browseSession && browseSession.forDue !== due) browseSession = null;

  /** @type {number|null} Week being browsed; `null` means "today". */
  let browseWeek = browseSession ? contentWeekFor(browseSession.week) : null;
  if (browseWeek !== null && !early && browseWeek === homeWeek) browseWeek = null;

  /** @returns {boolean} True while the pre-week-4 card is the view. */
  const isEarlyView = () => early && browseWeek === null;

  /** @returns {number} The week currently on screen. */
  const viewWeek = () => browseWeek ?? homeWeek;

  /**
   * Sort order for the browse position, so the slide animation knows which way
   * the view is travelling. The early-days view sits just before week 4.
   * @param {number|null} browse
   * @returns {number}
   */
  const position = (browse) =>
    browse === null ? (early ? MIN_CONTENT_WEEK - 1 : homeWeek) : browse;

  const root = /** @type {HTMLElement} */ (el('div', { class: 'screen today-screen' }));
  const weekHost = /** @type {HTMLElement} */ (el('div', { class: 'today-week' }));

  let headerEl = buildHeader();
  let navEl = buildNav();

  mount(root, headerEl, navEl, weekHost, redFlagsCard(), disclaimer());
  paintWeek(0);

  attachSwipe(root, {
    onSwipe: (direction) => {
      if (direction === 1) goNext();
      else goPrev();
    }
  });

  return root;

  /* --- Navigation -------------------------------------------------------- */

  /**
   * Move the view to a week (or back to today) and repaint.
   * @param {number|null} next Week 4–42, or `null` for the user's own week.
   * @returns {void}
   */
  function goTo(next) {
    let target = next === null ? null : contentWeekFor(next);
    if (target !== null && !early && target === homeWeek) target = null;
    if (target === browseWeek) return;

    const direction = position(target) > position(browseWeek) ? 1 : -1;
    browseWeek = target;
    browseSession = target === null ? null : { week: target, forDue: due };

    const nextHeader = buildHeader();
    root.replaceChild(nextHeader, headerEl);
    headerEl = nextHeader;

    const nextNav = buildNav();
    root.replaceChild(nextNav, navEl);
    navEl = nextNav;

    /* A new week is a new page, and iOS always presents one from its top.
       Instant, not smooth: the 200 ms slide is the transition, and a competing
       scroll animation under it reads as jank. */
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });

    paintWeek(direction);
  }

  /** @returns {void} Step one week back, or from week 4 into the early view. */
  function goPrev() {
    if (isEarlyView()) return;
    if (viewWeek() > MIN_CONTENT_WEEK) goTo(viewWeek() - 1);
    else if (early) goTo(null);
  }

  /** @returns {void} Step one week forward. */
  function goNext() {
    if (isEarlyView()) goTo(MIN_CONTENT_WEEK);
    else if (viewWeek() < MAX_CONTENT_WEEK) goTo(viewWeek() + 1);
  }

  /* --- Painting ---------------------------------------------------------- */

  /**
   * Replace the week column, sliding the new content in from the side it came
   * from. `direction` of 0 paints without motion (first render).
   * @param {1|-1|0} direction
   * @returns {void}
   */
  function paintWeek(direction) {
    weekHost.classList.remove('today-week--next', 'today-week--prev');
    mount(weekHost, buildWeekContent());
    if (direction === 0) return;
    void weekHost.offsetWidth; // restart the animation
    weekHost.classList.add(direction > 0 ? 'today-week--next' : 'today-week--prev');
  }

  /**
   * The header for whatever is on screen.
   * @returns {HTMLElement}
   */
  function buildHeader() {
    const nickname = ctx.settings.nickname.trim();
    const onSettings = () => ctx.showSettings();
    /* Past the due date the trimester is noise — nobody at 41 weeks needs to
       be told which one they are in — and dropping it keeps the most tender
       week in the app on one line instead of orphaning two words under the
       biggest numeral on the screen. */
    const todayMeta =
      status.daysToGo < 0
        ? `${formatGA(status.ga)} · ${formatDaysToGo(status.daysToGo)}`
        : `${formatGA(status.ga)} · ${trimesterLabel(status.trimester)} · ` +
          `${formatDaysToGo(status.daysToGo)}`;

    if (isEarlyView()) {
      return todayHeader({
        eyebrow: nickname ? `Hello, ${nickname}` : 'Hello, little one',
        title: 'Early days',
        big: false,
        meta: todayMeta,
        onSettings
      });
    }

    const week = viewWeek();
    const browsing = browseWeek !== null;
    const delta = week - referenceWeek;

    return todayHeader({
      /* "This week" above "Week 17" above "17w + 3d …" is the same fact three
         times, so the eyebrow only appears when it adds something: the baby's
         name, or which direction you are browsing. */
      eyebrow: browsing
        ? delta > 0
          ? 'Looking ahead'
          : 'Looking back'
        : nickname
          ? `${nickname}’s week`
          : undefined,
      title: `Week ${week}`,
      meta: browsing
        ? `${trimesterLabel(trimesterOf(week))} · ${relativeWeekLabel(delta)}`
        : todayMeta,
      onSettings
    });
  }

  /**
   * The chevrons and the "Back to today" pill.
   * @returns {HTMLElement}
   */
  function buildNav() {
    const week = viewWeek();
    const done = Math.max(0, Math.min(1, status.days / PREGNANCY_DAYS));
    return weekNav({
      progress: done,
      progressLabel: `${Math.round(done * 100)}% of the way there`,
      browsing: browseWeek !== null,
      canPrev: !isEarlyView() && (week > MIN_CONTENT_WEEK || early),
      canNext: isEarlyView() || week < MAX_CONTENT_WEEK,
      prevLabel: isEarlyView()
        ? 'Previous week'
        : early && week === MIN_CONTENT_WEEK
          ? 'Early days'
          : `Week ${Math.max(MIN_CONTENT_WEEK, week - 1)}`,
      nextLabel: isEarlyView()
        ? `Week ${MIN_CONTENT_WEEK}`
        : `Week ${Math.min(MAX_CONTENT_WEEK, week + 1)}`,
      onPrev: goPrev,
      onNext: goNext,
      onBackToToday: () => goTo(null)
    });
  }

  /**
   * Every card for the week on screen, in spec order.
   * @returns {(HTMLElement|null)[]}
   */
  function buildWeekContent() {
    const nickname = ctx.settings.nickname.trim();

    if (isEarlyView()) return [earlyDaysCard({ nickname })];

    const week = viewWeek();
    const content = getWeek(week);
    const size = content ?? SIZE_TABLE[week] ?? null;

    /** @type {(HTMLElement|null)[]} */
    const cards = [];

    if (week >= ANY_DAY_NOW_WEEK) {
      cards.push(anyDayNowCard({ current: browseWeek === null }));
    }

    if (size) {
      cards.push(
        sizeCard({
          size,
          units: ctx.settings.units,
          nickname,
          onOpen: () => ctx.go('size')
        })
      );
    }

    if (!content) {
      cards.push(missingWeekCard({ week }));
      return cards;
    }

    cards.push(proseCard('Your baby this week', content.baby));
    cards.push(proseCard('Your body', content.body));
    cards.push(menuCard({ nutrition: content.nutrition, dietTags: ctx.settings.dietTags }));
    cards.push(
      todosCard({
        todos: content.todos,
        todosDone: ctx.settings.todosDone,
        browsing: browseWeek !== null,
        onToggle: toggleTodo
      })
    );

    return cards;
  }

  /**
   * Persist one checkbox. The row's own DOM was already updated by the card,
   * and `todosDone`-only patches never trigger a re-render — so the page stays
   * exactly where the user left it.
   * @param {string} id Todo id.
   * @param {boolean} done
   * @returns {void}
   */
  function toggleTodo(id, done) {
    const todosDone = { ...ctx.settings.todosDone };
    if (done) todosDone[id] = true;
    else delete todosDone[id];
    ctx.update({ todosDone });
  }
}

/**
 * Gestational status for a stored due date, or `null` if the stored value is
 * not a real calendar date.
 * @param {string} dueISO
 * @returns {ReturnType<typeof pregnancyStatus>|null}
 */
function safeStatus(dueISO) {
  try {
    return pregnancyStatus(dueISO);
  } catch {
    return null;
  }
}

/**
 * Today without a usable due date — only reachable if the welcome gate is
 * bypassed or the stored date is corrupt.
 * @param {ScreenContext} ctx
 * @returns {HTMLElement}
 */
function withoutDueDate(ctx) {
  return /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'screen today-screen' },
      todayHeader({
        title: 'Today',
        big: false,
        meta: 'Let’s get your weeks counting.',
        onSettings: () => ctx.showSettings()
      }),
      noDueDateCard({ onSettings: () => ctx.showSettings() }),
      redFlagsCard(),
      disclaimer()
    )
  );
}
