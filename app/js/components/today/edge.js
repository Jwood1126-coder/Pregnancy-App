/**
 * The gentle edges of Today: before week 4, at weeks 41–42, when a week's
 * words haven't landed yet, and when there is no due date at all.
 *
 * Content here follows MASTER_PROMPT.md Appendix A — prenatal vitamin and
 * folate framing for the earliest days, reassurance (never alarm) at the end.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';

/**
 * Before week 4 there is no week content to show — this warm card stands in
 * its place, carrying the two things that genuinely matter right now.
 * @param {{ nickname?: string }} [options]
 * @returns {HTMLElement}
 */
export function earlyDaysCard(options = {}) {
  const nickname = (options.nickname ?? '').trim();

  /* The mark rides with the card's own label instead of taking a line of its
     own, where it read as a stray glyph. */
  return card(
    {},
    el(
      'div',
      { class: 'today-edge__head' },
      el('span', { class: 'today-mark', 'aria-hidden': 'true' }, '🌱'),
      el('h2', { class: 'section-title' }, 'First things first')
    ),
    el(
      'div',
      { class: 'prose' },
      el(
        'p',
        { class: 'lede' },
        nickname
          ? `It’s wonderfully early. ${nickname} is a few cells with big plans, and the week-by-week story starts at week 4.`
          : 'It’s wonderfully early. Right now your baby is a few cells with big plans, and the week-by-week story starts at week 4.'
      ),
      el(
        'p',
        {},
        'Two things are worth starting today: a daily prenatal vitamin, and 600 mcg DFE of folate. ' +
          'Folate matters most right at the beginning — the neural tube, which becomes your baby’s brain and spine, ' +
          'closes around week 6, often before anyone feels much of anything.'
      ),
      el(
        'p',
        {},
        'Most practices book that first prenatal visit for somewhere between weeks 8 and 10, so there’s no rush to be ' +
          'seen this minute. When you’re ready, give them a call — and in the meantime, eat well, drink water, and be kind to yourself.'
      )
    ),
    el(
      'p',
      { class: 'small muted' },
      'Use the arrows above to look ahead — week 4 is waiting whenever you’re curious.'
    )
  );
}

/**
 * Weeks 41–42: the any-day-now stretch, framed kindly.
 * @param {{ current?: boolean }} [options] `current` when this is the user's
 *   own week rather than a week they're browsing.
 * @returns {HTMLElement}
 */
export function anyDayNowCard(options = {}) {
  const opening = options.current
    ? 'You’re right at the end. Plenty of first babies take a little longer to arrive — a due date is an estimate, not a deadline.'
    : 'Weeks 41 and 42 are the any-day-now stretch. Plenty of first babies take a little longer to arrive — a due date is an estimate, not a deadline.';

  return card(
    { title: 'Any day now', class: 'card--accent' },
    el(
      'div',
      { class: 'prose' },
      el('p', {}, opening),
      el(
        'p',
        {},
        'Your provider will keep a closer eye on you both from here and will talk through what happens next. ' +
          'Keep the bag by the door, keep noticing movement, and rest whenever you can.'
      )
    )
  );
}

/**
 * A week whose prose hasn't been written yet. Size and dates still work, so
 * say so plainly and keep everything else on screen.
 * @param {{ week: number }} options
 * @returns {HTMLElement}
 */
export function missingWeekCard(options) {
  return card(
    { title: 'Still being written' },
    el(
      'p',
      {},
      `The words for week ${options.week} haven’t landed yet.`
    ),
    el(
      'p',
      { class: 'small muted' },
      'Your dates, your sizes, and everything you’ve ticked off are safe — check back in a moment.'
    )
  );
}

/**
 * No due date stored (only reachable if the welcome gate is bypassed).
 * @param {{ onSettings: () => void }} options
 * @returns {HTMLElement}
 */
export function noDueDateCard(options) {
  return card(
    { title: 'One quick thing' },
    el(
      'p',
      {},
      'Add your due date and Little One can start counting the weeks with you.'
    ),
    el(
      'button',
      { class: 'btn btn--primary btn--block', type: 'button', onClick: () => options.onSettings() },
      'Add your due date'
    )
  );
}
