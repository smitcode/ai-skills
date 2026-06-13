'use strict';

const os = require('os');
const path = require('path');

/**
 * Each adapter turns a parsed skill into one or more output targets:
 *   { path, content }      -> write a single file
 *   { path, copyDir }      -> recursively copy a source folder (native format)
 *
 * `scope` is 'global' (user home), 'project' (a repo), or 'both'.
 */

// YAML-safe scalar: JSON double-quoted strings are valid YAML double-quoted
// scalars, so this handles colons, quotes, and apostrophes in descriptions.
function yamlString(s) {
  return JSON.stringify(String(s == null ? '' : s));
}

const claude = {
  id: 'claude',
  label: 'Claude Code',
  scope: 'both',
  // Native format — copy the whole skill folder verbatim.
  resolve(skill, { scope, projectDir }) {
    const base =
      scope === 'global'
        ? path.join(os.homedir(), '.claude', 'skills')
        : path.join(projectDir, '.claude', 'skills');
    return [{ path: path.join(base, skill.name), copyDir: skill.dir }];
  },
};

const copilot = {
  id: 'copilot',
  label: 'GitHub Copilot',
  scope: 'project',
  resolve(skill, { projectDir }) {
    const content =
      `---\n` +
      `description: ${yamlString(skill.description)}\n` +
      `applyTo: "**"\n` +
      `---\n\n` +
      skill.body;
    return [
      {
        path: path.join(
          projectDir,
          '.github',
          'instructions',
          `${skill.name}.instructions.md`
        ),
        content,
      },
    ];
  },
};

const cursor = {
  id: 'cursor',
  label: 'Cursor',
  scope: 'project',
  resolve(skill, { projectDir }) {
    const content =
      `---\n` +
      `description: ${yamlString(skill.description)}\n` +
      `globs:\n` +
      `alwaysApply: false\n` +
      `---\n\n` +
      skill.body;
    return [
      {
        path: path.join(projectDir, '.cursor', 'rules', `${skill.name}.mdc`),
        content,
      },
    ];
  },
};

const windsurf = {
  id: 'windsurf',
  label: 'Windsurf',
  scope: 'project',
  resolve(skill, { projectDir }) {
    const content =
      `---\n` +
      `trigger: model_decision\n` +
      `description: ${yamlString(skill.description)}\n` +
      `---\n\n` +
      skill.body;
    return [
      {
        path: path.join(projectDir, '.windsurf', 'rules', `${skill.name}.md`),
        content,
      },
    ];
  },
};

const adapters = { claude, copilot, cursor, windsurf };

module.exports = { adapters, yamlString };
