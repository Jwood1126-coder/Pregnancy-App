/**
 * Baby silhouettes — five abstract side profiles, one per developmental stage.
 *
 * Each is a single closed smooth path (cubic beziers only, head at top) meant
 * to be filled with one accent colour. No faces, no clinical detail, no
 * cartoon: a solid shape that reads as "this is how big your baby is".
 *
 * **Measurement spans.** `crownY`, `rumpY` and `heelY` are measured off the
 * drawn curve itself, so consumers can map a real millimetre length onto the
 * art. Per `docs/PLAN.md`:
 *
 * ```
 * span = basis === 'crown-rump' ? rumpY - crownY : heelY - crownY;
 * k    = (lengthMm * pxPerMm) / span;   // render at viewBox.w*k by viewBox.h*k
 * ```
 *
 * **Pose honesty.** Weeks 4–19 are measured crown-rump, so those two shapes are
 * drawn curled — the curl is what the measurement describes, and anything past
 * `rumpY` (an embryo's tail, a tucked foot) is correctly excluded from the
 * span. Weeks 20+ are measured crown-heel, so those three shapes carry their
 * legs extended with only a soft knee bend: `crownY → heelY` covers virtually
 * the whole figure, so scaling by crown-heel length cannot exaggerate the baby.
 */

/** @typedef {import('../../lib/types.js').Silhouette} Silhouette */

/**
 * Every silhouette, ordered by week range. The ranges tile weeks 4–42 with no
 * gaps and no overlaps.
 * @type {Silhouette[]}
 */
