# Master Build Prompt — Pregnancy Companion App

> **How to use this file:** Paste everything below the horizontal rule into Claude Code (or any capable AI builder) at the root of an empty repository and say "build Phase 1." The prompt is self-contained: it carries the product spec, the design language, the medical-content guardrails, and the canonical fetal size data. You can also hand it to a human developer — it reads as a spec.

---

## ROLE

You are three people at once:

1. **A senior product engineer** who ships small, polished, reliable software.
2. **A careful UX designer** with iOS taste — restraint, whitespace, native feel.
3. **An evidence-informed prenatal health writer** who follows the content guardrails in Appendix A exactly and never invents medical claims.

You are building a **personal pregnancy companion for one family expecting their first baby**. This is not a growth-metrics startup MVP. It is a calm, beautiful, private keepsake tool. The quality bar: something you would proudly hand to your own partner on the day of the positive test.

## ONE-LINE GOAL

An iPhone-first app that tells us, week by week, what's happening with our baby, what to eat, and what to do next — and shows the baby on screen at its **true physical size**.

## PRODUCT PRINCIPLES

1. **Simple and elegant.** Few screens, no clutter, every element earns its place. When in doubt, leave it out.
2. **Private by default.** No accounts, no server, no analytics, no tracking. Every byte stays on the phone.
3. **Evidence-informed, never alarmist.** The app informs and reassures; it does not diagnose or prescribe. Every advice surface carries the disclaimer in Appendix A.
4. **Delight lives in the details.** The moment the true-size baby appears on screen should feel a little magical.
5. **Build up from a small core.** Ship Phase 1 completely — polished, tested, content-filled — before touching Phase 2.

## PLATFORM & STACK

- **iPhone-first Progressive Web App (PWA):** Vite + React + TypeScript + Tailwind CSS. Static files, no backend, no login. Installable via Safari's "Add to Home Screen," fully offline after first load (web manifest + service worker).
- **Why PWA first:** it gets on the actual iPhone today with zero App Store friction, and this spec is written so a native SwiftUI port can follow later without redesign.
- **Feel native:** `-apple-system` font stack, safe-area insets (`env(safe-area-inset-*)`), bottom tab bar, no rubber-band jank, dark mode via `prefers-color-scheme`, 150–250 ms ease-out transitions. Design target viewport 390×844; must also work at 375×667.
- **Storage:** app state and settings in `localStorage` (versioned schema with a migration stub); photos and documents in IndexedDB via a tiny wrapper (e.g. `idb-keyval`). Because iOS can evict web storage from rarely-used sites, the README and Settings both encourage installing to Home Screen and taking periodic backups (see Settings → Export).

## SETUP & THE WEEK ENGINE

- **First run:** a single warm welcome screen asking for the **due date** — or, if unknown, the first day of the last menstrual period (due date = LMP + 280 days). Optional baby nickname. Editable later in Settings.
- **Gestational age:** `daysPregnant = 280 − daysUntilDueDate`; display as "17 weeks + 3 days." Content is indexed by *completed* weeks (17w3d → week 17 content), the convention used by major pregnancy apps. Note this convention once in Settings so nobody is confused.
- **Trimesters:** T1 = weeks 1–13, T2 = 14–27, T3 = 28–40.
- **Edges:** before week 4, show a gentle "early days" screen; after week 40, keep serving weeks 41–42 content ("any day now"); cap at 42.
- Week math lives in a pure, unit-tested module.

## INFORMATION ARCHITECTURE

Final app has a bottom tab bar: **Today · Size · Journal · Docs · Plan**, plus a gear icon (top right of Today) for Settings. Tabs appear only when their phase ships — Phase 1 shows just **Today** and **Size**. Never ship a "coming soon" placeholder tab.

---

## FEATURE 1 — TODAY (home screen)

A single scrollable column of cards:

1. **Header:** big friendly "Week 17" numeral; beneath it "17w + 3d · 2nd trimester · 158 days to go."
2. **Size headline card:** comparison emoji + "About the size of a pear — 5.1 in, 4.9 oz." Tapping it jumps to the Size tab.
3. **Your baby this week** — 2–4 short paragraphs of development, specific to this week.
4. **Your body** — 1–3 short paragraphs on what mom may be feeling.
5. **On the menu this week** — the week's nutrition focus: one nutrient spotlight with a one-line *why it matters right now*, 4–6 concrete food ideas (meal/snack phrasing, not lecture phrasing), and one rotating food-safety reminder.
6. **This week's to-dos** — week-tagged checklist items with persistent checkboxes (e.g., week 24: "Schedule your glucose screen (done between 24–28 weeks)").
7. **When to call your provider** — a collapsed, always-present card containing the red-flag list from Appendix A, verbatim.

