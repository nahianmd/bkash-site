/* ============================================================
   bKash — entry point
   ============================================================ */

import { Engine, initReveal, initCounters } from './engine.js';
import { SCENE, initHero } from './hero.js';
import { initPhone } from './phone.js';
import { initPeople } from './people.js';
import { initDebug } from './debug.js';

/* ---- build the hero from SCENE ------------------------------
   Markup is generated from the data structure rather than hand
   written, so swapping placeholder art for real photography is
   a change to SCENE alone. */
function buildScene(scene) {
  const sceneEl = document.querySelector('[data-hero-scene]');
  const capsEl = document.querySelector('.hero__caps');
  if (!sceneEl || !capsEl) return;

  scene.subjects.forEach((s) => {
    const img = document.createElement('img');
    img.className = 'hero__subject';
    img.src = s.img;
    img.alt = s.alt;
    img.dataset.subject = s.id;
    // Positioned as a fraction of the plate so the layout holds
    // at any viewport; the plate is object-fit: cover.
    img.style.left = `${s.box.x * 100}%`;
    img.style.top = `${s.box.y * 100}%`;
    img.style.width = `${s.box.w * 100}%`;
    sceneEl.appendChild(img);
  });

  scene.subjects.forEach((s) => {
    const cap = document.createElement('div');
    cap.className = 'hero__cap';
    cap.dataset.heroCap = s.id;
    cap.innerHTML = `
      <p class="t-eyebrow hero__cap-role">${s.eyebrow}</p>
      <h2 class="t-h2 hero__cap-name">${s.head}</h2>
      <p class="t-lead hero__cap-line">${s.sub}</p>`;
    capsEl.appendChild(cap);
  });
}

/* ---- nav: solid once we leave the dark hero ----
   A class toggle driven from the engine's read phase, not a
   per-frame style write. */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('[data-hero]');
  if (!nav) return;

  let solid = false;
  Engine.read((st) => {
    const threshold = hero
      ? hero.getBoundingClientRect().bottom - 80
      : 80 - st.y;
    // The bird beat puts the hero on a white ground, so the nav has to
    // go solid there even though we have not left the hero section.
    const want = threshold <= 0 || document.body.classList.contains('hero-light');
    if (want !== solid) { solid = want; nav.classList.toggle('is-solid', want); }
  });

  // Mobile drawer
  const drawer = document.querySelector('[data-drawer]');
  document.querySelector('[data-drawer-open]')?.addEventListener('click', () => {
    drawer?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  document.querySelector('[data-drawer-close]')?.addEventListener('click', () => {
    drawer?.classList.remove('is-open');
    document.body.style.overflow = '';
  });
}

/* ---- boot ---- */
function boot() {
  buildScene(SCENE);
  initNav();
  const hero = initHero(SCENE);
  initPeople();
  const phone = initPhone();
  initReveal();
  initCounters();
  Engine.start();

  /* Live handles for tuning and for screenshotting exact scroll
     positions. Harmless in a demo file and the fastest way to
     re-tune damping once we know the input device. */
  window.__bkash = { Engine, SCENE, hero, phone };
  initDebug();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
