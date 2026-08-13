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
 * Scale factor to apply to a silhouette's `viewBox` so the drawing occupies
 * exactly the space the real, curled baby occupies.
 *
 * ```
 * span = lowestY − crownY                            // drawn, viewBox units
 * k    = (lengthMm × spanFraction × pxPerMm) / span
 * ```
 *
 * Render the SVG at `viewBox.w × k` by `viewBox.h × k` CSS pixels.
 *
 * The `spanFraction` factor is the whole honesty story. Every silhouette is
 * drawn curled, because that is how a baby lies; but from week 20 the official
 * length is crown-to-heel with the legs *stretched*, which a curled figure
 * cannot span. Scaling the curl to the stretched number would draw a baby far
 * bigger than life. `spanFraction` says what share of that official length the
 * drawn span really is (~1.0 for the crown-rump weeks, ~0.66–0.71 for the
 * curled crown-heel weeks), so the figure on the glass is the room the baby
 * takes up, and the stretched head-to-heel number stays a stat rather than a
 * silhouette.
 *
 * The measurement basis is therefore no longer a parameter: it is already baked
 * into the art's own `spanFraction`.
 *
 * @param {import('./types.js').Silhouette} sil The silhouette being drawn.
 * @param {number} lengthMm The week's official length in millimetres.
 * @param {number} [pxPerMm] Device density; defaults to {@link DEFAULT_PX_PER_MM}.
 * @returns {number} The viewBox-unit → CSS-pixel factor `k` (0 when unusable).
 */
export function silhouetteScale(sil, lengthMm, pxPerMm = DEFAULT_PX_PER_MM) {
  const span = silhouetteSpan(sil);
  const px = babyPixels(lengthMm, pxPerMm);
  if (span <= 0 || px <= 0) return 0;
  const fraction = sil.spanFraction;
  if (!Number.isFinite(fraction) || fraction <= 0) return 0;
  return (px * fraction) / span;
}

/**
 * The span the art actually draws, in viewBox units: crown to the lowest point
 * of the figure.
 *
 * This is a fact about the drawing alone — what it pairs with in millimetres is
 * `lengthMm × spanFraction`, not `lengthMm`. Unusable art yields 0, which
 * callers treat as "no honest render" and hide the layer.
 *
 * @param {import('./types.js').Silhouette} sil
 * @returns {number} Span in viewBox units (0 when the silhouette is unusable).
 */
export function silhouetteSpan(sil) {
  if (!sil) return 0;
  const span = sil.lowestY - sil.crownY;
  return Number.isFinite(span) && span > 0 ? span : 0;
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
