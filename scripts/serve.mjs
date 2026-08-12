/**
 * Zero-dependency static server for `app/`.
 *
 * Usage: `node scripts/serve.mjs [port]` (default 4173).
 *
 * The MIME table matters: ES modules are rejected by browsers unless `.js` is
 * served as `text/javascript`, and the manifest needs `application/manifest+json`.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory served as the site root. */
const ROOT = fileURLToPath(new URL('../app/', import.meta.url));

/** Port from argv[2], falling back to 4173. */
const PORT = Number.parseInt(process.argv[2] ?? '', 10) || 4173;

/** Extension → Content-Type. */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

/**
 * Content-Type for a file path.
 * @param {string} filePath
 * @returns {string}
 */
function contentType(filePath) {
  return MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Map a request URL to a file inside ROOT, or `null` if it escapes the root.
 * @param {string} requestUrl
 * @returns {string|null}
 */
function resolvePath(requestUrl) {
  /** @type {string} */
  let pathname;
  try {
    /* A bare '%' (or any bad escape) makes decodeURIComponent throw URIError.
       Unhandled, that rejection takes the whole dev server down — one stray
       link would end the session. A malformed path is simply not a path. */
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null;
  }
  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  if (relative.split(sep).includes('..')) return null;
  return join(ROOT, relative);
}

/**
 * Read a file, transparently serving `index.html` for directories.
 * @param {string} filePath
 * @returns {Promise<{ body: Buffer, path: string }|null>}
 */
async function readTarget(filePath) {
  let target = filePath;
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, 'index.html');
  } catch {
    return null;
  }
  try {
    return { body: await readFile(target), path: target };
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  /* The handler is async, so anything it throws becomes an unhandled rejection
     — fatal in Node 22. One request must never be able to kill the server. */
  try {
    const filePath = resolvePath(req.url ?? '/');
    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const found = await readTarget(filePath);
    if (!found) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType(found.path),
      'Content-Length': found.body.length,
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/'
    });
    res.end(req.method === 'HEAD' ? undefined : found.body);
  } catch (err) {
    console.error(`serve: ${req.method} ${req.url} failed`, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Little One → http://127.0.0.1:${PORT}/  (serving ${ROOT})`);
});
