/* ============================================================
   bKash — the hero's beats: pure data, no imports, so the Astro
   components can read it at build time (the no-JS still places the
   cutouts from the same numbers the camera uses).

   Camera targets and cutout boxes are fractions of the PLATE. The
   plate (2748×1536, 2026-09-19) has the three figures removed; the
   cutouts are the only people, always visible, sitting where the
   figures were painted. Placed by Nahian with the placement panel
   (`?place`), 2026-09-19.

   The order is customer, agent, merchant — Amena, then Rahim, then
   Faysal. Rahim IS the agent and Faysal the merchant; the deck's p.2
   has those two names against the other's line. Nahian, 2026-09-20.
   ============================================================ */

export type Cam = { x: number; y: number; s: number };
/** a cutout's box: top-left and width, as fractions of the plate; `soft`
    is how soft it reads at the wide shot, in screen px (0 = crisp) */
export type Cut = { x: number; y: number; w: number; soft?: number };
export type Beat = { id: string; cam: Cam; cut?: Cut };

export const PLATE = { w: 2748, h: 1536 };

export const BEATS: Beat[] = [
  { id: 'open', cam: { x: 0.5, y: 0.5, s: 1 } },
  { id: 'amena', cam: { x: 0.41, y: 0.5, s: 4 }, cut: { x: 0.3951, y: 0.4737, w: 0.027, soft: 0 } },
  { id: 'rahim', cam: { x: 0.37, y: 0.74, s: 3 }, cut: { x: 0.312, y: 0.745, w: 0.1, soft: 0 } },
  { id: 'faysal', cam: { x: 0.55, y: 0.78, s: 3.5 }, cut: { x: 0.4912, y: 0.6677, w: 0.102, soft: 0 } },
];
