/* ============================================================
   bKash — the hero's beats: pure data, no imports, so the Astro
   components can read it at build time (the no-JS still places the
   cutouts from the same numbers the camera uses).

   Camera targets and cutout boxes are fractions of the PLATE. The
   plate (1678×937, replated 2026-09-22 on the client's note; was
   2748×1536) has the three figures removed; the
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

/* Only the ASPECT of this is load-bearing — every consumer cover-fits
   it into a box (scene-rig's `box`, Bird's mark, the placement panel's
   `hOf`), so the pixel counts cancel. Kept truthful anyway. The replate
   is 1.7908 against the old 1.7891: a 0.1% difference, so every `cam`
   and `cut` fraction below carries over.

   Unlike HeroScene's width ladder this cannot be read from the image:
   the module stays import-free so the components can use it at build
   time. Typed by hand, and a pixel of drift in it is not load-bearing. */
export const PLATE = { w: 1678, h: 937 };

/* CENTRING A SUBJECT. `poseFor` places cam.x/cam.y at the viewport's
   centre, so a subject is centred exactly when its cam IS the centre of
   its own cut box:

     cam.x = cut.x + cut.w / 2
     cam.y = cut.y + cut.w * (imgH / imgW) * (PLATE.w / PLATE.h) / 2

   Amena was already built this way — (0.4100, 0.5000) against a true
   centre of (0.4086, 0.5000). Rahim and Faysal were not: Rahim sat
   0.0988 of the plate's height below centre. Both centred 2026-09-22 on
   Nahian's ask, and zoomed in with it.

   The zoom is not independent of the centring. The cover clamp in
   `poseFor` keeps cam.y inside [vh/2H_s, 1 - vh/2H_s], and at s = 3
   Rahim's centre (0.8388) falls outside it — it would have been clamped
   back to 0.8333. s >= 3.25 clears it, so zooming in is what MAKES the
   centring possible rather than a separate wish.

   These are derived from the cut boxes, so they go stale if a cutout is
   re-placed with `?place`. Re-derive from the two lines above; the panel
   prints the cut box you need. */
export const BEATS: Beat[] = [
  { id: 'open', cam: { x: 0.5, y: 0.5, s: 1 } },
  {
    id: 'amena',
    cam: { x: 0.41, y: 0.5, s: 4 },
    cut: { x: 0.3951, y: 0.4737, w: 0.027, soft: 0 },
  },
  {
    id: 'rahim',
    cam: { x: 0.3438, y: 0.8388, s: 3.75 },
    cut: { x: 0.3163, y: 0.7728, w: 0.055, soft: 0 },
  },
  {
    id: 'faysal',
    cam: { x: 0.5669, y: 0.8126, s: 4 },
    cut: { x: 0.5509, y: 0.75, w: 0.032, soft: 0 },
  },
];
