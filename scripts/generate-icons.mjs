/**
 * Little One — icon generator.
 *
 * Renders the app icon (sage field, centered off-white heart) at every size the
 * PWA and iOS need, and writes each one as a PNG using a PNG encoder written
 * from scratch on top of `node:zlib`. There are no dependencies here and there
 * is no image library: a PNG is a signature, an IHDR chunk, one deflated IDAT
 * chunk of filter-0 RGBA scanlines, and an IEND chunk, with a CRC32 on each.
 *
 * Run: `node scripts/generate-icons.mjs`  (or `npm run icons`)
 *
 * The heart is not a traced path — it is the classic implicit curve
 *   (x² + y² − 1)³ − x²·y³ ≤ 0
 * evaluated per sub-pixel, so it stays mathematically exact at every size
 * instead of resampling one master bitmap. Edges are smoothed by 4x4
 * supersampling: 16 samples per output pixel, and the coverage fraction blends
 * the heart colour against the background.
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(HERE, '..', 'app', 'icons');

/** @typedef {{ r: number, g: number, b: number }} RGB */

/** Sage accent — the icon background. Matches `--accent` in app.css. @type {RGB} */
const SAGE = { r: 0x6f, g: 0x7d, b: 0x5c };

/** Off-white — the heart. Matches `--bg` in app.css. @type {RGB} */
const OFF_WHITE = { r: 0xfa, g: 0xf7, b: 0xf2 };

/** Samples per pixel axis; 4 means 16 coverage samples per output pixel. */
const SUPERSAMPLE = 4;

/**
 * Fraction of the icon's edge spanned by the heart's bounding box on a
 * full-bleed icon. Roughly the proportion Apple and Google house icons use —
 * enough breathing room that the mark reads at 40px on a home screen.
 */
const HEART_SPAN = 0.62;

/**
 * Maskable icons may be cropped to a circle inscribed in the middle 80%, so
 * everything that must survive is scaled into that safe zone.
 */
const SAFE_ZONE = 0.8;

/* ------------------------------------------------------------------ *
 * PNG encoding
 * ------------------------------------------------------------------ */

/** The 8 bytes that begin every PNG file. */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Lookup table for the CRC32 variant PNG uses (IEEE 802.3, reflected,
 * polynomial 0xEDB88320).
 * @type {Uint32Array}
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/**
 * CRC32 over a byte range, as specified in the PNG spec (Annex D).
 *
 * @param {Buffer} bytes Data to checksum.
 * @returns {number} Unsigned 32-bit CRC.
 */
export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Wrap payload bytes in a PNG chunk: length, 4-character type, data, CRC over
 * type+data.
 *
 * @param {string} type Four ASCII characters, e.g. `'IHDR'`.
 * @param {Buffer} data Chunk payload (may be empty).
 * @returns {Buffer} The complete chunk.
 */
export function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([length, body, crc]);
}

/**
 * Encode 8-bit RGBA pixels as a PNG.
 *
 * Every scanline is prefixed with filter type 0 (None) — the simplest legal
 * choice, and with deflate on top the size cost is negligible at these
 * dimensions.
 *
 * @param {number} width Image width in pixels.
 * @param {number} height Image height in pixels.
 * @param {Buffer} rgba `width * height * 4` bytes, row-major, non-premultiplied.
 * @returns {Buffer} A complete PNG file.
 */
