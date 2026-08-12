/**
 * The card — the one repeating container in the app. Every screen is a stack
 * of these in a single column.
 */

import { el } from '../lib/dom.js';

/**
 * @typedef {Object} CardOptions
 * @property {string} [title] Small uppercase section title.
 * @property {any} [aside] Node or text pinned to the right of the title row.
 * @property {() => void} [onClick] Makes the whole card a tappable button.
 * @property {string} [class] Extra class names (e.g. `card--accent`).
 * @property {string} [ariaLabel] Accessible name when the card is tappable.
 */

/**
 * Build a card.
 * @param {CardOptions} [options] Card options.
 * @param {...any} children Card contents (see `el`).
 * @returns {HTMLElement}
 */
export function card(options = {}, ...children) {
  const { title, aside, onClick, ariaLabel } = options;
  const extra = options.class ? ` ${options.class}` : '';

  const head =
    title || aside
      ? el(
          'div',
          { class: 'card__head' },
          title ? el('h2', { class: 'section-title' }, title) : null,
          aside ?? null
        )
      : null;

  if (onClick) {
    return /** @type {HTMLElement} */ (
      el(
        'button',
        {
          class: `card card--tap${extra}`,
          type: 'button',
          'aria-label': ariaLabel ?? null,
          onClick
        },
        head,
        children
      )
    );
  }

  return /** @type {HTMLElement} */ (
    el('section', { class: `card${extra}` }, head, children)
  );
}

/**
 * A card whose body collapses. Used for the always-present, normally-collapsed
 * "When to call your provider" card.
 * @param {{ title: string, open?: boolean, class?: string, tone?: 'default'|'danger' }} options
 * @param {...any} children Body contents, revealed when expanded.
 * @returns {HTMLElement}
 */
export function collapsibleCard(options, ...children) {
  const open = options.open === true;
  const extra = options.class ? ` ${options.class}` : '';

  const body = el(
    'div',
    { class: 'card__body', hidden: !open },
    children
  );

  const chevron = el(
    'svg',
    { class: 'card__chevron', width: '10', height: '16', viewBox: '0 0 10 16', 'aria-hidden': 'true' },
    el('path', {
      d: 'M2 1.5 L8.5 8 L2 14.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    })
  );

  const toggle = el(
    'button',
    {
      class: 'card__toggle',
      type: 'button',
      'aria-expanded': String(open),
      onClick: () => {
        const nowOpen = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(nowOpen));
        if (nowOpen) body.removeAttribute('hidden');
        else body.setAttribute('hidden', '');
      }
    },
    el(
      'span',
      { class: 'section-title' },
      options.title
    ),
    chevron
  );

  return /** @type {HTMLElement} */ (
    el('section', { class: `card${extra}` }, toggle, body)
  );
}
