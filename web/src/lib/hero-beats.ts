/* ============================================================
   bKash — the hero's beats: pure data, no imports, so the Astro
   components can read it at build time (the no-JS still places the
   cutouts from the same numbers the camera uses).

   Camera targets and cutout boxes are fractions of the PLATE. The
   plate (1672×941, replated 2026-09-24 on the client's note; was
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
   is 1.7768 against 1.7908 the day before and 1.7891 originally — a
   0.78% shift this time, where the first replate was 0.10%. Small, but
   an order of magnitude less small, so the fractions below were
   re-placed against it rather than carried over.

   Unlike HeroScene's width ladder this cannot be read from the image:
   the module stays import-free so the components can use it at build
   time. Typed by hand, and a pixel of drift in it is not load-bearing. */
export const PLATE = { w: 1672, h: 941 };

/* CENTRING A SUBJECT. `poseFor` places cam.x/cam.y at the viewport's
   centre, so a subject is centred exactly when its cam IS the centre of
   its own cut box:

     cam.x = cut.x + cut.w / 2
     cam.y = cut.y + cut.w * (imgH / imgW) * (PLATE.w / PLATE.h) / 2

   Amena was already built this way. Rahim and Faysal were not — Rahim
   sat 0.0988 of the plate's height below centre — and both were centred
   2026-09-22 on Nahian's ask, and zoomed in with it.

   Re-derived 2026-09-24 after all three cut boxes were re-placed against
   the new plate and Faysal's new artwork, and again 2026-09-27 for
   Amena's new artwork (1254x1212, aspect 1.035 against the old 0.920 —
   she is now marginally wider than tall), and again 2026-09-28 for
   Faysal's, whose art was re-exported at the same 2163x2560 but framed
   differently. Rahim has not moved since the 24th; Amena's re-derives to
   exactly what was pasted, which is the check that she did not either.

   Each time, the cams pasted with the boxes were the OLD derived ones
   and had gone stale exactly as this comment warns. On the 24th Amena
   had drifted +0.0221 in x and Rahim +0.0102; on the 28th Faysal was
   +0.0065 out in y.

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
    cam: { x: 0.3881, y: 0.4988, s: 4 },
    cut: { x: 0.3726, y: 0.4722, w: 0.031, soft: 0 },
  },
  {
    id: 'rahim',
    cam: { x: 0.3336, y: 0.8348, s: 3.75 },
    cut: { x: 0.3061, y: 0.7693, w: 0.055, soft: 0 },
  },
  {
    id: 'faysal',
    cam: { x: 0.5698, y: 0.8138, s: 4 },
    cut: { x: 0.5363, y: 0.7434, w: 0.067, soft: 0 },
  },
];
