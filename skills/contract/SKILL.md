---
name: contract
description: Create a contract - a spec or PRD that fully explains a feature before any code is written, so a coding assistant or engineer can build it without guessing. Use this whenever the user wants to plan or spec a feature before building - things like "spec this out", "write a PRD", "let's plan this feature first", "make an implementation doc", "write the contract for X", or "I want a plan before we touch the code". Trigger it even if the user doesn't say the word "contract" - any time they want a build-ready description of a feature instead of the code itself.
---

# Contract

A contract is a plan that you and the user agree on before any code is written. It is the one document a coding assistant reads to build the feature without guessing or making things up. Your job here is to make that document - not to write the feature code.

Do these three steps in order: understand the codebase, then ask the user questions, then write the contract. Don't jump straight to writing - a contract built on guesses is worse than no contract.

## Step 1 - Understand the codebase

Before you ask the user anything, read the parts of the codebase the feature will touch. You want real files, not a vague idea of the project.

Find and read the files that will likely change, or that the new code has to work with. For each one, note what it does now, the patterns it follows (naming, error handling, how state and APIs are done), and where the new feature would fit in.

By the end of this step you should have a short list of real file paths, what each one does today, and where the new feature connects. You'll use this directly in the contract, so write down the real paths - never write a spec that isn't connected to the real code.

## Step 2 - Ask the user questions

Now fill in the gaps. The user knows what they want; you know the code. The questions bring the two together and find the decisions that shape the design.

Ask one question at a time - never a big list at once. After each answer, ask the next one. This keeps it easy for the user and lets each answer guide the next question.

For each question, give a short list of simple answer options to pick from, not an open question. Keep the options non-technical - describe what happens, not how it's built. Mark the option you recommend and say in one line why you'd pick it, then ask if they're okay with it. Always add an "other - let me explain" option so they're not stuck with your choices.

Across the questions, cover: what the feature should do for the user, what's not included (the limits of the work), edge cases and error states, and any spot where two reasonable choices exist. Stop once you can explain the whole feature start to finish with no "it depends" left.

**Example of how a question should look:**

> When a search returns no results, what should the user see?
>
> - **A - A short "nothing found" message** (recommended: simplest, and it matches how the rest of the app handles empty states)
> - **B - The empty state plus a few suggestions on what to try next**
> - **C - Keep the last results on screen and just show a small note**
> - **D - Something else - tell me what you have in mind**
>
> I'd go with A. Want to go with that, or pick another?

## Step 3 - Check, then write the contract

Before you write the full document, say your understanding back in a few sentences and get a yes. This is a cheap way to avoid writing a long doc based on a wrong idea.

Then write the contract using the template below. Leave out any section that doesn't apply (for example, no "Data model" section for a simple styling change) instead of filling it with fluff - but keep the numbers on the sections you do use. Write it so that an engineer or coding assistant who never saw the conversation could build the feature correctly from this document alone.

### Contract template

```markdown
# Contract: <Feature name>

**Status:** Draft
**Date:** <YYYY-MM-DD>
**Area:** <which part of the product / module>

## 1. Summary

One short paragraph, plain words: what we're building and why.

## 2. Problem

The problem this solves. What happens now and why that's not good enough.

## 3. Goals

Clear bullets - what success looks like.

## 4. Not included (out of scope)

What this feature does NOT do. This is just as important as the goals - it
stops a coding assistant from adding extra work or features no one asked for.

## 5. The code today (what's there now)

The real files involved and what they do now:

- `path/to/file.ts` - what it does today; what changes here
- `path/to/other.py` - ...
  Patterns and conventions the new code should follow.

## 6. The plan

The approach in a sentence or two, then broken down:

### 6.1 UI and UX

What the user sees and does. Every state: normal, loading, empty, error,
success. Note accessibility where it matters.

### 6.2 Data model

New or changed data: entities, fields, types, how they relate. (Skip if none.)

### 6.3 API / interface

For each endpoint or function: the signature or method + path, what goes in,
what comes back, and the error cases. For frontend: component props, events,
and the state it gives back.

### 6.4 Logic and edge cases

The step-by-step behavior. List the edge cases and say how each is handled -
this is where most of the confusion hides.

## 7. Performance and optimization

How fast and how cheap this has to be, made concrete (real numbers where you
can). Cover what applies:

- Expected load / scale - how many requests, rows, items, or users, etc.
- The hot paths - the parts that run a lot or work on big data, and the target
  (e.g. "the list should load in under X seconds with 10,000 rows").
- Caching, batching, rate limits, concurrency - what to reuse or throttle.
- Cost - any API quota or money limits, and how to stay under them.
  Skip this only if the feature has no real performance concern.

## 8. Other requirements

Only the ones that apply: security and access, logging/monitoring, easy to
maintain, reusable.

## 9. Files to change (checklist)

A checklist the coding assistant can follow:

- [ ] `path/to/file.ts` - what to change
- [ ] `path/to/new_file.py` - new; what it holds

## 10. Done when (acceptance criteria)

How we know it's done, written as things you can test:

- Given <situation>, when <action>, then <result>.

## 11. Risks and open questions

Guesses you made, choices left for later, anything still unclear.
```

## Where to save it

Save the contract as a Markdown file. Use the project's existing folder if there is one - look for a `specs/`, `contracts/`, `docs/specs/`, or `.specify/` folder and put it there. If there isn't one, make a `specs/` folder.

Name the file after the feature, in kebab-case: `specs/<feature-slug>.md` (for example `specs/user-profile-page.md`). Tell the user the path when you're done.

## Rules to keep in mind

- Make the contract, not the code. If the user also wants the code, finish and confirm the contract first - that's the thing they'll read and reuse.
- Keep the user-facing parts (Summary, Problem, Goals) in plain words, and the build-facing parts (API, done-when) exact. The coding assistant needs the exact parts to be exact.
- If you hit a decision while writing that you didn't settle in the questions, stop and ask instead of guessing - then write the answer into the doc.
