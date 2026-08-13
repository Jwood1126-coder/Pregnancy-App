import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PX_PER_MM,
  CREDIT_CARD_MM,
  MIN_PX_PER_MM,
  MAX_PX_PER_MM,
  effectivePxPerMm,
  clampPxPerMm,
  babyPixels,
  fitScale,
  scalePercent,
  silhouetteScale,
  silhouetteSpan,
  pxPerMmFromCardWidth,
  cardWidthFromPxPerMm
} from '../app/js/lib/scale.js';
import { SILHOUETTES } from '../app/js/features/size/silhouettes.js';

/**
 * A stand-in for a crown-rump stage: the drawn span *is* the quoted length, so
 * `spanFraction` is 1 and round numbers stay round.
 */
const SIL_CR = {
  id: 'test-cr',
  minWeek: 4,
  maxWeek: 19,
  viewBox: { w: 96, h: 150 },
  path: 'M0 0 Z',
  crownY: 6,
  rumpY: 140,
  lowestY: 146,
  spanFraction: 1
};

/**
 * A stand-in for a curled crown-heel stage: the quoted length is taken with the
 * legs stretched, and the curl occupies 0.7 of it.
 */
const SIL_CURLED = {
  id: 'test-curled',
  minWeek: 20,
  maxWeek: 42,
  viewBox: { w: 100, h: 150 },
  path: 'M0 0 Z',
  crownY: 6,
  rumpY: 146,
  lowestY: 146,
  spanFraction: 0.7
};

/** The real term silhouette, so the shipped numbers are under test too. */
const TERM = SILHOUETTES.find((s) => s.id === 'term');

test('constants match the spec', () => {
  assert.equal(DEFAULT_PX_PER_MM, 6.0);
  assert.deepEqual(CREDIT_CARD_MM, { w: 85.6, h: 53.98 });
});

test('effectivePxPerMm falls back when uncalibrated', () => {
  assert.equal(effectivePxPerMm(null), DEFAULT_PX_PER_MM);
  assert.equal(effectivePxPerMm(undefined), DEFAULT_PX_PER_MM);
  assert.equal(effectivePxPerMm(0), DEFAULT_PX_PER_MM);
  assert.equal(effectivePxPerMm(-3), DEFAULT_PX_PER_MM);
  assert.equal(effectivePxPerMm(Number.NaN), DEFAULT_PX_PER_MM);
  assert.equal(effectivePxPerMm(6.4), 6.4);
  // Implausible calibrations are pulled back into range.
  assert.equal(effectivePxPerMm(0.2), MIN_PX_PER_MM);
  assert.equal(effectivePxPerMm(400), MAX_PX_PER_MM);
});

test('clampPxPerMm keeps calibration physical', () => {
  assert.equal(clampPxPerMm(6), 6);
  assert.equal(clampPxPerMm(1), MIN_PX_PER_MM);
  assert.equal(clampPxPerMm(99), MAX_PX_PER_MM);
});

test('babyPixels converts millimetres to CSS pixels', () => {
  assert.equal(babyPixels(130, 6), 780); // week 17, crown-rump
  assert.equal(babyPixels(256, 6), 1536); // week 20, crown-heel
  assert.equal(babyPixels(512, 6), 3072); // week 40
  assert.equal(babyPixels(1, 6), 6); // week 4 — a single millimetre
  assert.equal(babyPixels(130), 780); // default density
  assert.equal(babyPixels(0, 6), 0);
  assert.equal(babyPixels(-5, 6), 0);
  assert.equal(babyPixels(130, 0), 0);
  assert.equal(babyPixels(Number.NaN, 6), 0);
});

test('fitScale renders at actual size until the baby outgrows the screen', () => {
  // Week 17 at 780 px inside an 800 px stage: actual size.
  assert.equal(fitScale(780, 800), 1);
  assert.equal(fitScale(780, 780), 1);
  // Week 40 at 3072 px inside a 700 px stage: scaled down honestly.
  assert.equal(fitScale(3072, 700), 700 / 3072);
  assert.equal(scalePercent(fitScale(3072, 700)), 23);
  assert.equal(scalePercent(fitScale(1536, 700)), 46);
  // Degenerate inputs never magnify or divide by zero.
  assert.equal(fitScale(0, 700), 1);
  assert.equal(fitScale(780, 0), 1);
  assert.equal(fitScale(780, -10), 1);
  assert.equal(fitScale(Number.NaN, 700), 1);
});

test('scalePercent stays inside 1–100', () => {
  assert.equal(scalePercent(1), 100);
  assert.equal(scalePercent(0.4557), 46);
  assert.equal(scalePercent(0.001), 1);
  assert.equal(scalePercent(0), 1);
  assert.equal(scalePercent(2), 100);
});

test('silhouetteSpan measures what the art actually draws', () => {
  // Crown to the lowest point of the figure — not to the rump.
  assert.equal(silhouetteSpan(SIL_CR), 140);
  assert.equal(silhouetteSpan(SIL_CURLED), 140);
  assert.equal(silhouetteSpan(null), 0);
  assert.equal(silhouetteSpan({ ...SIL_CR, lowestY: 6 }), 0);
  assert.equal(silhouetteSpan({ ...SIL_CR, lowestY: Number.NaN }), 0);
});

