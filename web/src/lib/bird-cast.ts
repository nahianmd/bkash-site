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
  customer: { zoom: 1, x: 0.5, y: 0.5 },
  agent: { zoom: 1, x: 0.5, y: 0.3 },
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
