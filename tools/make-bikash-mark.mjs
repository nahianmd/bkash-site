/* Derives the two nav marks from the supplied Bangla bKash artwork.
   Nahian handed over a 700x700 WebP on 2026-09-22; this is how the two
   files in web/src/assets/img/brand/ were made, so the derivation is
   auditable and repeatable if the source art is ever reissued.

   Run it from anywhere:  node tools/make-bikash-mark.mjs [source]
   (sharp is resolved out of web/node_modules — it is a dependency of
   the app, not of this script.)

   Two outputs, because the nav goes transparent over the hero:
     bikash.webp          the mark, trimmed to its own bounds
     bikash-on-dark.webp  the same pixels with ONLY the desaturated ones
                          remapped to --paper #ffffff

   The saturation test is what makes this safe. `কাশ` is near-neutral
   (max-min < 40) and becomes paper; the three brand pinks are far above
   that threshold and come through byte-identical. A blanket
   `filter: brightness(0) invert(1)` — the prototype's approach, which
   Logo.astro's comment rejects — would take the pinks to white too. */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, '..', 'web', 'package.json'));
const sharp = require('sharp');

const SRC =
  process.argv[2] ??
  'E:/Projects/bkash-logo-horizontal-bangla-mobile-banking-app-icon-free-png.webp';
const OUT = path.join(root, '..', 'web', 'src', 'assets', 'img', 'brand');

const SATURATION_FLOOR = 40; // below this a pixel is glyph, not brand colour
const PAPER = [255, 255, 255];

const trimmed = await sharp(SRC).trim({ threshold: 0 }).toBuffer();
const meta = await sharp(trimmed).metadata();
console.log(`trimmed to ${meta.width}x${meta.height} (${(meta.width / meta.height).toFixed(3)}:1)`);

await sharp(trimmed).webp({ quality: 95, effort: 6 }).toFile(path.join(OUT, 'bikash.webp'));

const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let recoloured = 0;
let kept = 0;
for (let i = 0; i < data.length; i += info.channels) {
  if (data[i + 3] === 0) continue;
  const saturation = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
  if (saturation < SATURATION_FLOOR) {
    [data[i], data[i + 1], data[i + 2]] = PAPER;
    recoloured++;
  } else {
    kept++;
  }
}
console.log(`on-dark: ${recoloured} glyph pixels to paper, ${kept} brand-colour pixels untouched`);

await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  .webp({ quality: 95, effort: 6 })
  .toFile(path.join(OUT, 'bikash-on-dark.webp'));
