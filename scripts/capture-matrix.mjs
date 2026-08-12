/**
 * Visual-QA capture matrix for "Little One".
 *
 * Starts `scripts/serve.mjs` on a free port, drives headless Chromium through
 * `scripts/cdp.mjs` at a true 390×844 iPhone viewport (dsf 2), walks every
 * state worth looking at in both light and dark, and writes the PNGs to
 * `<scratchpad>/polish/round-N/`.
 *
 * Usage: `node scripts/capture-matrix.mjs [round] [--out DIR] [--only substr]`
 *   round   Round number → `round-N` output directory (default 1).
 *   --out   Override the output root (default: the session scratchpad).
 *   --only  Capture only shots whose name contains this substring (iteration
 *           aid; the round is still reported as partial).
 *
 * Every shot is verified three ways before it counts as captured:
 *   1. the PNG exists, is the expected size, and is not trivially small;
 *   2. it decodes and its pixels are *not* uniform (a blank or single-colour
 *      page is a failure, not a screenshot);
 *   3. the state assertions for that shot pass *in the page* — an "expanded"
 *      card whose `aria-expanded` is still false fails the run rather than
 *      quietly producing a screenshot of the wrong thing.
 *
 * Dark shots are additionally checked against their light twin: a dark shot
 * that is not meaningfully darker means `prefers-color-scheme` emulation
 * silently didn't take.
 *
 * Zero dependencies: node built-ins plus `scripts/cdp.mjs`.
 */

import { spawn } from 'node:child_process';
import { statSync, readFileSync } from 'node:fs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

import { launch, freePort, sleep } from './cdp.mjs';

/** Repo root, resolved from this file. */
const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/** Default output root — the session scratchpad this harness reports into. */
const DEFAULT_OUT_ROOT =
  '/tmp/claude-0/-home-user-Pregnancy-App/e333f971-6049-5d3c-80c8-3e7b51c4028e/scratchpad/polish';

/** Viewport under test: iPhone 12/13/14-class logical size at 2×. */
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true };

/** Expected PNG dimensions, derived from the viewport. */
const EXPECT_W = VIEWPORT.width * VIEWPORT.deviceScaleFactor;
const EXPECT_H = VIEWPORT.height * VIEWPORT.deviceScaleFactor;

/** A full-colour 780×1688 PNG of real UI is never this small. */
const MIN_BYTES = 6000;

/** Above this share of identical pixels the "screenshot" is effectively blank. */
const MAX_DOMINANT_FRACTION = 0.985;

/** Below this many distinct sampled colours there is no UI on screen. */
const MIN_DISTINCT_COLOURS = 12;

/** A dark shot must be at least this much darker than its light twin (0–255). */
const MIN_DARK_DELTA = 12;

/* ---------------------------------------------------------------------------
   Dates
   --------------------------------------------------------------------------- */

/**
 * Local-midnight `YYYY-MM-DD` for a date, mirroring `app/js/lib/weekMath.js`'s
 * convention so there is no UTC-boundary drift between harness and app.
 * @param {Date} d
 * @returns {string}
 */
function toISO(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * A due date `offsetDays` from today (negative = already passed).
 * @param {number} offsetDays
 * @returns {string}
 */
function dueIn(offsetDays) {
  const now = new Date();
  return toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays));
}

/** The spec's due date: today + 158 days → 17w + 3d (280 − 158 = 122 = 17×7+3). */
const DUE = dueIn(158);

/** 272 days out → 8 days pregnant (1w + 1d): the pre-week-4 "Early days" view. */
const DUE_EARLY = dueIn(272);

/** 7 days past due → 41w + 0d: the "Any day now" framing. */
const DUE_LATE = dueIn(-7);

/* ---------------------------------------------------------------------------
   PNG decoding (verification)
   --------------------------------------------------------------------------- */

/**
 * @typedef {Object} Decoded
 * @property {number} width
 * @property {number} height
 * @property {number} channels 3 (RGB) or 4 (RGBA).
 * @property {Buffer} data Unfiltered pixel rows, `width * channels` per row.
 */

/**
 * Decode a non-interlaced 8-bit truecolour PNG — which is exactly what
 * `Page.captureScreenshot` produces. Anything else throws, loudly, because a
 * silently-unverified screenshot is worse than no screenshot.
 * @param {Buffer} buf
 * @returns {Decoded}
 */
