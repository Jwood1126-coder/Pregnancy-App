/**
 * Size — the signature screen.
 *
 * One job, done honestly: draw this week's baby at true physical size on the
 * glass, and never overstate it. The pipeline is
 *
 *   SIZE_TABLE.lengthMm × pxPerMm  →  CSS pixels of real baby
 *   silhouetteScale(...)           →  viewBox units → CSS pixels for the art
 *   fitScale(...)                  →  the honest shrink when it no longer fits
 *
 * with `pxPerMm` coming from the user's calibration when they've done it and
 * from `DEFAULT_PX_PER_MM` when they haven't. Everything the screen draws comes
 * from `SIZE_TABLE` and the silhouette contract, so it renders completely even
 * when a week's authored text is missing.
 *
 * `app/css/app.css` belongs to the foundation agent, so this screen's extra
 * rules ship as a scoped stylesheet built entirely from the existing design
 * tokens — no new colours, no new fonts. Selectors are prefixed `size-`.
 */

import { el } from '../lib/dom.js';
import { disclaimer } from '../components/disclaimer.js';
import { card } from '../components/card.js';
import {
  SIZE_TABLE,
  BASIS_SWITCH_WEEK,
  BASIS_SWITCH_NOTE
} from '../data/sizes.js';
import { silhouetteForWeek } from '../features/size/silhouettes.js';
import { scrubber } from '../features/size/scrubber.js';
import {
  openCalibration,
  CAL_MIN_PX_PER_MM,
  CAL_MAX_PX_PER_MM
} from '../features/size/calibration.js';
import {
  effectivePxPerMm,
  silhouetteScale,
  fitScale,
  scalePercent
} from '../lib/scale.js';
import { formatLength, formatWeight, basisLabel, trimesterLabel } from '../lib/units.js';
import {
  pregnancyStatus,
  contentWeekFor,
  trimesterOf,
  isValidISODate,
  MIN_CONTENT_WEEK,
  MAX_CONTENT_WEEK
} from '../lib/weekMath.js';

/** @typedef {import('../lib/types.js').ScreenContext} ScreenContext */
/** @typedef {import('../lib/types.js').Settings} Settings */
/** @typedef {import('../lib/types.js').Silhouette} Silhouette */
/** @typedef {import('../lib/types.js').LengthBasis} LengthBasis */

/** Id of the injected `<style>` element. */
export const SIZE_STYLE_ID = 'size-styles';

/** Footer line: the numbers are population averages, and that's worth saying. */
export const SIZE_AVERAGES_NOTE =
  'Lengths and weights are averages — every baby grows at their own pace.';

/**
 * Invitation shown until the user has calibrated their screen — it lives on
 * the honesty badge itself, so the promise is offered where the claim is made.
 * The word after the separator is the tappable half and carries the accent;
 * `"Try again"` replaces it when a calibration exists but rests on a slider
 * endpoint, which means the outline may never have matched the user's card.
 */
export const CALIBRATE_LEAD = 'Approximate size · ';

/** The tappable verb on that badge. */
export const CALIBRATE_ACTION = 'Calibrate';

/** …and when a calibration exists but rested on a slider endpoint. */
export const RECALIBRATE_ACTION = 'Try again';

/** Smallest stage we will ever ask for, in CSS px. */
const MIN_AVAILABLE_PX = 140;

/** How far the figure may reach into the bottom scrim's gradient, in CSS px. */
const FOOT_BLEED_PX = 24;

/** Smallest stage the early weeks are allowed to hug down to, in CSS px. */
const MIN_HUG_PX = 320;

/**
 * How much smaller an earlier week has to be before it is worth drawing as the
 * nested growth ring. Below this the ring is a couple of pixels wide, which
 * reads as a misregistered second copy rather than as growth.
 */
const GHOST_MAX_RATIO = 0.92;

/**
 * The week the user last scrubbed to, kept across re-renders (calibrating or
 * flipping units re-renders the screen, and losing their place would be rude).
 *
 * Stored alongside the due date it was scrubbed under: if that changes, "week
 * 40" no longer means what the user meant by it, so the memory is dropped and
 * `?week=` / the current week take over again. `null` until they scrub.
 *
 * @type {{ week: number, forDue: string|null }|null}
 */
let session = null;

/**
 * Forget the scrubbed week — called by `main.js` when storage is cleared, so a
 * `?reset=1` link cannot leave the Size screen parked on a stranger's week.
 * @returns {void}
 */
export function resetSessionWeek() {
  session = null;
}