export function encodePNG(width, height, rgba) {
  const expected = width * height * 4;
  if (rgba.length !== expected) {
    throw new Error(`expected ${expected} RGBA bytes for ${width}x${height}, got ${rgba.length}`);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type 6 = truecolour with alpha
  ihdr[10] = 0; // compression method: deflate
  ihdr[11] = 0; // filter method: adaptive
  ihdr[12] = 0; // interlace method: none

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type 0 (None)
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------------ *
 * The heart
 * ------------------------------------------------------------------ */

/**
 * The implicit heart test from the plan: a point is inside when
 * `(x² + y² − 1)³ − x²·y³ ≤ 0`. Coordinates are the curve's own units, with
 * +y pointing up, so the cusp sits at the bottom.
 *
 * @param {number} x Horizontal coordinate.
 * @param {number} y Vertical coordinate, positive up.
 * @returns {boolean} True when the point lies on or inside the curve.
 */
export function insideHeart(x, y) {
  const t = x * x + y * y - 1;
  return t * t * t - x * x * y * y * y <= 0;
}

/**
 * Measure the heart's bounding box numerically rather than hard-coding
 * constants, so the mark is exactly centred whatever the curve actually does.
 *
 * @param {number} [steps] Grid resolution per axis across [-1.5, 1.5].
 * @returns {{ minX: number, maxX: number, minY: number, maxY: number }} Bounds.
 */
export function heartBounds(steps = 2000) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i <= steps; i += 1) {
    const x = -1.5 + (3 * i) / steps;
    for (let j = 0; j <= steps; j += 1) {
      const y = -1.5 + (3 * j) / steps;
      if (!insideHeart(x, y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Render one icon: a solid background with the heart centred on top, edges
 * antialiased by supersampled coverage.
 *
 * @param {object} options Render options.
 * @param {number} options.size Edge length in pixels (icons are square).
 * @param {number} options.span Fraction of the edge spanned by the heart's
 *   bounding box.
 * @param {RGB} [options.background] Field colour.
 * @param {RGB} [options.foreground] Heart colour.
 * @param {{ minX: number, maxX: number, minY: number, maxY: number }} options.bounds
 *   Heart bounds from {@link heartBounds}.
 * @returns {Buffer} `size * size * 4` opaque RGBA bytes.
 */
export function renderIcon({ size, span, background = SAGE, foreground = OFF_WHITE, bounds }) {
  const rgba = Buffer.alloc(size * size * 4);

  const heartWidth = bounds.maxX - bounds.minX;
  const heartHeight = bounds.maxY - bounds.minY;
  const centreX = (bounds.minX + bounds.maxX) / 2;
  const centreY = (bounds.minY + bounds.maxY) / 2;

  // Pixels per heart unit, sized so the longer axis of the heart fills `span`.
  const scale = (size * span) / Math.max(heartWidth, heartHeight);
  const half = size / 2;

  const samples = SUPERSAMPLE * SUPERSAMPLE;
  const step = 1 / SUPERSAMPLE;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let hits = 0;

      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        // Image y grows downward; the curve's y grows upward, hence the flip.
        const deviceY = py + (sy + 0.5) * step;
        const y = centreY - (deviceY - half) / scale;

        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const deviceX = px + (sx + 0.5) * step;
          const x = centreX + (deviceX - half) / scale;
          if (insideHeart(x, y)) hits += 1;
        }
      }

      const coverage = hits / samples;
      const offset = (py * size + px) * 4;
      rgba[offset] = Math.round(background.r + (foreground.r - background.r) * coverage);
      rgba[offset + 1] = Math.round(background.g + (foreground.g - background.g) * coverage);
      rgba[offset + 2] = Math.round(background.b + (foreground.b - background.b) * coverage);
      rgba[offset + 3] = 255; // always opaque: iOS renders transparency as black
    }
  }

  return rgba;
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

/**
 * The full icon set. `apple-touch-icon` is full-bleed on purpose — iOS applies
 * its own rounded-rectangle mask and does not honour transparency.
 *
 * @type {{ file: string, size: number, span: number, note: string }[]}
 */
const TARGETS = [
  { file: 'icon-192.png', size: 192, span: HEART_SPAN, note: 'manifest, any' },
  { file: 'icon-512.png', size: 512, span: HEART_SPAN, note: 'manifest, any' },
  {
    file: 'icon-maskable-512.png',
    size: 512,
    span: HEART_SPAN * SAFE_ZONE,
    note: 'manifest, maskable (heart inside the 80% safe zone)'
  },
  { file: 'apple-touch-icon.png', size: 180, span: HEART_SPAN, note: 'iOS home screen, full-bleed' }
];

/**
 * Render and write every icon.
 *
 * @returns {{ file: string, size: number, bytes: number }[]} What was written.
 */
export function generateIcons() {
  mkdirSync(ICON_DIR, { recursive: true });

  const bounds = heartBounds();
  const written = [];

  for (const target of TARGETS) {
    const rgba = renderIcon({ size: target.size, span: target.span, bounds });
    const png = encodePNG(target.size, target.size, rgba);
    const path = join(ICON_DIR, target.file);
    writeFileSync(path, png);
    written.push({ file: target.file, size: target.size, bytes: png.length });
    console.log(`  ${target.file.padEnd(24)} ${target.size}x${target.size}  ${String(png.length).padStart(7)} bytes  — ${target.note}`);
  }

  return written;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  console.log('Generating Little One icons…');
  generateIcons();
  console.log(`Done — wrote ${TARGETS.length} PNGs to app/icons/`);
}