export function decodePNG(buf) {
  const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIG)) throw new Error('not a PNG');

  let offset = 8;
  /** @type {Buffer[]} */
  const idat = [];
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;

  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const body = buf.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8];
      colorType = body[9];
      interlace = body[12];
    } else if (type === 'IDAT') {
      idat.push(body);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error('unsupported interlaced PNG');
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : 0;
  if (!channels) throw new Error(`unsupported PNG colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.allocUnsafe(stride * height);

  /* Standard PNG defiltering (RFC 2083 §6): each scanline is prefixed by its
     filter type and reconstructed from the already-reconstructed line above. */
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const up = dst - stride;
    for (let x = 0; x < stride; x += 1) {
      const value = raw[src + x];
      const a = x >= channels ? out[dst + x - channels] : 0;
      const b = y > 0 ? out[up + x] : 0;
      const c = x >= channels && y > 0 ? out[up + x - channels] : 0;
      let recon;
      switch (filter) {
        case 0:
          recon = value;
          break;
        case 1:
          recon = value + a;
          break;
        case 2:
          recon = value + b;
          break;
        case 3:
          recon = value + ((a + b) >> 1);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          recon = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          throw new Error(`unknown PNG filter ${filter} on row ${y}`);
      }
      out[dst + x] = recon & 0xff;
    }
  }

  return { width, height, channels, data: out };
}

/**
 * @typedef {Object} ImageStats
 * @property {number} width
 * @property {number} height
 * @property {number} sampled Pixels inspected.
 * @property {number} distinct Distinct colours among them.
 * @property {number} dominantFraction Share held by the most common colour.
 * @property {number} meanLuma Mean luminance, 0–255.
 */

/**
 * Sample a decoded image on a grid and describe how much is actually going on
 * in it. A blank page has one colour; a real screen has hundreds.
 * @param {Decoded} img
 * @returns {ImageStats}
 */
export function imageStats(img) {
  const { width, height, channels, data } = img;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 20000)));
  /** @type {Map<number, number>} */
  const counts = new Map();
  let sampled = 0;
  let lumaSum = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = y * width * channels + x * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = (r << 16) | (g << 8) | b;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      lumaSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sampled += 1;
    }
  }

  let dominant = 0;
  for (const n of counts.values()) if (n > dominant) dominant = n;

  return {
    width,
    height,
    sampled,
    distinct: counts.size,
    dominantFraction: sampled ? dominant / sampled : 1,
    meanLuma: sampled ? lumaSum / sampled : 0
  };
}

/**
 * Verify one captured PNG on disk.
 * @param {string} filePath
 * @returns {{ ok: boolean, problems: string[], stats: ImageStats|null, bytes: number }}
 */
export function verifyPNG(filePath) {
  /** @type {string[]} */
  const problems = [];
  /** @type {number} */
  let bytes = 0;
  try {
    bytes = statSync(filePath).size;
  } catch {
    return { ok: false, problems: ['PNG was not written'], stats: null, bytes: 0 };
  }
  if (bytes < MIN_BYTES) problems.push(`only ${bytes} bytes (< ${MIN_BYTES}) — page probably blank`);

  /** @type {ImageStats|null} */
  let stats = null;
  try {
    stats = imageStats(decodePNG(readFileSync(filePath)));
  } catch (err) {
    problems.push(`could not decode PNG: ${/** @type {Error} */ (err).message}`);
    return { ok: false, problems, stats: null, bytes };
  }

  if (stats.width !== EXPECT_W || stats.height !== EXPECT_H) {
    problems.push(`is ${stats.width}×${stats.height}, expected ${EXPECT_W}×${EXPECT_H}`);
  }
  if (stats.distinct < MIN_DISTINCT_COLOURS) {
    problems.push(`only ${stats.distinct} distinct colours — nothing rendered`);
  }
  if (stats.dominantFraction > MAX_DOMINANT_FRACTION) {
    problems.push(
      `${(stats.dominantFraction * 100).toFixed(1)}% of pixels are one colour — effectively uniform`
    );
  }

  return { ok: problems.length === 0, problems, stats, bytes };
}

/* ---------------------------------------------------------------------------
   Page-side helpers
   --------------------------------------------------------------------------- */

/**
 * JS-source-safe string literal.
 * @param {string} s
 * @returns {string}
 */
const lit = (s) => JSON.stringify(s);

/**
 * Click a selector in the page, failing loudly if it isn't there. Clicking
 * nothing is the classic way a harness produces a screenshot of an unchanged
 * screen and calls it a state.
 * @param {import('./cdp.mjs').Page} page
 * @param {string} selector
 * @param {number} [settleMs]
 * @returns {Promise<void>}
 */
async function click(page, selector, settleMs = 260) {
  const found = await page.evaluate(
    `(() => {
       const node = document.querySelector(${lit(selector)});
       if (!node) return 'missing';
       if (node.hidden || node.disabled) return 'unavailable';
       node.click();
       return 'ok';
     })()`
  );
  if (found !== 'ok') throw new Error(`click ${selector}: element ${found}`);
  await page.waitForQuiet(settleMs);
}

/**
 * Scroll the window so a card (found by its section title) sits near the top.
 * @param {import('./cdp.mjs').Page} page
 * @param {string} title Exact section-title text.
 * @param {number} [padTop]
 * @returns {Promise<number>} The resulting `scrollY`.
 */
async function scrollToCard(page, title, padTop = 12) {
  const y = await page.evaluate(
    `(() => {
       const card = [...document.querySelectorAll('.card')].find(
         (c) => c.querySelector('.section-title')?.textContent?.trim() === ${lit(title)}
       );
       if (!card) return null;
       const top = card.getBoundingClientRect().top + window.scrollY;
       window.scrollTo(0, Math.max(0, top - ${padTop}));
       return window.scrollY;
     })()`
  );
  if (y === null) throw new Error(`no card titled ${JSON.stringify(title)} to scroll to`);
  await page.waitForQuiet(160);
  return y;
}

/**
 * Read a bundle of page facts as an object, for state assertions.
 * @param {import('./cdp.mjs').Page} page
 * @param {string} objectExpression A JS object literal evaluated in the page.
 * @returns {Promise<any>}
 */
async function probe(page, objectExpression) {
  return JSON.parse(await page.evaluate(`JSON.stringify(${objectExpression})`));
}

/**
 * Assert every entry of `checks` is truthy, collecting the failures.
 * @param {Object<string, any>} checks
 * @returns {string[]}
 */
function failures(checks) {
  return Object.entries(checks)
    .filter(([, pass]) => !pass)
    .map(([name]) => name);
}

/* ---------------------------------------------------------------------------
   The matrix
   --------------------------------------------------------------------------- */

/**
 * @typedef {Object} Shot
 * @property {string} name File stem (a `-dark` suffix is added for dark mode).
 * @property {string} path URL path + query, relative to the server root.
 * @property {(page: import('./cdp.mjs').Page) => Promise<void>} [act] Drive the
 *   page into the state (clicks, scrolls) after load.
 * @property {(page: import('./cdp.mjs').Page) => Promise<string[]>} [check]
 *   Return a list of failed state assertions (empty = the state engaged).
 */

/** Every state worth looking at, in capture order. @type {Shot[]} */
const SHOTS = [
  {
    name: 'welcome',
    path: '/?reset=1',
    check: async (page) => {
      const s = await probe(page, `({
        welcome: !!document.querySelector('.screen.welcome'),
        heading: document.querySelector('.welcome .title')?.textContent ?? '',
        dueInput: !!document.querySelector('#welcome-due, .welcome .input'),
        noTabs: !document.querySelector('.tabbar')
      })`);
      return failures({
        'welcome screen present': s.welcome,
        'greeting rendered': /little one/i.test(s.heading),
        'due-date field present': s.dueInput,
        'tab bar hidden on welcome': s.noTabs
      });
    }
  },
  {
    name: 'today-week17',
    path: `/?reset=1&due=${DUE}`,
    check: async (page) => {
      const s = await probe(page, `({
        week: document.querySelector('.week-numeral')?.textContent ?? '',
        meta: document.querySelector('.screen-head__meta')?.textContent ?? '',
        scrollY: window.scrollY,
        tabbar: !!document.querySelector('.tabbar')
      })`);
      return failures({
        'header reads Week 17': s.week.trim() === 'Week 17',
        'meta shows 17w + 3d': s.meta.includes('17w + 3d'),
        'at top of page': s.scrollY === 0,
        'tab bar present': s.tabbar
      });
    }
  },
  {
    name: 'today-menu',
    path: `/?reset=1&due=${DUE}`,
    act: async (page) => {
      await scrollToCard(page, 'On the menu this week');
    },
    check: async (page) => {
      const s = await probe(page, `(() => {
        const card = [...document.querySelectorAll('.card')].find(
          (c) => c.querySelector('.section-title')?.textContent?.trim() === 'On the menu this week'
        );
        const box = card ? card.getBoundingClientRect() : null;
        return {
          found: !!card,
          top: box ? box.top : null,
          bottom: box ? box.bottom : null,
          ideas: card ? card.querySelectorAll('.today-eat__item').length : 0,
          safety: card ? !!card.querySelector('.today-callout') : false,
          scrollY: window.scrollY
        };
      })()`);
      return failures({
        'nutrition card exists': s.found,
        'nutrition card at top of viewport': s.top !== null && s.top >= -2 && s.top < 120,
        'food ideas rendered': s.ideas >= 4,
        'food-safety callout visible': s.safety,
        'page actually scrolled': s.scrollY > 0
      });
    }
  },
  {
    name: 'today-todos',
    path: `/?reset=1&due=${DUE}`,
    act: async (page) => {
      await click(page, '.today-card--flags .card__toggle');
      /* Frame both cards. Starting point: the to-dos card just under the top of
         the viewport. But the tab bar is fixed over the bottom of the page, so
         "visible" ends at the tab bar's top edge, not at `innerHeight` — without
         that the last line of the expanded red-flags card sits behind the tab
         bar and the shot looks like a clipping bug. Scroll down as far as it
         takes to clear the tab bar, capped so the to-dos heading stays on
         screen. */
      await page.evaluate(
        `(() => {
           const byTitle = (t) => [...document.querySelectorAll('.card')].find(
             (c) => (c.querySelector('.section-title')?.textContent ?? '').trim() === t
           );
           const todos = byTitle('This week’s to-dos');
           const flags = document.querySelector('.today-card--flags');
           const tabbar = document.querySelector('.tabbar');
           const y = window.scrollY;
           const floor = tabbar ? tabbar.getBoundingClientRect().top : window.innerHeight;
           const todosTop = todos.getBoundingClientRect().top + y;
           const flagsBottom = flags.getBoundingClientRect().bottom + y;
           const preferred = todosTop - 12;
           const toClearTabbar = flagsBottom + 12 - floor;
           const target = Math.max(preferred, Math.min(toClearTabbar, preferred + 72));
           window.scrollTo(0, Math.max(0, target));
           return true;
         })()`
      );
      await page.waitForQuiet(160);
    },
    check: async (page) => {
      const s = await probe(page, `(() => {
        const flags = document.querySelector('.today-card--flags');
        const toggle = flags?.querySelector('.card__toggle');
        const body = flags?.querySelector('.card__body');
        const todos = [...document.querySelectorAll('.card')].find(
          (c) => (c.querySelector('.section-title')?.textContent ?? '').trim() === 'This week’s to-dos'
        );
        const tabbar = document.querySelector('.tabbar');
        const vh = window.innerHeight;
        const floor = tabbar ? tabbar.getBoundingClientRect().top : vh;
        const fb = flags?.getBoundingClientRect();
        const tb = todos?.getBoundingClientRect();
        return {
          flagsClearsTabBar: fb ? fb.bottom <= floor + 2 : false,
          todosTitleVisible: tb ? tb.top >= -4 : false,
          expanded: toggle?.getAttribute('aria-expanded') === 'true',
          bodyShown: body ? !body.hasAttribute('hidden') : false,
          bodyHeight: body ? body.getBoundingClientRect().height : 0,
          flagsText: (body?.textContent ?? '').slice(0, 40),
          flagsVisible: fb ? fb.top < vh && fb.bottom > 0 : false,
          todosVisible: tb ? tb.top < vh && tb.bottom > 0 : false,
          todoRows: todos ? todos.querySelectorAll('.today-todo').length : 0,
          scrollY: window.scrollY
        };
      })()`);
      return failures({
        'red-flags toggle reports expanded': s.expanded,
        'red-flags body is not hidden': s.bodyShown,
        'red-flags body has real height': s.bodyHeight > 60,
        'red-flags text present': /Call your OB/.test(s.flagsText),
        'red-flags card in viewport': s.flagsVisible,
        'red-flags card clears the tab bar': s.flagsClearsTabBar,
        'to-dos card in viewport': s.todosVisible,
        'to-dos heading still on screen': s.todosTitleVisible,
        'to-do rows rendered': s.todoRows >= 1,
        'page actually scrolled': s.scrollY > 0
      });
    }
  },
  {
    name: 'today-browsing',
    path: `/?reset=1&due=${DUE}`,
    act: async (page) => {
      /* Six taps of the forward chevron: 17 → 23. Driven through the real
         control rather than `?week=`, so the browse affordance is what's
         under test. */
      for (let i = 0; i < 6; i += 1) {
        await click(page, '.today-nav__btn:last-of-type', 90);
      }
      await page.evaluate('window.scrollTo(0, 0); true');
      await page.waitForQuiet(220);
    },
    check: async (page) => {
      const s = await probe(page, `({
        week: document.querySelector('.week-numeral')?.textContent ?? '',
        eyebrow: document.querySelector('.today-eyebrow')?.textContent ?? '',
        meta: document.querySelector('.screen-head__meta')?.textContent ?? '',
        pill: document.querySelector('.today-back')?.textContent ?? '',
        pillVisible: (() => {
          const p = document.querySelector('.today-back');
          if (!p) return false;
          const b = p.getBoundingClientRect();
          return b.width > 0 && b.top < window.innerHeight && b.bottom > 0;
        })(),
        scrollY: window.scrollY
      })`);
      return failures({
        'browsed to Week 23': s.week.trim() === 'Week 23',
        'eyebrow says looking ahead': /looking ahead/i.test(s.eyebrow),
        'meta shows relative position': /ahead/.test(s.meta),
        'Back to today pill present': /back to today/i.test(s.pill),
        'Back to today pill visible': s.pillVisible,
        'at top of page': s.scrollY === 0
      });
    }
  },
  {
    name: 'today-early',
    path: `/?reset=1&due=${DUE_EARLY}`,
    check: async (page) => {
      const s = await probe(page, `({
        title: document.querySelector('.screen-head .title')?.textContent ?? '',
        meta: document.querySelector('.screen-head__meta')?.textContent ?? '',
        mark: !!document.querySelector('.today-mark'),
        noNumeral: !document.querySelector('.week-numeral')
      })`);
      const ga = /^(\d+)w/.exec(s.meta.trim());
      return failures({
        'Early days header': s.title.trim() === 'Early days',
        'early-days card rendered': s.mark,
        'no week numeral before week 4': s.noNumeral,
        'gestational age under 4 weeks': ga !== null && Number(ga[1]) < 4
      });
    }
  },
  {
    name: 'today-week41',
    path: `/?reset=1&due=${DUE_LATE}`,
    check: async (page) => {
      const s = await probe(page, `({
        week: document.querySelector('.week-numeral')?.textContent ?? '',
        meta: document.querySelector('.screen-head__meta')?.textContent ?? '',
        anyDayNow: [...document.querySelectorAll('.section-title')]
          .some((t) => t.textContent.trim() === 'Any day now')
      })`);
      return failures({
        'header reads Week 41': s.week.trim() === 'Week 41',
        'meta shows 41w': s.meta.includes('41w'),
        'past-due framing in meta': /past|over|due/i.test(s.meta),
        '"Any day now" card present': s.anyDayNow
      });
    }
  },
  ...[8, 17, 28, 40].map((week) => ({
    name: `size-week${week}`,
    path: `/?reset=1&due=${DUE}&tab=size&week=${week}`,
    check: async (/** @type {import('./cdp.mjs').Page} */ page) => {
      const s = await probe(page, `({
        title: document.querySelector('.size-title')?.textContent ?? '',
        badge: document.querySelector('.size-fit')?.textContent ?? '',
        pct: document.querySelector('.size-fit__pct')?.textContent ?? '',
        figureVisible: (() => {
          const f = document.querySelector('.size-figure--now');
          if (!f) return false;
          const b = f.getBoundingClientRect();
          return b.width > 4 && b.height > 4;
        })(),
        stats: document.querySelector('.size-line')?.textContent ?? '',
        /* Without a nickname the comparison rides the stat line itself; the
           warm sentence only earns its own line when the baby has a name. */
        compare: (
          (document.querySelector('.size-line')?.textContent ?? '') +
          ' ' +
          (document.querySelector('.size-line__sub')?.textContent ?? '')
        ),
        canvasReady: !!document.querySelector('.size-canvas--ready')
      })`);
      /** @type {Object<string, any>} */
      const checks = {
        /* The title carries the trimester on its own line now, so it starts
           with the week rather than being only the week. */
        [`title reads Week ${week}`]: s.title.trim().startsWith(`Week ${week}`),
        'silhouette drawn': s.figureVisible,
        'canvas laid out': s.canvasReady,
        'length + weight shown': /\d/.test(s.stats),
        'comparison shown': /·\s+an?\s+\S/.test(s.compare),
        'honesty badge present': s.badge.length > 0
      };
      if (week === 40) {
        /* The point of the week-40 shot: the baby has outgrown the screen, so
           the badge must own up to it with a percentage. */
        checks['fit-scaled with a percent badge'] = /^\d+%$/.test(s.pct.trim());
        /* Uncalibrated — which is what every shot in this matrix is — the badge
           reads "Shown at 18% · Make it exact". The milestone sentence belongs
           to the one week the baby outgrows the screen, not to all 26 after it,
           so week 40 is expected to carry the offer instead. */
        checks['badge explains the scaling'] =
          /outgrew the screen|make it exact|calibrate|of actual size/i.test(s.badge);
      } else {
        checks['badge is not a scaling error'] = s.badge.length > 0;
      }
      return failures(checks);
    }
  })),
  {
    /* Life-size is shot at the user's own week, not at week 40. Measured: from
       about week 20 on, the actual-size body is wider than the 322 px stage at
       every scroll position, so a mid-baby frame is a featureless field of
       sage — true, but it shows a reviewer nothing. Week 17 still overflows the
       stage vertically (843 px of baby in a 442 px window, so the mode and its
       scroll are genuinely exercised) while keeping both contours of the torso
       and the week-16 ghost in frame. Week 40's outgrown-the-screen story is
       already told, with its percentage, by `size-week40`. */
    name: 'size-lifesize',
    path: `/?reset=1&due=${DUE}&tab=size&week=17`,
    act: async (page) => {
      await click(page, '.size-chip--action', 320);
      /* Life-size means the baby is taller than the stage: park the scroller
         mid-body so the shot shows the middle of the baby, not the crown. */
      await page.evaluate(
        `(() => {
           const s = document.querySelector('.size-scroller');
           s.scrollTop = Math.round((s.scrollHeight - s.clientHeight) / 2);
           return s.scrollTop;
         })()`
      );
      await page.waitForQuiet(200);
    },
    check: async (page) => {
      const s = await probe(page, `(() => {
        const scroller = document.querySelector('.size-scroller');
        const btn = document.querySelector('.size-chip--action');
        return {
          pressed: btn?.getAttribute('aria-pressed') === 'true',
          label: btn?.textContent ?? '',
          badge: document.querySelector('.size-fit')?.textContent ?? '',
          lifeClass: !!document.querySelector('.size-stage--life'),
          scrollTop: scroller?.scrollTop ?? 0,
          scrollable: scroller ? scroller.scrollHeight - scroller.clientHeight : 0,
          figureH: document.querySelector('.size-figure--now')?.getBoundingClientRect().height ?? 0
        };
      })()`);
      const midpoint = s.scrollable > 0 ? s.scrollTop / s.scrollable : 0;
      return failures({
        'life-size toggle is pressed': s.pressed,
        'toggle now offers Fit to screen': /fit to screen/i.test(s.label),
        'stage in life-size mode': s.lifeClass,
        'badge claims actual size': /actual size/i.test(s.badge),
        /* 787 px of week-17 baby in a stage that is now ~595 px, so ~190 px of
           it lives off-frame. The threshold was 200 when the stage still paid
           a row of chrome for the honesty badge; the badge is overlaid now, the
           picture kept those pixels, and the mode is still genuinely scrolling.
           Anything above ~120 px proves that. */
        'content overflows the stage': s.scrollable > 120,
        'scrolled to mid-baby': midpoint > 0.3 && midpoint < 0.7
      });
    }
  },
  {
    name: 'size-calibration',
    path: `/?reset=1&due=${DUE}&tab=size&week=17`,
    act: async (page) => {
      /* The honesty badge is itself the calibrate invitation until the device
         has been calibrated. */
      await click(page, '.size-fit', 420);
    },
    check: async (page) => {
      const s = await probe(page, `(() => {
        const sheet = document.querySelector('.sheet');
        return {
          sheet: !!sheet,
          open: sheet ? sheet.classList.contains('sheet--open') : false,
          label: sheet?.getAttribute('aria-label') ?? '',
          inner: !!document.querySelector('.size-cal__inner'),
          cardOutline: (() => {
            const c = document.querySelector('.size-cal__card');
            if (!c) return 0;
            return c.getBoundingClientRect().width;
          })(),
          slider: !!document.querySelector('.size-cal__input'),
          readout:
            document.querySelector('.size-cal__inner [aria-live]')?.textContent ?? '',
          /* The one edge this screen exists to align: the outline's bottom
             must clear the sticky action bar without scrolling. */
          outlineClearsBar: (() => {
            const card = document.querySelector('.size-cal__card');
            const bar = document.querySelector('.size-cal__actions');
            if (!card || !bar) return false;
            return card.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1;
          })(),
          onTop: (() => {
            const sheet = document.querySelector('.sheet');
            if (!sheet) return false;
            const b = sheet.getBoundingClientRect();
            return b.top < 40 && b.height > window.innerHeight * 0.8;
          })()
        };
      })()`);
      return failures({
        'calibration sheet mounted': s.sheet,
        'sheet finished sliding open': s.open,
        'sheet is the calibration one': /calibrat/i.test(s.label),
        'calibration body rendered': s.inner,
        'credit-card outline drawn': s.cardOutline > 100,
        'slider present': s.slider,
        /* The running commentary is a screen-reader affordance now — on the
           glass it only repeated the copy above the outline, and it cost the
           outline's bottom edge. The pixel density lives in the slider's
           aria-valuetext, where it belongs. */
        'live region guides the match': /matches your card|trust your eye/i.test(s.readout),
        'live region keeps pixel density out of sight': !/pixels per millim/i.test(s.readout),
        'card outline clears the action bar': s.outlineClearsBar,
        'sheet covers the screen': s.onTop
      });
    }
  },
  {
    name: 'settings',
    path: `/?reset=1&due=${DUE}`,
    act: async (page) => {
      await click(page, 'button[aria-label="Settings"]', 420);
    },
    check: async (page) => {
      const s = await probe(page, `(() => {
        const sheet = document.querySelector('.sheet');
        const titles = sheet
          ? [...sheet.querySelectorAll('.section-title')].map((t) => t.textContent.trim())
          : [];
        return {
          sheet: !!sheet,
          open: sheet ? sheet.classList.contains('sheet--open') : false,
          label: sheet?.getAttribute('aria-label') ?? '',
          titles,
          dueValue: document.querySelector('#settings-due')?.value ?? '',
          onTop: (() => {
            if (!sheet) return false;
            const b = sheet.getBoundingClientRect();
            return b.top < 40 && b.height > window.innerHeight * 0.8;
          })()
        };
      })()`);
      return failures({
        'settings sheet mounted': s.sheet,
        'sheet finished sliding open': s.open,
        'sheet is Settings': /settings/i.test(s.label),
        'pregnancy section present': s.titles.includes('Your pregnancy'),
        'units section present': s.titles.includes('Units'),
        'true-size section present': s.titles.includes('True size'),
        'due date seeded': s.dueValue === DUE,
        'sheet covers the screen': s.onTop
      });
    }
  }
];

/* ---------------------------------------------------------------------------
   Server plumbing
   --------------------------------------------------------------------------- */

/**
 * Start `scripts/serve.mjs` on `port`, buffering its output for diagnosis.
 * @param {number} port
 * @returns {{ child: import('node:child_process').ChildProcess, output: () => string }}
 */
function startServer(port) {
  const child = spawn(process.execPath, ['scripts/serve.mjs', String(port)], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let buf = '';
  child.stdout.on('data', (d) => (buf += d.toString()));
  child.stderr.on('data', (d) => (buf += d.toString()));
  child.on('error', (err) => (buf += `\n[spawn error] ${err.message}`));
  return { child, output: () => buf };
}

/**
 * Poll the static server until it answers.
 * @param {number} port
 * @param {number} [timeoutMs]
 * @returns {Promise<void>}
 */
async function waitForServer(port, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const ok = await new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}/`, { timeout: 1500 }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', () => resolve(false));
    });
    if (ok) return;
    if (Date.now() > deadline) throw new Error(`serve.mjs never answered on port ${port}`);
    await sleep(100);
  }
}

