# Needs register

Everything outstanding: content, information, decisions. Each row says what
happens if we never get it, so nothing silently becomes a 3am surprise.

Status: `OPEN` · `ASKED` · `GOT` · `WORKAROUND` (we shipped around it)

---

## A. Content we don't have

**A0 — HIGHEST PRIORITY. Real wide establishing photograph.**
The hero plate (`60fcba44`, 2000x1129, alt "Village market street at golden hour")
and all three figure cutouts (mother+daughter, agent shop, merchant stall) are
**AI-generated**. The supplied client photography is real, professional, and
carries visible bKash QR materials. The hero sequence zooms to 7.4x on the AI
figures — hands, faces, fabric — which is exactly where generative artifacts
show. Need: a real deep-focus wide location shot from bKash's photo library with
separable subjects. Supplied portraits cannot substitute: they are shallow depth
of field, so background figures are optically blurred and cannot be zoomed into.
Status: OPEN — raise tonight.

**Hard evidence (2026-09-16):** at the merchant hold the camera reaches 4.2x on
the stall, and the bKash logos printed all over it are AI-fabricated — wrong
wordmark proportions and nonsense Bangla tagline text. That is bKash's own brand
mark, rendered incorrectly, magnified, held on screen for several seconds, in
front of the person who owns it. The agent hold has the same problem on its
QR poster. This is the strongest argument for real photography.

| # | Need | Why it matters | If we never get it | Status |
|---|------|----------------|--------------------|--------|
| A1 | High-res `Agent.jpg` (currently 685x386) | Sits beside two 6000x4000 frames at equal size; agent is the emotional centre of the narrative | Crop tighter and cap the tile's display size so it never scales past ~1:1; slight composition compromise | OPEN |
| A2 | Better board portraits — Edward Yue + Shinya Yoshino (175x175), Nicholas Hughes (240x240), Jason Park (201x251) | 12 faces in a grid; range is 175px to 2400px with mixed aspect | Duotone treatment at small display size (see D1) | OPEN |
| A3 | Final story copy for the 3 hero holds (Amena / Faisal / Rahim) | Prototype still says "Placeholder line about..." | We write plausible copy and flag it as unapproved | ASKED |
| A4 | Bird-collage story captions (9 frames) | Same placeholder problem | Cut the captions, let the photos carry it | OPEN |
| A5 | Investor logos as SVG (currently mixed png/webp, one is `images.png`) | Logos scale up in the "Backed by the best" row | Cap display size; some will be soft | OPEN |
| A6 | Portrait/vertical crop of Kamal Quadir (have 1376x768 landscape) | CEO quote section wants a portrait treatment | Design the section around a landscape image | OPEN |

## A7 — real names now known for the three story subjects

`Website homepage version/src/App.tsx` carries the same three photographs the
hero uses, with real identities attached:

| photo | who |
|-------|-----|
| `Customer.jpg` | **Anisul Haque**, CNG driver |
| `Agent.jpg` | **Munni Barua**, known as "bKash Didi" |
| `Merchant.jpg` | **Shajib Ahmed**, book shop owner |

The hero currently uses invented personas (Amena Begum, Faisal Ahmed, Rahim
Mia) over AI imagery. These are real people with real photographs. Worth
deciding whether the hero should adopt them — it would strengthen A0
considerably. Status: OPEN.

## A8 — the Careers photograph is AI-generated too

`careers.jpg` (About page, "A team built to make a difference") is AI, not a
photograph: hands and forearms are wrong, and the desks behind them dissolve.
It presents as a real office photo, which puts it in the same category as A0.

`road-ahead.jpg` is fine by contrast — it is openly an **illustration**, so it
is not pretending to be anything. Illustration is a legitimate choice; a fake
photograph is the problem.

If bKash has a real office/team photo, it would close this in one swap.
Status: OPEN.

## B. Information about the room

| # | Need | What it decides | Status |
|---|------|-----------------|--------|
| B1 | Demo machine + GPU | three.js phone vs CSS 3D phone — two different builds | ASKED |
| B2 | Input device: trackpad / wheel / clicker | Scroll damping constant; a clicker needs different handling entirely | ASKED |
| B3 | Screen: size, resolution, projector or panel | Hero zoom targets; dark sections mud out on weak projectors | ASKED |
| B4 | Is it presented live or over screen share? | Screen share re-encodes to ~15-30fps — continuous motion looks bad, favour discrete reveals | OPEN |
| B5 | Length of the demo slot | How far into the scroll he actually gets; what to polish first | OPEN |

## C. Decisions we need from the client

| # | Decision | Recommendation | Status |
|---|----------|----------------|--------|
| C1 | Board portraits: re-supply or duotone | Duotone in bKash pink regardless — unifies 12 mismatched sources, reads as art direction | OPEN |
| C2 | "NGO" (prototype) vs "Microfinance" (supplied icon) | Use supplied set unless told otherwise | OPEN |
| C3 | বাংলা toggle: disable visibly, or hide | Visibly disabled — hiding it invites "where's Bangla?" | OPEN |
| C4 | Is the Kamal Quadir quote cleared for use? | Must confirm before it goes on screen in front of him | OPEN |
| C5 | **Is Inter the right typeface, or does bKash have an official one?** Inter was the prototype's substitute choice, not a brand decision. The whole type scale is tuned to Inter's metrics — the negative tracking at display sizes especially — so a swap is a retune, not a find-and-replace. Cheap to change mechanically (`astro.config.mjs` names the family once and `tokens.css` reads one variable), expensive to retune. | Proceed with Inter; the config makes the swap one entry | OPEN |
| C6 | **Which pinks and greys are official?** `--pink: #e2136e` is confirmed by the mark itself. `specs/refs/bkash-logo.svg` also yields `#d12053` and `#9e1638`, now shipped as `--pink-mid`/`--pink-dark`. But `--pink-wash`, `--pink-line` and the warm-neutral ink ramp (`--ink` … `--ink-4`) were invented in the prototype to sit next to the pink. If bKash has a secondary palette, it should be those instead. | Anchored to the mark where the mark answers it; flag the invented rest | OPEN |

## D. Deferred by us (not blocked — choices we made)

| # | Item | Note |
|---|------|------|
| D1 | Image optimization pass | Nahian: "we can optimize images later." Do before final build; watch total file size |
| D2 | Bangla localization | Out of scope tonight |
| D3 | Full device matrix QA | Demo machine + one phone only |
| D4 | Public deployment | Local demo file only; live branding not cleared for a public URL |