const CSS = `
/* The picture is the screen. Everything else is either inside the stage or
   below the fold, and the shell's top padding is trimmed back on this tab so
   the stage starts six pixels higher. */
.size-screen { gap: 8px; margin-top: -6px; }

.size-screen .screen-head { padding: 2px 2px 0; }

/* One line, not three. The picture is the screen's reason to exist, and every
   row of supporting type above it is a row the baby does not get. */
.size-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.size-title__sub {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--ink-soft);
  white-space: nowrap;
}

.size-back {
  flex: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  min-height: 44px;
  padding: 10px 14px;
}

.size-back[hidden] { display: none; }

/* --- The honesty badge --------------------------------------------------- */

/* The badge sits inside the stage — it costs no row of its own in the screen's
   flex column. It is laid out, not floated: at week 40 the crown reaches the
   top of the picture area, and a floating badge would paint over the baby's
   head. The extra bottom padding glues it to the crown below it, so badge and
   baby read as one group rather than as two objects sharing a card. */
.size-stage__top {
  display: flex;
  justify-content: center;
  padding: 0 var(--gutter) 14px;
}

/* Uncalibrated, the badge *is* the invitation: one always-visible element
   instead of a badge plus a calibrate row that lived below the fold. */
button.size-fit {
  border: 0;
  cursor: pointer;
  font-family: inherit;
  transition: transform var(--dur) var(--ease);
}

button.size-fit:active { transform: scale(0.98); transition-duration: 60ms; }

.size-fit__do { color: var(--accent-ink); font-weight: 700; }

.size-fit {
  text-wrap: balance;
  line-height: 1.35;
  max-width: 100%;
}

/* The soul of the product deserves more than caption weight. */
.size-fit--true {
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 15px;
  font-weight: 600;
  padding: 7px 16px;
}

/* Same object, two tones — sage when the size is true, neutral when it is not.
   The scaled state is the one 26 of the 39 weeks live in, so it cannot be a
   fainter, smaller, differently-shaped thing that morphs mid-scrub. */
.size-fit--scaled {
  background: color-mix(in srgb, var(--ink) 5%, transparent);
  color: var(--ink-soft);
  font-size: 15px;
  font-weight: 500;
  padding: 7px 16px;
}

.size-fit__pct { font-weight: 700; color: var(--ink); }

/* --- The stage ----------------------------------------------------------- */

/* Full-bleed: the stage runs to the edges of the phone and gives back the
   gutters as picture. */
.size-stage {
  /* A column: badge, then the picture area (given an explicit height — the
     room the baby may use), and the chip row floating over the bottom band
     that is deliberately left below it. */
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 8px 6px 0;
  margin: 0 calc(var(--gutter) * -1);
  border-left: 0;
  border-right: 0;
  border-radius: 0 0 var(--radius) var(--radius);
}

.size-scroller {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overscroll-behavior: contain;
}

.size-stage--life .size-scroller {
  align-items: flex-start;
  overflow: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  /* Both cut edges dissolve, so a body that runs off the frame reads as
     "there is more this way" rather than as a broken crop. */
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
}

.size-canvas {
  position: relative;
  flex: none;
  min-width: 1px;
  /* Hidden until the first real measurement, so the baby is never briefly
     wrong: the true-size promise is the one thing that must not flicker. */
  opacity: 0;
  transition: height var(--dur) var(--ease);
}

.size-canvas--ready { opacity: 1; }

.size-figure {
  position: absolute;
  top: 0;
  left: 50%;
  transition: transform 220ms var(--ease);
  will-change: transform;
}

/* During a drag the figure must track the thumb 1:1 — a running tween makes it
   trail on elastic. The ease is for discrete jumps only. */
.size-stage--scrubbing .size-figure { transition: none; }

.size-figure--now path { fill: var(--accent); }

/* Growth read as area, not as a line: an earlier week is painted as a paler
   solid nested inside this week, so the full-strength sage rim around it *is*
   the growth. A dashed stroke riding this week's own edge read as a torn
   sticker at 1% and as stitching across the belly at 12%. */
.size-figure--ghost path {
  fill: color-mix(in srgb, var(--accent) 46%, var(--card));
  stroke: none;
}

/* Dark is redesigned, not inverted: a full-strength accent across the whole
   stage is a glare panel at 3am, and it flattens the shape. Both layers are
   tinted from the same knocked-back base so the growth rim survives. */
@media (prefers-color-scheme: dark) {
  .size-figure--now path { fill: color-mix(in srgb, var(--accent) 72%, var(--bg)); }
  .size-figure--ghost path { fill: color-mix(in srgb, var(--accent) 40%, var(--bg)); }
}

/* The early weeks are a small figure in a large frame. A single soft wash of
   sage behind them turns that emptiness into matting rather than a void. */
.size-canvas--small::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: calc(var(--halo, 120px) * 2.6);
  height: calc(var(--halo, 120px) * 2.6);
  transform: translate(-50%, -35%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 9%, transparent) 0%,
    color-mix(in srgb, var(--accent) 0%, transparent) 62%
  );
  pointer-events: none;
}

/* --- Life-size wayfinding ------------------------------------------------ */

/* Wayfinding for a wall of sage. The marks live on the stage, not on the
   canvas: pinned to the frame they stay visible however far the body has been
   scrolled, and they clear the scroller's fade at top and bottom. */
.size-life-mark {
  position: absolute;
  left: var(--gutter);
  z-index: 2;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--card) 88%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  pointer-events: none;
}

/* Clear of the honesty badge, which owns the top of the stage. */
.size-life-mark--head { top: 62px; }
.size-life-mark--foot { bottom: calc(var(--foot-h, 96px) + 12px); }
.size-life-mark[hidden] { display: none; }

/* Where along the baby you are: the wall of sage says "shoulders" instead of
   nothing. */
.size-life-rail {
  position: absolute;
  right: 8px;
  top: 62px;
  bottom: calc(var(--foot-h, 96px) + 12px);
  z-index: 2;
  width: 3px;
  border-radius: 2px;
  background: var(--hairline);
  pointer-events: none;
}

.size-life-rail[hidden] { display: none; }

.size-life-rail__thumb {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: inherit;
  background: var(--accent);
}

/* "hidden" is an HTML property, not an SVG one — these layers are toggled by
   attribute, so the rule has to be explicit. */
.size-figure[hidden] { display: none; }

/* The bottom of the stage is a scrim carrying everything the picture needs:
   the numbers, the life-size control, and the scrubber itself. Overlaying them
   instead of stacking them below gives the baby roughly a hundred more pixels
   — on the one screen where pixels are the product. The figure fades into the
   band rather than being sliced by it, and the stage measurement reserves all
   but the topmost, purely-gradient strip. */
.size-stage__foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 22px 0 4px;
  background: linear-gradient(
    to top,
    var(--card) 82%,
    color-mix(in srgb, var(--card) 0%, transparent)
  );
  pointer-events: none;
}

/* The scrim swallows pointer events so a drag on the picture is a drag on the
   picture; the two controls inside it opt back in. */
.size-stage__foot .size-scrub {
  pointer-events: auto;
  padding: 0 var(--gutter);
}

/* Aligned to the app gutter, like the header, the scrubber and every card —
   the old 12 px inset hung the chips outside the column. */
.size-stage__bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 0 var(--gutter) 2px;
}

/* Length, basis, weight and the fruit, above the fold, on every week. */
.size-line {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.size-line__sub {
  display: block;
  margin-top: 1px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--ink-soft);
}

.size-chip {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.3;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--hairline);
  /* Opaque: a chip the silhouette shows through is a chip nobody can read. */
  background: var(--accent-soft);
  color: var(--ink-soft);
  white-space: nowrap;
}

.size-chip[hidden] { display: none; }

.size-chip--action {
  position: relative;
  margin-left: auto;
  flex: none;
  pointer-events: auto;
  cursor: pointer;
  font-family: inherit;
  color: var(--accent-ink);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
  min-height: 26px;
  padding: 5px 13px;
  /* A resting transition, or the press animates in and snaps back out. */
  transition: transform var(--dur) var(--ease);
}

/* The pill stays light; the hit box is 44 pt regardless, which is the iOS
   rule — a target you can hit without a chip you have to look at. */
.size-chip--action::after {
  content: '';
  position: absolute;
  inset: -9px -8px;
}

.size-chip--action:active { transform: scale(0.97); transition-duration: 60ms; }

/* The .card rule sets display:flex, which outranks the UA [hidden] rule. */
.size-note[hidden] { display: none; }

/* A closing rule, then two lines that are ranked rather than stacked. */
.size-foot {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--hairline);
}

.size-foot .disclaimer:last-child { font-size: 12px; opacity: 0.8; }
`;

