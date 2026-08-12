/**
 * Drag-to-dismiss for the app's two sheets.
 *
 * Both sheets render `.sheet__grabber` — the platform's universal "drag me
 * down to close" handle — and neither responded to a drag, which makes it a
 * false affordance: swipe-down is how an iPhone user closes a sheet, long
 * before they look for a Done button.
 *
 * The gesture is deliberately narrow: it starts on the grabber or the sheet's
 * header (never on a control inside it, and never on the scrollable body), it
 * only ever moves the sheet downward, and it hands back to CSS the moment the
 * finger lifts.
 */

/** How far down the sheet must travel before release dismisses it. */
const DISMISS_FRACTION = 0.25;

/** …or how fast it has to be moving, in CSS px per millisecond. */
const DISMISS_VELOCITY = 0.5;

/** How far the drag has to reach before the backdrop is fully clear. */
const FADE_DISTANCE = 400;

/**
 * Make a sheet dismissable by dragging its grabber or header downward.
 * @param {HTMLElement} sheet The `.sheet` element.
 * @param {HTMLElement|null} backdrop The dimmed page behind it, if any.
 * @param {() => void} close Called when the drag asks for a dismissal.
 * @returns {() => void} Detach the listeners (idempotent).
 */
export function attachSheetDrag(sheet, backdrop, close) {
  /** @type {number|null} */
  let pointerId = null;
  let startY = 0;
  let startedAt = 0;
  let dy = 0;

  /**
   * Whether a press at this target should start a drag: the grabber always,
   * the header only where it is not a control.
   * @param {EventTarget|null} target
   * @returns {boolean}
   */
  function isHandle(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('button, a, input, select, textarea, label')) return false;
    return Boolean(target.closest('.sheet__grabber, .sheet__head'));
  }

  /**
   * Paint the current drag offset.
   * @returns {void}
   */
  function paint() {
    sheet.style.transform = `translateY(${dy.toFixed(1)}px)`;
    if (backdrop) {
      backdrop.style.opacity = String(1 - Math.min(dy / FADE_DISTANCE, 1));
    }
  }

  /**
   * Hand the sheet back to CSS.
   * @returns {void}
   */
  function settle() {
    sheet.classList.remove('sheet--dragging');
    sheet.style.transform = '';
    if (backdrop) backdrop.style.opacity = '';
  }

  /** @param {PointerEvent} event @returns {void} */
  function onDown(event) {
    if (pointerId !== null || event.button > 0 || !isHandle(event.target)) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    startedAt = event.timeStamp;
    dy = 0;
    sheet.classList.add('sheet--dragging');
    try {
      sheet.setPointerCapture(event.pointerId);
    } catch {
      /* Older engines without pointer capture still get the window listeners. */
    }
  }

  /** @param {PointerEvent} event @returns {void} */
  function onMove(event) {
    if (event.pointerId !== pointerId) return;
    const raw = event.clientY - startY;
    /* Upward is resisted rather than followed: a sheet does not fly off the
       top of the screen. */
    dy = raw > 0 ? raw : raw * 0.2;
    if (dy < 0) dy = 0;
    if (event.cancelable) event.preventDefault();
    paint();
  }

  /** @param {PointerEvent} event @returns {void} */
  function onUp(event) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    const elapsed = Math.max(1, event.timeStamp - startedAt);
    const velocity = dy / elapsed;
    const height = sheet.getBoundingClientRect().height || 1;
    const dismiss = dy > height * DISMISS_FRACTION || velocity > DISMISS_VELOCITY;
    settle();
    if (dismiss) close();
  }

  /** @param {PointerEvent} event @returns {void} */
  function onCancel(event) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    settle();
  }

  sheet.addEventListener('pointerdown', onDown);
  sheet.addEventListener('pointermove', onMove);
  sheet.addEventListener('pointerup', onUp);
  sheet.addEventListener('pointercancel', onCancel);

  return () => {
    sheet.removeEventListener('pointerdown', onDown);
    sheet.removeEventListener('pointermove', onMove);
    sheet.removeEventListener('pointerup', onUp);
    sheet.removeEventListener('pointercancel', onCancel);
    if (pointerId !== null) {
      pointerId = null;
      settle();
    }
  };
}
