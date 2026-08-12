/**
 * Minimal zero-dependency Chrome DevTools Protocol driver.
 *
 * Everything here is node built-ins only (`node:net`, `node:http`,
 * `node:crypto`, `node:child_process`, `node:fs`) — no packages, no network
 * egress beyond 127.0.0.1. It exists because the visual-QA harness needs a
 * *true* 390×844 iPhone viewport and scripted interaction (clicks, scrolls,
 * dark mode), which `--screenshot=` on the Chromium CLI cannot give us: that
 * path clamps the window to a 500 px minimum width and silently left-crops the
 * page (see `docs/PLAN.md` § Demo spec, "Verified environment quirk").
 *
 * Three layers, bottom-up:
 *
 * 1. `WebSocketClient` — an RFC 6455 client good enough for CDP: HTTP/1.1
 *    Upgrade over `node:http`, masked client frames (mandatory for clients),
 *    text frames out, defensive reassembly of fragmented/continuation frames
 *    in, ping→pong, close handshake. It is not a general-purpose WS library:
 *    it speaks only what a DevTools endpoint speaks.
 * 2. `CDPConnection` — JSON request/response correlation by `id`, plus event
 *    dispatch.
 * 3. `launch()` → a `Page` of task-shaped helpers: `navigate`, `evaluate`,
 *    `setDarkMode`, `setViewport`, `screenshot`, `waitForQuiet`.
 *
 * Usage:
 * ```js
 * const browser = await launch();
 * const page = browser.page;
 * await page.setViewport();
 * await page.navigate('http://127.0.0.1:4173/');
 * await page.screenshot('/tmp/shot.png');
 * await browser.close();
 * ```
 */

import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** Headless Chromium shipped with this image (no Playwright package involved). */
export const CHROMIUM = '/opt/pw-browsers/chromium';

/** RFC 6455 §1.3 handshake GUID. */
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/** Opcodes we care about. */
const OP = { CONT: 0x0, TEXT: 0x1, BINARY: 0x2, CLOSE: 0x8, PING: 0x9, PONG: 0xa };

/* ---------------------------------------------------------------------------
   RFC 6455 client
   --------------------------------------------------------------------------- */

/**
 * A tiny WebSocket client (client role: every frame we send is masked).
 *
 * Incoming data is parsed frame-at-a-time with exactly one buffer concat per
 * frame: the header is peeked byte-wise across the queued chunks, and the
 * chunks are only joined once the whole frame has arrived. A naive
 * `Buffer.concat` per `data` event is quadratic, which matters here — a
 * 780×1688 screenshot arrives base64-encoded in hundreds of chunks.
 */
class WebSocketClient {
  /**
   * @param {import('node:net').Socket} socket A socket already upgraded to WS.
   */
  constructor(socket) {
    /** @type {import('node:net').Socket} */
    this.socket = socket;
    /** @type {Buffer[]} Unparsed bytes, oldest first. */
    this.chunks = [];
    /** @type {number} Total bytes queued in `chunks`. */
    this.queued = 0;
    /** @type {number|null} Total byte length of the frame being awaited. */
    this.need = null;
    /** @type {{ opcode: number, parts: Buffer[] }|null} In-flight fragmented message. */
    this.fragment = null;
    /** @type {(msg: string) => void} */
    this.onMessage = () => {};
    /** @type {(err: Error) => void} */
    this.onClose = () => {};
    /** @type {boolean} */
    this.closed = false;

    socket.setNoDelay(true);
    socket.on('data', (chunk) => this._ingest(chunk));
    socket.on('error', (err) => this._die(err));
    socket.on('close', () => this._die(new Error('websocket socket closed')));
  }

  /**
   * Open a WebSocket to `url` (`ws://host:port/path`) via an HTTP upgrade.
   * @param {string} url
   * @param {number} [timeoutMs]
   * @returns {Promise<WebSocketClient>}
   */
  static connect(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const target = new URL(url);
      const key = randomBytes(16).toString('base64');
      const expected = createHash('sha1').update(key + WS_GUID).digest('base64');

      const req = http.request({
        host: target.hostname,
        port: target.port || 80,
        path: target.pathname + target.search,
        method: 'GET',
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Key': key,
          'Sec-WebSocket-Version': '13'
        }
      });

