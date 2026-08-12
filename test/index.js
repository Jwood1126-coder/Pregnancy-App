/**
 * Aggregate suite entry point.
 *
 * `docs/PLAN.md` names `node --test test/` as validation gate 2, but the Node
 * shipped here (v22.22.2) treats a path argument as a *file* pattern rather
 * than a directory to walk: `node --test test/` resolves `test/` through the
 * module loader instead of scanning it. Resolving a directory finds its
 * `index.js`, so importing every suite from here makes the gate command work
 * exactly as the plan specifies.
 *
 * Both of these therefore run the same 4 suites:
 *
 * ```sh
 * node --test test/            # via this file
 * node --test "test/*.test.mjs"   # directly (what `npm test` runs)
 * ```
 *
 * (A bare `node --test` from the repo root discovers this file *and* the four
 * suites, so it reports every test twice — harmless, but prefer either command
 * above.)
 *
 * Keep this list in sync when adding a suite.
 */

import './weekMath.test.mjs';
import './scale.test.mjs';
import './units.test.mjs';
import './content.test.mjs';
