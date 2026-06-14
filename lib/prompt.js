'use strict';

const readline = require('readline');

// Tiny zero-dependency interactive prompts (checkbox + radio) built on
// readline keypress events. Falls back to nothing in non-TTY environments —
// callers should guard with process.stdin.isTTY.

const useColor = !!process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const dim = paint('2');
const bold = paint('1');
const cyan = paint('36');
const green = paint('32');

function setupKeys() {
  const input = process.stdin;
  readline.emitKeypressEvents(input);
  if (input.isTTY) input.setRawMode(true);
  input.resume();
  return input;
}

function teardownKeys(input, onKey) {
  input.removeListener('keypress', onKey);
  if (input.isTTY) input.setRawMode(false);
  input.pause();
}

function hideCursor() {
  if (useColor) process.stdout.write('\x1b[?25l');
}
function showCursor() {
  if (useColor) process.stdout.write('\x1b[?25h');
}

/**
 * Multi-select checkbox prompt.
 *   options: [{ id, label }]
 *   initial: array of pre-selected ids
 * Resolves to an array of selected ids (in option order). Always returns at
 * least one (the highlighted item) so callers never get an empty selection.
 */
function multiselect({ title, options, initial }) {
  return new Promise((resolve) => {
    const selected = new Set(initial || []);
    let cursor = 0;
    let rendered = 0;
    const output = process.stdout;

    const hint = dim(
      '↑/↓ move · space/tab toggle · a all · enter confirm'
    );

    function render(first) {
      if (!first) output.write(`\x1b[${rendered}A`);
      const lines = [bold(title), hint];
      options.forEach((o, i) => {
        const active = i === cursor;
        const pointer = active ? cyan('›') : ' ';
        const box = selected.has(o.id) ? green('◉') : dim('◯');
        const label = active ? cyan(o.label) : o.label;
        lines.push(`${pointer} ${box} ${label}`);
      });
      output.write(lines.map((l) => '\x1b[2K' + l).join('\n') + '\n');
      rendered = lines.length;
    }

    const input = setupKeys();
    hideCursor();

    function finish() {
      if (selected.size === 0) selected.add(options[cursor].id);
      teardownKeys(input, onKey);
      showCursor();
      resolve(options.filter((o) => selected.has(o.id)).map((o) => o.id));
    }

    function onKey(_str, key) {
      if (!key) return;
      if (key.ctrl && key.name === 'c') {
        teardownKeys(input, onKey);
        showCursor();
        output.write('\n');
        process.exit(130);
      }
      switch (key.name) {
        case 'up':
        case 'k':
          cursor = (cursor - 1 + options.length) % options.length;
          break;
        case 'down':
        case 'j':
          cursor = (cursor + 1) % options.length;
          break;
        case 'space':
        case 'tab':
          if (selected.has(options[cursor].id)) selected.delete(options[cursor].id);
          else selected.add(options[cursor].id);
          break;
        case 'a': {
          if (selected.size === options.length) selected.clear();
          else options.forEach((o) => selected.add(o.id));
          break;
        }
        case 'return':
        case 'enter':
          finish();
          return;
        default:
          return;
      }
      render(false);
    }

    input.on('keypress', onKey);
    render(true);
  });
}

/**
 * Single-select radio prompt.
 *   options: [{ id, label }]
 * Resolves to one id.
 */
function select({ title, options, initial }) {
  return new Promise((resolve) => {
    let cursor = Math.max(0, options.findIndex((o) => o.id === initial));
    if (cursor < 0) cursor = 0;
    let rendered = 0;
    const output = process.stdout;
    const hint = dim('↑/↓ move · enter select');

    function render(first) {
      if (!first) output.write(`\x1b[${rendered}A`);
      const lines = [bold(title), hint];
      options.forEach((o, i) => {
        const active = i === cursor;
        const pointer = active ? cyan('›') : ' ';
        const dot = active ? green('◉') : dim('◯');
        const label = active ? cyan(o.label) : o.label;
        lines.push(`${pointer} ${dot} ${label}`);
      });
      output.write(lines.map((l) => '\x1b[2K' + l).join('\n') + '\n');
      rendered = lines.length;
    }

    const input = setupKeys();
    hideCursor();

    function onKey(_str, key) {
      if (!key) return;
      if (key.ctrl && key.name === 'c') {
        teardownKeys(input, onKey);
        showCursor();
        output.write('\n');
        process.exit(130);
      }
      switch (key.name) {
        case 'up':
        case 'k':
          cursor = (cursor - 1 + options.length) % options.length;
          break;
        case 'down':
        case 'j':
          cursor = (cursor + 1) % options.length;
          break;
        case 'return':
        case 'enter':
          teardownKeys(input, onKey);
          showCursor();
          resolve(options[cursor].id);
          return;
        default:
          return;
      }
      render(false);
    }

    input.on('keypress', onKey);
    render(true);
  });
}

module.exports = { multiselect, select };
