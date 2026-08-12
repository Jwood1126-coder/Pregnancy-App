/**
 * The bottom tab bar. Phase 1 ships exactly two tabs — Today and Size.
 * Tabs appear only when their phase ships; there are never "coming soon" tabs.
 */

import { el } from '../lib/dom.js';

/** @typedef {import('../lib/types.js').TabId} TabId */

/**
 * @typedef {Object} TabDef
 * @property {TabId} id
 * @property {string} label
 * @property {string[]} paths SVG path `d` strings drawn as strokes in a 24×24 box.
 */

/** The Phase 1 tabs, in order. */
export const TABS = /** @type {TabDef[]} */ ([
  {
    id: 'today',
    label: 'Today',
    // A quiet sun: today, this morning, right now.
    paths: [
      'M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z',
      'M12 1.8v2.2M12 20v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M1.8 12h2.2M20 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6'
    ]
  },
  {
    id: 'size',
    label: 'Size',
    // A height gauge: two rules and the span between them.
    paths: ['M5 4h14M5 20h14M12 4.8v14.4', 'M9 8l3-3 3 3M9 16l3 3 3-3']
  }
]);

/**
 * Build one tab icon.
 * @param {TabDef} tab
 * @returns {SVGElement}
 */
function icon(tab) {
  return /** @type {SVGElement} */ (
    el(
      'svg',
      { width: '23', height: '23', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      tab.paths.map((d) =>
        el('path', {
          d,
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.7',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      )
    )
  );
}

/**
 * Build the tab bar.
 * @param {{ active: TabId, tabs?: TabDef[], onSelect: (id: TabId) => void }} options
 * @returns {HTMLElement}
 */
export function tabBar(options) {
  const tabs = options.tabs ?? TABS;
  return /** @type {HTMLElement} */ (
    el(
      'nav',
      { class: 'tabbar', role: 'tablist', 'aria-label': 'Sections' },
      el(
        'div',
        { class: 'tabbar__inner' },
        tabs.map((tab) =>
          el(
            'button',
            {
              class: 'tabbar__tab',
              type: 'button',
              role: 'tab',
              id: `tab-${tab.id}`,
              'aria-selected': String(tab.id === options.active),
              'aria-controls': 'screen',
              onClick: () => options.onSelect(tab.id)
            },
            icon(tab),
            el('span', {}, tab.label)
          )
        )
      )
    )
  );
}
