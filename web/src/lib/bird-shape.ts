/* ============================================================
   bKash — the mark's geometry

   Extracted 2026-09-18 from specs/refs/bkash-logo.svg: eight
   triangles, vertices as fractions of the bird's own bounding box
   (221.78 x 209.58 logo units, aspect 1.0582). Kept as numbers so
   the mask needs no image and no SVG file at runtime, and so both
   Bird.astro (paths at build time) and bird.ts (the solver at run
   time) read one source. Pure module: no imports, no window.
   ============================================================ */

export const BIRD_ASPECT = 1.0582;

/** Bird-box units: 1000 wide, 945 tall. */
export const BIRD_W = 1000;
export const BIRD_H = Math.round(BIRD_W / BIRD_ASPECT);

export type Tri = [[number, number], [number, number], [number, number]];

/* Fractions of the box. Order and fills as in the official file. */
export const FACETS: Tri[] = [
  [
    [0.3628, 0.4774],
    [0.4214, 0.756],
    [0.8047, 0.5507],
  ],
  [
    [0.4718, 0.061],
    [0.3629, 0.4774],
    [0.8048, 0.5507],
  ],
  [
    [0.0036, 0.0],
    [0.4607, 0.0578],
    [0.3526, 0.4718],
  ],
  [
    [0.0, 0.0814],
    [0.0509, 0.0814],
    [0.1937, 0.2746],
  ],
  [
    [0.8169, 0.548],
    [0.6841, 0.3535],
    [0.899, 0.3128],
  ],
  [
    [0.7947, 0.605],
    [0.8084, 0.5617],
    [0.473, 0.7418],
  ],
  [
    [0.3535, 0.4884],
    [0.4234, 0.8213],
    [0.2158, 1.0],
  ],
  [
    [0.878, 0.4116],
    [1.0, 0.4094],
    [0.9118, 0.3145],
  ],
];

/** The two facets large enough to start inside; the solver picks per viewport. */
export const START_CANDIDATES = [1, 2];

/** A facet's vertices in bird-box px. */
export const facetPx = (i: number) =>
  FACETS[i].map(([x, y]) => [x * BIRD_W, y * BIRD_H] as [number, number]);

/** Centroid of a facet in bird-box px. */
export function centroidPx(i: number): [number, number] {
  const p = facetPx(i);
  return [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
}

/** SVG path data for a facet in bird-box px. */
export const facetPath = (i: number) =>
  'M' +
  facetPx(i)
    .map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
    .join('L') +
  'Z';
