#!/usr/bin/env node
// PreToolUse hook (Bash): stop catastrophic shell commands, and turn
// risky-but-sometimes-legitimate ones into a permission prompt.
//
// Contract: reads the hook payload as JSON on stdin, prints a PreToolUse
// permission decision as JSON on stdout, exits 0 either way.
//
//   deny  — no recovery from running it. Not negotiable in-session.
//   ask   — legitimate sometimes, expensive when it is not. The user decides.
//
// `ask` is the important one: a warning gets read past, a prompt does not.
// This is a safety net, not a substitute for reading the command yourself.

import fs from 'node:fs';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function decide(permissionDecision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

const DENY = [
  ['a recursive delete of / or your home directory', /\brm\s+(-\w*r\w*f\w*|-\w*f\w*r\w*)\s+(\/|~\/?|\$HOME\/?)(\s|$)/],
  ['a recursive delete of everything under /', /\brm\s+(-\w*r\w*f\w*|-\w*f\w*r\w*)\s+\/\*/],
  ['a fork bomb', /:\(\)\s*\{\s*:\s*\|\s*:\s*&?\s*\}\s*;\s*:/],
  ['formatting a filesystem', /\bmkfs(\.\w+)?\b/],
  ['a raw write to a disk device', /\bdd\b[^\n]*\bof=\/dev\/(disk|sd|nvme|hd)/],
  ['a redirect onto a disk device', />\s*\/dev\/(disk|sd|nvme|hd)/],
  ['making the filesystem root world-writable', /\bchmod\s+(-R|--recursive)\s+([0-7]*7[0-7]*|a\+w|ugo\+w)\s+\//],
];

const ASK = [
  ['a force push to main or master', /\bgit\s+push\s+[^\n]*--force[^\n]*\b(main|master)\b/],
  ['a force push', /\bgit\s+push\s+[^\n]*\s-f\b/],
  ['discarding all uncommitted work', /\bgit\s+reset\s+--hard\b/],
  ['deleting untracked files', /\bgit\s+clean\s+[^\n]*-\w*f/],
  ['skipping the git hooks', /--no-verify\b/],
  ['piping a downloaded script straight into a shell', /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba)?sh\b/],
  ['deleting a remote branch', /\bgit\s+push\s+[^\n]*(--delete|\s:\w)/],
];

function main() {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    process.exit(0);
  }

  const command = String((input.tool_input || {}).command || '');
  if (!command) process.exit(0);

  for (const [label, re] of DENY) {
    if (re.test(command)) {
      decide(
        'deny',
        `Refused: this looks like ${label}, which cannot be undone.\n\n${command}\n\n` +
          `If it really is intended, run it yourself in a terminal outside Claude Code.`,
      );
    }
  }

  for (const [label, re] of ASK) {
    if (re.test(command)) {
      decide(
        'ask',
        `This looks like ${label}. It is sometimes the right thing to do, so it needs your ` +
          `confirmation rather than a refusal.\n\n${command}`,
      );
    }
  }

  process.exit(0);
}

main();
