/**
 * Guide content — the evidence-graded development-and-nutrition reference.
 *
 * Three data sets and one lookup:
 *   CRITICAL_WINDOWS — what your baby is building, when, and the concrete food
 *                      or habit move that helps, each graded for how solid the
 *                      science actually is.
 *   ALWAYS_AVOID     — the ongoing avoid list, one line each, also graded.
 *   GENERAL_TIPS     — everyday habits that hold across the whole pregnancy.
 *   windowsForWeek() — what is live this week and what is coming next.
 *
 * All targets, milestone anchors and food-safety rules come from
 * MASTER_PROMPT.md Appendix A. Evidence notes name the bodies behind the
 * guidance (ACOG, CDC, FDA, WHO, Cochrane, AAP, AMA, ATA) and never cite a
 * specific study, author, year, or effect size. Nothing here prescribes a
 * medication or a dose beyond the Appendix A intake targets.
 *
 * Three avoid-list items (retinol/liver, overheating, smoking) sit outside
 * Appendix A's food-safety list. Their substance is mainstream, and the two
 * numbers involved — the 102 °F ceiling and the 150-minute activity target —
 * are named as ACOG's rather than stated on this app's own authority, so no
 * figure here is app-authored.
 */

/**
 * How solid the science is behind a piece of guidance.
 *
 * - `strong` — randomized trials, meta-analyses, or universal guideline
 *   consensus (ACOG, CDC, Cochrane, FDA).
 * - `good` — consistent large observational evidence plus mainstream guideline
 *   support.
 * - `early` — a few small trials or emerging research; phrased as "some studies
 *   suggest".
 *
 * @typedef {'strong'|'good'|'early'} Evidence
 */

/**
 * A stretch of pregnancy where something specific is being built, paired with
 * the move that supports it.
 *
 * @typedef {object} CriticalWindow
 * @property {string} id            Stable kebab-case key.
 * @property {[number, number]} weeks  Inclusive gestational week range, within 4–42.
 * @property {string} title         Short headline, e.g. "Neural tube closes".
 * @property {string} developing    1–2 sentences: what your baby is building right now.
 * @property {string} action        1–2 sentences: the concrete food or habit move.
 * @property {Evidence} evidence    Grade for the action.
 * @property {string} evidenceNote  Honest one-liner about how well studied this is.
 */

/**
 * Something to steer clear of for the whole pregnancy.
 *
 * @typedef {object} AvoidItem
 * @property {string} id
 * @property {string} label
 * @property {string} detail
 * @property {Evidence} evidence
 */

/**
 * A small everyday habit.
 *
 * Tips carry a grade for the same reason windows do: this screen promises to
 * say how sure we are, and "take your prenatal" and "try ginger" are not
 * equally well established.
 *
 * @typedef {object} GeneralTip
 * @property {string} id
 * @property {string} label
 * @property {string} detail
 * @property {Evidence} evidence  Grade for the habit's claimed benefit.
 */

/**
 * The developmental windows, in the order they open.
 * @type {CriticalWindow[]}
 */
