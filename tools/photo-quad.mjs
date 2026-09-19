import { createRequire } from 'node:module'; const sharp = createRequire('/Users/nahian/Projects/bkash-site/web/package.json')('sharp');
const src = process.argv[2];
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i+1], data[i+2]]; };
// screen = the pink header or the near-white body; skin and bezel fail both
const isScreen = ([r, g, b]) => (r > 180 && g < 100 && b > 60) || (r > 200 && g > 180 && b > 180 && r > b + 4);
const X0 = 700, X1 = 1750, Y0 = 500, Y1 = 2400;
const left = [], right = [], top = [], bottom = [];
for (let y = Y0; y < Y1; y += 2) {
  let l = -1, r = -1;
  for (let x = X0; x < X1; x++) if (isScreen(px(x, y))) { l = x; break; }
  for (let x = X1; x > X0; x--) if (isScreen(px(x, y))) { r = x; break; }
  if (l >= 0) left.push([l, y]); if (r >= 0) right.push([r, y]);
}
for (let x = 750; x < 1700; x += 2) {
  let t = -1, b = -1;
  for (let y = Y0; y < Y1; y++) if (isScreen(px(x, y))) { t = y; break; }
  for (let y = Y1; y > Y0; y--) if (isScreen(px(x, y))) { b = y; break; }
  if (t >= 0) top.push([x, t]); if (b >= 0) bottom.push([x, b]);
}
// robust line fit: x = a*y + b for the side edges, y = a*x + b for top/bottom; trim worst 40% twice
function fit(pts, swap) {
  let P = pts.map(([x, y]) => swap ? [y, x] : [x, y]);
  let a = 0, b = 0;
  for (let it = 0; it < 3; it++) {
    const n = P.length, sx = P.reduce((s, p) => s + p[0], 0), sy = P.reduce((s, p) => s + p[1], 0);
    const sxx = P.reduce((s, p) => s + p[0] * p[0], 0), sxy = P.reduce((s, p) => s + p[0] * p[1], 0);
    a = (n * sxy - sx * sy) / (n * sxx - sx * sx); b = (sy - a * sx) / n;
    const res = P.map(p => Math.abs(p[1] - (a * p[0] + b)));
    const sorted = [...res].sort((u, v) => u - v); const cut = sorted[Math.floor(sorted.length * 0.8)];
    P = P.filter((p, i) => res[i] <= cut);
  }
  const rms = Math.sqrt(P.reduce((s, p) => s + (p[1] - (a * p[0] + b)) ** 2, 0) / P.length);
  return { a, b, n: P.length, rms };
}
const L = fit(left, true), R = fit(right, true), T = fit(top, false), B = fit(bottom, false);
// side: x = a*y + b ; top/bottom: y = a*x + b → intersect
function meet(side, tb) { const y = (tb.a * side.b + tb.b) / (1 - tb.a * side.a); return [side.a * y + side.b, y]; }
const TL = meet(L, T), TR = meet(R, T), BR = meet(R, B), BL = meet(L, B);
const f = ([x, y]) => [+(x / W).toFixed(4), +(y / H).toFixed(4)];
console.log(JSON.stringify({ W, H, fits: { L, R, T, B }, px: { TL, TR, BR, BL }, frac: { TL: f(TL), TR: f(TR), BR: f(BR), BL: f(BL) } }, null, 1));
// overlay for the eye
const poly = [TL, TR, BR, BL].map(p => p.map(v => v / 3).join(',')).join(' ');
const svg = Buffer.from(`<svg width="750" height="1000" xmlns="http://www.w3.org/2000/svg"><polygon points="${poly}" fill="none" stroke="#0f0" stroke-width="2"/></svg>`);
await sharp(src).resize(750, 1000).composite([{ input: svg }]).png().toFile(process.argv[3]);
