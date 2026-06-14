#!/usr/bin/env node
'use strict';

const path = require('path');
const { listSkills } = require('../lib/skills');
const { adapters } = require('../lib/adapters');
const { install } = require('../lib/install');
const { multiselect, select } = require('../lib/prompt');

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
                       (run with no flags for an interactive picker:
                        ↑/↓ move · space/tab toggle · a all · enter confirm)

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
  const scopeFlagged = !!args.flags.global || !!args.flags.project;
  let scope = args.flags.global ? 'global' : 'project';

  let assistants = parseList(args.flags.assistant, ASSISTANT_IDS);
  let skillNames = parseList(args.flags.skill, skills.map((s) => s.name));

  const nonInteractive = args.flags.yes || assistants.length > 0;

  if (!nonInteractive && process.stdin.isTTY) {
    if (assistants.length === 0) {
      assistants = await multiselect({
        title: 'Which assistant(s)? (Claude Code, Copilot, Cursor, Windsurf)',
        options: ASSISTANT_IDS.map((id) => ({ id, label: adapters[id].label })),
        initial: ['claude'],
      });
    }
    if (skillNames.length === 0) {
      skillNames = await multiselect({
        title: 'Which skill(s)?',
        options: skills.map((s) => ({
          id: s.name,
          label: `${s.name} — ${truncate(s.description, 60)}`,
        })),
        initial: skills.map((s) => s.name),
      });
    }
    // Only Claude Code supports a global scope; ask when relevant.
    if (!scopeFlagged && assistants.includes('claude')) {
      scope = await select({
        title: 'Install scope for Claude Code?',
        options: [
          { id: 'project', label: 'This project  (./.claude/skills)' },
          { id: 'global', label: 'Global         (~/.claude/skills, available everywhere)' },
        ],
        initial: 'project',
      });
    }
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