      const timer = setTimeout(() => {
        req.destroy();
        reject(new Error(`websocket handshake to ${url} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      req.on('upgrade', (res, socket, head) => {
        clearTimeout(timer);
        const accept = res.headers['sec-websocket-accept'];
        if (accept !== expected) {
          socket.destroy();
          reject(new Error(`websocket handshake rejected (accept mismatch: ${accept})`));
          return;
        }
        const ws = new WebSocketClient(socket);
        /* Bytes DevTools sent us in the same TCP segment as the 101 response. */
        if (head && head.length > 0) ws._ingest(head);
        resolve(ws);
      });

      req.on('response', (res) => {
        clearTimeout(timer);
        reject(new Error(`websocket handshake got HTTP ${res.statusCode}, expected 101`));
      });

      req.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      req.end();
    });
  }

  /**
   * Send one masked text frame. CDP messages are always text and always small
   * enough to send unfragmented.
   * @param {string} text
   * @returns {void}
   */
  send(text) {
    if (this.closed) throw new Error('websocket is closed');
    const payload = Buffer.from(text, 'utf8');
    const mask = randomBytes(4);
    const len = payload.length;

    /** @type {Buffer} */
    let header;
    if (len < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | len;
    } else if (len < 0x10000) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      /* Payload is far below 2^32; the high word is always zero. */
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(len, 6);
    }
    header[0] = 0x80 | OP.TEXT; // FIN + text

    const masked = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i += 1) masked[i] = payload[i] ^ mask[i & 3];

    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  /**
   * Send a close frame and drop the socket.
   * @returns {void}
   */
  close() {
    if (this.closed) return;
    this.closed = true;
    try {
      /* Empty masked close frame. */
      this.socket.write(Buffer.concat([Buffer.from([0x88, 0x80]), randomBytes(4)]));
    } catch {
      /* already gone */
    }
    this.socket.destroy();
  }

  /**
   * Byte `i` of the queued stream without joining the chunks.
   * @param {number} i
   * @returns {number}
   */
  _byteAt(i) {
    let offset = i;
    for (const chunk of this.chunks) {
      if (offset < chunk.length) return chunk[offset];
      offset -= chunk.length;
    }
    throw new Error('byte out of range');
  }

  /**
   * Queue bytes and drain every complete frame they finish.
   * @param {Buffer} chunk
   * @returns {void}
   */
  _ingest(chunk) {
    this.chunks.push(chunk);
    this.queued += chunk.length;
    try {
      this._drain();
    } catch (err) {
      this._die(/** @type {Error} */ (err));
    }
  }

  /**
   * Parse as many whole frames as the queue holds.
   * @returns {void}
   */
  _drain() {
    for (;;) {
      if (this.need === null) {
        if (this.queued < 2) return;
        const b1 = this._byteAt(1);
        const masked = (b1 & 0x80) !== 0;
        const short = b1 & 0x7f;
        let headerLen = 2;
        let payloadLen = short;
        if (short === 126) {
          if (this.queued < 4) return;
          headerLen = 4;
          payloadLen = (this._byteAt(2) << 8) | this._byteAt(3);
        } else if (short === 127) {
          if (this.queued < 10) return;
          headerLen = 10;
          /* High 32 bits must be zero for any payload we can hold in memory. */
          const high =
            this._byteAt(2) * 0x1000000 +
            (this._byteAt(3) << 16) +
            (this._byteAt(4) << 8) +
            this._byteAt(5);
          if (high !== 0) throw new Error('websocket frame larger than 4 GiB');
          payloadLen =
            this._byteAt(6) * 0x1000000 +
            (this._byteAt(7) << 16) +
            (this._byteAt(8) << 8) +
            this._byteAt(9);
        }
        /* A server MUST NOT mask, but tolerate it rather than corrupting data. */
        this.need = headerLen + (masked ? 4 : 0) + payloadLen;
      }

      if (this.queued < this.need) return;

      const joined = this.chunks.length === 1 ? this.chunks[0] : Buffer.concat(this.chunks, this.queued);
      const frame = joined.subarray(0, this.need);
      const rest = joined.subarray(this.need);
      this.chunks = rest.length > 0 ? [rest] : [];
      this.queued = rest.length;
      this.need = null;
      this._handleFrame(frame);
    }
  }

  /**
   * Interpret one complete frame.
   * @param {Buffer} frame
   * @returns {void}
   */
  _handleFrame(frame) {
    const fin = (frame[0] & 0x80) !== 0;
    const opcode = frame[0] & 0x0f;
    const masked = (frame[1] & 0x80) !== 0;
    const short = frame[1] & 0x7f;
    let offset = 2;
    if (short === 126) offset = 4;
    else if (short === 127) offset = 10;

    /** @type {Buffer} */
    let payload;
    if (masked) {
      const mask = frame.subarray(offset, offset + 4);
      const raw = frame.subarray(offset + 4);
      payload = Buffer.allocUnsafe(raw.length);
      for (let i = 0; i < raw.length; i += 1) payload[i] = raw[i] ^ mask[i & 3];
    } else {
      payload = frame.subarray(offset);
    }

    if (opcode === OP.PING) {
      this._pong(payload);
      return;
    }
    if (opcode === OP.PONG) return;
    if (opcode === OP.CLOSE) {
      this.close();
      this._die(new Error('websocket closed by peer'));
      return;
    }

    if (opcode === OP.CONT) {
      if (!this.fragment) return; // stray continuation — ignore rather than crash
      this.fragment.parts.push(payload);
      if (!fin) return;
      const message = Buffer.concat(this.fragment.parts);
      const wasText = this.fragment.opcode === OP.TEXT;
      this.fragment = null;
      if (wasText) this.onMessage(message.toString('utf8'));
      return;
    }

    if (opcode === OP.TEXT || opcode === OP.BINARY) {
      if (!fin) {
        this.fragment = { opcode, parts: [payload] };
        return;
      }
      if (opcode === OP.TEXT) this.onMessage(payload.toString('utf8'));
    }
  }

  /**
   * Answer a ping with a masked pong carrying the same body.
   * @param {Buffer} body
   * @returns {void}
   */
  _pong(body) {
    if (this.closed) return;
    const mask = randomBytes(4);
    const masked = Buffer.allocUnsafe(body.length);
    for (let i = 0; i < body.length; i += 1) masked[i] = body[i] ^ mask[i & 3];
    const header = Buffer.from([0x80 | OP.PONG, 0x80 | body.length]);
    try {
      this.socket.write(Buffer.concat([header, mask, masked]));
    } catch {
      /* socket already gone */
    }
  }

  /**
   * Mark the connection dead exactly once and notify the owner.
   * @param {Error} err
   * @returns {void}
   */
  _die(err) {
    if (this.closed) return;
    this.closed = true;
    try {
      this.socket.destroy();
    } catch {
      /* ignore */
    }
    this.onClose(err);
  }
}

/* ---------------------------------------------------------------------------
   CDP connection
   --------------------------------------------------------------------------- */

/** Request/response + event plumbing over one DevTools WebSocket. */
class CDPConnection {
  /** @param {WebSocketClient} ws */
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    /** @type {Map<number, { resolve: (v: any) => void, reject: (e: Error) => void, method: string }>} */
    this.pending = new Map();
    /** @type {Map<string, Set<(params: any) => void>>} */
    this.listeners = new Map();

    ws.onMessage = (text) => this._onMessage(text);
    ws.onClose = (err) => {
      for (const [, entry] of this.pending) entry.reject(err);
      this.pending.clear();
    };
  }

  /**
   * Issue a CDP command.
   * @param {string} method e.g. `'Page.navigate'`.
   * @param {Object} [params]
   * @param {number} [timeoutMs]
   * @returns {Promise<any>} The command's `result`.
   */
  send(method, params = {}, timeoutMs = 30000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, {
        method,
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
      try {
        this.ws.send(payload);
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(/** @type {Error} */ (err));
      }
    });
  }

  /**
   * Subscribe to a CDP event.
   * @param {string} method e.g. `'Page.loadEventFired'`.
   * @param {(params: any) => void} fn
   * @returns {() => void} Unsubscribe.
   */
  on(method, fn) {
    let set = this.listeners.get(method);
    if (!set) {
      set = new Set();
      this.listeners.set(method, set);
    }
    set.add(fn);
    return () => set.delete(fn);
  }

  /**
   * Resolve on the next occurrence of an event, or reject on timeout.
   * @param {string} method
   * @param {number} [timeoutMs]
   * @returns {Promise<any>}
   */
  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const off = this.on(method, (params) => {
        clearTimeout(timer);
        off();
        resolve(params);
      });
      const timer = setTimeout(() => {
        off();
        reject(new Error(`CDP event ${method} did not arrive within ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Route one inbound JSON message.
   * @param {string} text
   * @returns {void}
   */
  _onMessage(text) {
    /** @type {any} */
    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }

    if (typeof msg.id === 'number') {
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      if (msg.error) {
        entry.reject(new Error(`CDP ${entry.method}: ${msg.error.message ?? JSON.stringify(msg.error)}`));
      } else {
        entry.resolve(msg.result ?? {});
      }
      return;
    }

    if (typeof msg.method === 'string') {
      const set = this.listeners.get(msg.method);
      if (!set) return;
      for (const fn of Array.from(set)) {
        try {
          fn(msg.params ?? {});
        } catch (err) {
          console.error(`cdp: listener for ${msg.method} threw`, err);
        }
      }
    }
  }
}

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */

/**
 * Ask the OS for a port nobody is using, then let it go. Racy in principle,
 * fine in practice for a single-process harness (and far better than guessing).
 * @returns {Promise<number>}
 */
export function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => (port ? resolve(port) : reject(new Error('could not find a free port'))));
    });
  });
}

