// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  /* ---- fonts ------------------------------------------------
     The prototype shipped five hand-subset woff2 files that were
     not subset consistently: weight 600 carried 222KB of glyph
     data against weight 500's 26KB, and only weight 400 had a
     latin-ext file at all. Since `.t-h1` is weight 700 and
     `.t-h2`/`.t-h3`/`.t-eyebrow` are 600, a single `a-macron` in
     a headline fell back to the system font mid-word.

     One variable file per subset replaces all five: the source
     face declares `font-weight: 100 900`, so 400/500/600/700 all
     come out of the same file, and latin-ext covers every weight
     rather than only 400.

     Why the `local` provider and not `npm`: the npm provider
     resolves a package's whole `index.css` and never receives the
     `subsets` option (`unifont/dist/index.mjs:780` passes only
     `formats` to `resolveFromLocal`). It therefore emitted all
     seven subsets - cyrillic, greek and vietnamese included - and
     preloaded every one. Naming the two variants explicitly is
     the only way to ship exactly the two this site renders.

     `src` is a package import, so the files stay pinned to the
     devDependency and the build needs no network.

     The unicode ranges below are copied verbatim from
     `@fontsource-variable/inter@5.3.0`'s own index.css.        */
  fonts: [
    {
      name: 'Inter Variable',
      cssVariable: '--font-inter',
      provider: fontProviders.local(),
      display: 'swap',
      optimizedFallbacks: true,
      fallbacks: ['ui-sans-serif', 'system-ui', '-apple-system', 'Helvetica Neue', 'sans-serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'],
            unicodeRange: [
              'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA',
              'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122',
              'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD',
            ],
          },
          {
            weight: '100 900',
            style: 'normal',
            src: ['@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2'],
            unicodeRange: [
              'U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF',
              'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF',
              'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F',
              'U+A720-A7FF',
            ],
          },
        ],
      },
    },
  ],
});
