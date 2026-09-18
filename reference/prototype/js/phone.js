/* ============================================================
   bKash — phone bento
   See specs/sections/phone-bento.md

   A bento grid that fills exactly one screen, pins, then clears
   itself.

   At rest the phone is just another tile — same size, same
   corners, same gaps as its neighbours. It only BECOMES a phone
   once you scroll: its aspect narrows toward 360/760, a bezel
   grows, the notch fades in, and it comes forward.

   The grid falls as ONE RIGID PLANE — hinged along its bottom
   edge, tipping away from the viewer and receding. The cards
   never move relative to each other. Meanwhile the tile
   SEPARATES from that plane, becomes the device, and emerges
   forward on Z as the wall lays down behind it.

   (The reference does the same: a single transformer element for
   the entire grid, inside one perspective container.)

   Every pose is a direct function of scroll position rather than
   a timed animation, so the move scrubs in both directions.
   ============================================================ */

import { Engine } from './engine.js';

const { clamp } = Engine;

/* Cards ride the plane and have no motion of their own.
   `slot` maps each one onto the layout in phone.css — see the
   diagram in specs/sections/phone-bento.md. */
export const CARDS = [
  { slot: 'a', img: 'assets/img/bento/sendmoney.jpg',
    title: 'Send money in seconds',
    blurb: 'Any number, any hour, no branch and no queue.' },
  { slot: 'b', img: 'assets/img/bento/agent.jpg',
    title: '3.5 lakh agents',
    blurb: 'Open when the banks are not.' },
  { slot: 'c', img: 'assets/img/bento/train.jpg',
    title: 'Money moves before the train does',
    blurb: 'Sent from the platform, landed before the doors close.' },
  { slot: 'd', img: 'assets/img/bento/boatman.jpg',
    title: 'Take payment anywhere',
    blurb: 'A QR on the hull is a card machine that never needs power.' },
  { slot: 'e', copyOnly: true,
    title: '85 million',
    blurb: 'people keep their money here. One in twenty mobile money transactions on earth is a bKash user.' },
  { slot: 'f', img: 'assets/img/bento/merchant.jpg',
    title: 'Every stall a storefront',
    blurb: 'A lakh of shopkeepers taking digital payment.' },
  { slot: 'g', img: 'assets/img/bento/ferry.jpg',
    title: 'A shop that fits in a hand',
    blurb: 'Stock on the shoulder, till in the palm.' },
];

/* Phone WIDTH at the end of the zoom, in pixels. Height follows from
   the phone's aspect, so this is the single size dial.

   Capped against the viewport: 520 is right on a desktop but wider
   than the whole screen on a phone, where it rendered at 125% of the
   viewport. Fixed pixel targets have to be bounded by the space that
   actually exists. */
const PHONE_END_W = 520;

const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

/* On a phone the device grows until its outer frame meets the screen
   edges — the viewer's own handset becomes the bKash phone, which is a
   far stronger idea than a shrunken mockup floating in the middle.
   On a desktop it stops at a fixed size, bounded by the viewport. */
const endWidth = (vw) => isPhone() ? vw : Math.min(PHONE_END_W, vw * 0.72);

/* ---- timings, as fractions of the pin -------------------------

   These are deliberately INDEPENDENT of each other. An earlier
   version used one constant for both "growth finishes" and
   "forward starts", so changing where the dolly began also changed
   how fast the phone grew — every adjustment moved the thing you
   were measuring against.

   GROW_END     the phone reaches its final size. One continuous
                curve from the tile; nothing else depends on it.
   SLIDE_START  the phone begins moving left.
   SLIDE_X      final centre, as a fraction of viewport width.

   There used to be a second "dolly" stage that kept growing the
   phone after GROW_END. It slingshotted: growth covered 315px over
   two thirds of the pin, then the dolly covered 821px over one
   fifth — about eight times the speed. Eased ends cannot disguise a
   velocity mismatch that large. One curve now does the whole zoom,
   and PHONE_END_H is the dial for how big it finishes.           */
