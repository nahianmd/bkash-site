/* The soft twin of each cutout: the same drawing, pre-softened so that at
   the hero's wide shot it reads about 1.2px soft on a 1920 screen instead
   of sparkling-crisp against the painted street. Never blurred per frame
   (CLAUDE.md, performance rule 2): one copy, crossfaded by opacity.

   sigma_source = onScreenBlur × (sourceW / displayW at the wide shot),
   displayW = cut.w × 1920. Rendered at a quarter size (it is only ever
   shown small) with the sigma scaled to match.

   node tools/soft-twins.mjs   (from the repo root; needs web/node_modules) */
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../web/package.json', import.meta.url).pathname)('sharp');
const DIR = new URL('../web/src/assets/img/hero/', import.meta.url).pathname;
const ON_SCREEN_BLUR = 1.2;
const WIDE_W = 1920;
const CUTS = { amena: 0.04, rahim: 0.1, faysal: 0.072 };
for (const [id, w] of Object.entries(CUTS)) {
  const src = `${DIR}${id}.png`;
  const meta = await sharp(src).metadata();
  const displayW = w * WIDE_W;
  const sigma = ON_SCREEN_BLUR * (meta.width / displayW);
  const outW = Math.round(meta.width / 4);
  await sharp(src).resize(outW).blur(sigma / 4).png({ compressionLevel: 9 }).toFile(`${DIR}${id}-soft.png`);
  console.log(id, `${meta.width}px → soft ${outW}px, sigma ${sigma.toFixed(1)}px at source (${(sigma / 4).toFixed(1)} at 1/4)`);
}
