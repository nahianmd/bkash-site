/* ============================================================
   bKash — the cast inside the mark
   specs/sections/bird.md (revised 2026-09-22, rebuilt 2026-09-27)

   Three of the bird's facets stop being windows onto the street and
   become windows onto a scene: the middle holds the customer, the flat
   one the agent, the top wing the merchant.

   REBUILT 2026-09-27. Until now each window was COMPOSITED at runtime —
   the plate, plus that character's cutout on top — because `plate.png`
   has no people in it and there was nothing else to show. Nahian then
   supplied three finished illustrations (`customer.png`, `agent.png`,
   `merchant.png`), each a complete scene with its own background. So a
   window is now one image, not two layers, and the machinery that sized
   figure and background separately is gone with it.

   That machinery existed to work around a resolution problem: a crop of
   the plate framed on a character had nowhere near the pixels — Amena
   was 45px wide in the plate — so the figure had to be drawn from its
   own cutout and the street loosened until it read as depth of field.
   The supplied scenes have no such problem. At 2560 they land between
   0.91x and 1.51x, against the 1.4x-2.1x UPSCALE they replace: every
   window is sharper and the code is simpler.

   What it gives up: the windows are no longer views into the hero's own
   plate, so a person in the mark no longer stands in the same street
   they stand in below. They are three vignettes. That is the trade
   Nahian chose by supplying finished scenes.

   The hero's cutouts (`amena/rahim/faysal.png`) are untouched — they are
   the hero's, and only the bird changed.

   Geometry is build-time arithmetic in BIRD-BOX UNITS, so the caller
   drops it into the same coordinate space as the mask paths and
   inherits the mask's transform for free.
   ============================================================ */

import { FACET, facetBox } from './bird-shape';

/** Which facet holds which scene. */
export const CAST = [
  { facet: FACET.middle, id: 'customer', role: 'Customer' },
  { facet: FACET.flat, id: 'agent', role: 'Agent' },
  { facet: FACET.topWing, id: 'merchant', role: 'Merchant' },
] as const;

/* The dials, per window.

   Each scene is COVER-fitted to its facet's bounding box: scaled until it
   covers the box, keeping its own aspect, with the overflow clipped by
   the triangle. Something is always cropped, and these choose what.

   `zoom` — 1 is exactly cover, the loosest framing that leaves no gap.
   Above 1 pushes in and crops more. Below 1 would open a bare corner
   inside the mark, so it is not useful.

   `x`, `y` — which part survives the crop, 0..1. 0.5 centres; 0 keeps the
   left/top edge, 1 the right/bottom. Only the axis that actually
   overflows responds, so on a window cropped in width, `y` does nothing.

   The agent sits at y 0.3 rather than centred: his is the flat facet, so
   a third of the scene's HEIGHT is cropped, and centring that crop takes
   the top of his head. Biasing upward keeps him whole and still holds
   the QR stand and the table. */
export const CAST_TUNING: Record<string, { zoom: number; x: number; y: number }> = {
  /* Out a little and down-left, 2026-09-24. Below 1 the scene no longer
     covers the facet's box, so a gap opens — and because a triangle's
     bounding box is defined by its own vertices, there is no slack to
     borrow: any zoom under 1 exposes something. `y: 0.8` is what makes
     that affordable. It drives 80% of the gap to the TOP of the box,
     which for this facet is a single apex, so what shows is a wedge of
     about 12 x 12 CSS px rather than a band. 0.97 would halve it. */
  customer: { zoom: 0.95, x: 0.2, y: 0.8 },
  /* Left, 2026-09-24 — but a pure pan could not do it. At cover this
     scene is 441.9 units wide against a facet of 442: the width fits
     EXACTLY, so there is no horizontal slack and `x` had no effect at
     all. Slack has to be bought with zoom, at 1 unit of shift per 2
     units of zoom-in, so reaching the asked-for 20% of the facet's width
     took zoom 1.4. The cost is the vertical crop going 31% -> 51%; `y`
     stays at 0.3 and his head clears the top edge by about 2% of the
     scene's height. */
  agent: { zoom: 1.4, x: 0, y: 0.3 },
  merchant: { zoom: 1, x: 0.5, y: 0.5 },
};

export type Box = { x: number; y: number; w: number; h: number };
export type CastWindow = {
  /** facet index, for the clip path */
  facet: number;
  /** scene id — also the file's stem */
  id: string;
  role: string;
  clipId: string;
  /** the scene, in bird-box units, cover-fitted to the facet */
  img: Box;
};

/**
 * Geometry for the three windows, in bird-box units.
 *
 * `dims` carries each scene's intrinsic size — the caller has it from
 * `astro:assets`, and this module stays free of image imports so both
 * the live overlay and the static poster can read it at build time.
 */
export function castWindows(
  dims: Record<string, { width: number; height: number }>,
): CastWindow[] {
  const out: CastWindow[] = [];

  for (const { facet, id, role } of CAST) {
    const img = dims[id];
    if (!img) continue;
    const t = CAST_TUNING[id] ?? { zoom: 1, x: 0.5, y: 0.5 };

    const [bx, by, bw, bh] = facetBox(facet);

    /* Cover: the larger of the two ratios, so neither axis falls short. */
    const s = Math.max(bw / img.width, bh / img.height) * t.zoom;
    const w = img.width * s;
    const h = img.height * s;

    /* Pan. (bw - w) is <= 0 under cover, so x = 0 pins the scene's left
       edge to the box's and x = 1 pins the right; 0.5 centres. The axis
       that does not overflow contributes zero and ignores its dial. */
    out.push({
      facet,
      id,
      role,
      clipId: `bird-cast-${id}`,
      img: { x: bx + (bw - w) * t.x, y: by + (bh - h) * t.y, w, h },
    });
  }

  return out;
}