/* The animation finishes before the pin releases, leaving a stretch
   where the phone simply holds. Without it the zoom completed at the
   exact moment the sticky pin began to unstick, so the device started
   scrolling away — and the footer rising over it — before anyone could
   read the services it had just spent the whole section revealing. */
const ANIM_SPAN   = 0.74;

const GROW_END    = 0.745;
const SLIDE_START = 0.745;
const SLIDE_X     = 0.28;
/* Nowhere to slide to on a phone once the device fills the width, so it
   settles dead centre instead of moving aside for a copy column. */
const slideX = () => isPhone() ? 0.5 : SLIDE_X;

/* The zoom's fixed point, as a fraction of viewport HEIGHT above the
   centre — not a fixed pixel offset, which was tuned against a 992px
   desktop and threw the phone off-screen on a phone.

   The phone moves AWAY from this point as it scales, so the sign
   reads backwards from what you might expect:
     positive  -> focus sits higher -> the phone drifts DOWN
     negative  -> focus sits lower  -> the phone drifts UP    */
const FOCUS_Y_FRAC = -0.121;   // -120px at the 992px reference height

/* Phone only. How far the device's top edge sits BELOW the top of the
   screen when the zoom finishes — so 0 is flush and a positive number
   lets a sliver of background show above it.

   Expressed as a target rather than a focus offset on purpose. The
   focus point that produces it depends on where the bento slot lands
   and how far the device has to grow, both of which move with screen
   size; solving for it per frame is right on every handset, where a
   hand-tuned focus_y is right on exactly one. Tunable live via
   __bkash.phone.topInset(px). */
let PHONE_TOP_INSET = 0;

/* Matches --r-lg, so at rest the tile's corners are identical to
   its neighbours'. */
const TILE_RADIUS = 22;

/* Real phone proportions. Used both for the resting slot and for
   the end pose, so the tile never distorts on the way. */
const PHONE_ASPECT = 360 / 760;

/* ---- the sixteen services ------------------------------------
   Hotspot positions are DERIVED from the screen geometry, not
   placed by eye: the screen is cover-fit at phone aspect, so it
   shows the top 1520px of the 4730px source. Expressed as
   fractions of the screen box, they scale with the phone and
   cannot drift off their icons.

   Copy is PLACEHOLDER — mine, not bKash's. See
   specs/sections/phone-services.md.                             */
const COLS = [0.125, 0.375, 0.625, 0.875];
const ROWS = [0.2631, 0.4026, 0.5420, 0.6814];

const S = (col, row, name, blurb) => ({ x: COLS[col], y: ROWS[row], name, blurb });

export const SERVICES = [
  S(0, 0, 'Send Money',      'Money to any bKash number in seconds, at any hour, without a branch or a queue.'),
  S(1, 0, 'Mobile Recharge', 'Top up any operator from the same balance you keep everything else in.'),
  S(2, 0, 'Cash Out',        'Turn digital money into notes at any of 3.5 lakh agent points.'),
  S(3, 0, 'Make Payment',    'Pay a merchant by scanning their QR. No card, no terminal, no change.'),
  S(0, 1, 'Add Money',       'Pull funds in from a bank account, a card, or a remittance from abroad.'),
  S(1, 1, 'Pay Bill',        'Electricity, gas, water and internet — settled without leaving the house.'),
  S(2, 1, 'Savings',         'Put a little aside each week and watch it build, with no minimum balance.'),
  S(3, 1, 'Loan',            'Small instant credit, decided on your record here. No branch visit, no paperwork.'),
  S(0, 2, 'Insurance',       'Cover for health, accident and travel, starting from a few taka a month.'),
  S(1, 2, 'bKash to Bank',   'Move money into a bank account without queueing at one.'),
  S(2, 2, 'Education',       'School and university fees paid on time, without the day lost travelling.'),
  S(3, 2, 'NGO',             'Give directly to registered organisations, with the receipt in your history.'),
  S(0, 3, 'Toll Pay',        'Cross the bridge without stopping to find change.'),
  S(1, 3, 'Request Money',   'Ask to be paid back, and skip the awkward reminder.'),
  S(2, 3, 'Remittance',      'Money sent from abroad, landing here in minutes rather than days.'),
  S(3, 3, 'Donation',        'Reach people at the other end of the country, instantly.'),
];

