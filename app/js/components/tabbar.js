/**
 * The bottom tab bar — Today, Size, and Guide.
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

/** The shipped tabs, in order. */
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
    /* A ruler, deep enough to carry the calendar's optical mass: at 18 × 7 it
       was a squat sliver beside a 16 × 16.5 icon, and a tab pair that does not
       share a bounding box is the clearest "this is a web page" tell in the
       chrome. */
    paths: [
      'M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5z',
      'M7.5 6.5v3.5M11 6.5v5M14.5 6.5v3.5M18 6.5v5'
    ]
  },
  {
    id: 'guide',
    label: 'Guide',
    /* An open book: the one symbol for "here is what's known" that reads at
       23 px without detail, and it shares the pair's bounding box — same
       shoulders as the calendar, same waist as the ruler. */
    paths: [
      'M12 7.2C10.2 5.9 8 5.2 5.4 5.2H4.2A1.2 1.2 0 0 0 3 6.4v10.4a1.2 1.2 0 0 0 1.2 1.2h1.2c2.6 0 4.8.7 6.6 2',
      'M12 7.2c1.8-1.3 4-2 6.6-2h1.2A1.2 1.2 0 0 1 21 6.4v10.4a1.2 1.2 0 0 1-1.2 1.2h-1.2c-2.6 0-4.8.7-6.6 2',
      'M12 7.2v12.8'
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