/**
 * GET a JSON document over plain HTTP.
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<any>}
 */
function getJSON(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      /** @type {Buffer[]} */
      const parts = [];
      res.on('data', (d) => parts.push(d));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(parts).toString('utf8')));
        } catch (err) {
          reject(/** @type {Error} */ (err));
        }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

/**
 * Sleep.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll `/json/version` until DevTools answers.
 * @param {number} port
 * @param {number} [timeoutMs]
 * @returns {Promise<any>}
 */
async function waitForDevTools(port, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  /** @type {Error|null} */
  let last = null;
  while (Date.now() < deadline) {
    try {
      return await getJSON(`http://127.0.0.1:${port}/json/version`);
    } catch (err) {
      last = /** @type {Error} */ (err);
      await sleep(100);
    }
  }
  throw new Error(`DevTools on port ${port} never answered: ${last ? last.message : 'unknown'}`);
}

/**
 * Find the page target's WebSocket URL (retrying: the first tab can appear a
 * beat after `/json/version` starts answering).
 * @param {number} port
 * @param {number} [timeoutMs]
 * @returns {Promise<string>}
 */
async function pageTargetURL(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const list = await getJSON(`http://127.0.0.1:${port}/json/list`);
    const page = Array.isArray(list)
      ? list.find((t) => t && t.type === 'page' && typeof t.webSocketDebuggerUrl === 'string')
      : null;
    if (page) return page.webSocketDebuggerUrl;
    if (Date.now() > deadline) throw new Error('no page target appeared in /json/list');
    await sleep(100);
  }
}

