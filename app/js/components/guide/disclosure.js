/**
 * The expand-in-place primitive the whole Guide is built from.
 *
 * A button and a panel that opens under it. The height animation is a
 * `grid-template-rows: 0fr → 1fr` transition (see `app/css/app.css`), which
 * needs no measuring, no `max-height` guess that clips long text, and no
 * layout read on tap. Where a browser can't interpolate it the panel simply
 * appears — the content is never wrong, only less smooth.
 *
 * The body is a *builder*: the trimester timeline, the avoid list and the tips
 * are only constructed the first time someone opens them, so the screen's
 * first paint carries just the two sections that are about this week.
 */

import { el, mount } from '../../lib/dom.js';
import { chevron } from '../today/icons.js';

/** Ids for `aria-controls`; unique per document. */
let sequence = 0;

/**
 * @typedef {Object} DisclosureOptions
 * @property {any} head Contents of the toggle button, left of the chevron.
 * @property {() => any} body Built once, on first expand (see {@link el}).
 * @property {boolean} [open] Start expanded (default false).
 * @property {string} [class] Extra class names on the root.
 * @property {string} [toggleClass] Extra class names on the toggle button.
 * @property {string} [label] Accessible name for the toggle, when the head's
 *   own text isn't a complete sentence on its own.
 */

/**
 * Build a disclosure.
 * @param {DisclosureOptions} options
 * @returns {HTMLElement} The root element, with `setOpen(boolean)` attached.
 */
export function disclosure(options) {
  const id = `disclose-${++sequence}`;
  const startOpen = options.open === true;

  /* Two wrappers, and both earn their keep: `__inner` is the grid item that
     gets clipped to zero, so it must carry no padding of its own (padding on a
     zero-height box still paints, and every collapsed row would keep a few
     pixels of dead space). All spacing goes on `__body` inside it. */
  const body = /** @type {HTMLElement} */ (el('div', { class: 'disclose__body' }));
  const inner = el('div', { class: 'disclose__inner' }, body);
  const panel = el('div', { class: 'disclose__panel', id, role: 'region' }, inner);

  const toggle = /** @type {HTMLElement} */ (
    el(
      'button',
      {
        class: `disclose__toggle${options.toggleClass ? ` ${options.toggleClass}` : ''}`,
        type: 'button',
        'aria-expanded': String(startOpen),
        'aria-controls': id,
        'aria-label': options.label ?? null,
        onClick: () => setOpen(!isOpen())
      },
      options.head,
      el('span', { class: 'disclose__chev', 'aria-hidden': 'true' }, chevron('right', 14))
    )
  );

  const root = /** @type {HTMLElement} */ (
    el(
      'div',
      {
        class:
          `disclose${startOpen ? ' disclose--open' : ''}` +
          (options.class ? ` ${options.class}` : '')
      },
      toggle,
      panel
    )
  );

  let built = false;
  if (startOpen) build();

  /** @returns {void} Construct the body exactly once. */
  function build() {
    if (built) return;
    built = true;
    mount(body, options.body());
  }

  /** @returns {boolean} */
  function isOpen() {
    return root.classList.contains('disclose--open');
  }

  /**
   * Open or close the panel.
   * @param {boolean} next
   * @returns {void}
   */
  function setOpen(next) {
    if (next) build();
    root.classList.toggle('disclose--open', next);
    toggle.setAttribute('aria-expanded', String(next));
  }

  /* Exposed so a screen can open a section programmatically (the timeline
     opens itself at the current window). */
  // @ts-ignore — a deliberate handle on the returned element
  root.setOpen = setOpen;
  return root;
}
