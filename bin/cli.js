#!/usr/bin/env node
'use strict';

const readline = require('readline');
const path = require('path');
const { listSkills } = require('../lib/skills');
const { adapters } = require('../lib/adapters');
const { install } = require('../lib/install');

const ASSISTANT_IDS = Object.keys(adapters);

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args.flags[key] = true;
      } else {
        args.flags[key] = next;
        i++;
      }
    } else if (a === '-y') {
      args.flags.yes = true;
    } else {
      args._.push(a);
    }
  }
  return args;
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (a) => resolve(a.trim())));
}

function parseList(val, valid) {
  if (val === true || !val) return [];
  const items = String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (val === 'all' || items.includes('all')) return valid.slice();
  return items;
}

function printHelp() {
  console.log(`
ai-skills — install reusable AI assistant skills

Usage:
  npx @smitdev/ai-skills <command> [options]

Commands:
  list                 List the skills bundled in this package
  install              Install skills for one or more assistants

Options for "install":
  --assistant <ids>    Comma-separated: ${ASSISTANT_IDS.join(', ')} (or "all")
  --skill <names>      Comma-separated skill names (or "all"; default: all)
  --global             Install to your home dir (Claude Code only)
  --project            Install into a project (default)
  --dir <path>         Project directory (default: current directory)
  --dry-run            Show what would change without writing
  -y, --yes            Skip interactive prompts (use flags / defaults)
  -h, --help           Show this help

Examples:
  npx @smitdev/ai-skills list
  npx @smitdev/ai-skills install --assistant claude --global
  npx @smitdev/ai-skills install --assistant copilot,cursor --skill contract
`);
}

async function pickFromList(rl, label, options) {
  console.log(`\n${label}`);
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o.label}`));
  console.log(`  (comma-separated numbers, or "a" for all)`);
  const ans = await ask(rl, '> ');
  if (ans.toLowerCase() === 'a' || ans === '') return options.map((o) => o.id);
  const picked = ans
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => n >= 1 && n <= options.length)
    .map((n) => options[n - 1].id);
  return [...new Set(picked)];
}

async function runInstall(args) {
  const skills = listSkills();
  if (skills.length === 0) {
    console.error('No skills found in this package.');
    process.exit(1);
  }

  const projectDir = path.resolve(
    typeof args.flags.dir === 'string' ? args.flags.dir : process.cwd()
  );
  const dryRun = !!args.flags['dry-run'];
  const scope = args.flags.global ? 'global' : 'project';

  let assistants = parseList(args.flags.assistant, ASSISTANT_IDS);
  let skillNames = parseList(args.flags.skill, skills.map((s) => s.name));

  const nonInteractive =
    args.flags.yes || (assistants.length > 0);

  if (!nonInteractive && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (assistants.length === 0) {
      assistants = await pickFromList(
        rl,
        'Which assistant(s)?',
        ASSISTANT_IDS.map((id) => ({ id, label: adapters[id].label }))
      );
    }
    if (skillNames.length === 0) {
      skillNames = await pickFromList(
        rl,
        'Which skill(s)?',
        skills.map((s) => ({ id: s.name, label: `${s.name} — ${truncate(s.description, 60)}` }))
      );
    }
    rl.close();
  }

  if (assistants.length === 0) assistants = ASSISTANT_IDS.slice();
  if (skillNames.length === 0) skillNames = skills.map((s) => s.name);

  const invalidA = assistants.filter((a) => !ASSISTANT_IDS.includes(a));
  if (invalidA.length) {
    console.error(`Unknown assistant(s): ${invalidA.join(', ')}`);
    console.error(`Valid: ${ASSISTANT_IDS.join(', ')}`);
    process.exit(1);
  }
  const selectedSkills = skills.filter((s) => skillNames.includes(s.name));
  const invalidS = skillNames.filter((n) => !skills.some((s) => s.name === n));
  if (invalidS.length) {
    console.error(`Unknown skill(s): ${invalidS.join(', ')}`);
    console.error(`Valid: ${skills.map((s) => s.name).join(', ')}`);
    process.exit(1);
  }

  const results = install({
    assistants,
    skills: selectedSkills,
    scope,
    projectDir,
    dryRun,
  });

  const verb = dryRun ? 'Would install' : 'Installed';
  console.log(`\n${verb} ${selectedSkills.length} skill(s) for ${assistants.length} assistant(s):\n`);
  for (const r of results) {
    console.log(`  [${r.assistant}] ${r.skill}  ->  ${r.path}  (${r.action})`);
  }
  if (dryRun) console.log('\n(dry run — no files were written)');
}

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  if (args.flags.help || args.flags.h || cmd === 'help' || !cmd) {
    printHelp();
    return;
  }

  if (cmd === 'list') {
    const skills = listSkills();
    console.log(`\n${skills.length} skill(s) available:\n`);
    for (const s of skills) {
      console.log(`  ${s.name}`);
      console.log(`    ${truncate(s.description, 100)}\n`);
    }
    return;
  }

  if (cmd === 'install') {
    await runInstall(args);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
