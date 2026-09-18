/* ============================================================
   bKash — nav behaviour

   Replaces `reference/prototype/js/main.js:47-73`, which had three
   problems this file exists to fix:

   - H11: it called `hero.getBoundingClientRect()` on every read
     frame to decide whether the nav should be solid. That is a
     forced layout recalc per frame, for a value that changes twice
     a page. IntersectionObserver does it for free.

   - H7: the bird beat puts the hero on a white ground mid-pin, so
     the prototype added a `hero-light` class to <body> — and never
     removed it. Scrolling back up left the nav solid over a dark
     hero for the rest of the session.

   - The drawer set `document.body.style.overflow = 'hidden'` and
     hand-rolled nothing else: no focus trap, no Escape, no focus
     restore. A native <dialog> gives all three.
   ============================================================ */

/* ---- solid / transparent ------------------------------------
   A dark full-bleed header OPTS IN by placing a zero-height
   `[data-nav-dark-end]` marker at the point where its dark region
   ends. The nav is transparent while that marker is still below
   the nav band, and solid once it has passed above it.

   A page with no marker gets a solid nav from the first paint,
   which is the generic answer to "does About start solid?" — it
   starts solid unless something dark says otherwise.

   Only the top offset of `rootMargin` is used, so this does not
   depend on viewport height and needs no recomputing when the
   mobile URL bar collapses.

   The marker may be TOGGLED by a section's own ScrollTrigger at a
   beat boundary — that is the hero's escape hatch for the bird
   beat, where the colour changes without any element moving.
   Because it is driven by ScrollTrigger state rather than a
   one-way class add, it comes back correctly on the way up. */
function initNavGround(nav: HTMLElement): void {
  const markers = [...document.querySelectorAll<HTMLElement>('[data-nav-dark-end]')];

  /* Solid is the CSS default — see Nav.astro. With no marker, with
     JS disabled, or with JS broken, the nav stays legible rather
     than white-on-white, which is the way round the prototype had
     it. */
  if (markers.length === 0) return;

  /* The nav's own rendered height IS --nav-h, so read it rather
     than parsing the token. Parsing would bake in the assumption
     that the token stays in rem, and it silently breaks the day
     someone writes it in px. One layout read per observer, not per
     frame. */
  const navH = () => nav.offsetHeight;

  let over = new Set<Element>();

  /* Transparent only while a marker is positively below the nav
     band. Everything else — no marker, JS not yet run, JS broken —
     leaves the class off, which is the solid default in CSS. */
  const apply = () => nav.classList.toggle('is-over-dark', over.size > 0);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        /* `boundingClientRect.top` tells us the direction, so the
           state is right whether the callback fires on the way in
           or on the way out — and right on a deep link or a
           bfcache restore, where X3 bit the prototype's reveals. */
        if (e.boundingClientRect.top > navH()) over.add(e.target);
        else over.delete(e.target);
      }
      apply();
    },
    { rootMargin: `-${Math.round(navH())}px 0px 0px 0px`, threshold: 0 },
  );

  for (const m of markers) io.observe(m);

  /* `--nav-h` changes at the 767px breakpoint, and rootMargin is
     baked in at construction, so the observer is rebuilt when the
     breakpoint is crossed. Twice a session, not per frame. */
  const mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', () => {
    io.disconnect();
    over = new Set();
    initNavGround(nav);
  });
}

/* ---- the drawer --------------------------------------------
   `<dialog>` + `showModal()` gives the focus trap, Escape, focus
   restore and background inertness that the spec asks for, without
   hand-rolling any of it. */
function initDrawer(): void {
  const drawer = document.querySelector<HTMLDialogElement>('[data-drawer]');
  const open = document.querySelector<HTMLElement>('[data-drawer-open]');
  const close = document.querySelector<HTMLElement>('[data-drawer-close]');
  if (!drawer || !open) return;

  open.addEventListener('click', () => {
    /* showModal() moves focus into the dialog and returns it to the
       burger on close, because the burger was the active element. */
    drawer.showModal();
    open.setAttribute('aria-expanded', 'true');
  });

  close?.addEventListener('click', () => drawer.close());

  /* Escape, explicitly.

     A modal <dialog> is supposed to close on Escape by itself, via
     the `cancel` event. Relying on that alone was tested and could
     not be confirmed in this environment, and the criterion is
     specifically "closes on Escape" — so it is handled here as
     well. `close()` on an already-closed dialog is a no-op, so this
     is additive to the native behaviour, not a replacement for it. */
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      drawer.close();
    }
  });

  drawer.addEventListener('close', () => {
    open.setAttribute('aria-expanded', 'false');
    /* Belt and braces: Escape closes without a click, and not every
       engine restores focus on its own. Only when the burger is
       actually rendered — above 900px it is display:none, and
       focusing a hidden element silently drops focus to <body>. */
    if (open.offsetParent !== null) open.focus({ preventScroll: true });
  });

  /* Clicking the backdrop closes it. The dialog fills the screen, so
     "outside" means the ::backdrop, which targets the dialog itself. */
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) drawer.close();
  });

  /* Following a link inside the drawer must not leave it open behind
     the new page in a bfcache restore. */
  for (const a of drawer.querySelectorAll('a')) {
    a.addEventListener('click', () => drawer.close());
  }
}

/** Boot the nav. Called once, from Nav.astro's own module script. */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  initNavGround(nav);
  initDrawer();
}
