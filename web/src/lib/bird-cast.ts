/* ============================================================
   bKash — the cast inside the mark
   specs/sections/bird.md (revised 2026-09-22)

   Three of the bird's facets stop being windows onto the street and
   become windows onto a person: the top wing holds Amena, the middle
   holds Faysal, the flat one holds Rahim. Nahian's annotated render,
   2026-09-22 — `C` customer, `M` merchant, `A` agent.

   WHY THIS IS NOT A CROP OF THE PLATE. `plate.png` has no people in it
   (the three figures were removed 2026-09-19), so there is nothing to
   crop to. Each window composites the plate AND that character's
   cutout, the same two layers the hero uses.

   WHY THE FIGURE AND THE BACKGROUND ARE SIZED SEPARATELY. A crop framed
   around a character at the scale it sits in the plate does not have the
   pixels. Amena is 0.027 of the plate wide — 45px — so a crop around her
   is ~81x79 source px against a 606x591 window at retina: a 7.5x
   upscale, which is mush, not bokeh. But her cutout is 948x1030, so the
   FIGURE has pixels to spare. So the two are decoupled: the figure is
   placed at a size that reads (sharp, downsampled from its own source),
   and the background is a deliberately loose crop of the street behind
   her (~1.6x, which reads as depth of field). Nobody reads the two as
   being at different scales; they read a portrait with a background.

   Everything here is build-time arithmetic in BIRD-BOX UNITS, so the
   caller can drop it straight into the same coordinate space as the
   mask paths and inherit the mask's transform for free.
   ============================================================ */

import { PLATE, BEATS, type Cut } from './hero-beats';
import { FACET, facetBox, centroidPx } from './bird-shape';

/** Which facet holds whom, and how each one is framed. */
export const CAST = [
  { facet: FACET.topWing, id: 'amena', role: 'Customer' },
  { facet: FACET.middle, id: 'faysal', role: 'Merchant' },
  { facet: FACET.flat, id: 'rahim', role: 'Agent' },
] as const;

/* The two dials, per Nahian's eye.

   `fill` — the figure's height as a fraction of its facet's BOUNDING
   BOX, and the triangle then crops whatever overflows. The crop is the
   point: a figure sized to fit wholly inside the triangle reads as a
   sticker centred in a shape, not as a window onto someone. (Tried it —
   the largest inscribed box of a standing figure's aspect put Amena at
   84x91px inside a 303x296 window, 28% of its height. Correct
   arithmetic, wrong basis.) Nothing renders outside the triangle either
   way, because each window is clipped to its own facet, so a figure
   overflowing its box is safe. The figure is drawn from its own
   high-resolution cutout at any size here, so this costs nothing in
   sharpness — it is purely how tight the framing reads, and it is the
   dial to turn by eye.

   `bg` — the background crop's width as a fraction of the PLATE's
   width. Lower is a tighter street and a softer one: this is the dial
   that trades framing against the upscale. 0.22 puts all three windows
   near 1.6x at retina on desktop, which is soft enough to read as
   depth of field rather than as a bad image.

   `lift` — nudges the figure up (positive) within its facet, as a
   fraction of the facet's height. A centroid-centred figure sits low in
   a triangle that narrows downward. */
export const CAST_TUNING: Record<string, { fill: number; bg: number; lift: number }> = {
  amena: { fill: 0.7, bg: 0.22, lift: 0 },
  faysal: { fill: 0.7, bg: 0.22, lift: 0 },
  rahim: { fill: 0.7, bg: 0.22, lift: 0 },
};

export type Box = { x: number; y: number; w: number; h: number };
export type CastWindow = {
  /** facet index, for the clip path */
  facet: number;
  /** beat id — also the cutout's filename stem */
  id: string;
  role: string;
  clipId: string;
  /** the whole plate, in bird-box units, positioned so its crop lands on the facet */
  bg: Box;
  /** the cutout, in bird-box units */
  fig: Box;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** The cut box for a beat id, or null if that beat has no cutout. */
function cutOf(id: string): Cut | null {
  return BEATS.find((b) => b.id === id)?.cut ?? null;
}

/**
 * Geometry for the three windows, in bird-box units.
 *
 * `dims` carries each cutout's intrinsic size — the caller has it from
 * `astro:assets`, and this module stays free of image imports so it can
 * be read at build time by both the live overlay and the static poster.
 */
export function castWindows(
  dims: Record<string, { width: number; height: number }>,
): CastWindow[] {
  const out: CastWindow[] = [];

  for (const { facet, id, role } of CAST) {
    const cut = cutOf(id);
    const img = dims[id];
    if (!cut || !img) continue;
    const t = CAST_TUNING[id] ?? { fill: 0.7, bg: 0.22, lift: 0 };

    const [bx, by, bw, bh] = facetBox(facet);
    const aspect = bw / bh;

    /* ---- background: a loose crop of the plate, centred on the figure ----
       The crop is `bg` of the plate wide and carries the FACET's aspect, so
       it fills the facet's box exactly. Scale s is bird units per plate px;
       because cropH = cropW / aspect, bh / cropH resolves to the same s, so
       one scalar places the whole plate. */
    const cropW = t.bg * PLATE.w;
    const cropH = cropW / aspect;
    const s = bw / cropW;

    /* The figure's own box in plate px, to centre the crop on. */
    const figWp = cut.w * PLATE.w;
    const figHp = figWp * (img.height / img.width);
    const centreX = cut.x * PLATE.w + figWp / 2;
    const centreY = cut.y * PLATE.h + figHp / 2;

    /* Clamped so the crop never runs off the plate and leaves a bare edge
       inside the mark. */
    const x0 = clamp(centreX - cropW / 2, 0, Math.max(0, PLATE.w - cropW));
    const y0 = clamp(centreY - cropH / 2, 0, Math.max(0, PLATE.h - cropH));

    const bg: Box = {
      x: bx - x0 * s,
      y: by - y0 * s,
      w: PLATE.w * s,
      h: PLATE.h * s,
    };

    /* ---- figure: `fill` of the facet's box height, cropped by the facet ----
       Centred on the facet's CENTROID, not its box's centre: a triangle's
       mass is where a figure has room, and the box's centre can lie
       outside the triangle altogether. `lift` raises that centre. */
    const figAspect = img.width / img.height;
    const [cenX, cenY] = centroidPx(facet);
    const figH = t.fill * bh;
    const figW = figH * figAspect;
    const fig: Box = {
      x: cenX - figW / 2,
      y: cenY - figH / 2 - t.lift * bh,
      w: figW,
      h: figH,
    };

    out.push({ facet, id, role, clipId: `bird-cast-${id}`, bg, fig });
  }

  return out;
}