Week navigation: chevrons and swipe to browse any week 4–42 (browsing never changes the "current" week — a "Back to today" pill appears while browsing).

## FEATURE 2 — SIZE (the signature feature)

A tasteful single-color SVG silhouette of the baby rendered at **true physical size**.

- **Data:** per-week `lengthMm` and `weightG` from the canonical table in Appendix B. Lengths are **crown-to-rump through week 19** and **crown-to-heel from week 20** — always label which measurement is on screen. At the week 19→20 transition, show a friendly note: "From here we measure head to heel — hello, long legs!" so the apparent jump in size is explained, not confusing.
- **True-size math:** rendered pixels = `lengthMm × pxPerMm`. Default `pxPerMm = 6.0` (≈153 CSS px/inch, typical for iPhones), refined by a 30-second **calibration**: overlay a credit-card outline (ISO ID-1: 85.60 × 53.98 mm) that the user matches to a real card with a slider/pinch; store the resulting `pxPerMm` in localStorage. Show a small "actual size ✓ calibrated" badge once done; offer "Recalibrate" in Settings.
- **Fit logic:** while the baby fits in the viewport (minus chrome), render at 100% with an "Actual size" badge. Once too big, auto-scale to fit and badge honestly: "Shown at 43% — your baby has outgrown the screen 🎉." Provide a **Life-size mode** toggle that renders at 100% anyway and lets the user scroll along the baby, head to heel.
- **Week scrubber:** a horizontal drag control to sweep across weeks and watch growth animate smoothly (CSS scale transforms; keep it 60 fps). Include a faint ghost outline of the previous week for comparison, and a stats line: length (in/cm), weight (oz/lb/g), fruit comparison.
- **Silhouettes:** 5 stage-appropriate inline SVGs — embryo curl (w4–9), early fetus (w10–19), mid fetus (w20–27), late fetus (w28–36), term baby (w37+). Abstract and lovely — a single accent-color solid shape, not clinical, not cartoonish. Annotate each SVG with which span of the drawing corresponds to the week's measurement basis (crown-rump vs crown-heel) so the scaling maps to real anatomy.

## FEATURE 3 — WEEKLY CONTENT LIBRARY (data, not a screen)

Author **complete content for every week 4–42** in `src/data/weeks.ts`. No placeholders, no repeated filler — each week genuinely specific. Schema:

```ts
type DietTag = 'vegetarian' | 'vegan' | 'dairy-free' | 'nut-free' | 'halal' | 'kosher';

type Week = {
  week: number;                          // 4..42
  trimester: 1 | 2 | 3;
  lengthMm: number | null;               // from Appendix B
  lengthBasis: 'crown-rump' | 'crown-heel' | null;
  weightG: number | null;
  comparison: { name: string; emoji: string };   // "a pear", "🍐"
  baby: string[];                        // 2–4 short paragraphs: development
  body: string[];                        // 1–3 short paragraphs: mom
  nutrition: {
    focus: string;                       // e.g. "Iron"
    why: string;                         // 1–2 sentences tied to THIS week
    eat: { idea: string; tags?: DietTag[] }[];   // 4–6 concrete ideas
    safety: string;                      // one rotating reminder from Appendix A
  };
  todos: { id: string; label: string }[]; // may be empty; anchored per Appendix A
};
```

**Tone:** warm, plain-spoken, second person ("your baby," "you might notice"), roughly 8th-grade reading level, zero fear-mongering, no absolute medical claims ("always/never/guaranteed"). Milestones, nutrient guidance, and to-do timing must follow Appendix A exactly.

## FEATURE 4 — JOURNAL (Phase 2)

- Weekly bump photo + short note ("Week 17 — felt the first kicks!"). Capture via `<input type="file" accept="image/*">` (camera or library).
- Grid gallery grouped by week; tap for full screen with the note. Ultrasound photos get a special tag and filter.
- Images compressed client-side (longest edge ≤ 1600 px, JPEG) and stored in IndexedDB.

## FEATURE 5 — DOCS (Phase 2)

- Upload PDFs and images of lab results, ultrasound reports, insurance letters. Fields: title, date, category (Lab · Ultrasound · Insurance · Other), optional note.
- Searchable, filterable list; tap to view (object URL; PDFs open in the built-in viewer). Storage-used indicator. Local only.

## FEATURE 6 — PLAN (Phase 3)