export function initPhone() {
  const section = document.querySelector('[data-phone]');
  if (!section) return;

  const pin    = section.querySelector('[data-phone-pin]');
  const grid   = section.querySelector('[data-bento]');
  const device = section.querySelector('[data-phone-device]');
  const slot   = section.querySelector('[data-phone-slot]');
  const head   = section.querySelector('.bento__head');
  const notch  = section.querySelector('.phone__notch');
  if (!grid || !device || !slot || !pin) return;

  CARDS.forEach((c) => {
    const el = document.createElement('figure');
    el.className = 'bento__card bento__card--' + c.slot + (c.copyOnly ? ' bento__card--copy' : '');
    /* The image node is built rather than templated. An interpolated
       source attribute inside an innerHTML string reads to the build
       as a literal asset path and trips its inlining check. */
    if (!c.copyOnly) {
      const im = document.createElement('img');
      im.src = c.img;
      im.alt = c.title;
      el.appendChild(im);
    }
    /* Photo tiles carry a title only — a second line at tile size reads
       as clutter and competes with the photograph. The copy-only card is
       the exception, being all text by definition. */
    const cap = document.createElement('figcaption');
    cap.innerHTML = c.copyOnly
      ? '<h3 class="t-h3">' + c.title + '</h3><p class="t-sm">' + c.blurb + '</p>'
      : '<h3 class="t-h3">' + c.title + '</h3>';
    el.appendChild(cap);
    grid.insertBefore(el, slot);
  });

  let p = 0, phase = 1, growth = 0;
  let selected = 0, live = false;

  /* ---- hotspots over the sixteen icons ---- */
  const spots = section.querySelector('[data-phone-spots]');
  const spotEls = SERVICES.map((sv, i) => {
    const b = document.createElement('button');
    b.className = 'phone__spot';
    b.style.left = (sv.x * 100) + '%';
    b.style.top  = (sv.y * 100) + '%';
    b.type = 'button';
    b.setAttribute('aria-label', sv.name);
    b.addEventListener('click', () => select(i));
    if (spots) spots.appendChild(b);
    return b;
  });

  const panel  = section.querySelector('[data-svc-panel]');
  const svcIdx = section.querySelector('[data-svc-index]');
  const svcTtl = section.querySelector('[data-svc-title]');
  const svcTxt = section.querySelector('[data-svc-body]');

  function select(i) {
    selected = i;
    const sv = SERVICES[i];
    if (svcIdx) svcIdx.textContent = String(i + 1).padStart(2, '0') + ' / 16';
    if (svcTtl) svcTtl.textContent = sv.name;
    if (svcTxt) svcTxt.textContent = sv.blurb;
    spotEls.forEach((el, n) => el.classList.toggle('is-on', n === i));
  }
  select(0);   // first service is selected by default
  let slotBox = null, pinBox = null;
  let lastW = 0, lastH = 0;

  /* The device is a SIBLING of the grid, not a child — that is what
     lets it stay put while the wall falls behind it. It is parked on
     the slot's rect so the resting layout reads as an ordinary cell. */
  /* The slot sits INSIDE the grid, so once the wall starts tipping
     its client rect is a moving target. Measure it only when the
     viewport changes, with the grid's transform cleared, and cache
     it — the resting layout is what every pose is derived from. */
  function measureSlot() {
    const prev = grid.style.transform;
    grid.style.transform = 'none';
    grid.style.setProperty('--phone-col', 'auto');
    const h0 = slot.getBoundingClientRect().height;
    if (h0 > 0) grid.style.setProperty('--phone-col', (h0 * PHONE_ASPECT).toFixed(1) + 'px');
    const s = slot.getBoundingClientRect();
    const b = pin.getBoundingClientRect();
    slotBox = { w: s.width, h: s.height,
                cx: s.left + s.width / 2 - b.left,
                cy: s.top + s.height / 2 - b.top };
    grid.style.transform = prev;
  }

  Engine.read((st) => {
    /* Progress is measured against the PIN's travel, not the whole
       section: the headline above it is part of the section's height
       but not part of the pinned stretch. */
    const r = section.getBoundingClientRect();
    /* Measure the headline, NOT pin.offsetTop — for a sticky element
       offsetTop tracks where it is currently rendered, so it grows as
       the pin sticks and the denominator moves while you scroll. */
    const headH = head ? head.offsetHeight : 0;
    const span = r.height - headH - st.vh;
    p = span > 0 ? clamp((-r.top - headH) / (span * ANIM_SPAN), 0, 1) : 0;

    if (st.vw !== lastW || st.vh !== lastH || !slotBox) {
      lastW = st.vw; lastH = st.vh;
      measureSlot();
    }
    pinBox = { w: st.vw, h: st.vh };
  });

  Engine.write((st) => {
    if (!slotBox || !pinBox || !slotBox.h) return;

    /* One clock drives both the wall and the zoom, so they finish on
       the same beat: at GROW_END the phone is at its final width AND
       the bento is fully tilted and gone. The slide starts there. */
    const eg = ease(clamp(p / GROW_END, 0, 1));                            // zoom + fall
    const es = ease(clamp((p - SLIDE_START) / (1 - SLIDE_START), 0, 1));   // slide

    /* --- the wall falls, as one object ---
       Hinged along its bottom edge so the top tips away, and pushed
       back on Z so it recedes rather than merely rotating in place.
       One transform on one element: the cards hold their positions
       relative to each other throughout. */
    const rot  = 64 * eg;      // positive rotateX tips the top away
    const back = -950 * eg;
    const down = 6 * eg;
    grid.style.transform =
      'translate3d(0, ' + down.toFixed(1) + '%, ' + back.toFixed(0) +
      'px) rotateX(' + rot.toFixed(2) + 'deg)';
    // Reaches exactly zero as the tilt completes, not 8% short of it.
    grid.style.opacity = (1 - clamp((eg - 0.34) / 0.66, 0, 1)).toFixed(3);
    grid.style.pointerEvents = eg > 0.02 ? 'none' : 'auto';

    /* --- the tile becomes the device, and emerges ---
       Phase 1. At eg = 0 it is exactly the slot: same box, same
       corners, no bezel, indistinguishable from its neighbours, so
       the grid gaps stay even. As eg grows its aspect narrows toward
       a real phone, a bezel appears, the notch fades up, and it
       steps forward on Z while the wall goes back.

       Width and height are interpolated directly because the ASPECT
       has to change; a transform can only scale uniformly. It is one
       absolutely-positioned element, so nothing else relayouts. */
    const endH = Math.max(slotBox.h, endWidth(pinBox.w) / PHONE_ASPECT);

    // One continuous curve, tile to final size. No second stage.
    const h = slotBox.h + (endH - slotBox.h) * eg;
    // The slot is already phone-aspect, so this holds at every stage.
    const w = h * PHONE_ASPECT;

    /* --- zoom about the viewport's centre point ---
       The middle of the screen is the fixed point: every part of the
       tile moves away from it in proportion to the scale, exactly as
       a camera pushing in on that point would look.

       This is why the top rises. It is not a corrective shift to keep
       the phone whole — it is what scaling about the centre does. The
       bottom runs off the screen faster than the top approaches it,
       so the crop still reads as the evidence of the push-in. */
    const k        = h / slotBox.h;
    const slotLeft = slotBox.cx - slotBox.w / 2;
    const slotTop  = slotBox.cy - slotBox.h / 2;
    const vcx = pinBox.w / 2;

    /* Where the zoom pushes towards. On a desktop the phone ends taller
       than the viewport, so it crops and FOCUS_Y_FRAC decides how much
       of the top survives. A phone is its own case — see below. */
    const kEnd = endH / slotBox.h;
    /* Solving for a focus point divides by (1 - kEnd), so a device that
       ends the size it started has no solution. It cannot happen at
       these numbers — but a NaN here is a blank section in front of the
       CEO, so it degrades to the centre rather than to nothing. */
    let vcy;
    if (Math.abs(1 - kEnd) < 1e-3) {
      vcy = pinBox.h / 2;
    } else if (isPhone()) {
      /* Aim the TOP edge, not the centre. The device ends ~10% taller
         than the screen, so something has to crop; the services grid
         lives in the upper half of the screenshot, so it has to be the
         bottom. Centring looked like the safe choice and was not — the
         bento slot sits well above the middle, so a zoom about the
         centre drags the device upward and eats 178px of the top on a
         390x750 handset while leaving 104px blank underneath.
         Nahian, 2026-09-17. */
      vcy = (PHONE_TOP_INSET - slotTop * kEnd) / (1 - kEnd);
    } else if (endH <= pinBox.h * 1.08) {
      /* A small overflow still counts as fitting — on a tall desktop
         window the phone can end a few pixels over and centring that is
         right. */
      const wantTop = (pinBox.h - endH) / 2;
      vcy = (wantTop - slotTop * kEnd) / (1 - kEnd);
    } else {
      vcy = pinBox.h / 2 - FOCUS_Y_FRAC * pinBox.h;
    }

    let left  = vcx + (slotLeft - vcx) * k;
    const topY = vcy + (slotTop - vcy) * k;

    /* --- slide left, once the dolly is done --- */
    if (es > 0) {
      const centre = left + w / 2;
      left += (pinBox.w * slideX() - centre) * es;
    }

    device.style.width  = w.toFixed(1) + 'px';
    device.style.height = h.toFixed(1) + 'px';
    device.style.left   = left.toFixed(1) + 'px';
    /* Publish the phone's right edge so the copy can sit against it.
       Anchoring the panel to the device rather than to the viewport
       edge means it keeps its distance if PHONE_END_W or SLIDE_X
       change, instead of needing to be re-tuned alongside them. */
    pin.style.setProperty('--phone-right', (left + w).toFixed(1) + 'px');
    device.style.top    = topY.toFixed(1) + 'px';

    // Bezel and corner radius grow in; the notch arrives late, once
    // the shape is phone-like enough for it to make sense. Both
    // scale with the device so they stay proportional as it dollies.
    const bez = 9 * eg;
    device.style.padding = bez.toFixed(2) + 'px';
    device.style.borderRadius =
      (TILE_RADIUS + 20 * eg).toFixed(1) + 'px';
    if (notch) notch.style.opacity = clamp((eg - 0.34) / 0.36, 0, 1).toFixed(3);

    /* No Z push. Under the section's perspective a translateZ
       magnifies the element about the perspective origin, which both
       scales it beyond its layout size and drags its visual top
       upward — directly at odds with anchoring the top. The zoom is
       already doing the work; a second, projective one only makes the
       geometry unpredictable. */
    device.style.transform = 'none';

    phase = es > 0 ? 2 : 1;

    /* --- services become selectable once the slide is done ---
       This is the last section, so nothing follows it. Scrolling back
       up reverses the whole move and resets the selection to the
       first service, which is where it starts. */
    const wasLive = live;
    live = es > 0.995;
    if (spots) spots.style.pointerEvents = live ? 'auto' : 'none';
    spotEls.forEach(el => { el.tabIndex = live ? 0 : -1; });
    if (panel) {
      const f = clamp((es - 0.45) / 0.55, 0, 1);
      panel.style.opacity = f.toFixed(3);
      panel.style.transform = 'translate3d(0, ' + ((1 - f) * 18).toFixed(1) + 'px, 0)';
      panel.style.pointerEvents = live ? 'auto' : 'none';
    }
    if (wasLive && !live && selected !== 0) select(0);
    growth = eg;
  });

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  return {
    get progress() { return p; },
    get phase() { return phase; },
    get growth() { return growth; },
    /* Live tuning, same idea as __bkash.hero.nudge: the balance between
       what crops off the top and what crops off the bottom is an
       eye judgement on a real screen, not something to round-trip. */
    topInset(px) {
      if (px === undefined) return PHONE_TOP_INSET;
      PHONE_TOP_INSET = +px;
      Engine.wake();
      return PHONE_TOP_INSET;
    },
  };
}
