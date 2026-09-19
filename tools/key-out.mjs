/* Key a flat background out of an image WITHOUT touching whites inside the
   picture: flood-fill from the border only, so an unconnected white shirt
   or a white radish keeps its pixels.

   The ring of anti-aliased pixels around the artwork is matted rather than
   left opaque — otherwise the cut carries a halo of the old background.
   For each pixel bordering the filled region, alpha comes from how far the
   pixel is from the background colour, and the colour is un-premultiplied
   back out of it.

   node tools/key-out.mjs <in> <out> [tolerance] [ramp]   (needs web/node_modules) */
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../web/package.json', import.meta.url).pathname)('sharp');

const [, , inFile, outFile, tolArg, rampArg] = process.argv;
const TOL = Number(tolArg ?? 14);
const RAMP = Number(rampArg ?? 70);

const { data, info } = await sharp(inFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
if (C !== 4) throw new Error(`expected 4 channels, got ${C}`);
const at = (x, y) => (y * W + x) * 4;

const bg = [data[at(1, 1)], data[at(1, 1) + 1], data[at(1, 1) + 2]];
const diff = (i) => Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));

/* 1. flood-fill the background from every border pixel */
const isBg = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, 0, x, H - 1);
for (let y = 0; y < H; y++) stack.push(0, y, W - 1, y);
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const p = y * W + x;
  if (isBg[p] || diff(at(x, y)) > TOL) continue;
  isBg[p] = 1;
  stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}

/* 2. matte the ring: a kept pixel touching the fill gets partial alpha */
const ring = new Uint8Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (isBg[p]) continue;
    const touches =
      (x > 0 && isBg[p - 1]) || (x < W - 1 && isBg[p + 1]) || (y > 0 && isBg[p - W]) || (y < H - 1 && isBg[p + W]);
    if (touches) ring[p] = 1;
  }

let cleared = 0;
let matted = 0;
for (let p = 0; p < W * H; p++) {
  const i = p * 4;
  if (isBg[p]) {
    data[i + 3] = 0;
    cleared++;
    continue;
  }
  if (!ring[p]) continue;
  const a = Math.min(1, diff(i) / RAMP);
  if (a >= 0.995) continue;
  for (let k = 0; k < 3; k++) {
    const un = (data[i + k] - (1 - a) * bg[k]) / Math.max(a, 0.04);
    data[i + k] = Math.max(0, Math.min(255, Math.round(un)));
  }
  data[i + 3] = Math.round(a * 255);
  matted++;
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(outFile);
console.log(`bg ${bg.join(',')}  cleared ${((100 * cleared) / (W * H)).toFixed(1)}%  matted ${matted}px  -> ${outFile}`);
