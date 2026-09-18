#!/usr/bin/env node
// PostToolUse hook (Write|Edit): format the one file that was just written.
//
// Adapted from the sdd-kit original, which shelled out to `pnpm exec eslint`.
// This project is npm + Astro and has no ESLint config, so the per-file gate is
// Prettier instead. Whole-project checks (`astro check`) are too slow to run on
// every write — they belong in /verify, which uses the commands in CLAUDE.md.
//
// Prettier lives in web/node_modules, but hooks run from the repo root, so the
// binary is resolved explicitly rather than trusted to be on PATH.
//
// Contract: reads the hook payload as JSON on stdin. Silent exit 0 on success
// or when there is nothing to do. On a parse failure it prints
// {"decision":"block","reason":...}, which does not undo the write — the file
// is already on disk — it hands the problem back to Claude to fix now.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FORMATTABLE = /\.(ts|tsx|js|jsx|mjs|cjs|astro|css|json|md)$/;
const PRETTIER = path.resolve('web/node_modules/.bin/prettier');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    process.exit(0);
  }

  // PostToolUse carries the tool's own response; fall back to what was requested.
  const filePath = String(
    (input.tool_response || {}).filePath || (input.tool_input || {}).file_path || '',
  );

  if (!FORMATTABLE.test(filePath)) process.exit(0);
  if (!fs.existsSync(filePath)) process.exit(0);
  // Prettier not installed yet (e.g. before `npm install`). Not this hook's business.
  if (!fs.existsSync(PRETTIER)) process.exit(0);

  // Run from web/, not the repo root: Prettier resolves plugins named in
  // .prettierrc.json against its own working directory, and
  // prettier-plugin-astro only exists under web/node_modules.
  const result = spawnSync(PRETTIER, ['--write', '--ignore-unknown', path.resolve(filePath)], {
    cwd: path.resolve('web'),
    encoding: 'utf8',
  });

  if (result.error) process.exit(0);
  if (result.status === 0) process.exit(0);

  // A non-zero exit from --write means Prettier could not parse the file. That
  // is a real syntax error and worth surfacing immediately.
  const output = (result.stderr || result.stdout || '').trim();
  if (!output) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `Prettier could not parse ${filePath} — it is probably a syntax error:\n\n${output}`,
    }),
  );
  process.exit(0);
}

main();
