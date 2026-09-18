#!/usr/bin/env node
// PreToolUse hook (Write|Edit): refuse writes that look like they carry a real
// credential. Best-effort pattern matching, not a secret scanner — it exists to
// catch the obvious accident of pasting a live key into a file.
//
// Contract: reads the hook payload as JSON on stdin, prints a PreToolUse
// permission decision as JSON on stdout, exits 0 either way. Exit codes are not
// used to deny — `permissionDecision` is the supported channel for that, and it
// carries a reason the user actually sees.

import fs from 'node:fs';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function allow() {
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

const PLACEHOLDER =
  /(your[_-]?|example|changeme|replace|placeholder|xxxx|<[^>]*>|dummy|fake|test[_-]?key|redacted)/i;

const PATTERNS = [
  ['AWS access key ID', /AKIA[0-9A-Z]{16}/],
  ['private key block', /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{36,}/],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /sk_live_[A-Za-z0-9]{16,}/],
  ['Anthropic API key', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /sk-[A-Za-z0-9]{32,}/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  [
    'hardcoded secret assignment',
    /(secret|api[_-]?key|password|passwd|token)\s*[:=]\s*['"][A-Za-z0-9/+_=-]{20,}['"]/i,
  ],
];

// Files that legitimately hold secret-shaped placeholder text.
const EXEMPT = [/\.env\.example$/, /(^|\/)(specs|docs)\//, /(^|\/)scripts\/hooks\//];

function main() {
  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    allow(); // Unparseable payload is not this hook's problem to report.
  }

  const toolInput = input.tool_input || {};
  const filePath = String(toolInput.file_path || '');
  // Write sends `content`; Edit sends `new_string`.
  const content = String(toolInput.content ?? toolInput.new_string ?? '');

  if (!content) allow();
  if (EXEMPT.some((re) => re.test(filePath))) allow();

  for (const [label, re] of PATTERNS) {
    const match = content.match(re);
    if (match && !PLACEHOLDER.test(match[0])) {
      deny(
        `This write to ${filePath || 'an unnamed file'} contains what looks like a ${label}. ` +
          `Real credentials belong in an untracked .env file, never in a tracked source file. ` +
          `If this is a false positive, rename the variable so it stops matching, or add the ` +
          `file to the EXEMPT list in scripts/hooks/scan-secrets.mjs.`,
      );
    }
  }

  allow();
}

main();
