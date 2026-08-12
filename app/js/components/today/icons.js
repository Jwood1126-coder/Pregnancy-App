/**
 * The few line icons Today needs. All are `currentColor` strokes so they take
 * the colour of whatever they sit in — no icon font, no assets.
 */

import { el } from '../../lib/dom.js';

/**
 * A chevron pointing left or right.
 * @param {'left'|'right'} direction Which way it points.
 * @param {number} [size] Height in px (width follows at 5/8 of it).
 * @returns {SVGElement}
 */
export function chevron(direction, size = 16) {
  const d = direction === 'left' ? 'M8 1.5 L1.5 8 L8 14.5' : 'M2 1.5 L8.5 8 L2 14.5';
  return /** @type {SVGElement} */ (
    el(
      'svg',
      {
        width: String(Math.round((size * 5) / 8)),
        height: String(size),
        viewBox: '0 0 10 16',
        'aria-hidden': 'true'
      },
      el('path', {
        d,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    )
  );
}

/**
 * The settings gear — sliders, in keeping with the iOS-flavoured line work.
 * @returns {SVGElement}
 */
export function gearIcon() {
  return /** @type {SVGElement} */ (
    el(
      'svg',
      { width: '21', height: '21', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      el('path', {
        d: 'M3 8h9M17 8h4M3 16h5M13 16h8',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.7',
        'stroke-linecap': 'round'
      }),
      el('circle', {
        cx: '14.5',
        cy: '8',
        r: '2.3',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.7'
      }),
      el('circle', {
        cx: '10.5',
        cy: '16',
        r: '2.3',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.7'
      })
    )
  );
}

/**
 * A quiet leaf, used as the mark on the food-safety callout.
 * @returns {SVGElement}
 */
export function leafIcon() {
  return /** @type {SVGElement} */ (
    el(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      el('path', {
        d: 'M14 2C7.5 2 3.2 4.6 2.4 9.1 1.9 11.7 3 13.6 3 13.6S5.6 9 9.5 7',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      el('path', {
        d: 'M2.4 9.1C6.5 11.5 12.2 9.6 14 2',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    )
  );
}
