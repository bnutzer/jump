/**
 * Generates an SVG with 3 overlapping regular hexagons (point-up orientation)
 * and optionally renders PNG icons for Chrome Extension use.
 *
 * Vertex numbering (clockwise from top):
 *   1 = top, 2 = upper-right, 3 = lower-right,
 *   4 = bottom, 5 = lower-left, 6 = upper-left
 *
 * Placement:
 *   Hex 1: base
 *   Hex 2: vertex 1 on vertex 2 of Hex 1
 *   Hex 3: vertex 6 on vertex 5 of Hex 1 (vertex 1 on center of Hex 1)
 *
 * Dependencies:
 *   npm install opentype.js @resvg/resvg-js
 *   npm install -D @types/opentype.js
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

// ── Configuration ──────────────────────────────────────────────
const R = 120;
const OPACITY = 0.6;
const PADDING = 30;
const TRANSPARENT = true;
const OUTPUT_SVG = "hexagons.svg";

const FONT_FILE = "../public/fonts/Bungee-Regular.ttf";
const FONT_SIZE = 180;
const TEXT_STRING = "J!";
const TEXT_COLOR = "#333333";

const ICON_SIZES: Record<number, { content: number; total: number }> = {
  16: { content: 16, total: 16 },
  32: { content: 32, total: 32 },
  48: { content: 48, total: 48 },
  128: { content: 96, total: 128 },
};
const EXPORT_PNG = true;
const OUTPUT_DIR = "../public/img/";

const COMPENSATE_OPACITY = true;

const TARGET_COLORS = ["#79EFBF", "#79D8EF", "#79EFEF"];
const LABELS = ["Hex 1", "Hex 2", "Hex 3"];

// ── Color helpers ──────────────────────────────────────────────
function hexToRgb(h: string): [number, number, number] {
  const c = h.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [r, g, b]
      .map(clamp)
      .map((v) => v.toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
}

function compensate(targetHex: string, alpha: number): string {
  const [tr, tg, tb] = hexToRgb(targetHex);
  const bg = 255 * (1 - alpha);
  return rgbToHex(
    (tr - bg) / alpha,
    (tg - bg) / alpha,
    (tb - bg) / alpha
  );
}

// ── Compute fill colors ───────────────────────────────────────
const fillColors = COMPENSATE_OPACITY
  ? TARGET_COLORS.map((c) => {
      const fill = compensate(c, OPACITY);
      console.log(`  ${c} (target) → ${fill} (fill at α=${OPACITY})`);
      return fill;
    })
  : [...TARGET_COLORS];

// ── Geometry helpers ──────────────────────────────────────────
type Point = [number, number];

function hexVertices(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: 6 }, (_, i): Point => [
    cx + r * Math.cos(((-90 + 60 * i) * Math.PI) / 180),
    cy + r * Math.sin(((-90 + 60 * i) * Math.PI) / 180),
  ]);
}

function ptsStr(verts: Point[]): string {
  return verts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

// ── Compute centers ───────────────────────────────────────────
const cx1 = 0,
  cy1 = 0;
const cx2 = cx1 + (R * Math.sqrt(3)) / 2;
const cy2 = cy1 + R / 2;
const cx3 = cx1;
const cy3 = cy1 + R;

const centers: Point[] = [
  [cx1, cy1],
  [cx2, cy2],
  [cx3, cy3],
];

// ── Derive viewBox ────────────────────────────────────────────
const allPts = centers.flatMap(([cx, cy]) => hexVertices(cx, cy, R));
const minX = Math.min(...allPts.map(([x]) => x)) - PADDING;
const minY = Math.min(...allPts.map(([, y]) => y)) - PADDING;
const maxX = Math.max(...allPts.map(([x]) => x)) + PADDING;
const maxY = Math.max(...allPts.map(([, y]) => y)) + PADDING;
const vbW = maxX - minX;
const vbH = maxY - minY;

// ── Text position (centroid of hex centers) ───────────────────
const textX = centers.reduce((s, [x]) => s + x, 0) / 3;
const textY = centers.reduce((s, [, y]) => s + y, 0) / 3;

// ── Text to SVG paths ─────────────────────────────────────────
function textToSvgPaths(
  fontPath: string,
  text: string,
  fontSize: number,
  centerX: number,
  centerY: number
): string {
  const font = opentype.loadSync(fontPath);

  // opentype.js getPath() returns a path with SVG commands.
  // We use it per-glyph to get individual paths and bounding boxes.
  const glyphPaths: { x: number; path: opentype.Path }[] = [];
  let cursorX = 0;

  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(0, 0, fontSize);
    if (path.commands.length > 0) {
      glyphPaths.push({ x: cursorX, path });
    }
    const advance = (glyph.advanceWidth ?? 0) * (fontSize / font.unitsPerEm);
    cursorX += advance;
  }

  // Compute actual bounding box of all rendered glyphs
  let allMinX = Infinity,
    allMinY = Infinity,
    allMaxX = -Infinity,
    allMaxY = -Infinity;

  for (const { x, path } of glyphPaths) {
    const bb = path.getBoundingBox();
    allMinX = Math.min(allMinX, x + bb.x1);
    allMinY = Math.min(allMinY, bb.y1);
    allMaxX = Math.max(allMaxX, x + bb.x2);
    allMaxY = Math.max(allMaxY, bb.y2);
  }

  const renderedCenterX = (allMinX + allMaxX) / 2;
  const renderedCenterY = (allMinY + allMaxY) / 2;

  // Offset to center the rendered text on (centerX, centerY)
  const offsetX = centerX - renderedCenterX;
  const offsetY = centerY - renderedCenterY;

  // opentype.js paths are already in SVG coordinate space (y-down),
  // so we just need to translate.
  const elements = glyphPaths.map(({ x, path }) => {
    const tx = offsetX + x;
    const ty = offsetY;
    return (
      `    <path d="${path.toPathData(2)}"` +
      ` transform="translate(${tx.toFixed(2)},${ty.toFixed(2)})"` +
      ` fill="${TEXT_COLOR}"/>`
    );
  });

  const renderedW = allMaxX - allMinX;
  const renderedH = allMaxY - allMinY;
  console.log(
    `✔ Converted '${text}' to ${elements.length} glyph path(s)` +
      ` (${renderedW.toFixed(1)}×${renderedH.toFixed(1)} SVG units, bbox-centered)`
  );

  return elements.join("\n");
}

// ── Build text SVG ────────────────────────────────────────────
let textSvg: string;
if (existsSync(FONT_FILE)) {
  textSvg = textToSvgPaths(FONT_FILE, TEXT_STRING, FONT_SIZE, textX, textY);
} else {
  console.warn(`⚠ Font file ${FONT_FILE} not found — using <text> fallback`);
  textSvg =
    `    <text x="${textX.toFixed(1)}" y="${textY.toFixed(1)}"` +
    ` font-family="Bungee, sans-serif" font-size="${FONT_SIZE}"` +
    ` fill="${TEXT_COLOR}" text-anchor="middle"` +
    ` dominant-baseline="central">${TEXT_STRING}</text>`;
}

// ── Build SVG body ────────────────────────────────────────────
const VIEWBOX = `${minX.toFixed(1)} ${minY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`;

function buildSvgBody(): string {
  const lines: string[] = [""];

  if (!TRANSPARENT) {
    lines.push(
      `  <rect x="${minX}" y="${minY}" width="${vbW}" height="${vbH}" fill="white"/>`
    );
  }

  lines.push('  <g style="isolation: isolate;">');

  centers.forEach(([cx, cy], i) => {
    const verts = hexVertices(cx, cy, R);
    lines.push(
      `    <polygon points="${ptsStr(verts)}"` +
        ` fill="${fillColors[i]}"` +
        ` style="mix-blend-mode: multiply;"` +
        ` opacity="${OPACITY}"/>` +
        `  <!-- ${LABELS[i]} -->`
    );
  });

  lines.push("  </g>", "");
  lines.push("  <!-- Text as outlined paths — no font dependency -->");
  lines.push("  <g>", textSvg, "  </g>", "");

  return lines.join("\n");
}

const svgBody = buildSvgBody();

function makeSvg(viewbox: string, width: number, height: number): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg"` +
    ` viewBox="${viewbox}"` +
    ` width="${width}" height="${height}">` +
    svgBody +
    `</svg>`
  );
}

// ── Write standalone SVG ──────────────────────────────────────
const standaloneSvg = makeSvg(VIEWBOX, vbW, vbH);
writeFileSync(OUTPUT_SVG, standaloneSvg);
console.log(`\n✔ SVG written to ${OUTPUT_SVG}  (${vbW.toFixed(0)}×${vbH.toFixed(0)} px)`);
console.log(`  Background: ${TRANSPARENT ? "transparent" : "white"}`);

// ── PNG export via resvg ──────────────────────────────────────
if (EXPORT_PNG) {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [sizeLabel, spec] of Object.entries(ICON_SIZES)
    .map(([k, v]) => [Number(k), v] as [number, typeof v])
    .sort(([a], [b]) => a - b)) {
    const { content: contentPx, total: totalPx } = spec;
    const border = (totalPx - contentPx) / 2;

    let svgString: string;

    if (border > 0) {
      const inner = makeSvg(VIEWBOX, contentPx, contentPx);
      svgString =
        `<svg xmlns="http://www.w3.org/2000/svg"` +
        ` width="${totalPx}" height="${totalPx}"` +
        ` viewBox="0 0 ${totalPx} ${totalPx}">` +
        `<g transform="translate(${border},${border})">` +
        inner +
        `</g></svg>`;
    } else {
      svgString = makeSvg(VIEWBOX, totalPx, totalPx);
    }

    const resvg = new Resvg(svgString, {
      fitTo: { mode: "width", value: totalPx },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const outPath = join(OUTPUT_DIR, `icon-${sizeLabel}.png`);
    writeFileSync(outPath, pngBuffer);

    let desc = `${contentPx}px content`;
    if (border > 0) desc += ` + ${border}px border`;
    console.log(`  ✔ ${outPath}  (${totalPx}×${totalPx}, ${desc})`);
  }

  console.log(`\n✔ All PNGs written to ${OUTPUT_DIR}/`);
}
