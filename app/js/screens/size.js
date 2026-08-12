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

/** Invitation shown until the user has calibrated their screen. */
export const CALIBRATE_PROMPT = 'Approximate size — take 30 seconds to calibrate';

/**
 * Invitation shown when a calibration exists but sits on a slider endpoint —
 * the user may have run out of slider before the outline matched their card,
 * so the badge stays honest and the door stays open.
 */
export const RECALIBRATE_PROMPT = 'Approximate size — try the calibration again';

/** Quiet confirmation shown once they have. */
export const CALIBRATED_BADGE = 'Actual size, calibrated';

/** Smallest stage we will ever ask for, in CSS px. */
const MIN_AVAILABLE_PX = 140;

/** How much of last week's outline must stay visible beside this week's, in CSS px. */
const GHOST_SLIVER_PX = 26;

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
.size-screen { gap: 10px; }

.size-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent);
}

.size-title {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-top: 1px;
}

.size-back {
  flex: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  margin-top: 6px;
  padding: 7px 13px;
}

.size-back[hidden] { display: none; }

/* --- The honesty badge --------------------------------------------------- */

.size-fitbar {
  display: flex;
  justify-content: center;
  min-height: 28px;
  padding: 0 2px;
}

.size-fit {
  text-align: center;
  text-wrap: balance;
  line-height: 1.35;
  padding: 5px 13px;
}

.size-fit--true { background: var(--accent-soft); color: var(--accent); }

.size-fit--scaled {
  background: transparent;
  color: var(--ink-soft);
  font-weight: 500;
  padding-left: 0;
  padding-right: 0;
}

.size-fit__pct { font-weight: 700; color: var(--ink); }

/* --- The stage ----------------------------------------------------------- */

.size-stage {
  align-items: center;
  justify-content: center;
  padding: 16px 14px;
}

.size-scroller {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overscroll-behavior: contain;
}

.size-stage--life .size-scroller {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
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
  transition: transform 260ms var(--ease);
  will-change: transform;
}

.size-figure--now path { fill: var(--accent); }

.size-figure--ghost path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
  opacity: 0.32;
}

/* "hidden" is an HTML property, not an SVG one — these layers are toggled by
   attribute, so the rule has to be explicit. */
.size-figure[hidden] { display: none; }

/* Floating chips: they cost the stage no vertical room, which is the whole
   point — every pixel saved here is a pixel of real baby. */
.size-stage__bar {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.size-chip {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.3;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--hairline);
  background: color-mix(in srgb, var(--accent-soft) 88%, transparent);
  color: var(--ink-soft);
  white-space: nowrap;
}

.size-chip[hidden] { display: none; }

.size-chip--ghost {
  background: transparent;
  border-style: dashed;
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}

.size-chip--action {
  margin-left: auto;
  pointer-events: auto;
  cursor: pointer;
  font-family: inherit;
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
  min-height: 30px;
}

.size-chip--action:active { transform: scale(0.97); }

/* --- Stats --------------------------------------------------------------- */

.size-stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 4px;
}

.size-stats__line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 2px 16px;
}

.size-stat { display: flex; align-items: baseline; gap: 6px; }

