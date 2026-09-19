/* ============================================================
   bKash — the device: the handset's geometry and the pose solver.
   Shared by services.ts (the CSS device, the arrival, the zoom) and
   phone3d.ts (the WebGL device), so both are built from ONE set of
   numbers and coincide at the handoff by construction.
   ============================================================ */

/* ---- the handset --------------------------------------------------
   `assets/models/phone.glb` — "iPhone 16 - Free" by Wes (Sketchfab
   Standard licence), meshopt-compressed from 2.46MB to 305KB. These
   are read from the model's vertices (tools: world-space bounds per
   node; the corner radius from the outermost vertex along the
   diagonal of a rounded rectangle), in the model's units — one unit
   is about a centimetre. The front of the phone faces +z; the display
   is the node `Object_18`, a flat plane at z = 0.3901. */
export const MODEL = {
  display: { w: 6.5266, h: 14.085, z: 0.3901, r: 0.9172, node: 'Object_18' },
  body: { w: 7.1832, h: 14.7387, r: 1.2403 },
  /** the dynamic island: its width, height, and the gap above it to the display's top edge */
  island: { w: 1.8207, h: 0.3631, top: 0.309 },
  /** the home-screen screenshot: its pixel size */
  shot: { w: 720, h: 4730 },
  /** display aspect, w/h */
  get aspect() {
    return this.display.w / this.display.h;
  },
  /** how much of the screenshot's height the display shows from the top */
  get visibleFrac() {
    return this.shot.w / this.aspect / this.shot.h;
  },
};

/* ---- the pose: six numbers that put the device on the photograph ----
   CSS `translate3d(tx,ty,tz) rotateZ(rz) rotateY(ry) rotateX(rx)` about
   the device's centre, projected by the pin's perspective. Solved by
   Levenberg–Marquardt on the four corners: eight equations, six
   unknowns; the residual is how far the photograph's lens is from the
   CSS camera. */
export type Pose = { tx: number; ty: number; tz: number; rx: number; ry: number; rz: number };
export const POSE_ZERO: Pose = { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0 };

/** The pin's camera: the device's centre, the perspective distance and its origin, in px. */
export type Camera = { cx: number; cy: number; d: number; ox: number; oy: number };

/** Project the device's four corners (W×H, centred at cx,cy) under a pose. TL, TR, BR, BL. */
export function projectCorners(q: Pose, W: number, H: number, cam: Camera): number[] {
  const out: number[] = [];
  const [ca, sa] = [Math.cos(q.rx), Math.sin(q.rx)];
  const [cb, sb] = [Math.cos(q.ry), Math.sin(q.ry)];
  const [cc, sc] = [Math.cos(q.rz), Math.sin(q.rz)];
  for (const [x, y] of [
    [-W / 2, -H / 2],
    [W / 2, -H / 2],
    [W / 2, H / 2],
    [-W / 2, H / 2],
  ]) {
    /* rotateX, then rotateY, then rotateZ, then translate — the CSS
       matrices, in the order the functions apply to a point. */
    const y1 = y * ca;
    const z1 = y * sa;
    const x2 = x * cb + z1 * sb;
    const z2 = -x * sb + z1 * cb;
    const x3 = x2 * cc - y1 * sc;
    const y3 = x2 * sc + y1 * cc;
    const X = cam.cx + x3 + q.tx;
    const Y = cam.cy + y3 + q.ty;
    const Z = z2 + q.tz;
    const k = cam.d / (cam.d - Z);
    out.push(cam.ox + (X - cam.ox) * k, cam.oy + (Y - cam.oy) * k);
  }
  return out;
}

export function solvePose(
  target: number[],
  W: number,
  H: number,
  cam: Camera,
): { pose: Pose; rms: number } {
  const qw = (target[2] - target[0] + target[4] - target[6]) / 2;
  const k0 = qw / W;
  const qcx = (target[0] + target[2] + target[4] + target[6]) / 4;
  const qcy = (target[1] + target[3] + target[5] + target[7]) / 4;
  let q: Pose = {
    tx: (qcx - cam.ox) / k0 + cam.ox - cam.cx,
    ty: (qcy - cam.oy) / k0 + cam.oy - cam.cy,
    tz: cam.d - cam.d / k0,
    rx: 0,
    ry: 0,
    rz: 0,
  };
  const keys: (keyof Pose)[] = ['tx', 'ty', 'tz', 'rx', 'ry', 'rz'];
  const step: Pose = { tx: 0.5, ty: 0.5, tz: 0.5, rx: 1e-3, ry: 1e-3, rz: 1e-3 };
  const resid = (p: Pose) => projectCorners(p, W, H, cam).map((v, i) => v - target[i]);
  const cost = (r: number[]) => r.reduce((a, b) => a + b * b, 0);
  let r = resid(q);
  let c = cost(r);
  let lambda = 1e-3;
  for (let it = 0; it < 60; it++) {
    /* numeric Jacobian, central differences */
    const J: number[][] = r.map(() => new Array(6).fill(0));
    keys.forEach((key, j) => {
      const h = step[key];
      const rp = resid({ ...q, [key]: q[key] + h });
      const rm = resid({ ...q, [key]: q[key] - h });
      for (let i = 0; i < 8; i++) J[i][j] = (rp[i] - rm[i]) / (2 * h);
    });
    const A: number[][] = keys.map(() => new Array(6).fill(0));
    const g = new Array(6).fill(0);
    for (let i = 0; i < 8; i++)
      for (let a = 0; a < 6; a++) {
        g[a] += J[i][a] * r[i];
        for (let b = 0; b < 6; b++) A[a][b] += J[i][a] * J[i][b];
      }
    for (let a = 0; a < 6; a++) A[a][a] *= 1 + lambda;
    const delta = solve6(
      A,
      g.map((v) => -v),
    );
    if (!delta) break;
    const next = { ...q };
    keys.forEach((key, j) => (next[key] = q[key] + delta[j]));
    const rn = resid(next);
    const cn = cost(rn);
    if (cn < c) {
      q = next;
      r = rn;
      c = cn;
      lambda = Math.max(lambda / 4, 1e-9);
      if (c < 1e-6) break;
    } else lambda = Math.min(lambda * 8, 1e6);
  }
  return { pose: q, rms: Math.sqrt(c / 8) };
}

/** Gaussian elimination with partial pivoting, 6×6. */
function solve6(A: number[][], b: number[]): number[] | null {
  const n = 6;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let i = col + 1; i < n; i++) if (Math.abs(M[i][col]) > Math.abs(M[piv][col])) piv = i;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let i = col + 1; i < n; i++) {
      const f = M[i][col] / M[col][col];
      for (let j = col; j <= n; j++) M[i][j] -= f * M[col][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
