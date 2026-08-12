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

/** A stand-in silhouette with the same proportions as the shipped placeholder. */
const SIL = {
  id: 'test',
  minWeek: 4,
  maxWeek: 42,
  viewBox: { w: 96, h: 146 },
  path: 'M0 0',
  crownY: 6,
  rumpY: 100,
  heelY: 140
};

/** Same shape with no heel marked — art that only supports crown-rump. */
const SIL_NO_HEEL = { ...SIL, heelY: null };

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

test('silhouetteSpan picks the drawn span that matches the measurement', () => {
  assert.equal(silhouetteSpan(SIL, 'crown-rump'), 94);
  assert.equal(silhouetteSpan(SIL, 'crown-heel'), 134);
  // Art without a heel refuses the crown-heel request rather than substituting
  // the shorter crown-rump span, which would draw the baby ~57% too long.
  assert.equal(silhouetteSpan(SIL_NO_HEEL, 'crown-heel'), 0);
  // The crown-rump basis still works on the same art.
  assert.equal(silhouetteSpan(SIL_NO_HEEL, 'crown-rump'), 94);
  assert.equal(silhouetteSpan(null, 'crown-rump'), 0);
});

test('silhouetteScale maps the drawing onto true physical size', () => {
  // Week 17: 130 mm crown-rump over a 94-unit span at 6 px/mm.
  const k17 = silhouetteScale(SIL, 'crown-rump', 130, 6);
  assert.equal(k17, 780 / 94);
  // The drawn crown→rump distance now measures exactly the true length.
  assert.ok(Math.abs((SIL.rumpY - SIL.crownY) * k17 - 780) < 1e-9);

  // Week 20: 256 mm crown-heel over a 134-unit span.
  const k20 = silhouetteScale(SIL, 'crown-heel', 256, 6);
  assert.equal(k20, 1536 / 134);
  assert.ok(Math.abs((SIL.heelY - SIL.crownY) * k20 - 1536) < 1e-9);

  // Missing heel data gives 0 (caller hides the figure) instead of exaggerating.
  assert.equal(silhouetteScale(SIL_NO_HEEL, 'crown-heel', 256, 6), 0);

  // Unusable inputs give 0, never NaN or Infinity.
  assert.equal(silhouetteScale(SIL, 'crown-rump', 0, 6), 0);
  assert.equal(silhouetteScale({ ...SIL, crownY: 10, rumpY: 10 }, 'crown-rump', 130, 6), 0);
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