.size-stat__v {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.size-stat__k { font-size: 13px; color: var(--ink-soft); }

.size-compare { font-size: 15px; color: var(--ink-soft); }

/* The .card rule sets display:flex, which outranks the UA [hidden] rule. */
.size-note[hidden] { display: none; }

/* --- Calibration entry points -------------------------------------------- */

.size-calpill {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  padding: 11px 16px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  transition: transform var(--dur) var(--ease);
}

.size-calpill:active { transform: scale(0.985); }
.size-calpill__chev { margin-left: auto; flex: none; opacity: 0.75; }

.size-calbadge {
  display: block;
  text-align: center;
  font-size: 12.5px;
  color: var(--ink-soft);
}

.size-foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
}
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

  const title = el('h1', { class: 'size-title' }, `Week ${startWeek}`);
  const meta = el('p', { class: 'screen-head__meta' }, '');

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
    el(
      'div',
      {},
      el('p', { class: 'size-eyebrow' }, 'True size'),
      title,
      meta
    ),
    backBtn
  );

  /* --- Honesty badge ----------------------------------------------------- */

  const fitBadge = el('p', { class: 'badge size-fit', 'aria-live': 'polite' }, '');
  const fitBar = el('div', { class: 'size-fitbar' }, fitBadge);

  /* --- Stage ------------------------------------------------------------- */

  const ghostFigure = svgFigure('size-figure--ghost');
  const nowFigure = svgFigure('size-figure--now');

  const canvas = el('div', { class: 'size-canvas' }, ghostFigure.svg, nowFigure.svg);
  const scroller = el('div', { class: 'size-scroller' }, canvas);

  const basisChip = el('span', { class: 'size-chip' }, '');
  /* Dashed, like the outline it names, so "week 16" needs no further caption. */
  const ghostChip = el('span', { class: 'size-chip size-chip--ghost' }, '');

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
          if (state.lifeSize) scroller.scrollTop = 0;
        }
      },
      'Life-size'
    )
  );

  const stage = /** @type {HTMLElement} */ (
    el(
      'section',
      { class: 'stage size-stage' },
      scroller,
      el('div', { class: 'size-stage__bar' }, basisChip, ghostChip, lifeBtn)
    )
  );

  /* --- Scrubber ---------------------------------------------------------- */

  const scrub = scrubber({
    week: startWeek,
    min: MIN_CONTENT_WEEK,
    max: MAX_CONTENT_WEEK,
    hint: 'Drag to sweep the weeks — the faint outline is the week before.',
    onChange: (week) => setWeek(week, true)
  });

  /* --- Stats ------------------------------------------------------------- */

  const lengthValue = el('span', { class: 'size-stat__v' }, '');
  const lengthKey = el('span', { class: 'size-stat__k' }, '');
  const weightValue = el('span', { class: 'size-stat__v' }, '');
  const compareLine = el('p', { class: 'size-compare' }, '');

  const stats = el(
    'div',
    { class: 'size-stats' },
    el(
      'div',
      { class: 'size-stats__line' },
      el('span', { class: 'size-stat' }, lengthValue, lengthKey),
      el('span', { class: 'size-stat' }, weightValue, el('span', { class: 'size-stat__k' }, 'weight'))
    ),
    compareLine
  );

  /* --- The week 19 → 20 note --------------------------------------------- */

  const noteCard = /** @type {HTMLElement} */ (
    card({ class: 'card--accent size-note' }, el('p', { class: 'small' }, BASIS_SWITCH_NOTE))
  );
  noteCard.hidden = true;

  /* --- Calibration entry points ------------------------------------------ */

  /* Only a calibration that landed *inside* the slider earns the badge. A value
     sitting on an endpoint means the user ran out of slider before the outline
     matched their card, so the render is still a guess and must not claim
     otherwise — the honest hedge is the whole point of the badge. */
  const calibrated = isTrustedCalibration(settings);

  const calPill = calibrated
    ? null
    : el(
        'button',
        {
          class: 'size-calpill',
          type: 'button',
          onClick: () => openCalibration(ctx)
        },
        isCalibrated(settings) ? RECALIBRATE_PROMPT : CALIBRATE_PROMPT,
        el(
          'svg',
          {
            class: 'size-calpill__chev',
            width: '8',
            height: '13',
            viewBox: '0 0 8 13',
            'aria-hidden': 'true'
          },
          el('path', {
            d: 'M1.5 1.5 L6.5 6.5 L1.5 11.5',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          })
        )
      );

  const calBadge = calibrated
    ? el('p', { class: 'size-calbadge' }, `✓ ${CALIBRATED_BADGE}`)
    : null;

  /* --- Footer ------------------------------------------------------------ */

  const footer = el(
    'footer',
    { class: 'size-foot' },
    calBadge,
    el('p', { class: 'disclaimer' }, SIZE_AVERAGES_NOTE),
    disclaimer()
  );

  const screen = /** @type {HTMLElement} */ (
    el(
      'div',
      { class: 'screen size-screen' },
      header,
      fitBar,
      stage,
      scrub,
      /* Above the stats, and so above the fold: the one week this note appears
         is the week the numbers jump, and an unseen explanation explains
         nothing. It costs the stage a little height on week 20 alone. */
      noteCard,
      stats,
      calPill,
      footer
    )
  );

  /* --- Measurement ------------------------------------------------------- */

  /**
   * The box the baby may occupy.
   *
   * Measured, never assumed: the visual viewport, less the app's own padding,
   * less every piece of chrome that shares the first screenful with the stage
   * (the header, the honesty badge, the scrubber, the stats line), less the tab
   * bar as it actually renders — safe-area padding and all. Everything below
   * the stats (the ruler note, the calibration pill, the footer) is allowed to
   * fall below the fold, so the picture gets the room it deserves.
   * @returns {{ availH: number, availW: number }} CSS pixels.
   */
  function measureAvailable() {
    const view = window.visualViewport;
    const viewportH = (view && view.height) || window.innerHeight || 0;
    if (!viewportH || !screen.isConnected) {
      return { availH: MIN_AVAILABLE_PX, availW: MIN_AVAILABLE_PX };
    }

    const main = screen.parentElement;
    const mainStyle = main ? getComputedStyle(main) : null;
    const padTop = mainStyle ? num(mainStyle.paddingTop) : 0;
    const padBottom = mainStyle ? num(mainStyle.paddingBottom) : 0;
    /* The tab bar carries its own safe-area padding, so its rendered height is
       the honest reserve; `.app-main`'s padding is the fallback if it's gone. */
    const tabbar = document.querySelector('.tabbar');
    const tabH = tabbar ? tabbar.getBoundingClientRect().height : 0;
    const bottomReserve = tabH > 0 ? tabH + 12 : padBottom;

    const screenStyle = getComputedStyle(screen);
    const gap = num(screenStyle.rowGap);

    let chrome = 0;
    let count = 0;
    for (const child of Array.from(screen.children)) {
      if (/** @type {HTMLElement} */ (child).hidden) continue;
      count += 1;
      if (child !== stage) chrome += child.getBoundingClientRect().height;
      if (child === stats) break;
    }
    chrome += gap * Math.max(0, count - 1);

    const stageStyle = getComputedStyle(stage);
    const stagePadY = num(stageStyle.paddingTop) + num(stageStyle.paddingBottom);
    const stagePadX = num(stageStyle.paddingLeft) + num(stageStyle.paddingRight);
    const stageBorderY = num(stageStyle.borderTopWidth) + num(stageStyle.borderBottomWidth);

    const availH = Math.max(
      MIN_AVAILABLE_PX,
      viewportH - padTop - bottomReserve - chrome - stagePadY - stageBorderY
    );
    const availW = Math.max(MIN_AVAILABLE_PX, stage.clientWidth - stagePadX);
    return { availH, availW };
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

  /**
   * Fill in everything that depends on the week but not on the viewport.
   * @returns {void}
   */
  function paint() {
    const settingsNow = ctx.settings;
    const week = state.week;
    const row = SIZE_TABLE[week];
    const units = settingsNow.units;

    title.textContent = `Week ${week}`;
    const trimester = trimesterOf(week);
    meta.textContent =
      week === currentWeek
        ? `${trimesterLabel(trimester)} · this week`
        : trimesterLabel(trimester);
    backBtn.hidden = week === currentWeek;

    if (!row) return;

    /* Stats — always straight from SIZE_TABLE, so the screen is complete even
       when a week's authored prose hasn't landed. */
    lengthValue.textContent = formatLength(row.lengthMm, units);
    lengthKey.textContent = basisLabel(row.basis);
    weightValue.textContent = formatWeight(row.weightG, units);
    compareLine.textContent =
      `About the size of ${withArticle(row.comparison.name)}` +
      (row.comparison.emoji ? ` ${row.comparison.emoji}` : '');

    basisChip.textContent = basisLabel(row.basis);

    /* The change of ruler at week 20 needs explaining exactly when it bites:
       on week 20 itself, and on any jump that crosses the boundary. */
    const crossed =
      state.previousWeek !== null &&
      state.previousWeek < BASIS_SWITCH_WEEK &&
      week >= BASIS_SWITCH_WEEK;
    noteCard.hidden = !(week === BASIS_SWITCH_WEEK || crossed);

    nowLayer = layerFor(week);
    ghostLayer = week > MIN_CONTENT_WEEK ? layerFor(week - 1) : null;

    if (nowLayer) nowFigure.draw(nowLayer.sil);
    nowFigure.show(Boolean(nowLayer));

    if (ghostLayer) ghostFigure.draw(ghostLayer.sil);
    ghostFigure.show(Boolean(ghostLayer));
    ghostChip.hidden = !ghostLayer;
    if (ghostLayer) ghostChip.textContent = `week ${week - 1}`;

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
    const { availH, availW } = measureAvailable();

    /* The percentage on the badge is a promise about the baby, so the fit is
       measured against the baby alone. The ghost only asks for a fixed sliver
       of elbow room on the left, which costs the render a few per cent at most
       and is the difference between a visible comparison and a hidden one. */
    const sliver = ghostLayer ? GHOST_SLIVER_PX : 0;
    const widthBox = Math.max(availW - sliver, availW * 0.5);
    const fit = Math.min(
      fitScale(nowLayer.bodyH, availH),
      fitScale(nowLayer.width, widthBox)
    );
    const outgrown = fit < 1;
    const life = state.lifeSize && outgrown;
    const applied = life ? 1 : fit;
    const pct = scalePercent(fit);
    const contentH = nowLayer.bodyH * applied;

    place(nowFigure, nowLayer, applied, 0);
    if (ghostLayer) {
      /* Slide the ghost left until it clears the current outline, then a little
         further, so what shows is unmistakably last week and not a stray edge. */
      const clearance = Math.max(0, nowLayer.width - ghostLayer.width) * applied;
      place(ghostFigure, ghostLayer, applied, -(clearance / 2) - sliver);
    }

    canvas.style.height = `${Math.round(contentH)}px`;
    canvas.style.width = life
      ? `${Math.max(Math.round(nowLayer.width * applied + sliver * 2), Math.round(availW))}px`
      : '100%';

    stage.classList.toggle('size-stage--life', life);
    scroller.style.maxHeight = life ? `${Math.round(availH)}px` : '';

    lifeBtn.hidden = !outgrown;
    lifeBtn.textContent = life ? 'Fit to screen' : 'Life-size';
    lifeBtn.setAttribute('aria-pressed', String(life));

    if (!outgrown) {
      setBadge('true', 'Actual size');
    } else if (life) {
      setBadge('true', 'Actual size — scroll to travel the whole length');
    } else {
      setBadge(
        'scaled',
        [
          'Shown at ',
          el('span', { class: 'size-fit__pct' }, `${pct}%`),
          ' — your baby has outgrown the screen 🎉'
        ]
      );
    }

    nowFigure.svg.setAttribute(
      'aria-label',
      `Silhouette of your baby at week ${state.week}, ` +
        (life || !outgrown ? 'drawn at actual size' : `drawn at ${pct}% of actual size`)
    );

    canvas.classList.add('size-canvas--ready');
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

  const onViewportChange = () => {
    if (!screen.isConnected) {
      teardown();
      return;
    }
    relayout();
  };
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('orientationchange', onViewportChange);

  /**
   * Drop every listener this render created. `main.js` calls it before the
   * screen is swapped out, so a long session of settings changes cannot leave
   * a pile of stale observers hanging off `window`. Idempotent.
   * @returns {void}
   */
  function teardown() {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('orientationchange', onViewportChange);
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

  /* A hairline that ignores the transform, so the ghost reads the same at
     week 5 and at week 42. */
  if (className.endsWith('ghost')) {
    path.setAttribute('vector-effect', 'non-scaling-stroke');
  }

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