export const SILHOUETTES = [
  {
    /**
     * The embryo curl. A C-shaped body with an outsized head bud at the top,
     * the hollow of the C on the belly side, faint arm and leg bud swells,
     * and a short tail tapering away below the rump. Crown-rump only: the
     * tail reaches past `rumpY`, which sits at the base of the spine, so it
     * is correctly excluded from the measured span.
     */
    id: 'embryo-curl',
    minWeek: 4,
    maxWeek: 9,
    /* The box is a tight bound on the drawing (the art spans 1.5 → 64.5 of the
       66 units). Every empty viewBox unit is multiplied by the same `k` as the
       baby, so slack here is width the real figure never gets to use. */
    viewBox: { w: 66, h: 106 },
    path:
      'M30.5 7 C35.7 7 42.7 8 47.5 11 C52.3 14 56.8 19.8 59.5 25 ' +
      'C62.2 30.2 63.5 36.7 63.5 42 C63.5 47.3 59.3 52.3 59.5 57 ' +
      'C59.7 61.7 64.3 65.2 64.5 70 C64.7 74.8 62.8 81.8 60.5 86 ' +
      'C58.2 90.2 54.3 92.7 50.5 95 C46.7 97.3 41.8 99.2 37.5 100 ' +
      'C33.2 100.8 28.7 100.8 24.5 100 C20.3 99.2 15.8 97 12.5 95 ' +
      'C9.2 93 6.3 90.7 4.5 88 C2.7 85.3 1.2 81.7 1.5 79 ' +
      'C1.8 76.3 4 73 6.5 72 C9 71 13.2 72 16.5 73 ' +
      'C19.8 74 23.2 76.3 26.5 78 C29.8 79.7 33.2 82 36.5 83 ' +
      'C39.8 84 43.7 85 46.5 84 C49.3 83 52.5 80 53.5 77 ' +
      'C54.5 74 54 69.3 52.5 66 C51 62.7 47 59.5 44.5 57 ' +
      'C42 54.5 40 52.7 37.5 51 C35 49.3 32.2 48.2 29.5 47 ' +
      'C26.8 45.8 24.2 45.7 21.5 44 C18.8 42.3 15.7 40.2 13.5 37 ' +
      'C11.3 33.8 8 29.3 8.5 25 C9 20.7 12.8 14 16.5 11 ' +
      'C20.2 8 25.3 7 30.5 7 Z',
    crownY: 7,
    rumpY: 95,
    heelY: null
  },
  {
    /**
     * Early fetus, still tightly curled — and the shape the app shows for ten
     * of the weeks people open it hardest, so it is drawn to landmarks rather
     * than by eye. Four of them stop it reading as a two-lobed peanut:
     *
     * - a **head that is the anchor mass**: a near-round skull 32 units across
     *   (x 5.4 → 37.4) over the top third of the drawing, with the trunk kept
     *   to ~35 units at its widest so the lower mass no longer out-weighs it.
     * - a **short, narrow neck**. The nape sits at x ≈ 31.8 and the throat at
     *   x ≈ 17.6 (y ≈ 46), so the neck is ~14 units — 44% of the head, crossed
     *   in six units of height. A wide pinch run over fifteen units is the
     *   waist between two beads; this is a neck.
     * - a **face in profile**: forehead (y ≈ 17), brow (y ≈ 26), nose apex
     *   (y ≈ 32), lip (y ≈ 37) and chin (y ≈ 42). One of the two masses now
     *   says out loud which one it is.
     * - a **front that reads as limbs**, not as a belly: the chest hollows
     *   back to x ≈ 17.8 (y ≈ 54), a forearm swells out at y ≈ 62, the drawn-up
     *   knee is the leftmost point of the whole drawing at y ≈ 81, a notch
     *   cuts back to x ≈ 16 at y ≈ 93, and the tucked heel sits below it at
     *   y ≈ 103. Three convexities separated by two real notches are what say
     *   "curled" rather than "bust".
     *
     * The BACK (right) stays one unbroken convex sweep — nape, shoulder, spine
     * apex at y ≈ 77 — and then tapers in to the rump, so the whole figure
     * closes like a comma instead of standing on a pedestal.
     *
     * Curled is the honest pose here, because these weeks are measured
     * crown-rump, and the box is a tight bound on the art: the outline ends in
     * a rounded rump tangent to y = 117.
     */
    id: 'early-fetus-curl',
    minWeek: 10,
    maxWeek: 19,
    viewBox: { w: 45, h: 118 },
    path:
      'M22.5 6 C30.2 6 36.2 12 37.4 20 ' +
      'C38.4 26.6 37.6 33.6 36.2 39.4 ' +
      'C35.4 42.6 31.6 43 31.8 46.4 ' +
      'C32 50.4 35.6 53.6 37.2 58.4 ' +
      'C39.2 64.4 40.8 70.4 40.6 76.6 ' +
      'C40.4 84 38 91.6 35.6 98 ' +
      'C33.4 104 31 110.6 27.4 114.6 ' +
      'C26 116.2 24.6 117 22.6 117 ' +
      'C20.6 117 17.4 116 14.8 113 ' +
      'C12.4 110.2 9.6 107 9.2 103.2 ' +
      'C8.8 99.4 15.2 98.2 16 93.4 ' +
      'C16.8 87.6 8.6 86 5.6 80.6 ' +
      'C3 76 10.6 73 14.6 69.2 ' +
      'C14.4 66.4 12.4 64.6 12.2 62 ' +
      'C12 59.2 16.8 57.8 17.8 54.2 ' +
      'C18.4 51.4 17.6 48.8 17.6 46.4 ' +
      'C17.6 44.2 13.6 44.8 12.4 42.4 ' +
      'C11.2 40 11.6 38.4 10.6 36.8 ' +
      'C9.2 34.4 5.4 35 5.4 31.8 ' +
      'C5.4 29 9.2 29.4 9 26.4 ' +
      'C8.8 22.8 5.8 21.2 6 17.2 ' +
      'C6.3 10.4 14.6 6 22.5 6 Z',
    crownY: 6,
    rumpY: 117,
    heelY: null
  },
  {
    /**
     * Mid fetus. Recognisably a baby in profile now: head about a quarter of
     * the figure, lean torso, arms tucked, and long thin legs carried nearly
     * straight so crown-to-heel really is the whole body — as these weeks
     * scale by crown-heel length, it has to be.
     */
    id: 'mid-fetus',
    minWeek: 20,
    maxWeek: 27,
    viewBox: { w: 100, h: 204 },
    path:
      'M48 7 C52.3 7.3 58.3 8.8 62 12 C65.7 15.2 69 21 70 26 ' +
      'C71 31 69.7 37.7 68 42 C66.3 46.3 62 49 60 52 ' +
      'C58 55 55 57.3 56 60 C57 62.7 63.3 63.7 66 68 ' +
      'C68.7 72.3 71 79.7 72 86 C73 92.3 71.5 99.7 72 106 ' +
      'C72.5 112.3 75.3 118.3 75 124 C74.7 129.7 71.8 134.7 70 140 ' +
      'C68.2 145.3 65.7 150.7 64 156 C62.3 161.3 61 166.7 60 172 ' +
      'C59 177.3 58.8 183.5 58 188 C57.2 192.5 57 196.7 55 199 ' +
      'C53 201.3 49.2 202 46 202 C42.8 202 36.7 201.3 36 199 ' +
      'C35.3 196.7 40.5 192.8 42 188 C43.5 183.2 44.7 176 45 170 ' +
      'C45.3 164 45.2 157.3 44 152 C42.8 146.7 38.2 142.7 38 138 ' +
      'C37.8 133.3 43 129 43 124 C43 119 39.3 113.7 38 108 ' +
      'C36.7 102.3 36.2 95.3 35 90 C33.8 84.7 30.7 80.3 31 76 ' +
      'C31.3 71.7 36.5 68 37 64 C37.5 60 35.5 56.3 34 52 ' +
      'C32.5 47.7 29 43 28 38 C27 33 26.7 26.7 28 22 ' +
      'C29.3 17.3 32.7 12.5 36 10 C39.3 7.5 43.7 6.7 48 7 Z',
    crownY: 7,
    rumpY: 131,
    heelY: 202
  },
  {
    /**
     * Late fetus, filling out. Rounder cheeks, a deeper chest and a fuller
     * thigh than the mid fetus, with the head down to roughly a quarter of
     * the figure. Legs stay extended with only a soft knee bend, keeping the
     * crown-heel span honest.
     */
    id: 'late-fetus',
    minWeek: 28,
    maxWeek: 36,
    viewBox: { w: 100, h: 204 },
    path:
      'M48 7 C52.5 7.3 59.2 8.7 63 12 C66.8 15.3 70 21.7 71 27 ' +
      'C72 32.3 70.7 39.5 69 44 C67.3 48.5 63 51.2 61 54 ' +
      'C59 56.8 55.8 58.5 57 61 C58.2 63.5 65 64.7 68 69 ' +
      'C71 73.3 73.7 80.5 75 87 C76.3 93.5 75.5 101.5 76 108 ' +
      'C76.5 114.5 78.5 120.3 78 126 C77.5 131.7 75 136.8 73 142 ' +
      'C71 147.2 67.8 151.8 66 157 C64.2 162.2 63.2 167.8 62 173 ' +
      'C60.8 178.2 60 183.7 59 188 C58 192.3 58.2 196.7 56 199 ' +
      'C53.8 201.3 49.3 202 46 202 C42.7 202 36.7 201.3 36 199 ' +
      'C35.3 196.7 40.5 192.8 42 188 C43.5 183.2 44.7 176 45 170 ' +
      'C45.3 164 45.3 157.3 44 152 C42.7 146.7 37.2 142.7 37 138 ' +
      'C36.8 133.3 43.2 129 43 124 C42.8 119 37.8 113.7 36 108 ' +
      'C34.2 102.3 33.3 95.3 32 90 C30.7 84.7 27.5 80.3 28 76 ' +
      'C28.5 71.7 34.3 68 35 64 C35.7 60 33.5 56.3 32 52 ' +
      'C30.5 47.7 26.8 43 26 38 C25.2 33 25.3 26.7 27 22 ' +
      'C28.7 17.3 32.5 12.5 36 10 C39.5 7.5 43.5 6.7 48 7 Z',
    crownY: 7,
    rumpY: 133,
    heelY: 202
  },
  {
    /**
     * Term baby, and the roundest of the five: full cheeks, a soft belly,
     * chubby limbs, and a head about a quarter of the crown-heel span. Legs
     * extended with a soft bend and the heel at the very bottom of the
     * drawing.
     */
    id: 'term-baby',
    minWeek: 37,
    maxWeek: 42,
    viewBox: { w: 100, h: 204 },
    path:
      'M48 7 C52.8 7.3 59.8 8.5 64 12 C68.2 15.5 71.8 22.3 73 28 ' +
      'C74.2 33.7 72.7 41.3 71 46 C69.3 50.7 65.2 53.2 63 56 ' +
      'C60.8 58.8 56.8 60.7 58 63 C59.2 65.3 66.7 65.8 70 70 ' +
      'C73.3 74.2 76.5 81.3 78 88 C79.5 94.7 78.5 103.3 79 110 ' +
      'C79.5 116.7 81.7 122.3 81 128 C80.3 133.7 77.2 138.8 75 144 ' +
      'C72.8 149.2 70 154 68 159 C66 164 64.3 169 63 174 ' +
      'C61.7 179 61 184.8 60 189 C59 193.2 59.2 196.8 57 199 ' +
      'C54.8 201.2 50.5 202 47 202 C43.5 202 36.8 201.3 36 199 ' +
      'C35.2 196.7 40.5 192.8 42 188 C43.5 183.2 44.8 176 45 170 ' +
      'C45.2 164 44.5 157.3 43 152 C41.5 146.7 36.2 142.7 36 138 ' +
      'C35.8 133.3 42.3 129 42 124 C41.7 119 36.2 113.7 34 108 ' +
      'C31.8 102.3 30.5 95.3 29 90 C27.5 84.7 24.3 80.3 25 76 ' +
      'C25.7 71.7 32 68 33 64 C34 60 32.3 56.3 31 52 ' +
      'C29.7 47.7 25.8 43 25 38 C24.2 33 24.3 26.7 26 22 ' +
      'C27.7 17.3 31.3 12.5 35 10 C38.7 7.5 43.2 6.7 48 7 Z',
    crownY: 7,
    rumpY: 134,
    heelY: 202
  }
];

/**
 * The silhouette to draw for a given week.
 * Weeks outside every range fall back to the nearest one, so this never
 * returns `null` while at least one silhouette exists.
 * @param {number} week Gestational week.
 * @returns {Silhouette|null} The matching silhouette, or `null` if none exist.
 */
export function silhouetteForWeek(week) {
  if (SILHOUETTES.length === 0) return null;
  const exact = SILHOUETTES.find((s) => week >= s.minWeek && week <= s.maxWeek);
  if (exact) return exact;
  const first = SILHOUETTES[0];
  const last = SILHOUETTES[SILHOUETTES.length - 1];
  return week < first.minWeek ? first : last;
}