/**
 * Ensure the Size stylesheet is present exactly once. Safe to call on every
 * render, and a no-op outside a browser.
 * @returns {void}
 */
export function ensureSizeStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SIZE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SIZE_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/**
 * Render the Size screen.
 * @param {ScreenContext} ctx
 * @returns {HTMLElement}
 */
export function render(ctx) {
  ensureSizeStyles();

  const settings = ctx.settings;
  const currentWeek = currentWeekFor(settings);
  const dueForSession = settings.dueDateISO ?? null;

  /* A scrubbed week only survives while the due date it was chosen under does. */
  if (session && session.forDue !== dueForSession) session = null;

  /* Precedence: what the user scrubbed to > `?week=` > where they actually are. */
  const startWeek = contentWeekFor(session?.week ?? ctx.initialWeek ?? currentWeek);

  /** @type {{ week: number, previousWeek: number|null, lifeSize: boolean }} */
  const state = { week: startWeek, previousWeek: null, lifeSize: false };

  /* --- Header ------------------------------------------------------------ */

  /* The trimester rides on the title's own line: a separate eyebrow and a
     separate meta paragraph cost three rows of type above the picture. */
  const titleSub = el('span', { class: 'size-title__sub' }, '');
  const title = el('h1', { class: 'size-title' }, `Week ${startWeek}`, ' ', titleSub);

  const backBtn = /** @type {HTMLElement} */ (
    el(
      'button',
      {
        class: 'pill size-back',
        type: 'button',
        hidden: true,
        onClick: () => setWeek(currentWeek)
      },
      `Back to week ${currentWeek}`
    )
  );

  const header = el(
    'header',
    { class: 'screen-head' },
    el('div', {}, title),
    backBtn
  );

  /* --- Honesty badge ----------------------------------------------------- */

  /* Only a calibration that landed *inside* the slider earns the badge. A value
     sitting on an endpoint means the user ran out of slider before the outline
     matched their card, so the render is still a guess and must not claim
     otherwise — the honest hedge is the whole point of the badge. */
  const calibrated = isTrustedCalibration(settings);

  /* A button, because until this device is calibrated the badge is also the
     invitation to calibrate — one always-visible element in place of a badge
     plus a row that was never once seen above the fold. */
  const fitBadge = /** @type {HTMLElement} */ (
    calibrated
      ? el('p', { class: 'badge size-fit', 'aria-live': 'polite' })
      : el('button', {
          class: 'badge size-fit',
          type: 'button',
          'aria-live': 'polite',
          onClick: () => openCalibration(ctx)
        })
  );
  const fitBar = el('div', { class: 'size-stage__top' }, fitBadge);

  /* --- Stage ------------------------------------------------------------- */

  const ghostFigure = svgFigure('size-figure--ghost');
  const nowFigure = svgFigure('size-figure--now');

  /* The ghost draws *after* the fill, so last week reads as a dashed ring
     sitting inside this week rather than as a second baby standing beside it. */
  const headMark = el('span', { class: 'size-life-mark size-life-mark--head', hidden: true }, 'head');
  const footMark = el('span', { class: 'size-life-mark size-life-mark--foot', hidden: true }, '');
  const railThumb = el('span', { class: 'size-life-rail__thumb' });
  const rail = /** @type {HTMLElement} */ (
    el('div', { class: 'size-life-rail', hidden: true, 'aria-hidden': 'true' }, railThumb)
  );
  const canvas = el('div', { class: 'size-canvas' }, nowFigure.svg, ghostFigure.svg);
  const scroller = /** @type {HTMLElement} */ (el('div', { class: 'size-scroller' }, canvas));

  /* One line carrying what the screen is actually about: how long, measured
     which way, how heavy — and the fruit, warmly, on the line below. */
  const statLine = el('p', { class: 'size-line' }, '');
  const compareLine = el('span', { class: 'size-line__sub' }, '');
  statLine.append(compareLine);

  const lifeBtn = /** @type {HTMLElement} */ (
    el(
      'button',
      {
        class: 'size-chip size-chip--action',
        type: 'button',
        hidden: true,
        onClick: () => {
          state.lifeSize = !state.lifeSize;
          relayout();
          if (state.lifeSize) revealScroll();
        }
      },
      'Life-size'
    )
  );

  const bar = /** @type {HTMLElement} */ (
    el('div', { class: 'size-stage__bar' }, statLine, lifeBtn)
  );

  /* --- Scrubber ---------------------------------------------------------- */

  const scrub = scrubber({
    week: startWeek,
    min: MIN_CONTENT_WEEK,
    max: MAX_CONTENT_WEEK,
    hint: hintFor(ghostWeekFor(startWeek)),
    onChange: (week) => setWeek(week, true)
  });

  /* The scrubber rides the stage's bottom scrim instead of costing a hundred
     pixels of its own row beneath it. */
  const foot = /** @type {HTMLElement} */ (
    el('div', { class: 'size-stage__foot' }, bar, scrub)
  );

  const stage = /** @type {HTMLElement} */ (
    el('section', { class: 'stage size-stage' }, fitBar, scroller, foot, headMark, footMark, rail)
  );

  /* The figure follows the thumb exactly while a drag is live. */
  scrub.addEventListener('scrub-start', () => {
    stage.classList.add('size-stage--scrubbing');
  });
  scrub.addEventListener('scrub-end', () => {
    stage.classList.remove('size-stage--scrubbing');
  });

  /* --- The week 19 → 20 note --------------------------------------------- */

  const noteCard = /** @type {HTMLElement} */ (
    card({ class: 'card--accent size-note' }, el('p', { class: 'small' }, BASIS_SWITCH_NOTE))
  );
  noteCard.hidden = true;

  /* --- Footer ------------------------------------------------------------ */

  const footer = el(
    'footer',
    { class: 'size-foot' },
    el('p', { class: 'disclaimer' }, SIZE_AVERAGES_NOTE),
    disclaimer()
  );

  const screen = /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'screen size-screen' },
      header,
      stage,
      /* Directly under the stage, and so still within reach: the one week this
         note appears is the week the numbers jump, and an unseen explanation
         explains nothing. */
      noteCard,
      footer
    )
  );

  /* --- Measurement ------------------------------------------------------- */

  /**
   * The box the baby may occupy.
   *
   * Measured, never assumed: the visual viewport, less the app's own padding,
   * less the one line of chrome that shares the first screenful with the stage
   * (the header), less the stage's own frame, less the tab bar as it actually
   * renders — safe-area padding and all. Everything below the stage (the ruler
   * note, the footer) is allowed to fall below the fold, because the picture is
   * what the screen is for.
   * @returns {{ availH: number, availW: number, frameY: number }} CSS pixels.
   */
  function measureAvailable() {
    const view = window.visualViewport;
    const viewportH = (view && view.height) || window.innerHeight || 0;
    if (!viewportH || !screen.isConnected) {
      return { availH: MIN_AVAILABLE_PX, availW: MIN_AVAILABLE_PX, frameY: 0 };
    }

    const main = screen.parentElement;
    const mainStyle = main ? getComputedStyle(main) : null;
    const padTop = mainStyle ? num(mainStyle.paddingTop) : 0;
    const padBottom = mainStyle ? num(mainStyle.paddingBottom) : 0;
    /* The tab bar carries its own safe-area padding, so its rendered height is
       the honest reserve; `.app-main`'s padding is the fallback if it's gone.
       Nothing is added on top of it: the stage's own scrim already separates
       the picture from the bar. */
    const tabbar = document.querySelector('.tabbar');
    const tabH = tabbar ? tabbar.getBoundingClientRect().height : 0;
    const bottomReserve = tabH > 0 ? tabH : padBottom;

    const screenStyle = getComputedStyle(screen);
    const gap = num(screenStyle.rowGap);

    let chrome = 0;
    let count = 0;
    for (const child of Array.from(screen.children)) {
      if (/** @type {HTMLElement} */ (child).hidden) continue;
      count += 1;
      if (child === stage) break;
      chrome += child.getBoundingClientRect().height;
    }
    chrome += gap * Math.max(0, count - 1);

    const stageStyle = getComputedStyle(stage);
    const stagePadY = num(stageStyle.paddingTop) + num(stageStyle.paddingBottom);
    const stagePadX = num(stageStyle.paddingLeft) + num(stageStyle.paddingRight);
    const stageBorderY = num(stageStyle.borderTopWidth) + num(stageStyle.borderBottomWidth);
    /* The badge band on top is frame. The bottom overlay is mostly frame too —
       but its top strip is pure gradient, and a foot that reaches into it
       dissolves rather than being cut, so only the opaque part is reserved. */
    const footH = foot.getBoundingClientRect().height;
    const topH = fitBar.getBoundingClientRect().height;
    const frame =
      stagePadY + stageBorderY + topH + Math.max(0, footH - FOOT_BLEED_PX);

    const availH = Math.max(
      MIN_AVAILABLE_PX,
      viewportH - padTop - bottomReserve - chrome - frame
    );
    const availW = Math.max(MIN_AVAILABLE_PX, stage.clientWidth - stagePadX);
    stage.style.setProperty('--foot-h', `${Math.round(footH)}px`);
    return { availH, availW, frameY: frame };
  }

  /* --- Painting ---------------------------------------------------------- */

  /**
   * What one layer of the stage needs to draw a week: the art, the true-size
   * factor for its own measurement basis, and the box that implies.
   * @param {number} week
   * @returns {{ sil: Silhouette, k: number, bodyH: number, width: number }|null}
   */
  function layerFor(week) {
    const row = SIZE_TABLE[week];
    const sil = silhouetteForWeek(week);
    if (!row || !sil) return null;
    /* Nullish-only fallback: `pxPerMm: 0` is a corrupt value, not a "use the
       default" signal, and `effectivePxPerMm` rejects it rather than trusting
       it — while a genuinely calibrated 5.87 is used exactly as stored. */
    const pxPerMm = effectivePxPerMm(ctx.settings.pxPerMm);
    const k = silhouetteScale(sil, row.basis, row.lengthMm, pxPerMm);
    if (!(k > 0)) return null;
    return {
      sil,
      k,
      bodyH: (sil.viewBox.h - sil.crownY) * k,
      width: sil.viewBox.w * k
    };
  }

  /** @type {{ sil: Silhouette, k: number, bodyH: number, width: number }|null} */
  let nowLayer = null;
  /** @type {{ sil: Silhouette, k: number, bodyH: number, width: number }|null} */
  let ghostLayer = null;
  /** @type {number|null} The earlier week the nested shape is showing. */
  let ghostWeek = null;

  /**
   * Fill in everything that depends on the week but not on the viewport.
   * @returns {void}
   */
  function paint() {
    const settingsNow = ctx.settings;
    const week = state.week;
    const row = SIZE_TABLE[week];
    const units = settingsNow.units;
    const nickname = (settingsNow.nickname ?? '').trim();

    title.firstChild.nodeValue = `Week ${week}`;
    const trimester = trimesterOf(week);
    titleSub.textContent =
      week === currentWeek
        ? `· ${trimesterLabel(trimester)} · this week`
        : `· ${trimesterLabel(trimester)}`;
    backBtn.hidden = week === currentWeek;

    if (!row) return;

    /* The line under the picture — always straight from SIZE_TABLE, so the
       screen is complete even when a week's authored prose hasn't landed. */
    const fruit =
      withArticle(row.comparison.name) +
      (row.comparison.emoji ? ` ${row.comparison.emoji}` : '');
    statLine.firstChild.nodeValue =
      `${formatLength(row.lengthMm, units)} ${basisLabel(row.basis)} · ` +
      `${formatWeight(row.weightG, units)} · ${fruit}`;
    /* The Size tab is the screen a grandparent gets shown — it should know the
       baby's name too. That sentence earns a second line; without a nickname
       the fruit is already on the first one, and the line is not repeated. */
    compareLine.textContent = nickname
      ? `${nickname} is about the size of ${fruit}`
      : '';
    compareLine.hidden = !nickname;

    footMark.textContent = row.basis === 'crown-heel' ? 'heel' : 'bottom';

    /* The change of ruler at week 20 needs explaining exactly when it bites:
       on week 20 itself, and on any jump that crosses the boundary. */
    const crossed =
      state.previousWeek !== null &&
      state.previousWeek < BASIS_SWITCH_WEEK &&
      week >= BASIS_SWITCH_WEEK;
    noteCard.hidden = !(week === BASIS_SWITCH_WEEK || crossed);

    nowLayer = layerFor(week);
    /* The ghost is a growth comparison, so it is only drawn when it compares
       something: same stage art, same ruler, and visibly smaller. Week over
       week that stops being true after about week 24 (w39 → w40 is one per
       cent), so the screen walks back to the nearest week that qualifies and
       the caption names it. When nothing qualifies there is no ghost and no
       clause — that silence is the treatment, not an omission. */
    ghostWeek = ghostWeekFor(week);
    ghostLayer = ghostWeek === null ? null : layerFor(ghostWeek);

    scrub.setHint(hintFor(ghostWeek));

    if (nowLayer) nowFigure.draw(nowLayer.sil);
    nowFigure.show(Boolean(nowLayer));

    if (ghostLayer) ghostFigure.draw(ghostLayer.sil);

    relayout();
  }

  /**
   * Apply the fit: one uniform factor for both layers, so the ghost stays a
   * true comparison, and the badge that tells the user what they're looking at.
   * @returns {void}
   */
  function relayout() {
    /* Off-document (the first paint happens before main.js mounts us) there is
       nothing honest to measure, so wait rather than guess. */
    if (!nowLayer || !screen.isConnected) return;
    const { availH, availW, frameY } = measureAvailable();

    /* The percentage on the badge is a promise about the baby, so the fit is
       measured against the baby alone — and the ghost, nested inside it, asks
       for no elbow room at all. */
    const fit = Math.min(
      fitScale(nowLayer.bodyH, availH),
      fitScale(nowLayer.width, availW)
    );
    const outgrown = fit < 1;
    const life = state.lifeSize && outgrown;
    const applied = life ? 1 : fit;
    const pct = scalePercent(fit);
    const contentH = nowLayer.bodyH * applied;

    place(nowFigure, nowLayer, applied, 0);
    /* Both layers share the crown anchor and one uniform factor, so last week
       lands strictly inside this week: a tree ring, not a double exposure. */
    if (ghostLayer) place(ghostFigure, ghostLayer, applied, 0);
    ghostFigure.show(Boolean(ghostLayer) && !life);

    /* Once the baby has outgrown the screen the frame is pinned to the room
       available, so the picture never marches up and down under the user's
       thumb. While it still fits — weeks 4 to about 15 — the frame hugs the
       figure instead, with a floor, so week 8 is a small baby in a small stage
       rather than 96 px of silhouette adrift in 500 px of nothing. */
    const stageH = outgrown
      ? availH
      : Math.min(availH, Math.max(MIN_HUG_PX, contentH + 96));

    stage.style.height = `${Math.round(stageH + frameY)}px`;
    canvas.style.height = `${Math.round(contentH)}px`;
    canvas.style.width = life
      ? `${Math.max(Math.round(nowLayer.width * applied), Math.round(availW))}px`
      : '100%';

    /* A soft halo behind the smallest weeks: matting, not emptiness. */
    const small = !life && contentH < stageH * 0.45;
    canvas.classList.toggle('size-canvas--small', small);
    if (small) canvas.style.setProperty('--halo', `${Math.round(contentH)}px`);

    stage.classList.toggle('size-stage--life', life);
    scroller.style.height = `${Math.round(stageH)}px`;

    /* In life-size there is no ghost to point at. */
    scrub.setHint(hintFor(life ? null : ghostWeek));

    headMark.hidden = !life;
    footMark.hidden = !life;
    rail.hidden = !life;
    if (life) paintRail();

    lifeBtn.hidden = !outgrown;
    lifeBtn.textContent = life ? 'Fit to screen' : 'Life-size';
    lifeBtn.setAttribute('aria-pressed', String(life));

    const nickname = (ctx.settings.nickname ?? '').trim();
    const trueSize = nickname ? `${nickname}, actual size` : 'Actual size';
    const toHeel = footMark.textContent === 'heel' ? 'head to heel' : 'head to bottom';

    /* Outgrowing the screen is one of the few genuine milestones this app can
       mark, so the week it happens says so. */
    const justOutgrew =
      outgrown &&
      state.previousWeek !== null &&
      state.previousWeek < state.week &&
      fitsAt(state.previousWeek, availH, availW);

    if (!outgrown) {
      if (calibrated) {
        /* The reward for calibrating belongs here, on the badge the user came
           for — not on a grey line below the fold. */
        setBadge('true', `${trueSize} ✓ calibrated`);
      } else {
        /* Uncalibrated, the render is a good guess, not a promise — and the
           badge is where the promise is offered. */
        setBadge('true', [CALIBRATE_LEAD, calibrateWord()]);
      }
    } else if (life) {
      setBadge('true', `Actual size — scroll ${toHeel}`);
    } else if (justOutgrew) {
      setBadge('true', `Week ${state.week} — your baby just outgrew the screen 🎉`);
    } else if (calibrated) {
      setBadge('scaled', [
        'Shown at ',
        el('span', { class: 'size-fit__pct' }, `${pct}%`),
        ' — your baby outgrew the screen 🎉'
      ]);
    } else {
      setBadge('scaled', [
        'Shown at ',
        el('span', { class: 'size-fit__pct' }, `${pct}%`),
        ' · ',
        calibrateWord()
      ]);
    }

    nowFigure.svg.setAttribute(
      'aria-label',
      `Silhouette of your baby at week ${state.week}, ` +
        (life || !outgrown ? 'drawn at actual size' : `drawn at ${pct}% of actual size`)
    );

    canvas.classList.add('size-canvas--ready');
  }

  /**
   * The tappable half of the badge while this device is uncalibrated.
   * @returns {HTMLElement}
   */
  function calibrateWord() {
    return /** @type {HTMLElement} */ (
      el(
        'span',
        { class: 'size-fit__do' },
        isCalibrated(ctx.settings) ? RECALIBRATE_ACTION : CALIBRATE_ACTION
      )
    );
  }

  /**
   * Whether a week would have fitted in the box this one was measured against.
   * Used only to catch the week the baby outgrows the screen.
   * @param {number} week
   * @param {number} availH
   * @param {number} availW
   * @returns {boolean}
   */
  function fitsAt(week, availH, availW) {
    const layer = layerFor(week);
    if (!layer) return false;
    return Math.min(fitScale(layer.bodyH, availH), fitScale(layer.width, availW)) >= 1;
  }

  /**
   * Draw the life-size progress rail: where along the baby the frame is.
   * @returns {void}
   */
  function paintRail() {
    const total = scroller.scrollHeight || 1;
    const view = scroller.clientHeight || 1;
    const share = Math.max(0.08, Math.min(1, view / total));
    const at = Math.max(0, Math.min(1 - share, (scroller.scrollTop || 0) / total));
    railThumb.style.height = `${(share * 100).toFixed(1)}%`;
    railThumb.style.top = `${(at * 100).toFixed(1)}%`;
  }

  /**
   * Position one layer. The crown is pinned to the top of the canvas and used
   * as the transform origin, so scaling grows the baby downward from a fixed
   * head — smooth to watch, and correct in life-size mode where the user
   * scrolls from head to heel.
   * @param {{ svg: SVGElement }} figure
   * @param {{ sil: Silhouette, k: number }} layer
   * @param {number} applied The fit factor in force.
   * @param {number} dx Sideways nudge in final CSS pixels.
   * @returns {void}
   */
  function place(figure, layer, applied, dx) {
    const crown = layer.sil.crownY;
    const s = layer.k * applied;
    const style = /** @type {SVGElement & { style: CSSStyleDeclaration }} */ (figure.svg).style;
    style.transformOrigin = `50% ${crown}px`;
    style.transform =
      `translate(calc(-50% + ${dx.toFixed(2)}px), ${-crown}px) scale(${s})`;
  }

  /**
   * Entering life-size, nudge the scroller and let it settle: a wall of sage
   * with no visible head or heel has to declare that it scrolls, and one small
   * movement says it better than a sentence.
   * @returns {void}
   */
  function revealScroll() {
    scroller.scrollTop = 0;
    if (typeof scroller.scrollTo !== 'function') return;
    scroller.scrollTo({ top: 40, behavior: 'smooth' });
    setTimeout(() => {
      if (scroller.isConnected) scroller.scrollTo({ top: 0, behavior: 'smooth' });
    }, 320);
  }

  /**
   * The earlier week to nest inside this one, or `null` when none qualifies.
   *
   * It must be drawn by the same hand (same stage art), measured by the same
   * ruler (crown-rump and crown-heel compare nothing), and be small enough
   * that the growth rim is a shape rather than a hairline.
   * @param {number} week
   * @returns {number|null}
   */
  function ghostWeekFor(week) {
    const now = SIZE_TABLE[week];
    const sil = silhouetteForWeek(week);
    if (!now || !sil) return null;
    for (let w = week - 1; w >= Math.max(MIN_CONTENT_WEEK, sil.minWeek); w -= 1) {
      const before = SIZE_TABLE[w];
      if (!before || before.basis !== now.basis) return null;
      const art = silhouetteForWeek(w);
      if (!art || art.id !== sil.id) return null;
      if (before.lengthMm / now.lengthMm <= GHOST_MAX_RATIO) return w;
    }
    return null;
  }

  /**
   * Set the badge's tone and contents.
   * @param {'true'|'scaled'} tone
   * @param {any} content Text or nodes (see `el`).
   * @returns {void}
   */
  function setBadge(tone, content) {
    fitBadge.className = `badge size-fit size-fit--${tone}`;
    fitBadge.textContent = '';
    const parts = Array.isArray(content) ? content : [content];
    for (const part of parts) {
      fitBadge.append(typeof part === 'string' ? document.createTextNode(part) : part);
    }
  }

  /**
   * Move to another week.
   * @param {number} week
   * @param {boolean} [fromScrubber] True when the scrubber already moved.
   * @returns {void}
   */
  function setWeek(week, fromScrubber) {
    const next = contentWeekFor(week);
    if (next === state.week) return;
    state.previousWeek = state.week;
    state.week = next;
    session = { week: next, forDue: dueForSession };
    if (!fromScrubber) scrub.setWeek(next);
    paint();
  }

  /* --- Life cycle -------------------------------------------------------- */

  paint();

  /* The first honest measurement can only happen once the screen is in the
     document. A width-only ResizeObserver gives us that moment, plus every
     rotation, without ever reacting to a height we ourselves just set (which
     would be a feedback loop). */
  let lastWidth = -1;
  /** @type {ResizeObserver|null} */
  let observer = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver((entries) => {
      if (!screen.isConnected) {
        teardown();
        return;
      }
      const width = entries[0] ? entries[0].contentRect.width : 0;
      if (Math.abs(width - lastWidth) < 0.5) return;
      lastWidth = width;
      relayout();
    });
    requestAnimationFrame(() => {
      if (observer && screen.parentElement) observer.observe(screen.parentElement);
    });
  }

  /* Mobile Safari fires `resize` when the URL bar collapses, which is ~60–100
     px of visual viewport. Re-measuring on that made the baby re-scale mid
     scroll and "Shown at 65%" quietly become "Shown at 72%", so only a real
     change of viewport counts. Rotation bypasses the gate entirely. */
  let lastViewH = 0;
  const onViewportChange = () => {
    if (!screen.isConnected) {
      teardown();
      return;
    }
    const view = window.visualViewport;
    const h = (view && view.height) || window.innerHeight || 0;
    const w = window.innerWidth;
    if (w === lastWidth && Math.abs(h - lastViewH) < 140) return;
    lastViewH = h;
    relayout();
  };

  const onRotate = () => {
    if (!screen.isConnected) {
      teardown();
      return;
    }
    relayout();
  };

  const onScrollerScroll = () => {
    if (state.lifeSize) paintRail();
  };

  window.addEventListener('resize', onViewportChange);
  window.addEventListener('orientationchange', onRotate);
  scroller.addEventListener('scroll', onScrollerScroll, { passive: true });

  /**
   * Drop every listener this render created. `main.js` calls it before the
   * screen is swapped out, so a long session of settings changes cannot leave
   * a pile of stale observers hanging off `window`. Idempotent.
   * @returns {void}
   */
  function teardown() {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('orientationchange', onRotate);
    scroller.removeEventListener('scroll', onScrollerScroll);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /* Belt and braces: the frame after mount, then once more after the tab bar
     and any web fonts have settled. Both are idempotent. */
  requestAnimationFrame(relayout);
  setTimeout(relayout, 150);

  /** @type {any} */ (screen).__teardown = teardown;
  return screen;
}

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