/**
 * Stop the static server.
 * @param {import('node:child_process').ChildProcess} child
 * @returns {Promise<void>}
 */
function stopServer(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      resolve();
    }, 2000);
  });
}

/* ---------------------------------------------------------------------------
   Run
   --------------------------------------------------------------------------- */

/**
 * Parse argv.
 * @param {string[]} argv
 * @returns {{ round: number, outRoot: string, only: string|null }}
 */
function parseArgs(argv) {
  let round = 1;
  let outRoot = DEFAULT_OUT_ROOT;
  /** @type {string|null} */
  let only = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') outRoot = path.resolve(argv[++i] ?? outRoot);
    else if (arg === '--only') only = argv[++i] ?? null;
    else if (/^\d+$/.test(arg)) round = Number(arg);
  }
  return { round, outRoot, only };
}

/**
 * Capture one shot in one theme and verify it.
 * @param {import('./cdp.mjs').Page} page
 * @param {Shot} shot
 * @param {boolean} dark
 * @param {string} outDir
 * @param {number} serverPort
 * @returns {Promise<{ file: string, ok: boolean, problems: string[], stats: ImageStats|null, bytes: number }>}
 */
async function captureShot(page, shot, dark, outDir, serverPort) {
  const file = `${shot.name}${dark ? '-dark' : ''}.png`;
  const filePath = path.join(outDir, file);
  /** @type {string[]} */
  const problems = [];

  page.clearErrors();
  await page.navigate(`http://127.0.0.1:${serverPort}${shot.path}`);

  try {
    if (shot.act) await shot.act(page);
  } catch (err) {
    problems.push(`driving the state failed: ${/** @type {Error} */ (err).message}`);
  }

  await page.waitForQuiet(160);

  if (shot.check && problems.length === 0) {
    try {
      for (const failed of await shot.check(page)) problems.push(`state check failed: ${failed}`);
    } catch (err) {
      problems.push(`state check threw: ${/** @type {Error} */ (err).message}`);
    }
  }

  const bytes = await page.screenshot(filePath);
  const verified = verifyPNG(filePath);
  problems.push(...verified.problems);
  for (const err of page.pageErrors) problems.push(`page error: ${err}`);

  return { file, ok: problems.length === 0, problems, stats: verified.stats, bytes };
}

