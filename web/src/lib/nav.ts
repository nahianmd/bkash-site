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
  const opener = document.querySelector<HTMLElement>('[data-drawer-open]');
  const closer = document.querySelector<HTMLElement>('[data-drawer-close]');
  if (!drawer || !opener) return;

  const openDrawer = () => {
    /* showModal() gives the focus trap and background inertness.
       Because the burger is the active element when it is called,
       the engine also knows to send focus back here on close. */
    drawer.showModal();
    opener.setAttribute('aria-expanded', 'true');
  };

  /* State is set HERE rather than in a `close` event listener.

     The `close` event was measured not to fire in the target
     browser — neither for close() from a click nor from Escape,
     with `drawer.open` correctly going false either way. Hanging
     aria-expanded and focus restoration off that event left the
     burger permanently announcing aria-expanded="true". So every
     path that closes the drawer calls this, and the event listener
     below is kept only as a harmless backstop for engines that do
     fire it. Idempotent: close() on a closed dialog is a no-op. */
  const closeDrawer = () => {
    drawer.close();
    opener.setAttribute('aria-expanded', 'false');
    /* Only when the burger is actually rendered: above 900px it is
       display:none, and focusing a hidden element silently drops
       focus to <body>. */
    if (opener.offsetParent !== null) opener.focus({ preventScroll: true });
  };

  opener.addEventListener('click', openDrawer);
  closer?.addEventListener('click', closeDrawer);

  /* Escape, explicitly. A modal <dialog> is supposed to close on
     Escape by itself via `cancel`, but the criterion is specifically
     "closes on Escape", so it is not left to chance. */
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    }
  });

  /* Backdrop. The dialog fills the screen, so a click that lands on
     the dialog itself rather than its content is the backdrop. */
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  /* Following a link must not leave the drawer open behind the new
     page on a bfcache restore. */
  for (const a of drawer.querySelectorAll('a')) {
    a.addEventListener('click', closeDrawer);
  }

  /* Backstop for engines that do dispatch it, e.g. a close driven by
     the engine itself rather than by our own code. */
  drawer.addEventListener('close', () => {
    opener.setAttribute('aria-expanded', 'false');
  });
}

/* ---- the menus --------------------------------------------
   Three buttons, three panels. Click toggles; on a device that can
   hover, resting on a button opens after a beat and leaving the
   header closes after a longer one, so crossing from the bar into
   the panel never drops it. Escape, a click outside, and focus
   leaving the header all close. The bar goes solid while a panel is
   open (Nav.astro, .is-open). Layout is read once per open, to place
   the card under its button — never per frame. */
function initMenus(nav: HTMLElement): void {
  const buttons = [...nav.querySelectorAll<HTMLButtonElement>('[data-menu-button]')];
  const panels = new Map(
    [...nav.querySelectorAll<HTMLElement>('[data-menu-panel]')].map((p) => [
      p.dataset.menuPanel!,
      p,
    ]),
  );
  if (buttons.length === 0) return;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const OPEN_DELAY = 80;
  const CLOSE_DELAY = 220;
  let openId: string | null = null;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  /* The card sits under its own button: its text column lines up with
     the button's label, and it is pulled back inside the gutters when
     that would run it off the right edge. */
  function place(panel: HTMLElement, btn: HTMLElement) {
    const navBox = nav.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    /* how far in from the card's edge its text starts — the cells carry
       the padding, not the card; a menu with no titles aligns by its
       first link */
    const title = panel.querySelector('.nav__group-label, .nav__list a');
    const inset = title
      ? title.getBoundingClientRect().left - panel.getBoundingClientRect().left
      : 0;
    const gutter = parseFloat(getComputedStyle(nav).paddingLeft);
    const max = navBox.width - gutter - panel.offsetWidth;
    const x = Math.max(gutter, Math.min(btnBox.left - navBox.left - inset, max));
    panel.style.setProperty('--panel-x', `${Math.round(x)}px`);
  }

  function show(id: string) {
    clearTimer();
    if (openId === id) return;
    if (openId) hideNow(openId);
    const panel = panels.get(id);
    const btn = buttons.find((b) => b.dataset.menuButton === id);
    if (!panel || !btn) return;
    panel.hidden = false;
    /* the placing read is also the one forced layout that lets the
       transition run from the hidden state — once per open, never per
       frame */
    place(panel, btn);
    panel.classList.add('is-in');
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    openId = id;
  }

  function hideNow(id: string) {
    const panel = panels.get(id);
    const btn = buttons.find((b) => b.dataset.menuButton === id);
    if (panel) {
      panel.classList.remove('is-in');
      panel.hidden = true;
    }
    btn?.setAttribute('aria-expanded', 'false');
    if (openId === id) openId = null;
    if (!openId) nav.classList.remove('is-open');
  }

  const closeAll = () => {
    clearTimer();
    if (openId) hideNow(openId);
  };
  const closeSoon = () => {
    clearTimer();
    timer = window.setTimeout(closeAll, CLOSE_DELAY);
  };

  for (const btn of buttons) {
    const id = btn.dataset.menuButton!;
    /* With a pointer that hovers, the panel is already open by the time
       the click lands — so a click only ever opens; leaving the header,
       Escape or a click outside closes. Touch and keyboard toggle. */
    btn.addEventListener('click', () => {
      if (openId === id) {
        if (!canHover) closeAll();
        return;
      }
      show(id);
    });
    if (canHover) {
      btn.addEventListener('pointerenter', () => {
        clearTimer();
        timer = window.setTimeout(() => show(id), OPEN_DELAY);
      });
    }
  }
  if (canHover) {
    nav.addEventListener('pointerleave', closeSoon);
    nav.addEventListener('pointerenter', clearTimer);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId) {
      const id = openId;
      closeAll();
      buttons.find((b) => b.dataset.menuButton === id)?.focus();
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (openId && !nav.contains(e.target as Node)) closeAll();
  });
  nav.addEventListener('focusout', (e) => {
    const to = e.relatedTarget as Node | null;
    if (openId && to && !nav.contains(to)) closeAll();
  });
  window.addEventListener('resize', () => {
    const panel = openId ? panels.get(openId) : null;
    const btn = buttons.find((b) => b.dataset.menuButton === openId);
    if (panel && btn) place(panel, btn);
  });
  /* A choice made: the panel closes behind the navigation. */
  for (const a of nav.querySelectorAll('[data-menu-panel] a'))
    a.addEventListener('click', closeAll);

  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.nav = {
      open: show,
      close: closeAll,
      get openId() {
        return openId;
      },
    };
  }
}

/** Boot the nav. Called once, from Nav.astro's own module script. */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  initNavGround(nav);
  initMenus(nav);
  initDrawer();
}
