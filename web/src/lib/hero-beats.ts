/* ============================================================
   bKash — the hero's beats: pure data, no imports, so the Astro
   components can read it at build time (the no-JS still places the
   cutouts from the same numbers the camera uses).

   Camera targets and cutout boxes are fractions of the PLATE. The
   plate (2748×1536, 2026-09-19) has the three figures removed; the
   cutouts are the only people, always visible, sitting where the
   figures were painted. Placed against an offline composite; the dev
   handle nudges them live.
   ============================================================ */

export type Cam = { x: number; y: number; s: number };
/** a cutout's box: top-left and width, as fractions of the plate; `soft`
    is how soft it reads at the wide shot, in screen px (0 = crisp) */
export type Cut = { x: number; y: number; w: number; soft?: number };
export type Beat = { id: string; cam: Cam; cut?: Cut };

export const PLATE = { w: 2748, h: 1536 };

export const BEATS: Beat[] = [
  { id: 'open', cam: { x: 0.5, y: 0.5, s: 1 } },
  { id: 'amena', cam: { x: 0.41, y: 0.5, s: 4 }, cut: { x: 0.388, y: 0.47, w: 0.04 } },
  { id: 'rahim', cam: { x: 0.37, y: 0.74, s: 3 }, cut: { x: 0.312, y: 0.745, w: 0.1 } },
  { id: 'faysal', cam: { x: 0.55, y: 0.78, s: 3.5 }, cut: { x: 0.52, y: 0.71, w: 0.072 } },
];