export const CRITICAL_WINDOWS = [
  {
    id: 'folate-neural-tube',
    weeks: [4, 12],
    title: 'The neural tube closes',
    developing:
      'A flat ribbon of cells is folding into a tube that becomes your baby’s brain and spinal cord. It seals by about week 6 — often before a pregnancy feels real — and folate keeps working right through the first trimester.',
    action:
      'Get 600 mcg DFE of folate a day from your prenatal vitamin plus food: lentils, chickpeas, spinach, romaine, asparagus, oranges, and fortified breakfast cereal or bread.',
    evidence: 'strong',
    evidenceNote:
      'Very well studied — randomized trials plus decades of population data, and the reason flour is fortified in the US. CDC and ACOG both recommend it for everyone who could become pregnant.'
  },

  {
    id: 'organogenesis-food-safety',
    weeks: [4, 10],
    title: 'Every major organ starts forming',
    developing:
      'Heart, brain, lungs, kidneys, limbs and face are all being laid down in these few weeks. Cardiac activity usually shows on ultrasound around week 6 or 7.',
    action:
      'This is when food safety and skipping alcohol matter most. Cook meat and eggs through, choose pasteurized dairy, wash produce, and pour yourself something else.',
    evidence: 'strong',
    evidenceNote:
      'Very well studied. That organs form in this window is settled embryology, and the alcohol and listeria guidance is universal across CDC, FDA and ACOG.'
  },

  {
    id: 'vitamin-a-caution',
    weeks: [4, 10],
    title: 'Vitamin A: the one to keep an eye on',
    developing:
      'The same signals that shape your baby’s face, heart and limbs run on vitamin A. Too much of the animal form (retinol) during these weeks can disrupt that shaping.',
    action:
      'Skip liver, liver pâté and any high-dose retinol supplement or fish-liver oil. Beta-carotene from carrots, sweet potato, squash and dark greens is a different form and is fine.',
    evidence: 'strong',
    evidenceNote:
      'Very well studied for the drug forms — high-dose retinoids are recognized teratogens, which is why the caution carries over to concentrated food and supplement sources like liver. Beta-carotene from vegetables has no such signal.'
  },

  {
    id: 'iodine-thyroid',
    weeks: [4, 16],
    title: 'Thyroid hormone builds the early brain',
    developing:
      'Until your baby’s own thyroid switches on around week 12, yours supplies all the thyroid hormone driving early brain wiring. Your need for iodine rises to make it.',
    action:
      'Use iodized salt at home, and keep dairy, eggs and fish in the week. Check your prenatal label for iodine — many include it, some don’t.',
    evidence: 'good',
    evidenceNote:
      'Strong where deficiency is real: correcting it clearly protects brain development, and WHO and the American Thyroid Association recommend iodine in pregnancy. The benefit of extra iodine in already-sufficient diets is less certain.'
  },

  {
    id: 'choline-memory',
    weeks: [4, 42],
    title: 'Choline and the memory center',
    developing:
      'Choline goes into every cell membrane your baby builds and into the hippocampus, the brain’s memory hub. Demand runs all pregnancy and peaks in the last months.',
    action:
      'Aim for 450 mg a day. Two whole eggs get you most of the way; beef, chicken, salmon, soybeans, kidney beans, quinoa and broccoli fill the rest.',
    evidence: 'good',
    evidenceNote:
      'The 450 mg target is an official US intake recommendation, and the AMA and AAP back choline in pregnancy. Be honest, though: the human trials on memory are small, so the biology is stronger than the trial evidence.'
  },

  {
    id: 'protein-building-blocks',
    weeks: [14, 42],
    title: 'Growth shifts into building mode',
    developing:
      'The organ blueprints are drawn, so now your baby is mostly adding tissue — muscle, bone, brain and the placenta keeping up alongside.',
    action:
      'Aim for about 75–100 g of protein a day and spread it across meals rather than loading dinner: eggs or yogurt at breakfast, beans or chicken at lunch, fish, tofu or lentils at night.',
    evidence: 'good',
    evidenceNote:
      'The higher requirement is well established and consistent across mainstream guidance. How much the spreading-it-out part adds is supported by nutrition research but less firmly proven in pregnancy specifically.'
  },

  {
    id: 'iron-blood-and-banking',
    weeks: [14, 42],
    title: 'Blood volume climbs — and your baby banks iron',
    developing:
      'Your blood volume rises by nearly half to supply the placenta, and your baby stores enough iron to cover roughly the first four to six months after birth.',
    action:
      'Target 27 mg of iron a day — beef, sardines, lentils, tofu, pumpkin seeds, fortified cereal — and pair plant sources with vitamin C (peppers, citrus, tomatoes, strawberries) to absorb far more.',
    evidence: 'strong',
    evidenceNote:
      'Very well studied for the outcome that matters most here — iron supplementation clearly reduces maternal anemia and iron deficiency. Effects on birth weight are less certain. The vitamin C absorption effect is long-established, and ACOG and CDC both screen for and treat anemia.'
  },

  {
    id: 'hearing-voices',
    weeks: [18, 26],
    title: 'Your baby starts listening',
    developing:
      'Hearing comes online around week 18 — first your heartbeat and the rush of blood, then outside sound. By about weeks 25–26 your baby responds to familiar voices.',
    action:
      'Not a food one: talk, read and sing out loud, and let your partner do the same. Low voices carry through best, so a partner reading aloud is not a token gesture — and a song repeated most nights is one your newborn may well recognise.',
    evidence: 'good',
    evidenceNote:
      'The strongest evidence is the newborn one — babies recognize the voices and rhythms they heard before birth. The week-by-week onset dates are the standard patient-education timeline rather than a precise measurement.'
  },

  {
    id: 'magnesium-cramps',
    weeks: [20, 34],
    title: 'Leg cramps and the magnesium question',
    developing:
      'Your baby is mineralizing bone and your body is carrying more weight and fluid, which is roughly when night cramps in the calves tend to start.',
    action:
      'Some studies suggest magnesium helps with pregnancy leg cramps. Food is the easy version: pumpkin seeds, almonds, black beans, spinach, whole grains, and a square of dark chocolate.',
    evidence: 'early',
    evidenceNote:
      'Early evidence — small trials that disagree with each other, and Cochrane reviewers have called the results inconsistent. The foods are good for you regardless; ask your provider before adding a supplement.'
  },

  {
    id: 'steady-carbs-glucose',
    weeks: [24, 28],
    title: 'The glucose screen window',
    developing:
      'Placental hormones deliberately loosen your insulin response so more sugar reaches your baby, and that effect keeps building toward term. Your screening test lands in these weeks because that’s the first point the effect is clear enough to measure, with time left to do something about it.',
    action:
      'Lean on slow carbs paired with protein: oats with nuts, lentil or bean soup, brown rice or barley bowls, whole-grain bread with eggs. Steadier energy, fewer crashes.',
    evidence: 'good',
    evidenceNote:
      'Consistent evidence that whole grains, legumes and fiber steady blood sugar, and screening in this window is universal ACOG practice. Note that no eating pattern reliably prevents gestational diabetes — the screen is how you find out.'
  },

  {
    id: 'dha-brain-sprint',
    weeks: [17, 42],
    title: 'The brain-and-retina growth sprint',
    developing:
      'Your baby’s brain roughly triples in weight across the last few months, and the retina builds alongside it. Both are built from fat, and DHA is the one they concentrate most.',
    action:
      'Have 2–3 servings a week of low-mercury oily fish — salmon, sardines, trout, herring — or take an algal or fish-oil supplement with about 200–300 mg DHA a day. Hitting that target buys the part that is nailed down — fewer early preterm births — rather than the “smarter baby” part, which is not settled.',
    evidence: 'good',
    evidenceNote:
      'Split the honesty: reducing early preterm birth is strong — Cochrane meta-analyses of many randomized trials. The "smarter baby" claim is mixed and early; trials of later IQ have not settled it.'
  },

  {
    id: 'plant-omega3-ala',
    weeks: [24, 42],
    title: 'Walnuts, chia and flax — an honest note',
    developing:
      'Plant omega-3 (ALA) is not the same molecule your baby’s brain uses. Your body has to convert it to DHA, and it does that job poorly — only a small fraction gets through.',
    action:
      'Keep eating walnuts, chia and ground flax; they’re lovely food. But if you don’t eat fish, get DHA itself from an algal-oil supplement rather than relying on the conversion.',
    evidence: 'good',
    evidenceNote:
      'The poor conversion rate itself is well measured, and algal DHA is mainstream advice for plant-based diets rather than an emerging idea. Early evidence on one part of it, though: only a few small trials have asked whether eating more plant ALA does anything for the baby.'
  },

  {
    id: 'vitamin-d-partner',
    weeks: [4, 42],
    title: 'Vitamin D opens the door for calcium',
    developing:
      'Calcium can’t do its job without vitamin D to absorb it, and your baby draws on your stores to set up their own bone and immune system.',
    action:
      'Aim for 600 IU a day. Your prenatal usually covers it; salmon, sardines, egg yolks and fortified milk or plant milk top it up.',
    evidence: 'good',
    evidenceNote:
      'The 600 IU target and the absorption role are firmly established. Trials of higher doses show mixed results for outcomes like preeclampsia and birth weight, so guidance stops at meeting the target — ask your provider before going above it.'
  },

  {
    id: 'calcium-skeleton',
    weeks: [28, 42],
    title: 'Your baby banks a skeleton',
    developing:
      'Most of your baby’s skeletal calcium is laid down in these final weeks — the bones are hardening fast, and teeth buds are mineralizing under the gums.',
    action:
      'Hit 1,000 mg of calcium a day: milk, yogurt, hard cheese, fortified plant milk, canned sardines with the bones, tofu set with calcium, kale and white beans.',
    evidence: 'strong',
    evidenceNote:
      'Very well studied. The third-trimester mineralization surge is settled physiology, the intake target is consistent across mainstream guidance, and Cochrane reviews find calcium also lowers preeclampsia risk in people who get too little.'
  },

  {
    id: 'hydration-fiber-comfort',
    weeks: [28, 42],
    title: 'The constipation-and-heartburn stretch',
    developing:
      'Your baby now takes up most of the room, pressing on your stomach and slowing your gut. Pregnancy hormones and iron supplements both add to the slowdown.',
    action:
      'Aim for 8–12 cups of water and 25–30 g of fiber a day — oats, pears, prunes, beans, berries — and eat smaller meals more often, staying upright for a while after.',
    evidence: 'good',
    evidenceNote:
      'Consistent evidence and clear mechanism: fiber with fluid is first-line for constipation, and smaller upright meals are standard reflux advice from ACOG-aligned sources. Fiber without the fluid can make things worse.'
  },

  {
    id: 'dates-final-weeks',
    weeks: [36, 42],
    title: 'Dates in the last few weeks',
    developing:
      'Your baby is putting on fat and settling head-down, and your cervix is quietly starting to soften and thin in preparation for labor.',
    action:
      'Some studies suggest eating dates daily from about week 36 is linked to a riper cervix and less need for induction. The trials used a modest daily handful; there is no established amount, so treat it as a snack, not a protocol.',
    evidence: 'early',
    evidenceNote:
      'Early evidence — a few small randomized trials, mostly modest in size and quality, with no major body making a formal recommendation. Harmless and pleasant to try; mention it at a visit if you have gestational diabetes.'
  }
];