test('silhouetteScale renders a crown-rump stage at its quoted length', () => {
  // Week 17: 130 mm crown-rump, spanFraction 1, over a 140-unit drawn span at
  // 6 px/mm → 780 px of baby spread across 140 units.
  const k17 = silhouetteScale(SIL_CR, 130, 6);
  assert.equal(k17, 780 / 140);
  // The drawn span measures exactly the quoted length: nothing is discounted.
  assert.ok(Math.abs(silhouetteSpan(SIL_CR) * k17 - 780) < 1e-9);
  // The default density is the uncalibrated fallback.
  assert.equal(silhouetteScale(SIL_CR, 130), 780 / 140);
});

test('silhouetteScale draws a curled stage at the space the curl occupies', () => {
  // Week 20: 256 mm quoted head-to-heel *stretched*; the curl is 0.7 of that,
  // so 256 × 0.7 × 6 = 1075.2 px of drawing across a 140-unit span.
  const k20 = silhouetteScale(SIL_CURLED, 256, 6);
  assert.ok(Math.abs(k20 - 1075.2 / 140) < 1e-12);
  assert.ok(Math.abs(silhouetteSpan(SIL_CURLED) * k20 - 1075.2) < 1e-9);
  // …and emphatically NOT the full stretched 1536 px: scaling the curl to the
  // stretched number is the exaggeration this contract exists to prevent.
  assert.ok(silhouetteSpan(SIL_CURLED) * k20 < 1536);

  // Week 40 on the shipped term art: 512 mm × 0.66 × 6 px/mm = 2027.52 px
  // over its own drawn span (lowestY − crownY = 594.6 − 8 = 586.6 units).
  assert.equal(TERM.spanFraction, 0.66);
  assert.ok(Math.abs(silhouetteSpan(TERM) - 586.6) < 1e-9);
  const k40 = silhouetteScale(TERM, 512, 6);
  assert.ok(Math.abs(k40 - (512 * 0.66 * 6) / 586.6) < 1e-12);
  assert.ok(Math.abs(silhouetteSpan(TERM) * k40 - 2027.52) < 1e-9);
  // 66% of the stretched 3072 px, to the millimetre.
  assert.ok(Math.abs(silhouetteSpan(TERM) * k40 - 0.66 * babyPixels(512, 6)) < 1e-9);
});

test('silhouetteScale refuses unusable input instead of guessing', () => {
  // Never NaN, never Infinity — 0 means "no honest render", and the caller
  // hides the layer.
  assert.equal(silhouetteScale(SIL_CR, 0, 6), 0);
  assert.equal(silhouetteScale(SIL_CR, -5, 6), 0);
  assert.equal(silhouetteScale(SIL_CR, 130, 0), 0);
  assert.equal(silhouetteScale(null, 130, 6), 0);
  // A degenerate drawn span.
  assert.equal(silhouetteScale({ ...SIL_CR, lowestY: 6 }, 130, 6), 0);
  // A missing or nonsensical spanFraction is not silently treated as 1: that
  // would draw a curled baby at its full stretched length.
  assert.equal(silhouetteScale({ ...SIL_CURLED, spanFraction: undefined }, 256, 6), 0);
  assert.equal(silhouetteScale({ ...SIL_CURLED, spanFraction: 0 }, 256, 6), 0);
  assert.equal(silhouetteScale({ ...SIL_CURLED, spanFraction: -0.7 }, 256, 6), 0);
  assert.equal(silhouetteScale({ ...SIL_CURLED, spanFraction: Number.NaN }, 256, 6), 0);
});

test('every shipped silhouette scales to a finite, positive factor', () => {
  for (const sil of SILHOUETTES) {
    const k = silhouetteScale(sil, 100, 6);
    assert.ok(Number.isFinite(k) && k > 0, `${sil.id}: unusable scale ${k}`);
  }
});

test('calibration converts between card width and density', () => {
  // 85.6 × 6 does not round-trip exactly in binary floating point.
  assert.ok(Math.abs(pxPerMmFromCardWidth(CREDIT_CARD_MM.w * 6) - 6) < 1e-12);
  assert.equal(cardWidthFromPxPerMm(6), CREDIT_CARD_MM.w * 6);
  assert.equal(cardWidthFromPxPerMm(null), CREDIT_CARD_MM.w * DEFAULT_PX_PER_MM);
  assert.equal(pxPerMmFromCardWidth(0), DEFAULT_PX_PER_MM);
  assert.equal(pxPerMmFromCardWidth(-40), DEFAULT_PX_PER_MM);
  assert.equal(pxPerMmFromCardWidth(10), MIN_PX_PER_MM);
  assert.equal(pxPerMmFromCardWidth(100000), MAX_PX_PER_MM);
  // Round trip.
  const width = cardWidthFromPxPerMm(6.35);
  assert.ok(Math.abs(pxPerMmFromCardWidth(width) - 6.35) < 1e-12);
});
