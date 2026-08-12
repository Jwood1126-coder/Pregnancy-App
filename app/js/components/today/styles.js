/**
 * Today-screen styles, injected once on first render.
 *
 * `app/css/app.css` is owned by the foundation agent; this agent owns only
 * `screens/today.js` and `components/today/*`. Rather than edit a file it does
 * not own, Today ships its handful of extra rules as a scoped stylesheet built
 * **entirely from the design tokens** already defined in app.css — no new
 * colours, no new fonts, no hard-coded palette. Every selector is prefixed
 * `today-` so nothing can collide with the shared system.
 */

/** Id of the injected `<style>` element. */
export const STYLE_ID = 'today-styles';

const CSS = `
/* --- Header ------------------------------------------------------------- */

/* The same eyebrow as .section-title, differing only in colour — accent for
   a browsing or edge state, ink-soft for an ordinary heading. Two nearly
   identical eyebrow styles set the same word differently for no reason a
   reader could infer. */
.today-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent-ink);
  margin-bottom: 3px;
}

/* Horizontal drags belong to the week browser; vertical scrolling and
   pinch-to-zoom stay with the browser, so nothing about reading gets worse. */
.today-screen { touch-action: pan-y pinch-zoom; }

/* --- Week browsing ------------------------------------------------------ */

.today-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 2px;
}

/* The row used to be two chevrons and 250 px of nothing. The nothing is now
   the journey: a silent sage track that fills as the weeks go by, so the one
   thing a parent wants at a glance finally has a visual form. */
.today-nav__spacer {
  flex: 1 1 auto;
  align-self: center;
  height: 4px;
  margin-right: 10px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  overflow: hidden;
}

.today-nav__progress {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width var(--dur) var(--ease);
}

.today-nav__btn { color: var(--ink-soft); }

/* Fade the symbol, not the chip: dropping the fill and the shadow together
   left a pale smudge on the warm ground that read as a rendering artifact
   rather than as a disabled control. */
.today-nav__btn[disabled] {
  color: color-mix(in srgb, var(--ink-soft) 35%, transparent);
  box-shadow: none;
  background: color-mix(in srgb, var(--card) 55%, transparent);
}

/* While browsing, the pill owns the left of the row and the chevrons the
   right — there is no progress track between them to squeeze. */
.today-back {
  margin-right: auto;
  border: 0;
  cursor: pointer;
  min-height: 44px;
  padding: 10px 14px 10px 10px;
  font-family: inherit;
  animation: today-fade-in var(--dur) var(--ease) both;
}

.today-back svg { flex: none; }

@keyframes today-fade-in {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: none; }
}

/* --- Week content column (the swipeable stack) -------------------------- */

.today-week {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.today-week--next { animation: today-in-next var(--dur) var(--ease) both; }
.today-week--prev { animation: today-in-prev var(--dur) var(--ease) both; }

@keyframes today-in-next {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: none; }
}

@keyframes today-in-prev {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: none; }
}

/* --- Size headline card ------------------------------------------------- */

.today-size {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* The slot is always rendered, even when a week's comparison carries no
   emoji — otherwise the headline jumps 56 px left on one week in four and the
   card visibly lurches as you swipe. */
.today-size__emoji {
  font-size: 40px;
  line-height: 1;
  flex: none;
  width: 40px;
  text-align: center;
}

.today-size__emoji svg { display: block; margin: 0 auto; }

.today-size__text { min-width: 0; flex: 1 1 auto; }

.today-size__head {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.32;
  letter-spacing: -0.015em;
  /* text-wrap: pretty optimises the last line's length and happily strands the
     article ("… the size of a / watermelon"); balance splits the lines evenly. */
  text-wrap: balance;
}

.today-size__meta {
  margin-top: 3px;
  font-size: 15px;
  color: var(--ink-soft);
}

.today-size__basis {
  margin-top: 1px;
  font-size: 13px;
  color: var(--ink-soft);
  opacity: 0.85;
}

.today-size__go { flex: none; color: var(--ink-soft); opacity: 0.6; }

/* --- Nutrition ---------------------------------------------------------- */

.today-focus {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

/* Caption weight: the "why" supports the list, so it must not outweigh it. */
.today-why {
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink-soft);
  text-wrap: pretty;
}

.today-eat {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-eat__item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  font-size: 17px;
  line-height: 1.5;
}

.today-eat__dot {
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 9px;
  border-radius: 50%;
  background: var(--accent);
}

.today-eat__chip {
  display: inline-block;
  margin-left: 7px;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
  vertical-align: 1px;
}

/* --- Gentle callout (food safety) --------------------------------------- */

.today-callout {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 6px;
  padding: 13px 15px;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
}

.today-callout__icon { flex: none; color: var(--accent-ink); margin-top: 2px; }

.today-callout__label {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent-ink);
}

.today-callout__text { font-size: 15px; line-height: 1.5; text-wrap: pretty; }

/* --- To-dos ------------------------------------------------------------- */

.today-todos { display: flex; flex-direction: column; }

/* An iOS row: the press highlight bleeds to the card's inner edge, so the
   whole row is visibly the thing you are touching. With the global
   webkit-tap-highlight-color of transparent, tapping a to-do used to give
   literally no feedback until the box flipped. */
.today-todo {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin: 0 -20px;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color var(--dur) var(--ease);
}

.today-todo:active { background: var(--press); transition-duration: 60ms; }

/* The divider is inset to the label, so it still starts where the text does
   even though the row now runs to the card's edge. */
.today-todo + .today-todo::before {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  top: 0;
  border-top: 1px solid var(--hairline);
}

/* The platform's own circle-check, drawn rather than borrowed: the UA checkbox
   is a square control in a rounded, hand-made screen. */
.today-todo__box {
  appearance: none;
  -webkit-appearance: none;
  flex: none;
  width: 24px;
  height: 24px;
  margin: 1px 0 0;
  border: 1.8px solid var(--hairline-strong);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms var(--ease), border-color 150ms var(--ease);
}

.today-todo__box:checked {
  border-color: var(--accent);
  background: var(--accent) no-repeat center/13px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8.5 6.5 12 13 4.5'/%3E%3C/svg%3E");
}

.today-todo__label {
  font-size: 17px;
  line-height: 1.45;
  text-wrap: pretty;
  transition: color var(--dur) var(--ease);
}

.today-todo--done .today-todo__label {
  color: var(--ink-soft);
  text-decoration: line-through;
  text-decoration-color: var(--hairline-strong);
  text-decoration-thickness: 1px;
}

/* --- When to call your provider ----------------------------------------- */

/* The shared .card__body rule sets display:flex, which outranks the user
   agent's [hidden] { display: none } — so restore it here, scoped to this
   card, and the red-flag list really is collapsed until it is asked for. */
.today-card--flags .card__body[hidden] { display: none; }

.today-flags {
  margin: 0;
  padding: 2px 0 2px 14px;
  border-left: 3px solid var(--danger);
  font-size: 15px;
  line-height: 1.6;
  text-wrap: pretty;
}

.today-flags strong { font-weight: 700; }

/* The one card that must be scannable under stress was a ten-line paragraph
   of middot-separated symptoms. Same words, one per line. */
.today-flags ul {
  list-style: none;
  margin: 8px 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.today-flags li {
  position: relative;
  padding-left: 14px;
}

.today-flags li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--danger);
}

.today-flags a {
  color: var(--danger);
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
}

/* --- Edge-state cards --------------------------------------------------- */

/* Paired with the eyebrow on one row — alone on its own 40 px line it read as
   a stray glyph rather than a designed mark. */
.today-edge__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.today-mark {
  font-size: 22px;
  line-height: 1;
}
`;

/**
 * Ensure the Today stylesheet is present in the document exactly once.
 * Safe to call on every render, and a no-op outside a browser.
 * @returns {void}
 */
export function ensureTodayStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
