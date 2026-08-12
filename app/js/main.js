/**
 * Little One — app composition.
 *
 * Owns the shell: welcome gating, tab state, screen swapping, the Settings
 * sheet, demo/dev query parameters, and service-worker registration. Screens
 * are dumb: each exports `render(ctx)` and returns an element.
 */

import { el, mount } from './lib/dom.js';
import {
  loadSettings,
  updateSettings,
  clearSettings
} from './lib/storage.js';
import { isValidISODate, contentWeekFor } from './lib/weekMath.js';
import { clampPxPerMm } from './lib/scale.js';
import { tabBar } from './components/tabbar.js';
import * as welcomeScreen from './screens/welcome.js';
import * as todayScreen from './screens/today.js';
import * as sizeScreen from './screens/size.js';
import * as settingsScreen from './screens/settings.js';

/** @typedef {import('./lib/types.js').TabId} TabId */
/** @typedef {import('./lib/types.js').Settings} Settings */

/** Screen modules by tab id. */
const SCREENS = { today: todayScreen, size: sizeScreen };

/** Query parameters the demo/dev harness may pass; all are stripped on load. */
const DEMO_PARAMS = ['due', 'reset', 'tab', 'week', 'pxmm'];

/** @type {TabId} */
let currentTab = 'today';

/** @type {number|null} Week seeded by `?week=` for the Size screen. */
let initialWeek = null;

/** @type {HTMLElement} */
let root;

/** @type {HTMLElement} */
let mainEl;

/** @type {HTMLElement|null} */
let navEl = null;

/** @type {HTMLElement|null} */
let sheetEl = null;

/** True while the welcome screen is showing (no tab bar). */
let inWelcome = false;

/**
 * The context handed to every screen. `settings` is a live getter so a screen
 * that holds the context across interactions always reads current state.
 * @type {import('./lib/types.js').ScreenContext}
 */
const context = /** @type {any} */ ({
  get settings() {
    return loadSettings();
  },
  get initialWeek() {
    return initialWeek;
  },
  update,
  go,
  showSettings
});

/* -------------------------------------------------------------------------
   State changes
   ------------------------------------------------------------------------- */

/**
 * Persist a settings patch and re-render if it changed something structural.
 * A `todosDone`-only patch never re-renders — checkbox state is applied to the
 * DOM directly by the screen, so the page never jumps.
 * @param {Partial<Settings>} patch
 * @returns {Settings} The new settings.
 */
function update(patch) {
  const wasWelcome = inWelcome;
  const next = updateSettings(patch);
  const structural = Object.keys(patch).some((key) => key !== 'todosDone');
  if (!structural) return next;

  if (wasWelcome !== !next.dueDateISO) buildShell();
  else renderScreen();
  return next;
}

/**
 * Switch tabs.
 * @param {TabId} tab
 * @returns {void}
 */
function go(tab) {
  if (!SCREENS[tab]) return;
  currentTab = tab;
  if (inWelcome) return;
  renderScreen();
  window.scrollTo(0, 0);
}

/* -------------------------------------------------------------------------
   Settings sheet
   ------------------------------------------------------------------------- */

/**
 * Present Settings as a full-screen sheet sliding up from the bottom.
 * @returns {void}
 */
function showSettings() {
  if (sheetEl) return;
  const sheetCtx = Object.assign(Object.create(context), { close: hideSettings });
  const sheet = /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Settings' },
      safely(() => settingsScreen.render(sheetCtx), 'Settings')
    )
  );
  document.body.appendChild(sheet);
  sheetEl = sheet;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => sheet.classList.add('sheet--open'));
}

/**
 * Dismiss the Settings sheet, removing it once the slide-down finishes.
 * @returns {void}
 */
function hideSettings() {
  const sheet = sheetEl;
  if (!sheet) return;
  sheetEl = null;
  document.body.style.overflow = '';
  sheet.classList.remove('sheet--open');
  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    sheet.remove();
  };
  sheet.addEventListener('transitionend', remove, { once: true });
  setTimeout(remove, 400);
}

/* -------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------- */

/**
 * Run a render function, falling back to a calm message instead of a blank
 * screen if a screen module throws.
 * @param {() => HTMLElement} fn
 * @param {string} label Screen name, for the console.
 * @returns {HTMLElement}
 */
