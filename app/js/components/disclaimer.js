/**
 * The standing medical disclaimer. Every advice surface ends with this exact
 * sentence (MASTER_PROMPT.md Appendix A).
 */

import { el } from '../lib/dom.js';

/** The disclaimer text, verbatim. Do not reword. */
export const DISCLAIMER_TEXT =
  'For information only — not medical advice. Your OB or midwife knows you and your baby best.';

/**
 * The disclaimer line, for the foot of any advice surface.
 * @param {{ class?: string }} [options] Extra class names.
 * @returns {HTMLElement}
 */
export function disclaimer(options = {}) {
  const extra = options.class ? ` ${options.class}` : '';
  return /** @type {HTMLElement} */ (
    el('p', { class: `disclaimer${extra}`, role: 'note' }, DISCLAIMER_TEXT)
  );
}