/**
 * Build one silhouette layer: an `<svg>` sized so that one viewBox unit is one
 * CSS pixel before transforms, which lets the fit live entirely in a GPU-cheap
 * `transform: scale()` that CSS can transition.
 * @param {string} className Layer modifier class.
 * @returns {{ svg: SVGElement, draw: (sil: Silhouette) => void,
 *   show: (visible: boolean) => void }}
 */
function svgFigure(className) {
  const path = el('path', { d: '' });
  const svg = /** @type {SVGElement} */ (
    el(
      'svg',
      {
        class: `size-figure ${className}`,
        role: className.endsWith('ghost') ? null : 'img',
        'aria-hidden': className.endsWith('ghost') ? 'true' : null,
        focusable: 'false',
        preserveAspectRatio: 'xMidYMin meet'
      },
      path
    )
  );

  let drawn = '';

  return {
    svg,
    draw(sil) {
      const key = `${sil.id}:${sil.viewBox.w}x${sil.viewBox.h}`;
      if (key !== drawn) {
        drawn = key;
        svg.setAttribute('viewBox', `0 0 ${sil.viewBox.w} ${sil.viewBox.h}`);
        svg.setAttribute('width', String(sil.viewBox.w));
        svg.setAttribute('height', String(sil.viewBox.h));
        path.setAttribute('d', sil.path);
      }
    },
    show(visible) {
      if (visible) svg.removeAttribute('hidden');
      else svg.setAttribute('hidden', '');
    }
  };
}