/* ---------------------------------------------------------------------------
   Page
   --------------------------------------------------------------------------- */

/** The scripted-browser surface the capture harness actually uses. */
export class Page {
  /** @param {CDPConnection} conn */
  constructor(conn) {
    this.conn = conn;
    /** @type {string[]} Console errors + page exceptions, newest last. */
    this.pageErrors = [];
  }

  /**
   * Enable the domains we depend on and start collecting page errors.
   * @returns {Promise<void>}
   */
  async init() {
    await this.conn.send('Page.enable');
    await this.conn.send('Runtime.enable');
    await this.conn.send('Log.enable').catch(() => {});
    this.conn.on('Runtime.exceptionThrown', (params) => {
      const d = params?.exceptionDetails;
      const text = d?.exception?.description ?? d?.text ?? 'unknown exception';
      this.pageErrors.push(String(text).split('\n')[0]);
    });
    this.conn.on('Log.entryAdded', (params) => {
      const entry = params?.entry;
      if (entry && entry.level === 'error') this.pageErrors.push(String(entry.text));
    });
  }

  /** @returns {void} Drop collected page errors (call before each shot). */
  clearErrors() {
    this.pageErrors = [];
  }

  /**
   * Navigate and wait for load + a quiet frame.
   * @param {string} url
   * @returns {Promise<void>}
   */
  async navigate(url) {
    const loaded = this.conn.once('Page.loadEventFired', 20000).catch(() => null);
    const result = await this.conn.send('Page.navigate', { url });
    if (result && result.errorText) throw new Error(`navigate to ${url} failed: ${result.errorText}`);
    await loaded;
    await this.waitForQuiet();
  }

  /**
   * Evaluate an expression in the page and return its value.
   *
   * `awaitPromise` is on, so an expression that evaluates to a promise resolves
   * before this returns — which is what makes `waitForQuiet` and click-then-
   * settle helpers possible.
   * @param {string} expression
   * @param {number} [timeoutMs]
   * @returns {Promise<any>}
   */
  async evaluate(expression, timeoutMs = 30000) {
    const result = await this.conn.send(
      'Runtime.evaluate',
      {
        expression,
        returnByValue: true,
        awaitPromise: true,
        userGesture: true
      },
      timeoutMs
    );
    if (result.exceptionDetails) {
      const d = result.exceptionDetails;
      const text = d.exception?.description ?? d.text ?? 'evaluation failed';
      throw new Error(`evaluate failed: ${String(text).split('\n')[0]}`);
    }
    return result.result?.value;
  }

