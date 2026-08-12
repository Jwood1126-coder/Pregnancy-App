/**
 * "When to call your provider" — always present, collapsed by default.
 *
 * The body is the red-flag blockquote from MASTER_PROMPT.md Appendix A,
 * **verbatim**. The only presentational liberties: `**988**` is rendered as
 * bold (as the source markdown asks) and wired to `tel:988` so it can be
 * called with one tap. Do not reword, reorder, or soften any of it.
 */

import { el } from '../../lib/dom.js';
import { collapsibleCard } from '../card.js';

/** Everything before the crisis number. */
const BEFORE =
  'Call your OB or midwife right away for: vaginal bleeding · severe abdominal pain · ' +
  'severe headache, vision changes, or sudden swelling of your face or hands · ' +
  'fever of 100.4 °F (38 °C) or higher · fluid leaking from the vagina · ' +
  'regular contractions before 37 weeks · a clear drop in your baby\'s movement after 28 weeks. ' +
  'If you have thoughts of harming yourself, call or text ';

/** The crisis number, bolded in the source. */
const NUMBER = '988';

/** Everything after the crisis number. */
const AFTER = ' — you deserve support, right now.';

/**
 * The red-flag card's text, exactly as Appendix A writes it (markdown emphasis
 * removed). Exported so content tests can assert the wording never drifts.
 * @type {string}
 */
export const RED_FLAGS_TEXT = `${BEFORE}${NUMBER}${AFTER}`;

/** The lead-in, and then one symptom per line. */
const [LEAD, SYMPTOMS] = (() => {
  const at = BEFORE.indexOf(': ');
  const items = BEFORE.slice(at + 2).split(' · ');
  /* The last symptom carries the sentence that runs into the 988 line. */
  return [BEFORE.slice(0, at + 1), items];
})();

/**
 * Build the collapsed red-flags card.
 *
 * The words are Appendix A's, untouched — `RED_FLAGS_TEXT` still reassembles
 * to the verbatim string. Only the setting changes: the one card that has to
 * be scannable under stress was a ten-line paragraph of middot-separated
 * symptoms, so the middots become line breaks.
 * @returns {HTMLElement}
 */
export function redFlagsCard() {
  const last = SYMPTOMS.length - 1;
  /* The final entry ends the sentence and runs into the crisis line, which
     belongs below the list rather than inside it. */
  const tail = SYMPTOMS[last];
  const split = tail.indexOf('. ');
  const lastItem = split < 0 ? tail : tail.slice(0, split + 1);
  const closing = split < 0 ? '' : tail.slice(split + 2);

  return collapsibleCard(
    { title: 'When to call your provider', open: false, class: 'today-card--flags' },
    el(
      'blockquote',
      { class: 'today-flags' },
      el('p', {}, LEAD),
      el(
        'ul',
        {},
        SYMPTOMS.slice(0, last).map((item) => el('li', {}, item)),
        el('li', {}, lastItem)
      ),
      el(
        'p',
        {},
        closing,
        el('a', { href: 'tel:988' }, el('strong', {}, NUMBER)),
        AFTER
      )
    )
  );
}
