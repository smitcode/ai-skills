'use strict';

const fs = require('fs');
const path = require('path');
const { adapters } = require('./adapters');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/**
 * Install the given skills for the given assistants.
 * opts: { assistants: string[], skills: Skill[], scope, projectDir, dryRun }
 * Returns a list of { assistant, skill, path, action } records.
 */
function install({ assistants, skills, scope, projectDir, dryRun }) {
  const results = [];
  for (const id of assistants) {
    const adapter = adapters[id];
    if (!adapter) throw new Error(`Unknown assistant: ${id}`);

    // Project-only adapters ignore a 'global' scope request.
    const effScope = adapter.scope === 'project' ? 'project' : scope;

    for (const skill of skills) {
      const targets = adapter.resolve(skill, { scope: effScope, projectDir });
      for (const t of targets) {
        const existed = fs.existsSync(t.path);
        if (!dryRun) {
          if (t.copyDir) copyDir(t.copyDir, t.path);
          else writeFile(t.path, t.content);
        }
        results.push({
          assistant: adapter.label,
          skill: skill.name,
          path: t.path,
          action: existed ? 'updated' : 'created',
        });
      }
    }
  }
  return results;
}

module.exports = { install, copyDir };