/**
 * Capture the whole matrix.
 * @returns {Promise<void>}
 */
async function main() {
  const { round, outRoot, only } = parseArgs(process.argv.slice(2));
  const outDir = path.join(outRoot, `round-${round}`);
  const shots = only ? SHOTS.filter((s) => s.name.includes(only)) : SHOTS;
  if (shots.length === 0) throw new Error(`--only ${only} matched no shots`);

  /* A round directory must describe this round and nothing else: a stale PNG
     from a previous attempt is a lie a reviewer cannot detect by looking. A
     `--only` run is explicitly a patch on an existing round, so it keeps them. */
  if (!only) await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  console.log(`Little One capture matrix → ${outDir}`);
  console.log(`viewport ${VIEWPORT.width}×${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x`);
  console.log(`due dates: main ${DUE} · early ${DUE_EARLY} · past-due ${DUE_LATE}`);

  const serverPort = await freePort();
  const { child, output } = startServer(serverPort);
  /** @type {any[]} */
  const results = [];
  /** @type {import('./cdp.mjs').Browser|null} */
  let browser = null;

  try {
    await waitForServer(serverPort);
    browser = await launch();
    const page = browser.page;
    await page.setViewport(VIEWPORT);

    for (const dark of [false, true]) {
      await page.setDarkMode(dark);
      for (const shot of shots) {
        const result = await captureShot(page, shot, dark, outDir, serverPort);
        results.push({ ...result, shot: shot.name, dark });
        const status = result.ok ? ' ok ' : 'FAIL';
        const luma = result.stats ? ` luma ${result.stats.meanLuma.toFixed(0)}` : '';
        const colours = result.stats ? ` colours ${result.stats.distinct}` : '';
        console.log(`  [${status}] ${result.file}  ${result.bytes}B${colours}${luma}`);
        for (const problem of result.problems) console.log(`         · ${problem}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(child);
  }

  /* Cross-check the themes: a dark shot that isn't darker than its light twin
     means the emulated `prefers-color-scheme` never reached the page. */
  for (const result of results.filter((r) => r.dark)) {
    const light = results.find((r) => !r.dark && r.shot === result.shot);
    if (!light || !light.stats || !result.stats) continue;
    const delta = light.stats.meanLuma - result.stats.meanLuma;
    if (delta < MIN_DARK_DELTA) {
      result.ok = false;
      result.problems.push(
        `dark shot is not darker than its light twin (Δluma ${delta.toFixed(1)}) — dark mode did not engage`
      );
      console.log(`  [FAIL] ${result.file} · ${result.problems[result.problems.length - 1]}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  await writeFile(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(
      {
        round,
        capturedAt: new Date().toISOString(),
        viewport: VIEWPORT,
        dueDates: { main: DUE, early: DUE_EARLY, pastDue: DUE_LATE },
        partial: Boolean(only),
        shots: results.map((r) => ({
          file: r.file,
          ok: r.ok,
          bytes: r.bytes,
          distinctColours: r.stats?.distinct ?? null,
          meanLuma: r.stats ? Number(r.stats.meanLuma.toFixed(1)) : null,
          problems: r.problems
        }))
      },
      null,
      2
    )}\n`
  );

  console.log(`\n${results.length - failed.length}/${results.length} shots verified.`);
  if (failed.length > 0) {
    console.error(`failing: ${failed.map((r) => r.file).join(', ')}`);
    console.error(`server output:\n${output()}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
