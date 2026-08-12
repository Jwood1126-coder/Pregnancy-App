/**
 * A small horizontal-swipe gesture, used to browse weeks on Today.
 *
 * Vertical scrolling always wins: the gesture only commits once the horizontal
 * travel clearly dominates, and nothing is ever `preventDefault`ed on move, so
 * the page scrolls exactly as it would without this. Listeners are attached to
 * the screen element itself, so they disappear with it — no globals to leak.
 */

/**
 * @typedef {Object} SwipeOptions
 * @property {(direction: 1|-1) => void} onSwipe Called with `1` for a swipe
 *   left (→ next week) and `-1` for a swipe right (→ previous week).
 * @property {number} [threshold] Minimum horizontal travel in px (default 48).
 */

/** Travel before we decide whether a gesture is horizontal or vertical. */
const DECIDE_AT = 10;

/** How much more horizontal than vertical a gesture must be to count. */
const DOMINANCE = 1.4;

/**
 * Attach the swipe gesture to an element.
 * @param {HTMLElement} node Element to watch (the whole screen, typically).
 * @param {SwipeOptions} options Gesture options.
 * @returns {void}
 */
export function attachSwipe(node, options) {
  const threshold = options.threshold ?? 48;

  let active = false;
  let decided = false;
  let horizontal = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;

  /**
   * Begin tracking a gesture.
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  function begin(x, y) {
    active = true;
    decided = false;
    horizontal = false;
    startX = x;
    startY = y;
    lastX = x;
  }

  /**
   * Track movement and decide the gesture's axis once it has travelled enough.
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  function move(x, y) {
    if (!active) return;
    lastX = x;
    if (decided) return;
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) < DECIDE_AT && Math.abs(dy) < DECIDE_AT) return;
    decided = true;
    horizontal = Math.abs(dx) > Math.abs(dy) * DOMINANCE;
  }

  /**
   * Finish a gesture, firing `onSwipe` when it qualifies.
   * @param {boolean} [cancelled] True for pointercancel / touchcancel.
   * @returns {void}
   */
  function end(cancelled = false) {
    if (!active) return;
    active = false;
    if (cancelled || !horizontal) return;
    const dx = lastX - startX;
    if (Math.abs(dx) < threshold) return;
    suppressNextClick(node);
    options.onSwipe(dx < 0 ? 1 : -1);
  }

  if (typeof window !== 'undefined' && 'PointerEvent' in window) {
    node.addEventListener('pointerdown', (e) => {
      const ev = /** @type {PointerEvent} */ (e);
      if (!ev.isPrimary) return;
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      begin(ev.clientX, ev.clientY);
    });
    node.addEventListener('pointermove', (e) => {
      const ev = /** @type {PointerEvent} */ (e);
      move(ev.clientX, ev.clientY);
    });
    node.addEventListener('pointerup', () => end());
    node.addEventListener('pointercancel', () => end(true));
    return;
  }

  node.addEventListener('touchstart', (e) => {
    const t = /** @type {TouchEvent} */ (e).touches[0];
    if (t) begin(t.clientX, t.clientY);
  }, { passive: true });
  node.addEventListener('touchmove', (e) => {
    const t = /** @type {TouchEvent} */ (e).touches[0];
    if (t) move(t.clientX, t.clientY);
  }, { passive: true });
  node.addEventListener('touchend', () => end(), { passive: true });
  node.addEventListener('touchcancel', () => end(true), { passive: true });
}

/**
 * Swallow the click a finished drag would otherwise deliver to whatever sat
 * under the finger (a to-do checkbox, the size card).
 * @param {HTMLElement} node
 * @returns {void}
 */
function suppressNextClick(node) {
  /** @param {Event} e */
  const swallow = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  node.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => node.removeEventListener('click', swallow, true), 200);
}
