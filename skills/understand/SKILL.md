---
name: understand
description: Read a whole codebase and write a set of plain-language docs that explain it - one overview/map doc plus one doc per aspect (UI, styles, API, models, data, testing, features, services, and so on). Use this when someone wants to understand a project as a whole or get onboarded to a repo - things like "help me understand this codebase", "document this repo", "explain how this project is structured", "map out the code", "onboard me to this project", or "I just joined and need to learn this code". This is for the WHOLE codebase. It can also explain one single feature in depth on request - things like "explain how login works", "walk me through the checkout flow", "how does feature X work" - but only after confirming with the user first (see "Explaining a single feature on request").
---

# Understanding

The goal is to help someone understand a codebase fast - like a new engineer joining the team next week. You do that by reading the code and writing a small set of plain, connected docs: one map that gives the big picture, and one doc per aspect (UI, API, data, and so on) that goes deeper.

Write everything for a smart person who is new to this project. No jargon dumps. Point to real files. Don't make things up - if you didn't read something, say so.

Do these steps in order: survey the repo, pick the aspects, write the map, then write each aspect doc.

## Step 1 - Survey the repo

Get the big picture before going deep. Look at:

- The entry points (main file, app start, routes, index).
- The folder layout - what the top-level folders are for.
- Config and dependencies (package.json, requirements, env files) - this tells you the stack and the main libraries.
- The README, if there is one.

You don't need to read every file. Read the entry points and a few important files in each area so you understand how the project is put together. Note what you did and didn't read.

## Step 2 - Pick the aspects

Don't force a fixed list. Look at what this repo actually has and pick the aspects that apply. A good default set:

1. UI elements
2. Styles
3. API
4. Models
5. Data
6. Testing
7. Features
8. Services

But adjust to the repo. Drop ones that don't exist (a backend repo has no UI or styles). Add ones that matter here but aren't listed (for example: auth, config, state management, build/deploy, data flow, third-party integrations). Tell the user the list of aspects you landed on before you write.

## Step 3 - Write the map doc first

This is the most important doc - it ties everything together and gives the mental model. Write it before the aspect docs. Use this shape:

```markdown
# Codebase map: <project name>

## What this project is

One short paragraph in plain words - what it does and who it's for.

## The big pieces

The main parts of the system and what each one is responsible for. Link to the
aspect doc for each (e.g. "see api.md").

## How it's laid out

The folder structure and what each top-level folder is for.

## How a typical action flows through

Follow one common action from start to finish (e.g. a user clicks X -> this
component -> this API -> this service -> this data). This is the part that makes
it all click. A simple diagram or step list is great here.

## Stack and key dependencies

The main languages, frameworks, and libraries, and what each is used for.

## Where to start reading

The 3-5 files a newcomer should open first, and why.

## What this map skips

Anything you didn't read or that's out of scope, so the reader isn't misled.
```

## Step 4 - Write one doc per aspect

For each aspect from Step 2, write a doc using the same shape so they all feel consistent:

```markdown
# <Aspect> (e.g. API)

## What this covers

One or two sentences - what this aspect is and why it matters here.

## Where it lives

The key files and folders, with real paths:

- `path/to/file` - what it does

## How it works

The mental model in plain words. How the pieces fit together. A small diagram
or flow helps a lot.

## The main pieces

The important files/modules/functions and what each one does. Keep it to the
ones that matter, not every file.

## How it connects to the rest

How this aspect talks to the others (e.g. the API calls these services, which
read these models).

## Gotchas

The non-obvious things - surprises, tricky bits, patterns you have to know.
Whatever would trip up a newcomer.

## Where to start reading

The first file or two to open to understand this aspect.
```

## Where to save the docs

Put all the docs in one folder so they're a set. Reuse the project's docs folder if there is one - look for `docs/`, then use `docs/codebase/`. If there's no docs folder, create `codebase-map/`.

Name the files simply: the map is `overview.md`, and each aspect is its lowercase name (`api.md`, `ui.md`, `data.md`, ...). Tell the user the folder path and the list of files when you're done.

## Explaining a single feature on request

Sometimes the user doesn't want the whole codebase mapped - they want one feature explained in depth (e.g. "explain how login works", "walk me through the checkout flow", "how does search work"). This skill can do that too, but it's a different job from the full map, so **always confirm before starting**.

When a request looks like a single-feature explanation:

1. **Confirm first.** Don't dive in. Ask the user something like: "Do you want me to explain just the `<feature>` feature in depth, or map the whole codebase? And should I write it to a doc file or just explain it here in the chat?" Wait for their answer before doing the work. Only proceed once they've confirmed the scope (one feature vs. whole repo) and the output (a file vs. inline).

2. **Trace the feature, not the repo.** Once confirmed, follow the one feature end to end instead of surveying everything. Find its entry point (the button, route, command, or event that kicks it off) and follow it through the layers - UI -> API -> services -> data and back. Read only the files on that path.

3. **Write the explanation** using this shape:

```markdown
# Feature: <feature name>

## What it does

One short paragraph in plain words - what this feature is, from the user's point of view.

## How it's triggered

Where it starts - the button, route, command, or event that kicks it off, with the real file path.

## How it flows end to end

Follow the feature step by step through the layers (UI -> API -> service -> data
-> back). This is the core of the doc. A numbered list or a small diagram works well.
Point to the real file (and function) at each step.

## The main pieces

The key files/functions involved and what each one contributes. Just the ones on this
feature's path, not the whole repo.

## Edge cases and gotchas

Error handling, validation, special states, and the non-obvious bits someone would miss.

## Where to start reading

The first file or two to open to follow this feature.
```

4. **Output where they asked.** If they wanted a file, save it in the same docs folder the full maps use (see "Where to save the docs") as `feature-<name>.md`. If they wanted it inline, just explain it in the chat. Either way, follow the same rules below - real file paths, no invention.

## Rules to keep in mind

- Write for a newcomer. Plain words, real examples, no walls of jargon.
- Point to real file paths. Every claim should be tied to actual code, not a guess.
- Don't invent. If you didn't read part of the code, leave it out and say so in the "skips" section rather than guessing.
- Keep the docs connected. The map links to the aspect docs; the aspect docs say how they connect to each other. That's what makes the set feel cohesive instead of 8 loose files.
- Use a small diagram or step-by-step flow wherever it explains things faster than prose - especially for data flow and how an action moves through the system.
