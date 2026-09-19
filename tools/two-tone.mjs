/* Turn a flat two-tone wordmark on white into a transparent PNG that
   works on a DARK ground: trim to the ink, take alpha from how far each
   pixel is from white (so the anti-aliased edge survives), and recolour
   by saturation — the saturated pixels keep the brand pink, the rest
   become the light ink the dark footer needs.

   node tools/two-tone.mjs <in> <out> [padPx]      (needs web/node_modules) */
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../web/package.json', import.meta.url).pathname)('sharp');

const [, , inFile, outFile, padArg] = process.argv;
const PAD = Number(padArg ?? 2);
const PINK = [226, 19, 110]; // --pink
const INK = [255, 255, 255]; // --on-night carries the alpha in CSS
const RAMP = 200; // distance from white at which a pixel is fully opaque

const { data, info } = await sharp(inFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const at = (x, y) => (y * W + x) * 4;
const dist = (i) => Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);

/* 1. trim to the ink */
let x0 = W, y0 = H, x1 = -1, y1 = -1;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = at(x, y);
    if (data[i + 3] > 8 && dist(i) > 18) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
x0 = Math.max(0, x0 - PAD); y0 = Math.max(0, y0 - PAD);
x1 = Math.min(W - 1, x1 + PAD); y1 = Math.min(H - 1, y1 + PAD);
const w = x1 - x0 + 1, h = y1 - y0 + 1;

/* 2. alpha from distance to white, colour from saturation */
const out = Buffer.alloc(w * h * 4);
let pinkPx = 0, inkPx = 0;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const i = at(x0 + x, y0 + y);
    const o = (y * w + x) * 4;
    const a = Math.min(1, dist(i) / RAMP) * (data[i + 3] / 255);
    /* Hue, not saturation: an anti-aliased pink edge is pink blended
       toward white, so it is desaturated but still clearly redder than
       it is green — (240,180,210) reads pink, a grey edge (150,160,150)
       does not. Saturation alone put a white fringe on every pink
       letter. */
    const isPink = data[i] - data[i + 1] > 18;
    const c = isPink ? PINK : INK;
    if (a > 0.5) (isPink ? pinkPx++ : inkPx++);
    out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2];
    out[o + 3] = Math.round(a * 255);
  }

await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(outFile);
console.log(`trimmed ${W}x${H} -> ${w}x${h}   pink ${pinkPx}px, ink ${inkPx}px   -> ${outFile}`);
