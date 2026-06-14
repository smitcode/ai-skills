# @smitdev/ai-skills

Reusable AI assistant **skills** you can install with one command — for
**Claude Code**, **GitHub Copilot**, **Cursor**, and **Windsurf**.

Skills are authored once in the Claude [Agent Skill](https://docs.claude.com/en/docs/claude-code/skills)
format (`SKILL.md`) and converted on install to whatever your assistant expects.

## Install a skill

No global install needed — run it with `npx`:

```bash
# See what's available
npx @smitdev/ai-skills list

# Interactive: pick assistant(s) and skill(s) with the keyboard
#   ↑/↓ move · space or tab toggle · a select all · enter confirm
npx @smitdev/ai-skills install

# Non-interactive examples
npx @smitdev/ai-skills install --assistant claude --global
npx @smitdev/ai-skills install --assistant copilot,cursor,windsurf
npx @smitdev/ai-skills install --assistant all --skill contract --project
```

### Where files go

| Assistant       | Scope            | Destination |
|-----------------|------------------|-------------|
| Claude Code     | `--global`       | `~/.claude/skills/<name>/SKILL.md` |
| Claude Code     | `--project`      | `./.claude/skills/<name>/SKILL.md` |
| GitHub Copilot  | project          | `./.github/instructions/<name>.instructions.md` |
| Cursor          | project          | `./.cursor/rules/<name>.mdc` |
| Windsurf        | project          | `./.windsurf/rules/<name>.md` |

Copilot, Cursor, and Windsurf read their rules from inside a repo, so those
always install into a project directory (`--dir`, default: current folder).
Claude Code can install globally (available everywhere) or per-project.

Use `--dry-run` to preview without writing anything.

## Available skills

- **contract** — Create a build-ready spec / PRD for a feature before any code
  is written, so a coding assistant can build it without guessing.
- **understand** — Read a whole codebase and write a connected set of
  plain-language docs (a map plus one doc per aspect) to onboard fast.
- **gistly** — Answer a question so it's correct, dense, and easy to hold in
  your head: the answer first, the mental model that makes it stick, fewest
  tokens it honestly needs.

## Authoring your own skills

Each skill is a folder under [`skills/`](skills/) containing a `SKILL.md` with
YAML frontmatter:

```markdown
---
name: my-skill
description: When to use this skill, in one or two sentences. The assistant uses this to decide when to apply it.
---

# My Skill

Instructions for the assistant…
```

Drop the folder in `skills/`, bump the version, and publish. Any extra files in
the folder are copied verbatim for Claude Code.

## License

MIT