/**
 * The ongoing avoid list — true for the whole pregnancy, grouped-ready.
 * @type {AvoidItem[]}
 */
export const ALWAYS_AVOID = [
  {
    id: 'avoid-alcohol',
    label: 'Alcohol',
    detail:
      'There’s no known safe amount at any stage — mocktails, sparkling water and juice spritzers are all fair game.',
    evidence: 'strong'
  },
  {
    id: 'avoid-high-mercury-fish',
    label: 'High-mercury fish',
    detail:
      'Skip shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin and orange roughy; keep albacore tuna to 6 oz a week. Salmon, sardines, shrimp, cod, tilapia and canned light tuna are the best picks.',
    evidence: 'strong'
  },
  {
    id: 'avoid-raw-animal-foods',
    label: 'Raw or undercooked meat, poultry, eggs and sprouts',
    detail:
      'Cook them through — this is about listeria, salmonella and toxoplasma, and raw sprouts can’t be washed clean.',
    evidence: 'strong'
  },
  {
    id: 'avoid-raw-dough',
    label: 'Raw dough and batter',
    detail:
      'Sneak-tasting cookie dough counts: raw flour carries E. coli and raw egg carries salmonella.',
    evidence: 'strong'
  },
  {
    id: 'avoid-unpasteurized',
    label: 'Unpasteurized dairy and juice',
    detail:
      'Soft cheeses like brie, camembert, feta, queso fresco and blue are fine only if the label says pasteurized.',
    evidence: 'strong'
  },
  {
    id: 'avoid-cold-cuts',
    label: 'Deli meats, hot dogs and refrigerated smoked seafood',
    detail:
      'These are fine when heated until steaming hot, which is what kills listeria; cold from the package is the risk.',
    evidence: 'strong'
  },
  {
    id: 'avoid-unwashed-produce',
    label: 'Unwashed produce and cross-contamination',
    detail:
      'Rinse fruit and vegetables well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.',
    evidence: 'strong'
  },
  {
    id: 'avoid-excess-caffeine',
    label: 'Caffeine over 200 mg a day',
    detail:
      'That’s about one 12-oz coffee — tea, chocolate, soda and energy drinks all count toward the total. The 200 mg limit is standard guidance; the underlying studies are observational, which is why the limit is cautious rather than a bright line.',
    evidence: 'good'
  },
  {
    id: 'avoid-retinol',
    label: 'Liver and retinol supplements',
    detail:
      'High-dose animal vitamin A can affect how your baby forms; beta-carotene from vegetables is a different story and is fine.',
    evidence: 'strong'
  },
  {
    id: 'avoid-overheating',
    label: 'Hot tubs, saunas and overheating',
    detail:
      'Skip hot tubs and saunas, especially in the first trimester — ACOG’s line is water or rooms above about 102 °F. A warm bath you can sit in comfortably is fine.',
    evidence: 'good'
  },
  {
    id: 'avoid-smoke',
    label: 'Smoking, vaping and secondhand smoke',
    detail:
      'Quitting at any point helps, and it’s worth asking the household to take it outside — or asking your provider for support.',
    evidence: 'strong'
  }
];