- **Appointments list:** date/time, type presets (Prenatal visit · Ultrasound · Glucose test · Tdap shot · GBS swab · Hospital tour · Custom), location, notes.
- **Suggested schedule generator** from the due date: monthly visits to 28w, every two weeks to 36w, weekly to 40w — plus the screening windows from Appendix A (NT scan 11–13w, anatomy scan 18–22w, glucose 24–28w, Tdap 27–36w, GBS 36–37w). Each suggestion adds to the list with one tap.
- **Calendar sync, the pragmatic v1:** every appointment (or "export all") downloads an **.ics file** — on iPhone this opens directly into the Calendar app. Include a 1-day-before `VALARM`. (True two-way EventKit sync is reserved for a future native port.)

## SETTINGS

Due date (edit), baby nickname, units toggle (in/oz ↔ cm/g), **dietary preferences** (the `DietTag` list — used to filter/annotate food ideas), recalibrate true size, **Export / Import backup** (one JSON file with media bundled as a zip), About + full medical disclaimer.

---

## DESIGN LANGUAGE

- **Palette:** warm off-white background (≈`#FAF7F2`), near-black ink text, ONE dusty accent — sage or terracotta, pick one and commit. Soft shadows, 16–20 px card radius. Dark mode: true near-black surface, same accent.
- **Type:** `-apple-system` stack; oversized rounded week numerals; 17 px body; generous line height.
- **Motion:** subtle and physical; the Size scrubber must feel like dragging something real.
- **No confetti, no mascots.** Elegance over cuteness. Emoji are allowed as quiet accents (size comparisons, empty states).

## ENGINEERING QUALITY BAR

- TypeScript strict mode; small components; content in data modules, never in JSX.
- Unit tests for the pure logic: week math, fit-scaling math, calibration math, .ics generation.
- Works fully offline after first load; installable manifest with a proper icon; state survives refresh and app restarts.
- `npm i && npm run dev` runs; `npm run build` passes clean. README covers setup, installing to an iPhone Home Screen, and how backups work.
- No lorem ipsum anywhere. All 39 weeks (4–42) of content shipped and proofread.

## BUILD ORDER — complete each phase before starting the next

- **Phase 1 (the core):** scaffold → week engine → Today → Size (with calibration + life-size mode) → full weekly content 4–42 → Settings basics → PWA shell. Then stop and demo.
- **Phase 2 (memories):** Journal + Docs + backup export/import.
- **Phase 3 (logistics):** Plan + suggested schedule + .ics export.
- **Backlog (do NOT build now):** kick counter, contraction timer, weight tracker, name shortlist, partner view, push reminders, HealthKit, native SwiftUI port.

---

## APPENDIX A — CONTENT ACCURACY GUARDRAILS (follow strictly)

**Daily targets to weave into weekly nutrition content** (US guidance for a typical singleton pregnancy):
- Folate **600 mcg DFE** (emphasize weeks 4–12; neural tube closes ~week 6) · Iron **27 mg** (pair with vitamin C; emphasize T2–T3) · Calcium **1,000 mg** · Choline **450 mg** (eggs are the star) · DHA **~200–300 mg** (2–3 weekly servings of low-mercury fish, or a supplement) · Vitamin D **600 IU** · Protein **~75–100 g in T2–T3** · Fiber **25–30 g** · Water **8–12 cups**.
- Energy: no extra calories needed in T1; **≈ +340 kcal/day in T2**; **≈ +450 kcal/day in T3**. Frame as "a hearty snack, not a second dinner" — never as calorie-math pressure.
- A daily prenatal vitamin is assumed and encouraged throughout.

**Food-safety reminders** (rotate one per week; this is the complete approved list):
- No alcohol — no known safe amount.
- Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, orange roughy. Albacore tuna ≤ 6 oz/week. Best picks: salmon, sardines, shrimp, cod, tilapia, canned light tuna.
- No raw or undercooked meat, poultry, eggs, or raw sprouts; no raw dough.
- Only pasteurized dairy and juice. Soft cheeses (brie, camembert, feta, queso fresco, blue) only if the label says pasteurized.
- Deli meats, hot dogs, and refrigerated smoked seafood only if heated until steaming (listeria precaution).
- Caffeine ≤ **200 mg/day** (~one 12-oz coffee).
- Wash produce well; keep raw meat separate; leftovers within 2 hours.

**Trimester nutrition arcs:** T1 = nausea coping (small frequent meals, cold/bland foods, ginger; vitamin B6 only "ask your provider"), folate emphasis. T2 = iron + vitamin C pairing, calcium and vitamin D, steady protein, appetite returning. T3 = DHA for the brain-growth sprint, fiber + fluids for constipation, smaller meals for heartburn, energy-dense snacks.

**Milestone anchors — place these in the correct weeks:**
- Neural tube closes ~w6 · cardiac activity visible on ultrasound ~w6–7 · all major organs forming w4–10 (this is *why* T1 food safety matters — say so gently) · sex visible on ultrasound ~w18–20 · first movements felt (quickening) w16–22 · hearing develops ~w18, recognizes voices ~w25–26 · eyes open ~w27 · rapid brain growth across T3 · lungs maturing w34–36 · "full term" = 39w0d–40w6d (37–38 is "early term") · encourage daily kick counts from w28 (call if fewer than 10 movements in 2 hours) · head-down positioning conversations w32–36.

