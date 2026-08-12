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
 * @property {{ cx: string, cy: string, r: string }} [dot] A filled dot drawn
 *   with the paths (the calendar's "today").
 */

/** The Phase 1 tabs, in order. */
export const TABS = /** @type {TabDef[]} */ ([
  {
    id: 'today',
    label: 'Today',
    /* A calendar with today marked. The old eight-rayed sun turned into a
       sparkle of noise at @3x and read as a brightness control. */
    paths: [
      'M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
      'M4 9.5h16M8 3v3M16 3v3'
    ],
    dot: { cx: '12', cy: '14', r: '1.9' }
  },
  {
    id: 'size',
    label: 'Size',
    /* A ruler. The old double-headed arrow between two rules read as a resize
       handle borrowed from a drawing tool. */
    paths: [
      'M4.5 8.5h15a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14v-4a1.5 1.5 0 0 1 1.5-1.5z',
      'M7.5 8.5v3M11 8.5v4.5M14.5 8.5v3M18 8.5v4.5'
    ]
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
      ),
      tab.dot
        ? el('circle', {
            cx: tab.dot.cx,
            cy: tab.dot.cy,
            r: tab.dot.r,
            fill: 'currentColor'
          })
        : null
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
