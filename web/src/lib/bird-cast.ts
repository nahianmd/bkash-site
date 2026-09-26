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

   Each scene is COVER-fitted to its facet's bounding box — scaled until
   it covers the box, keeping its own aspect, overflow clipped by the
   triangle — and then MOVED.

   `zoom` — 1 is exactly cover. Above 1 pushes in and crops more. Below 1
   no longer covers, and because a triangle's bounding box is defined by
   its own three vertices there is no slack anywhere to borrow: any zoom
   under 1 exposes something. Sometimes that is affordable (see the
   customer) but it is never free.

   `dx`, `dy` — how far to MOVE THE SCENE, as a fraction of the facet's
   width and height, from centred. **Negative is left and up, positive is
   right and down**, and it means the image moves that way — so `dx:
   -0.2` slides the scene 20% of the facet's width to the left, which
   brings its RIGHT side into view.

   That sign convention is the whole reason this is written as a signed
   offset from centre rather than as a 0..1 position. The 0..1 form
   inverts when the image under-fills instead of overflowing, so the same
   number meant "move left" in one window and "move right" in another —
   which is exactly how 2026-09-24's adjustments went out backwards.

   Neither dial is clamped. Pushing past the available slack opens a gap
   and the hero's street shows through it; the numbers below say where
   each one stands. */
export const CAST_TUNING: Record<string, { zoom: number; dx: number; dy: number }> = {
  /* Out a little, and as far down-left as she goes. Asked for 30% left
     and bottom; neither is fully reachable. At zoom 0.95 the horizontal
     slack is 102.8 units, so -0.116 is the furthest left before a gap
     opens on the right — 30% would need 132.6. And zooming out means she
     under-fills vertically, so there is no "down" past +0.025, where her
     bottom edge meets the box's and the whole 23-unit gap sits at the
     top. That apex is the cheapest place for it: what shows is a wedge
     of roughly 15 x 15 CSS px, not a band.

     Then a step down, 2026-09-24. She has no room left underneath — her
     bottom edge already met the box's — so moving down only grows the
     top gap: 23 units to 32, and the wedge from about 15 x 15 to 21 x 21
     CSS px. If that notch reads as a fault rather than as shape, zoom
     0.97 halves it and zoom 1 removes it, at the cost of the zoom-out. */
  customer: { zoom: 0.95, dx: -0.116, dy: 0.045 },
  /* Left 20%, which a pure pan could not do: at cover this scene is
     441.9 units wide against a facet of 442, so the width fits EXACTLY
     and there was no slack to move through. Slack costs zoom, 1 unit of
     travel per 2 of zoom-in, so 20% took 1.4 — and at 1.4 the -0.2 lands
     exactly on the slack: fully left, no gap. The price is the vertical
     crop going 31% -> 51%.

     dy was briefly 0.092 and WRONG — converting it to the signed model
     used the zoom-1.0 height rather than the zoom-1.4 one, which put the
     window at 21.1% of the scene while his head is at about 17.1%. It
     cut the top of his head off. 0.209 restores the original framing;
     0.26 is that plus the step down asked for on 2026-09-24, and leaves
     4.3% of headroom instead of 1.8%. */
  agent: { zoom: 1.4, dx: -0.2, dy: 0.26 },
  merchant: { zoom: 1, dx: 0, dy: 0 },
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
    const t = CAST_TUNING[id] ?? { zoom: 1, dx: 0, dy: 0 };

    const [bx, by, bw, bh] = facetBox(facet);

    /* Cover: the larger of the two ratios, so neither axis falls short. */
    const s = Math.max(bw / img.width, bh / img.height) * t.zoom;
    const w = img.width * s;
    const h = img.height * s;

    /* Centre the scene on the box, then move it. The centred term is
       (bw - w) / 2 whichever way the fit falls, so the offset keeps one
       meaning — negative left, positive right — for over- and
       under-filling windows alike. */
    out.push({
      facet,
      id,
      role,
      clipId: `bird-cast-${id}`,
      img: {
        x: bx + (bw - w) / 2 + t.dx * bw,
        y: by + (bh - h) / 2 + t.dy * bh,
        w,
        h,
      },
    });
  }

  return out;
}
