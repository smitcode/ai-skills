'use strict';

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

/**
 * Minimal YAML frontmatter parser. Handles the flat `key: value` pairs we use
 * in SKILL.md (name, description). Values run to end of line; surrounding
 * quotes are stripped. This is intentionally tiny so the installer ships with
 * zero dependencies.
 */
function parseFrontmatter(raw) {
  const fm = {};
  const lines = raw.split(/\r?\n/);
  let key = null;
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (m) {
      key = m[1];
      fm[key] = stripQuotes(m[2].trim());
    } else if (key && /^\s+\S/.test(line)) {
      // continuation line for a folded value
      fm[key] = (fm[key] + ' ' + line.trim()).trim();
    }
  }
  return fm;
}

function stripQuotes(v) {
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

/**
 * Parse a single skill folder into { name, description, body, dir }.
 * Only the FIRST frontmatter block (the top of SKILL.md) is stripped — any
 * `---` inside fenced code blocks in the body is preserved.
 */
function parseSkill(dir) {
  const file = path.join(dir, 'SKILL.md');
  const md = fs.readFileSync(file, 'utf8');
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  let fm = {};
  let body = md;
  if (m) {
    fm = parseFrontmatter(m[1]);
    body = md.slice(m[0].length);
  }
  return {
    name: fm.name || path.basename(dir),
    description: fm.description || '',
    body: body.replace(/^\s+/, ''),
    dir,
  };
}

/** Discover every skill folder under skills/. */
function listSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map((d) => parseSkill(path.join(SKILLS_DIR, d.name)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { listSkills, parseSkill, parseFrontmatter, SKILLS_DIR };
