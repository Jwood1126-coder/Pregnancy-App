/**
 * Demo screenshot harness for "Little One".
 *
 * Zero-dependency (`node:child_process`, `node:http`, `node:fs`): starts
 * `scripts/serve.mjs` on a local port, polls it until it accepts connections,
 * drives `/opt/pw-browsers/chromium` headless once per shot in `docs/PLAN.md`
 * § Demo spec, then stops the server. No npm, no network egress beyond
 * 127.0.0.1.
 *
 * Usage: `node scripts/screenshot.mjs [outDir] [port]`
 *   outDir  Directory screenshots are written to (created if missing).
 *           Defaults to `<repoRoot>/screens`.
 *   port    Port for the throwaway static server. Defaults to 4173.
 *
 * Exit code is nonzero if the server never became ready, or if any shot's
 * PNG failed to appear / came back implausibly small (a cheap blank-page
 * smoke test — the real check is a human or agent opening each PNG).
 */

import { spawn, spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { toISODate } from '../app/js/lib/weekMath.js';

/** Repo root, resolved from this file's location. */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Headless Chromium binary (Playwright's download cache, no `npx`). */
const CHROMIUM = '/opt/pw-browsers/chromium';

/** Output directory for PNGs; overridable via argv[2]. */
const OUT_DIR = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, 'screens'));

/** Static-server port; overridable via argv[3]. */
const PORT = Number.parseInt(process.argv[3] ?? '', 10) || 4173;

const BASE_URL = `http://127.0.0.1:${PORT}`;

/** Below this many bytes a PNG at this window size is almost certainly blank. */
const MIN_PLAUSIBLE_BYTES = 3000;

/**
 * Due date for the demo: exactly 158 days from today, which is 17w + 3d
 * pregnant (280 − 158 = 122 = 17×7 + 3). Computed at runtime so the demo
 * always shows "today" correctly, using local-midnight arithmetic (mirrors
 * `app/js/lib/weekMath.js`'s convention) so there's no UTC-boundary drift.
 * @returns {string} `YYYY-MM-DD`
 */
function demoDueDate() {
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 158);
  return toISODate(due);
}

const DUE = demoDueDate();

/** @typedef {{ file: string, urlPath: string }} Shot */

/** Shots required by `docs/PLAN.md` § Demo spec, in capture order. */
const SHOTS = /** @type {Shot[]} */ ([
  { file: 'welcome.png', urlPath: '/?reset=1' },
  { file: 'today.png', urlPath: `/?due=${DUE}` },
  { file: 'size-week17.png', urlPath: `/?due=${DUE}&tab=size` },
  { file: 'size-week28.png', urlPath: `/?due=${DUE}&tab=size&week=28` },
  { file: 'size-week40.png', urlPath: `/?due=${DUE}&tab=size&week=40` }
]);

/**
 * Poll `BASE_URL/` until it answers, or reject after `timeoutMs`.
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
function waitForServer(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(BASE_URL + '/', { timeout: 2000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error(`serve.mjs did not answer ${BASE_URL}/ within ${timeoutMs}ms`));
          return;
        }
        setTimeout(attempt, 100);
      });
    };
    attempt();
  });
}

/**
 * Start `scripts/serve.mjs` as a detached-from-stdio child, buffering its
 * output so it can be printed for diagnosis if something goes wrong.
 * @returns {{ child: import('node:child_process').ChildProcess, output: () => string }}
 */
function startServer() {
  const child = spawn(process.execPath, ['scripts/serve.mjs', String(PORT)], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let buf = '';
  child.stdout.on('data', (d) => (buf += d.toString()));
  child.stderr.on('data', (d) => (buf += d.toString()));
  child.on('error', (err) => (buf += `\n[spawn error] ${err.message}`));
  return { child, output: () => buf };
}

/**
 * Capture one shot with headless Chromium, using the exact flags from
 * `docs/PLAN.md` § Demo spec (window clamps to 500px min width in this
 * Chromium build; shooting at 500×900 keeps layout and pixels in sync — see
 * the plan's "Verified environment quirk" note).
 * @param {Shot} shot
 * @returns {{ ok: boolean, outPath: string, url: string, stderr: string, sizeBytes: number }}
 */
function captureShot(shot) {
  const outPath = path.join(OUT_DIR, shot.file);
  const url = BASE_URL + shot.urlPath;
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=500,900',
    '--force-device-scale-factor=2',
    '--virtual-time-budget=5000',
    `--screenshot=${outPath}`,
    url
  ];
  const result = spawnSync(CHROMIUM, args, { encoding: 'utf8', timeout: 30000 });
  const stderr = [result.stdout, result.stderr].filter(Boolean).join('\n');
  const sizeBytes = fileSizeOrZero(outPath);
  const ok = result.status === 0 && sizeBytes >= MIN_PLAUSIBLE_BYTES;
  return { ok, outPath, url, stderr, sizeBytes };
}

/**
 * File size in bytes, or 0 if the file doesn't exist (never throws) —
 * Chromium exiting nonzero can mean no PNG was written at all.
 * @param {string} p
 * @returns {number}
 */
function fileSizeOrZero(p) {
  try {
    return statSync(p).size;
  } catch {
    return 0;
  }
}

/**
 * Stop the server, giving it a moment to exit cleanly before forcing it.
 * @param {import('node:child_process').ChildProcess} child
 * @returns {Promise<void>}
 */
function stopServer(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    child.once('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      resolve();
    }, 3000);
  });
}

/**
 * Entry point: serve, wait, shoot every demo shot, report, stop serving.
 * @returns {Promise<void>}
 */
async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`Little One demo shots → ${OUT_DIR}`);
  console.log(`due date (today + 158d): ${DUE}`);

  const { child, output } = startServer();
  /** @type {Array<{ shot: Shot, result: ReturnType<typeof captureShot> }>} */
  const results = [];
  let failed = false;

  try {
    await waitForServer();
    for (const shot of SHOTS) {
      const result = captureShot(shot);
      results.push({ shot, result });
      const status = result.ok ? 'ok' : 'FAIL';
      console.log(`  [${status}] ${shot.file}  (${result.sizeBytes}B)  ${result.url}`);
      if (!result.ok) {
        failed = true;
        console.log(`    chromium output:\n${indent(result.stderr)}`);
      }
    }
  } catch (err) {
    failed = true;
    console.error(`screenshot.mjs: ${/** @type {Error} */ (err).message}`);
    console.error(`server output so far:\n${indent(output())}`);
  } finally {
    await stopServer(child);
  }

  if (failed) {
    console.error('screenshot.mjs: one or more shots failed — see above.');
    process.exitCode = 1;
    return;
  }

  console.log('screenshot.mjs: all shots captured.');
}

/**
 * Indent a multi-line string for nested log output.
 * @param {string} s
 * @returns {string}
 */
function indent(s) {
  return s
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');
}

main();