/**
 * Everyday habits that hold across the whole pregnancy.
 * @type {GeneralTip[]}
 */
export const GENERAL_TIPS = [
  {
    id: 'tip-small-meals',
    label: 'Eat small and often when nausea hits',
    detail:
      'An empty stomach makes queasiness worse, so graze on cold or bland things — crackers, toast, yogurt, watermelon. Keep a snack on the nightstand for before you sit up.',
    evidence: 'good'
  },
  {
    id: 'tip-ginger-b6',
    label: 'Try ginger for morning sickness',
    detail:
      'Ginger tea, chews or ginger ale made with real ginger help many people, and the evidence for it is reasonably consistent. Vitamin B6 is also used for nausea — ask your provider before starting it.',
    evidence: 'good'
  },
  {
    id: 'tip-prenatal-vitamin',
    label: 'Take your prenatal every day',
    detail:
      'It’s the backstop for folate, iron, iodine and vitamin D on the days food doesn’t cooperate. If it upsets your stomach, try taking it with dinner or at bedtime.',
    evidence: 'strong'
  },
  {
    id: 'tip-hydration',
    label: 'Drink 8–12 cups of water a day',
    detail:
      'Fluid supports your bigger blood volume, your amniotic fluid, and everything fiber is trying to do. Pale-straw urine is the easiest check.',
    evidence: 'good'
  },
  {
    id: 'tip-exercise',
    label: 'Keep moving most days',
    detail:
      'Walking, swimming, stationary cycling and prenatal yoga are all well supported by ACOG for most pregnancies, whose target is about 150 minutes a week. Aim for a pace where you can still hold a conversation.',
    evidence: 'strong'
  },
  {
    id: 'tip-pelvic-floor',
    label: 'Work your pelvic floor',
    detail:
      'A few sets of squeeze-and-release a day is linked to less leaking late in pregnancy and after birth. Easy to pair with something routine, like brushing your teeth.',
    evidence: 'good'
  },
  {
    id: 'tip-side-sleep',
    label: 'Settle onto your side in the third trimester',
    detail:
      'Side-lying keeps the weight off the big vein behind your uterus, and the evidence for it is observational but consistent. Waking up on your back is not a problem — just roll back over and go to sleep.',
    evidence: 'good'
  },
  {
    id: 'tip-kick-counts',
    label: 'Count movements daily from week 28',
    detail:
      'Pick a time your baby is usually active, get comfortable, and count. Call your provider if you get fewer than 10 movements in 2 hours, or if the pattern clearly changes. Knowing your baby’s pattern is the part everyone agrees on; formal counting protocols have been trialled with mixed results.',
    evidence: 'good'
  },
  {
    id: 'tip-skincare',
    label: 'Check your skincare labels',
    detail:
      'Over-the-counter retinol is one to shelve for now, and if a retinoid was prescribed for you, ask your provider what to swap it for — oral vitamin A relatives are known to affect development. Sunscreen, gentle cleansers and moisturizer are all fine, and sunscreen helps with pregnancy skin darkening.',
    evidence: 'good'
  },
  {
    id: 'tip-vaccines',
    label: 'Ask about vaccines at the right visit',
    detail:
      'Flu, COVID and Tdap are all recommended in pregnancy, and Tdap has its own window later on so your baby gets antibodies for whooping cough. Ask your provider to line up the timing.',
    evidence: 'good'
  },
  {
    id: 'tip-ask-about-extras',
    label: 'Run supplements and herbal teas past your provider',
    detail:
      'Herbal blends and single-nutrient supplements aren’t regulated the way medicines are, and a few aren’t a good idea in pregnancy. One quick question at a visit settles it.',
    evidence: 'good'
  }
];

