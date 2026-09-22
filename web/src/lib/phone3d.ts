/* ============================================================
   bKash — the phone as an object. One WebGL canvas over the pin, one
   handset mesh, driven by the SAME six-number pose the CSS device
   uses, through a camera built to be the CSS camera: world units are
   CSS pixels, the eye sits at the pin's perspective origin at the
   perspective distance, and the frustum is off-centre so a point at
   z = 0 draws at its own pixel. The display plane is the group's
   origin, so rotating the group is rotating the CSS device.

   Loaded on demand (services.ts imports this module as the section
   approaches); the CSS device is the fallback and takes over at Rest
   B for the zoom, where the two coincide by construction.
   ============================================================ */

import {
  Box3,
  BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MODEL, type Camera, type Pose } from './device';

/** What the object does after the emergence: where it slides to, how
    big it is there, and the small rotations that keep it alive — all in
    CSS conventions (px, y down, rotate signs as the pose's). */
export type Live = { dx: number; dy: number; s: number; rx: number; ry: number };
export const LIVE_ZERO: Live = { dx: 0, dy: 0, s: 1, rx: 0, ry: 0 };

export type Phone3D = {
  /** the pin's size and camera, and the display's width at Rest B in px */
  setCamera(vw: number, vh: number, cam: Camera, screenW: number): void;
  /** the pose scaled by u (1 = on the photograph, 0 = Rest B), plus the live offsets */
  setPose(pose: Pose, u: number, live?: Live): void;
  render(): void;
  /** the display's corners as the WebGL camera projects them: TL, TR, BR, BL, in pin px */
  projectDisplayCorners(): number[];
  /** the model's bounds in its own units, for a sanity check */
  bounds(): { model: number[]; display: number[] };
  dispose(): void;
};

export async function createPhone3D(
  canvas: HTMLCanvasElement,
  modelUrl: string,
  screenUrl: string,
): Promise<Phone3D> {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  /* No tone mapping: the screen's pixels must be the screenshot's, so
     the handoff to the CSS device is exact. */
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera();
  camera.matrixAutoUpdate = true;

  /* group (the pose) → fit (px per unit) → model (display plane at the origin) */
  const group = new Group();
  const fit = new Group();
  group.add(fit);
  scene.add(group);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const [gltf, shot] = await Promise.all([
    loader.loadAsync(modelUrl),
    new TextureLoader().loadAsync(screenUrl),
  ]);
  const model = gltf.scene;
  model.position.z = -MODEL.display.z;
  fit.add(model);

  /* The display: the screenshot, unlit, mapped by the plane's own
     extent — planar UVs from the vertices, since the model's are the
     author's. Drawn last and without depth so it never fights the
     front glass it is coplanar with. */
  const display = model.getObjectByName(MODEL.display.node) as Mesh | undefined;
  if (display) {
    const geo = display.geometry as BufferGeometry;
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const pos = geo.getAttribute('position');
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[2 * i] = (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
      uv[2 * i + 1] = (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
    }
    geo.setAttribute('uv', new BufferAttribute(uv, 2));
    shot.colorSpace = SRGBColorSpace;
    shot.anisotropy = renderer.capabilities.getMaxAnisotropy();
    /* the top of the screenshot, as much of it as the display shows */
    shot.repeat.set(1, MODEL.visibleFrac);
    shot.offset.set(0, 1 - MODEL.visibleFrac);
    shot.needsUpdate = true;
    const old = display.material;
    display.material = new MeshBasicMaterial({
      map: shot,
      toneMapped: false,
      depthTest: false,
    });
    display.renderOrder = 1000;
    if (!Array.isArray(old)) old.dispose();
  }

  let vw = 1;
  let vh = 1;
  let cam: Camera = { cx: 0, cy: 0, d: 1500, ox: 0, oy: 0 };
  let screenW = 1;
  let screenH = 1;

  function setCamera(w: number, h: number, c: Camera, sw: number) {
    vw = w;
    vh = h;
    cam = c;
    screenW = sw;
    screenH = sw / MODEL.aspect;
    renderer.setSize(vw, vh, false);
    /* The CSS camera: eye at the perspective origin, d in front of the
       z = 0 plane; an off-centre frustum whose near plane spans the
       pin. World y is up, so CSS y is negated throughout. */
    const near = 10;
    const far = 40000;
    const k = near / cam.d;
    camera.position.set(cam.ox, -cam.oy, cam.d);
    camera.rotation.set(0, 0, 0);
    camera.updateMatrixWorld(true);
    camera.projectionMatrix.makePerspective(
      -cam.ox * k,
      (vw - cam.ox) * k,
      cam.oy * k,
      -(vh - cam.oy) * k,
      near,
      far,
    );
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    /* px per model unit, so the display is exactly screenW wide */
    const s = screenW / MODEL.display.w;
    fit.scale.setScalar(s);
  }

  function setPose(p: Pose, u: number, live: Live = LIVE_ZERO) {
    group.position.set(cam.cx + p.tx * u + live.dx, -(cam.cy + p.ty * u + live.dy), p.tz * u);
    /* CSS rotateZ·rotateY·rotateX in a y-down frame is Rz(−rz)·Ry(ry)·Rx(−rx)
       in three's y-up frame; 'ZYX' applies X first, as CSS does. */
    group.rotation.set(-(p.rx * u + live.rx), p.ry * u + live.ry, -p.rz * u, 'ZYX');
    group.scale.setScalar(live.s);
    group.updateMatrixWorld(true);
  }

  function render() {
    renderer.render(scene, camera);
  }

  const v = new Vector3();
  function projectDisplayCorners(): number[] {
    const out: number[] = [];
    for (const [x, y] of [
      [-screenW / 2, screenH / 2],
      [screenW / 2, screenH / 2],
      [screenW / 2, -screenH / 2],
      [-screenW / 2, -screenH / 2],
    ]) {
      v.set(x, y, 0).applyMatrix4(group.matrixWorld).project(camera);
      out.push(((v.x + 1) / 2) * vw, ((1 - v.y) / 2) * vh);
    }
    return out;
  }

  function bounds() {
    const m = new Box3().setFromObject(model);
    const d = display ? new Box3().setFromObject(display) : new Box3();
    const f = (b: Box3) =>
      [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map((n) => +n.toFixed(3));
    return { model: f(m), display: f(d) };
  }

  function dispose() {
    renderer.dispose();
    shot.dispose();
  }

  return { setCamera, setPose, render, projectDisplayCorners, bounds, dispose };
}