function safely(fn, label) {
  try {
    return fn();
  } catch (err) {
    console.error(`${label} failed to render`, err);
    return /** @type {HTMLElement} */ (
      el(
        'div',
        { class: 'screen' },
        el(
          'section',
          { class: 'card' },
          el('h2', { class: 'section-title' }, 'Just a moment'),
          el(
            'p',
            { class: 'small muted' },
            'This part of the app isn’t ready yet. Everything you’ve saved is safe.'
          )
        )
      )
    );
  }
}

/**
 * Let the outgoing screen drop anything it attached outside its own subtree
 * (the Size screen's window listeners and ResizeObserver). A screen opts in by
 * hanging a `__teardown` function off the element it returns; screens that
 * don't need one are unaffected.
 * @returns {void}
 */
function teardownScreens() {
  if (!mainEl) return;
  for (const child of Array.from(mainEl.children)) {
    const fn = /** @type {any} */ (child).__teardown;
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error('screen teardown failed', err);
      }
    }
  }
}

/**
 * Build (or rebuild) the shell: `<main>` plus the tab bar, or the tab-less
 * welcome layout.
 * @returns {void}
 */
function buildShell() {
  teardownScreens();
  inWelcome = !loadSettings().dueDateISO;
  mainEl = /** @type {HTMLElement} */ (
    el('main', {
      id: 'screen',
      class: inWelcome ? 'app-main app-main--no-tabs' : 'app-main'
    })
  );
  navEl = null;
  mount(root, mainEl);
  renderScreen();
}

/**
 * Render the active screen into `<main>` and keep the tab bar in sync.
 * @returns {void}
 */
function renderScreen() {
  teardownScreens();

  if (inWelcome) {
    mount(mainEl, safely(() => welcomeScreen.render(context), 'Welcome'));
    return;
  }

  const screen = SCREENS[currentTab] ?? SCREENS.today;
  mount(mainEl, safely(() => screen.render(context), currentTab));

  const nextNav = /** @type {HTMLElement} */ (
    tabBar({ active: currentTab, onSelect: go })
  );
  if (navEl) root.replaceChild(nextNav, navEl);
  else root.appendChild(nextNav);
  navEl = nextNav;
}

/* -------------------------------------------------------------------------
   Demo / dev query parameters
   ------------------------------------------------------------------------- */

/**
 * Apply `?due=`, `?reset=1`, `?tab=`, `?week=`, `?pxmm=` once on load, then
 * strip them from the address bar so a refresh is a normal launch.
 * @returns {void}
 */
function applyQueryParams() {
  let url;
  try {
    url = new URL(window.location.href);
  } catch {
    return;
  }
  const q = url.searchParams;
  if (!DEMO_PARAMS.some((key) => q.has(key))) return;

  if (q.get('reset') === '1') {
    clearSettings();
    /* Storage is gone; the screens' remembered week must go with it. */
    sizeScreen.resetSessionWeek();
    todayScreen.resetBrowseWeek();
  }

  const due = q.get('due');
  if (due && isValidISODate(due)) updateSettings({ dueDateISO: due });

  const pxmm = q.get('pxmm');
  if (pxmm !== null) {
    const value = Number(pxmm);
    if (Number.isFinite(value) && value > 0) {
      updateSettings({ pxPerMm: clampPxPerMm(value) });
    }
  }

  const tab = q.get('tab');
  if (tab === 'today' || tab === 'size') currentTab = tab;

  const week = q.get('week');
  if (week !== null) {
    const value = Number(week);
    if (Number.isFinite(value)) initialWeek = contentWeekFor(value);
  }

  for (const key of DEMO_PARAMS) q.delete(key);
  const search = q.toString();
  const clean = url.pathname + (search ? `?${search}` : '') + url.hash;
  try {
    window.history.replaceState(null, '', clean);
  } catch {
    /* file:// and similar — harmless */
  }
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

/**
 * Register the service worker so the app works offline after first load.
 * @returns {void}
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!window.location.protocol.startsWith('http')) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('service worker registration failed', err);
    });
  });
}

/**
 * Start the app.
 * @returns {void}
 */
function boot() {
  root = /** @type {HTMLElement} */ (document.getElementById('app'));
  if (!root) return;
  applyQueryParams();
  buildShell();
  registerServiceWorker();
}

boot();
