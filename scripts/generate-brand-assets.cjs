/**
 * Genera los PNG de la marca (icono de la app, variantes de iOS y Android, splash y favicon) a partir del
 * símbolo "Discos": tres barras redondeadas de altura creciente, dibujadas en una rejilla de 48 × 48.
 *
 * No usa dependencias: rasteriza las barras con suavizado y escribe el PNG con zlib.
 * Uso: node scripts/generate-brand-assets.cjs
 */
const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const OUT_DIR = path.join(__dirname, "..", "assets", "images");

/** Rejilla del símbolo y sus tres discos (x, y, ancho, alto); el radio es la mitad del ancho. */
const GRID = 48;
const DISCS = [
  { x: 7, y: 17, w: 8, h: 14 },
  { x: 19, y: 11, w: 9, h: 26 },
  { x: 32, y: 5, w: 10, h: 38 },
];

const INK = "#0e0f0c";
const BLACK = "#000000";
const WHITE = "#ffffff";
/** Del disco más bajo al más alto. */
const VOLT_SHADES = ["#5f7d1f", "#8fb52c", "#c6ff3d"];
const GRAY_SHADES = ["#8c9184", "#b8bcb0", "#d9dcd2"];

/** Muestras por lado dentro de cada píxel para suavizar los bordes. */
const SAMPLES = 4;

const hexToRgb = (hex) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

/** ¿El punto (en unidades de la rejilla) cae dentro del disco? Un disco es un rectángulo con extremos redondos. */
function isInsideDisc(disc, px, py) {
  const radius = disc.w / 2;
  if (px < disc.x || px > disc.x + disc.w || py < disc.y || py > disc.y + disc.h) return false;
  const centerX = disc.x + radius;
  const nearestY = Math.min(Math.max(py, disc.y + radius), disc.y + disc.h - radius);
  return (px - centerX) ** 2 + (py - nearestY) ** 2 <= radius ** 2;
}

/** Qué fracción del píxel cubre cada disco. */
function coverage(gridX, gridY, gridStep) {
  return DISCS.map((disc) => {
    let hits = 0;
    for (let sy = 0; sy < SAMPLES; sy += 1) {
      for (let sx = 0; sx < SAMPLES; sx += 1) {
        const px = gridX + ((sx + 0.5) / SAMPLES) * gridStep;
        const py = gridY + ((sy + 0.5) / SAMPLES) * gridStep;
        if (isInsideDisc(disc, px, py)) hits += 1;
      }
    }
    return hits / (SAMPLES * SAMPLES);
  });
}

/**
 * Dibuja el símbolo centrado. `glyphScale` es qué parte del lienzo ocupa la rejilla de 48;
 * `background` null deja el fondo transparente.
 */
function render({ size, glyphScale, background, shades }) {
  const pixels = Buffer.alloc(size * size * 4);
  const glyphSize = size * glyphScale;
  const offset = (size - glyphSize) / 2;
  const gridStep = GRID / glyphSize;
  const base = background ? [...hexToRgb(background), 255] : [0, 0, 0, 0];
  const colors = shades.map(hexToRgb);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let [r, g, b, a] = base;
      const covered = coverage((x - offset) * gridStep, (y - offset) * gridStep, gridStep);
      covered.forEach((alpha, index) => {
        if (alpha === 0) return;
        const [cr, cg, cb] = colors[index];
        const outAlpha = alpha + (a / 255) * (1 - alpha);
        r = (cr * alpha + r * (a / 255) * (1 - alpha)) / outAlpha;
        g = (cg * alpha + g * (a / 255) * (1 - alpha)) / outAlpha;
        b = (cb * alpha + b * (a / 255) * (1 - alpha)) / outAlpha;
        a = outAlpha * 255;
      });
      pixels.set([Math.round(r), Math.round(g), Math.round(b), Math.round(a)], (y * size + x) * 4);
    }
  }
  return pixels;
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function encodePng(pixels, size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 bits por canal, RGBA
  const rowLength = size * 4 + 1;
  const raw = Buffer.alloc(rowLength * size);
  for (let y = 0; y < size; y += 1) pixels.copy(raw, y * rowLength + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const ICON_SIZE = 1024;
/** En el icono el símbolo ocupa dos tercios, como en el mockup (119 de 180). */
const ICON_GLYPH = 0.66;
/** Android recorta el icono adaptable: lo importante debe caber en el círculo central (~61% del lienzo). */
const ADAPTIVE_GLYPH = 0.5;

const ASSETS = [
  { file: "icon.png", size: ICON_SIZE, glyphScale: ICON_GLYPH, background: INK, shades: VOLT_SHADES },
  // iOS, modo oscuro: fondo transparente, el sistema pone el suyo.
  { file: "ios-icon-dark.png", size: ICON_SIZE, glyphScale: ICON_GLYPH, background: null, shades: VOLT_SHADES },
  // iOS, modo tintado: escala de grises que el sistema tiñe.
  { file: "ios-icon-tinted.png", size: ICON_SIZE, glyphScale: ICON_GLYPH, background: BLACK, shades: GRAY_SHADES },
  { file: "android-icon-foreground.png", size: ICON_SIZE, glyphScale: ADAPTIVE_GLYPH, background: null, shades: VOLT_SHADES },
  { file: "android-icon-monochrome.png", size: ICON_SIZE, glyphScale: ADAPTIVE_GLYPH, background: null, shades: [WHITE, WHITE, WHITE] },
  // Splash: solo el símbolo; el color de fondo lo pone app.json.
  { file: "splash-icon.png", size: 512, glyphScale: 1, background: null, shades: VOLT_SHADES },
  { file: "favicon.png", size: 64, glyphScale: 0.72, background: INK, shades: VOLT_SHADES },
];

for (const asset of ASSETS) {
  const png = encodePng(render(asset), asset.size);
  fs.writeFileSync(path.join(OUT_DIR, asset.file), png);
  console.log(`${asset.file}  ${asset.size}×${asset.size}  ${(png.length / 1024).toFixed(1)} KB`);
}
