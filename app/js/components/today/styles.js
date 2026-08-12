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

.today-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
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
  min-height: 40px;
  padding: 0 2px;
}

.today-nav__spacer { flex: 1 1 auto; }

.today-nav__btn { color: var(--ink-soft); }
.today-nav__btn[disabled] { opacity: 0.32; }

.today-back {
  border: 0;
  cursor: pointer;
  min-height: 34px;
  padding: 6px 14px 6px 10px;
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

.today-size__emoji {
  font-size: 40px;
  line-height: 1;
  flex: none;
}

.today-size__text { min-width: 0; flex: 1 1 auto; }

.today-size__head {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.32;
  letter-spacing: -0.015em;
  text-wrap: pretty;
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

.today-why {
  font-size: 16px;
  line-height: 1.5;
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
  font-size: 16px;
  line-height: 1.45;
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
  color: var(--accent);
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

.today-callout__icon { flex: none; color: var(--accent); margin-top: 2px; }

.today-callout__label {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent);
}

.today-callout__text { font-size: 15px; line-height: 1.5; text-wrap: pretty; }

/* --- To-dos ------------------------------------------------------------- */

.today-todos { display: flex; flex-direction: column; }

.today-todo {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 12px 0;
  cursor: pointer;
}

.today-todo + .today-todo { border-top: 1px solid var(--hairline); }

.today-todo__box {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--accent);
}

.today-todo__label {
  font-size: 16px;
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

.today-flags a {
  color: var(--danger);
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
}

/* --- Edge-state cards --------------------------------------------------- */

.today-mark {
  font-size: 30px;
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
