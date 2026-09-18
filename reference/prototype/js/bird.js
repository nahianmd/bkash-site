/* ============================================================
   bKash — the bird
   See specs/sections/hero-collapse.md

   THE ARTWORK IS THE SHAPE. `collage-bird.webp` is already cut to
   the bKash mark, every facet filled with its own photograph and
   transparent around the outside. There is nothing to reconstruct.

   Three earlier attempts built the shape out of polygons and all
   three were wrong, because the polygons in the old prototype were
   never the shape — they were hit regions laid OVER this artwork
   for the shard interaction. They are kept below for exactly that
   purpose, and are not used for rendering.
   ============================================================ */

export const BIRD_ASPECT = 1195 / 1111;   /* the artwork's own aspect */

export const BIRD_ART = 'assets/img/collage-bird.webp';

/* The facet Rahim's frame hands over into — the large wing panel.
   Taken from the old prototype's own clip target, which was fitted
   to this artwork. Fractions of the artwork box. */
export const LIVE_POLY = '47.7% 5.9%, 53.0% 13.6%, 78.9% 55.2%, 35.6% 47.0%';

export const LIVE_BOX = (() => {
  const pts = LIVE_POLY.split(',').map(p => p.trim().split(/\s+/).map(parseFloat));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) / 100, x1 = Math.max(...xs) / 100;
  const y0 = Math.min(...ys) / 100, y1 = Math.max(...ys) / 100;
  return { x0, y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();

/* Hit regions for the future per-facet stories. Fitted to the
   artwork, not derived from the logo. Unused for now. */
export const HIT_REGIONS = [
  { card: 'a3',  poly: '1.3% 0.0%, 45.2% 5.8%, 20.3% 25.7%, 18.7% 24.8%' },
  { card: 'a2',  poly: '0.0% 7.6%, 4.1% 7.5%, 14.6% 22.4%, 10.5% 19.0%' },
  { card: 'a4',  poly: '20.3% 26.7%, 45.1% 6.9%, 38.0% 32.6%, 33.9% 46.4%' },
  { card: 'a5',  poly: LIVE_POLY },
  { card: 'a9',  poly: '35.9% 48.9%, 66.9% 54.4%, 77.8% 56.7%, 42.0% 75.1%' },
  { card: 'a8',  poly: '19.1% 99.7%, 27.9% 68.6%, 33.8% 50.4%, 41.3% 81.3%' },
  { card: 'a10', poly: '46.0% 76.1%, 73.5% 61.7%, 71.3% 67.3%, 44.6% 79.1%' },
  { card: 'a6',  poly: '68.3% 35.3%, 90.5% 30.1%, 81.1% 53.9%, 80.6% 54.5%' },
  { card: 'a7',  poly: '87.9% 40.5%, 92.2% 30.4%, 99.8% 41.0%, 88.1% 41.0%' },
];

export function buildBird(root, scene) {
  const bird = root.querySelector('[data-bird]');
  if (!bird) return null;

  // The mark itself.
  const art = document.createElement('img');
  art.className = 'bird__art';
  art.src = BIRD_ART;
  art.alt = 'The bKash mark, made of photographs of the people who use it';
  bird.appendChild(art);

  /* Rahim's frame, clipped to the wing panel and sitting over the
     artwork's own photograph of the same subject. It exists only so
     the handover from beat 3 is invisible; it fades out early in the
     zoom, revealing the artwork underneath. */
  const liveFacet = document.createElement('div');
  liveFacet.className = 'bird__facet--live';
  liveFacet.style.clipPath = `polygon(${LIVE_POLY})`;

  const host = document.createElement('div');
  host.className = 'bird__live';
  const sc = document.createElement('div');
  sc.className = 'bird__scene';

  const plate = document.createElement('img');
  plate.className = 'bird__plate';
  plate.src = 'assets/img/scene-plate-wide.webp';
  plate.alt = '';
  sc.appendChild(plate);

  (scene ? scene.subjects : []).forEach((s) => {
    const cut = document.createElement('img');
    cut.className = 'bird__subject';
    cut.src = s.img;
    cut.alt = '';
    cut.style.left = `${s.box.x * 100}%`;
    cut.style.top = `${s.box.y * 100}%`;
    cut.style.width = `${s.box.w * 100}%`;
    sc.appendChild(cut);
  });

  host.appendChild(sc);
  liveFacet.appendChild(host);
  bird.appendChild(liveFacet);

  return { bird, liveHost: host, liveFacet };
}
