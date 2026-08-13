# Pregnancy App

A private, iPhone-first pregnancy companion for our family — week-by-week guidance on the baby's development, what to eat, and what to do next, plus a true-to-life size view that renders the baby at actual physical size on screen.

## Status

**Phase 1 is built.** The week engine, Today screen, true-size Size screen with calibration, the Guide, Settings, the PWA shell, and all 39 weeks of content (weeks 4–42) ship in [`app/`](./app). The product spec lives in [`MASTER_PROMPT.md`](./MASTER_PROMPT.md) and the engineering plan in [`docs/PLAN.md`](./docs/PLAN.md).

- **Guide** — what your baby is building this week and the one food or habit move that helps, each graded for how solid the evidence actually is.
- **HelloFresh picks (optional)** — switch on "We get HelloFresh" in Settings and the week's food card adds two or three dishes that come around on HelloFresh menus regularly and suit that week's nutrient, plus a tip for choosing well from whatever the menu turns out to be. The app is offline and can't see your actual menu, and it never pretends to.

## Run it

There is **nothing to install** — no dependencies, no build step, no registry. `app/` is the deployable site, plain ES modules and hand-written CSS, so any static host will do.

```sh
node scripts/serve.mjs          # → http://127.0.0.1:4173/
bash scripts/check.sh           # syntax gate: node --check on every .js/.mjs
node --test test/               # unit + content tests
```

Handy while developing (each is applied once on load, then stripped from the address bar): `?due=YYYY-MM-DD` seeds a due date · `?reset=1` clears storage · `?tab=size` opens a tab · `?week=40` sets the Size scrubber · `?pxmm=6.0` seeds calibration.

## Roadmap

- **Phase 1 — the core:** week engine · Today screen · true-size view with calibration · Guide · all weekly content (weeks 4–42) · installable PWA shell
- **Phase 2 — memories:** bump-photo journal · document uploads · backup export/import
- **Phase 3 — logistics:** appointments · suggested prenatal schedule · calendar (.ics) export

Everything runs on-device: no accounts, no server, no analytics.

## Install on your iPhone

Little One installs straight from Safari — there's no App Store, no account, and nothing to sign up for.

1. Open the app's web address in **Safari** (it has to be Safari, not Chrome or Firefox — only Safari can add apps to the Home Screen on iOS).
2. Tap the **Share** button — the square with an arrow pointing up, at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**, then tap **Add** in the top right.

That's it. Little One now sits on your Home Screen with its own icon and opens full-screen, without the Safari address bar — just like an app from the App Store.

A couple of nice things that come with it:

- **It works offline.** Once it's installed, everything is stored on your phone. Open it on a plane, in a lift, or in a waiting room with no signal and it still works.
- **Every byte stays on the phone.** Your due date, your baby's nickname, your to-dos — none of it ever leaves the device. There's no server to send it to.

To remove it, touch and hold the icon and choose **Remove App**, the same as any other app.