/**
 * The week the user is actually living through, or the first content week when
 * there is no usable due date.
 * @param {Settings} settings
 * @returns {number}
 */
function currentWeekFor(settings) {
  const due = settings.dueDateISO;
  if (!due || !isValidISODate(due)) return MIN_CONTENT_WEEK;
  try {
    return pregnancyStatus(due).week;
  } catch {
    return MIN_CONTENT_WEEK;
  }
}

/**
 * Whether this device has been calibrated. Storage only ever keeps a finite
 * positive number or `null`, but the check is explicit so a hand-edited `0`
 * can never masquerade as a calibration.
 * @param {Settings} settings
 * @returns {boolean}
 */
function isCalibrated(settings) {
  const px = settings.pxPerMm;
  return typeof px === 'number' && Number.isFinite(px) && px > 0;
}

/**
 * Whether a stored calibration may claim "actual size". A value resting on a
 * slider endpoint is a stop, not a match — the outline may never have reached
 * the user's card — so it keeps the softer "approximate" wording.
 * @param {Settings} settings
 * @returns {boolean}
 */
function isTrustedCalibration(settings) {
  if (!isCalibrated(settings)) return false;
  const px = /** @type {number} */ (settings.pxPerMm);
  return px > CAL_MIN_PX_PER_MM && px < CAL_MAX_PX_PER_MM;
}

/**
 * The scrubber's one-line hint. It only names the nested shape on the weeks
 * where one is actually drawn — the app must never point at something that
 * isn't on screen.
 * @param {number|null} ghostWeek The week drawn inside this one, if any.
 * @returns {string}
 */
function hintFor(ghostWeek) {
  return ghostWeek === null
    ? 'Drag to sweep the weeks and watch your baby grow.'
    : `Drag to sweep the weeks — the paler shape inside is week ${ghostWeek}.`;
}

/**
 * "a pear", "an avocado", "a head of lettuce".
 * @param {string} name Comparison name from `SIZE_TABLE`.
 * @returns {string}
 */
function withArticle(name) {
  return `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;
}

/**
 * Parse a computed-style length, treating anything unusable as zero.
 * @param {string} value
 * @returns {number}
 */
function num(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