  /**
   * Emulate `prefers-color-scheme`.
   * @param {boolean} dark
   * @returns {Promise<void>}
   */
  async setDarkMode(dark) {
    await this.conn.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]
    });
  }

  /**
   * Emulate an iPhone-class viewport (the app is iPhone-first, and the CLI
   * screenshot path cannot go narrower than 500 px).
   * @param {{ width?: number, height?: number, deviceScaleFactor?: number, mobile?: boolean }} [options]
   * @returns {Promise<void>}
   */
  async setViewport(options = {}) {
    const width = options.width ?? 390;
    const height = options.height ?? 844;
    const deviceScaleFactor = options.deviceScaleFactor ?? 2;
    const mobile = options.mobile ?? true;
    await this.conn.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile,
      screenWidth: width,
      screenHeight: height,
      screenOrientation: { type: 'portraitPrimary', angle: 0 }
    });
    await this.conn.send('Emulation.setTouchEmulationEnabled', {
      enabled: mobile,
      maxTouchPoints: 5
    }).catch(() => {});
  }

  /**
   * Let layout, transitions and lazy work settle: two animation frames (the
   * first schedules, the second observes the result of style/layout the first
   * kicked off) plus a short delay for CSS transitions like the settings sheet.
   * @param {number} [delayMs]
   * @returns {Promise<void>}
   */
  async waitForQuiet(delayMs = 180) {
    await this.evaluate(
      `new Promise((resolve) => {
         requestAnimationFrame(() => requestAnimationFrame(() => {
           setTimeout(() => resolve(true), ${Math.max(0, Math.round(delayMs))});
         }));
       })`
    );
  }

  /**
   * Capture the viewport to a PNG file.
   * @param {string} filePath
   * @param {{ captureBeyondViewport?: boolean }} [options]
   * @returns {Promise<number>} Bytes written.
   */
  async screenshot(filePath, options = {}) {
    const result = await this.conn.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: options.captureBeyondViewport === true,
      fromSurface: true
    });
    const buf = Buffer.from(result.data, 'base64');
    await writeFile(filePath, buf);
    return buf.length;
  }
}

/* ---------------------------------------------------------------------------
   launch
   --------------------------------------------------------------------------- */

/**
 * @typedef {Object} Browser
 * @property {Page} page The first (and only) page target.
 * @property {number} port DevTools port.
 * @property {() => Promise<void>} close Stop Chromium and clean the profile up.
 */

/**
 * Launch headless Chromium with a throwaway profile and attach to its page.
 *
 * A fresh `--user-data-dir` per launch is load-bearing for this harness: the
 * app registers a service worker, and a persistent profile would let one
 * round's cached CSS leak into the next round's screenshots.
 *
 * @param {{ port?: number, extraArgs?: string[], binary?: string }} [options]
 * @returns {Promise<Browser>}
 */
export async function launch(options = {}) {
  const port = options.port ?? (await freePort());
  const binary = options.binary ?? CHROMIUM;
  const profileDir = mkdtempSync(path.join(tmpdir(), 'cdp-profile-'));

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--hide-scrollbars',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--force-color-profile=srgb',
    '--mute-audio',
    ...(options.extraArgs ?? []),
    'about:blank'
  ];

  const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stdout.on('data', (d) => (log += d.toString()));
  child.stderr.on('data', (d) => (log += d.toString()));
  /** @type {Error|null} */
  let spawnError = null;
  child.on('error', (err) => (spawnError = err));

  /** @type {WebSocketClient|null} */
  let ws = null;

  /** @returns {Promise<void>} */
  const close = async () => {
    if (ws) ws.close();
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once('exit', resolve));
      child.kill('SIGTERM');
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      await exited;
      clearTimeout(timer);
    }
    try {
      rmSync(profileDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  };

  try {
    if (spawnError) throw spawnError;
    await waitForDevTools(port);
    const wsUrl = await pageTargetURL(port);
    ws = await WebSocketClient.connect(wsUrl);
    const conn = new CDPConnection(ws);
    const page = new Page(conn);
    await page.init();
    return { page, port, close };
  } catch (err) {
    await close();
    const detail = log.trim() ? `\nchromium output:\n${log.trim()}` : '';
    throw new Error(`launch failed: ${/** @type {Error} */ (err).message}${detail}`);
  }
}