**Appointment & screening windows (for to-dos and the Plan tab):** first prenatal visit w8–10 · NIPT blood test available from w10 · NT scan w11–13 · anatomy scan w18–22 · glucose screen w24–28 · Tdap vaccine w27–36 · RhoGAM ~w28 if Rh-negative · GBS swab w36–37 · pack the hospital bag by w35 · car seat installed by w36.

**"Call your provider now" red flags — render this card verbatim:**
> Call your OB or midwife right away for: vaginal bleeding · severe abdominal pain · severe headache, vision changes, or sudden swelling of your face or hands · fever of 100.4 °F (38 °C) or higher · fluid leaking from the vagina · regular contractions before 37 weeks · a clear drop in your baby's movement after 28 weeks. If you have thoughts of harming yourself, call or text **988** — you deserve support, right now.

**Every advice surface ends with:** *"For information only — not medical advice. Your OB or midwife knows you and your baby best."*

**Never include:** medication or supplement dosing beyond the targets above, weight-loss content, diagnostic language, or anything that scores anxiety over reassurance.

## APPENDIX B — CANONICAL SIZE TABLE (embed exactly; population averages)

Lengths are crown-to-rump (CR) through week 19 and crown-to-heel (CH) from week 20. Comparisons may be swapped for better silhouette/emoji fit, but lengths and weights are fixed.

| Week | Length (mm) | Basis | Weight (g) | Comparison |
|-----:|------------:|:-----:|-----------:|------------|
| 4  | 1   | CR | <1   | poppy seed 🌱 |
| 5  | 2   | CR | <1   | sesame seed |
| 6  | 6   | CR | <1   | sweet pea 🫛 |
| 7  | 12  | CR | <1   | blueberry 🫐 |
| 8  | 16  | CR | 1    | raspberry |
| 9  | 23  | CR | 2    | cherry 🍒 |
| 10 | 31  | CR | 4    | kumquat 🍊 |
| 11 | 41  | CR | 7    | fig |
| 12 | 54  | CR | 14   | lime 🍋‍🟩 |
| 13 | 74  | CR | 23   | lemon 🍋 |
| 14 | 87  | CR | 43   | peach 🍑 |
| 15 | 101 | CR | 70   | apple 🍎 |
| 16 | 116 | CR | 100  | avocado 🥑 |
| 17 | 130 | CR | 140  | pear 🍐 |
| 18 | 142 | CR | 190  | bell pepper 🫑 |
| 19 | 153 | CR | 240  | mango 🥭 |
| 20 | 256 | CH | 300  | banana 🍌 |
| 21 | 267 | CH | 360  | carrot 🥕 |
| 22 | 278 | CH | 430  | corn on the cob 🌽 |
| 23 | 289 | CH | 500  | grapefruit |
| 24 | 300 | CH | 600  | cantaloupe 🍈 |
| 25 | 346 | CH | 660  | cauliflower |
| 26 | 356 | CH | 760  | head of lettuce 🥬 |
| 27 | 366 | CH | 875  | rutabaga |
| 28 | 376 | CH | 1005 | eggplant 🍆 |
| 29 | 386 | CH | 1150 | butternut squash |
| 30 | 399 | CH | 1320 | cabbage 🥬 |
| 31 | 411 | CH | 1500 | coconut 🥥 |
| 32 | 424 | CH | 1700 | jicama |
| 33 | 437 | CH | 1920 | pineapple 🍍 |
| 34 | 450 | CH | 2150 | large cantaloupe 🍈 |
| 35 | 462 | CH | 2380 | honeydew melon 🍈 |
| 36 | 474 | CH | 2620 | romaine lettuce 🥬 |
| 37 | 486 | CH | 2860 | winter melon |
| 38 | 498 | CH | 3080 | mini pumpkin 🎃 |
| 39 | 507 | CH | 3290 | mini watermelon 🍉 |
| 40 | 512 | CH | 3460 | small pumpkin 🎃 |
| 41 | 515 | CH | 3600 | watermelon 🍉 |
| 42 | 517 | CH | 3700 | watermelon 🍉 |

These are averages — the app should say so once in the Size view footer ("every baby grows at their own pace").

---

**Working title:** "Little One" (rename anytime — it appears only in the manifest, header, and README).

**Begin with Phase 1.** Scaffold the project, build the week engine with tests, then Today, then Size, then author all weekly content per the schema and Appendices. Stop after Phase 1 and demo before continuing.
