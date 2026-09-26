// Recolour the phones in the journey wall's sketches magenta.
// Each phone is a quad (full-res pixels, read off a gridded crop),
// grown a few px; inside it, only the phone's dark greys are recoloured
// â€” mapped from their luminance onto a pink ramp so the drawing's
// shading survives â€” and the lighter fingers over the phone are left.
// node pinkphones.cjs <in.jpg> <out.jpg> <preview.png>
const sharp = require('E:/Projects/bkash-site/web/node_modules/sharp');
const [, , src, out, preview] = process.argv;
const Q = {
  p2013: [[3559, 999], [3587, 995], [3600, 1067], [3572, 1074]],
  p2016a: [[4446, 1080], [4500, 1041], [4510, 1054], [4458, 1092]],
  p2016b: [[4629, 1095], [4667, 1087], [4702, 1136], [4667, 1147]],
  p2019: [[5843, 1020], [5885, 1014], [5895, 1055], [5853, 1062]],
  p2020: [[6337, 978], [6397, 978], [6354, 1036], [6291, 1038]],
  p2022: [[6799, 1006], [6849, 1004], [6852, 1068], [6804, 1073]],
  p2024: [[7650, 1152], [7704, 1150], [7780, 1224], [7712, 1236]],
  p2025: [[8248, 809], [8288, 797], [8336, 871], [8291, 881]],
};
const GROW = 5;
const DARK = [120, 12, 60]; // deep pink for the darkest ink
const PINK = [226, 19, 110]; // --pink for the phone's body grey
const LIGHT = [243, 150, 190]; // the lightest greys on the phone
const T_BODY = 175; // luma at or below: the phone
const T_EDGE = 205; // up to here: fade back to the original

const inside = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const grow = (poly) => {
  const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
  const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
  return poly.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [x + (dx / d) * GROW, y + (dy / d) * GROW];
  });
};
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const C = info.channels;
  let n = 0;
  for (const [name, q] of Object.entries(Q)) {
    const poly = grow(q);
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (!inside(poly, x + 0.5, y + 0.5)) continue;
        const i = (y * W + x) * C;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (L > T_EDGE) continue;
        /* a grey pixel only: leave anything already coloured */
        if (Math.max(r, g, b) - Math.min(r, g, b) > 28) continue;
        const t = Math.min(1, L / T_BODY);
        const pink = t < 0.55 ? lerp(DARK, PINK, t / 0.55) : lerp(PINK, LIGHT, (t - 0.55) / 0.45);
        const k = L <= T_BODY ? 1 : 1 - (L - T_BODY) / (T_EDGE - T_BODY);
        data[i] = Math.round(r + (pink[0] - r) * k);
        data[i + 1] = Math.round(g + (pink[1] - g) * k);
        data[i + 2] = Math.round(b + (pink[2] - b) * k);
        n++;
      }
  }
  const img = sharp(data, { raw: { width: W, height: info.height, channels: C } });
  await img.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(out);
  /* preview: every phone, cropped, side by side */
  const comps = [];
  const names = Object.keys(Q);
  for (let k = 0; k < names.length; k++) {
    const q = Q[names[k]];
    const cx = Math.round(q.reduce((a, p) => a + p[0], 0) / 4);
    const cy = Math.round(q.reduce((a, p) => a + p[1], 0) / 4);
    const S = 200;
    const left = Math.max(0, Math.min(W - S, cx - S / 2));
    const top = Math.max(0, Math.min(info.height - S, cy - S / 2));
    comps.push({
      input: await sharp(out).extract({ left, top, width: S, height: S }).toBuffer(),
      left: (k % 4) * (S + 6),
      top: Math.floor(k / 4) * (S + 6),
    });
  }
  await sharp({ create: { width: 4 * 206, height: 2 * 206, channels: 3, background: '#000' } })
    .composite(comps)
    .png()
    .toFile(preview);
  console.log('recoloured px', n);
})();
