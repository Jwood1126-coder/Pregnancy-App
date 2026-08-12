/**
 * True-size math: turning millimetres of real baby into CSS pixels on glass.
 *
 * Pure module — no DOM, no storage.
 */

/**
 * Default device density: ~6 CSS px per millimetre (≈153 CSS px/inch), which is
 * close to correct for most iPhones. Refined per-device by calibration.
 */
export const DEFAULT_PX_PER_MM = 6.0;

/** ISO/IEC 7810 ID-1 card (credit card) dimensions in millimetres. */
export const CREDIT_CARD_MM = { w: 85.6, h: 53.98 };

/** Calibration guard rails — a slider outside this range is not a real screen. */
export const MIN_PX_PER_MM = 2.0;

/** @see MIN_PX_PER_MM */
export const MAX_PX_PER_MM = 20.0;

/**
 * Resolve the density to render with: the calibrated value when present,
 * otherwise the default.
 * @param {number|null|undefined} pxPerMm Stored calibration (`null` = none).
 * @returns {number} A usable px-per-mm value.
 */
export function effectivePxPerMm(pxPerMm) {
  if (typeof pxPerMm !== 'number' || !Number.isFinite(pxPerMm) || pxPerMm <= 0) {
    return DEFAULT_PX_PER_MM;
  }
  return clampPxPerMm(pxPerMm);
}

/**
 * Clamp a calibration result into a physically plausible range.
 * @param {number} pxPerMm
 * @returns {number}
 */
export function clampPxPerMm(pxPerMm) {
  return Math.min(MAX_PX_PER_MM, Math.max(MIN_PX_PER_MM, pxPerMm));
}

/**
 * How many CSS pixels the baby's measured length occupies at true size.
 * Straight `lengthMm × pxPerMm`; pass the value from {@link effectivePxPerMm}
 * if you want the uncalibrated fallback applied.
 * @param {number} lengthMm Measured length in millimetres (crown-rump or crown-heel).
 * @param {number} [pxPerMm] Device density; defaults to {@link DEFAULT_PX_PER_MM}.
 * @returns {number} Length in CSS pixels (0 for non-finite or non-positive input).
 */
export function babyPixels(lengthMm, pxPerMm = DEFAULT_PX_PER_MM) {
  if (!Number.isFinite(lengthMm) || lengthMm <= 0) return 0;
  if (!Number.isFinite(pxPerMm) || pxPerMm <= 0) return 0;
  return lengthMm * pxPerMm;
}

/**
 * The scale factor needed to fit the baby inside the available space.
 * Never magnifies: the result is at most 1 ("actual size").
 * @param {number} babyPx True-size length in CSS pixels.
 * @param {number} availPx Available space in CSS pixels.
 * @returns {number} A factor in (0, 1]; 1 when the baby already fits.
 */
export function fitScale(babyPx, availPx) {
  if (!Number.isFinite(babyPx) || babyPx <= 0) return 1;
  if (!Number.isFinite(availPx) || availPx <= 0) return 1;
  return Math.min(1, availPx / babyPx);
}

/**
 * Round a fit scale to a friendly percentage for the honesty badge
 * ("Shown at 43%").
 * @param {number} scale Factor from {@link fitScale}.
 * @returns {number} Whole percent, 1–100.
 */
export function scalePercent(scale) {
  return Math.max(1, Math.min(100, Math.round(scale * 100)));
}

/**
 * Scale factor to apply to a silhouette's `viewBox` so its measured span renders
 * at true physical size.
 *
 * `span = basis === 'crown-rump' ? rumpY − crownY : heelY − crownY`
 * `k = (lengthMm × pxPerMm) / span`
 *
 * Render the SVG at `viewBox.w × k` by `viewBox.h × k` CSS pixels.
 *
 * If a crown-heel measurement is requested but the silhouette has no `heelY`,
 * this returns 0 rather than guessing. Substituting the crown-rump span would
 * *inflate* `k` (a smaller span for the same millimetres), drawing a baby much
 * longer than life — so the honest answer is to draw nothing and let the caller
 * hide the layer.
 *
 * @param {import('./types.js').Silhouette} sil The silhouette being drawn.
 * @param {import('./types.js').LengthBasis} basis Which span the length measures.
 * @param {number} lengthMm The week's measured length in millimetres.
 * @param {number} [pxPerMm] Device density; defaults to {@link DEFAULT_PX_PER_MM}.
 * @returns {number} The viewBox-unit → CSS-pixel factor `k` (0 when unusable).
 */
export function silhouetteScale(sil, basis, lengthMm, pxPerMm = DEFAULT_PX_PER_MM) {
  const span = silhouetteSpan(sil, basis);
  const px = babyPixels(lengthMm, pxPerMm);
  if (span <= 0 || px <= 0) return 0;
  return px / span;
}

/**
 * The drawn span (in viewBox units) that corresponds to a measurement basis.
 *
 * A crown-heel request against art with no usable `heelY` yields 0: there is no
 * safe substitute, because every other span in the drawing is shorter and would
 * scale the figure up. Callers treat 0 as "no honest render" and hide the layer.
 *
 * @param {import('./types.js').Silhouette} sil
 * @param {import('./types.js').LengthBasis} basis
 * @returns {number} Span in viewBox units (0 when the silhouette is unusable).
 */
export function silhouetteSpan(sil, basis) {
  if (!sil) return 0;
  const rumpSpan = sil.rumpY - sil.crownY;
  if (basis === 'crown-heel') {
    const heel = sil.heelY;
    if (typeof heel === 'number' && Number.isFinite(heel) && heel > sil.crownY) {
      return heel - sil.crownY;
    }
    return 0;
  }
  return rumpSpan > 0 ? rumpSpan : 0;
}

/**
 * Calibration: px-per-mm implied by a credit-card outline drawn `widthPx` wide.
 * @param {number} widthPx On-screen width of the matched card outline, CSS px.
 * @returns {number} Calibrated px per millimetre, clamped to a sane range.
 */
export function pxPerMmFromCardWidth(widthPx) {
  if (!Number.isFinite(widthPx) || widthPx <= 0) return DEFAULT_PX_PER_MM;
  return clampPxPerMm(widthPx / CREDIT_CARD_MM.w);
}

/**
 * Inverse of {@link pxPerMmFromCardWidth} — the on-screen card width for a
 * given density (used to position the calibration slider).
 * @param {number} pxPerMm
 * @returns {number} Card width in CSS pixels.
 */
export function cardWidthFromPxPerMm(pxPerMm) {
  return effectivePxPerMm(pxPerMm) * CREDIT_CARD_MM.w;
}