/** Lowest gestational week the guide covers. */
const MIN_WEEK = 4;
/** Highest gestational week the guide covers. */
const MAX_WEEK = 42;
/** How far ahead "upcoming" looks, in weeks. */
const LOOKAHEAD_WEEKS = 3;

/**
 * Sort windows by when they open, then by when they close, then by id — so the
 * order is stable and does not depend on the array literal above.
 *
 * @param {CriticalWindow} a
 * @param {CriticalWindow} b
 * @returns {number}
 */
function byStart(a, b) {
  return a.weeks[0] - b.weeks[0] || a.weeks[1] - b.weeks[1] || a.id.localeCompare(b.id);
}

/**
 * What's live this week, and what opens soon.
 *
 * `active` holds every window covering the given week (inclusive on both ends).
 * `upcoming` holds windows that have not opened yet but start within the next
 * three weeks. Weeks outside 4–42 are clamped into range; a non-numeric week
 * yields two empty arrays rather than throwing, so the UI can render safely.
 *
 * @param {number} week Gestational week (completed weeks).
 * @returns {{ active: CriticalWindow[], upcoming: CriticalWindow[] }}
 */
export function windowsForWeek(week) {
  /* Only a number or a numeric string is a week. `Number(null)` and
     `Number('')` are both 0, which would silently clamp "no week at all" to
     week 4 and render the first trimester at someone who has no due date. */
  const n =
    typeof week === 'number'
      ? week
      : typeof week === 'string' && week.trim() !== ''
        ? Number(week)
        : NaN;
  if (!Number.isFinite(n)) return { active: [], upcoming: [] };

  const w = Math.min(MAX_WEEK, Math.max(MIN_WEEK, Math.floor(n)));

  const active = CRITICAL_WINDOWS.filter(
    (entry) => entry.weeks[0] <= w && w <= entry.weeks[1]
  ).sort(byStart);

  const upcoming = CRITICAL_WINDOWS.filter(
    (entry) => entry.weeks[0] > w && entry.weeks[0] <= w + LOOKAHEAD_WEEKS
  ).sort(byStart);

  return { active, upcoming };
}
