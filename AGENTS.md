# AGENTS.md

Guidance for AI coding agents working on this project.

## Project overview

calcl is a minimal, open-source web-based calculator inspired by Numi. It runs entirely in the browser with no backend. The UI is a multiline editor where each line is an expression and results appear right-aligned.

## Tech stack

- React 19 + Vite (dev server + build)
- math.js for expression evaluation, units, currencies
- Pure CSS (no framework) — all styles in `src/App.css`
- No TypeScript — plain JSX/JS

## Architecture

### Entry point

`src/main.jsx` → renders `<App />` into `#root`.

`src/App.jsx` is a thin wrapper that just renders `<Editor />`.

### Editor (`src/components/Editor.jsx`)

The core component. It manages:

- **Lines state**: array of `{ id, text }` objects, each rendered as an `<input>`
- **Results state**: parallel array of evaluation results (one per line)
- **Modals**: `tutorial | export | import | null` controlled via `modal` state
- **Key handling**: Enter (new line / split), Backspace (merge up), Delete (merge down), Arrow up/down (navigate)
- **Slash commands**: `/tutorial`, `/clear`, `/export`, `/import` — intercepted on Enter before expression evaluation
- **Focus management**: `focusRequest` ref to focus lines after state changes

Each line is an independent `<input>` — this is intentional, not a `<textarea>`. This gives per-line results and precise cursor management.

### Evaluator (`src/engine/evaluator.js`)

- Uses `math.evaluate()` with a fresh scope per `evaluateAll()` call (variables persist across lines within one call, reset on each re-evaluation)
- **Preprocessing** (`preprocess()`) converts percentage syntax (`10%`, `X% of Y`, `Y + X%`) and `in` → `to` for unit conversions before passing to math.js
- **Currencies**: defined as math.js custom units against a `currency` base unit with approximate exchange rates
- **Result types**: `{ type: 'result' | 'error' | 'empty' | 'comment' }` — the Editor switches rendering on `result.type`
- **Function values**: if a user types a bare function name like `log`, the evaluator returns `log()` instead of dumping the function source

### Modals

- `TutorialModal.jsx` — static content showing how to use the app
- `ExportModal.jsx` — formats lines as `expression    = result`, copy/download as `.txt`
- `ImportModal.jsx` — drag-and-drop or click-to-browse for `.txt` files, parses via `parseExportFile()` in Editor.jsx

## Key conventions

- **No TypeScript** — all `.js` and `.jsx`
- **Styling** — single `src/App.css` file, CSS custom properties for the dark theme defined in `:root`
- **No CSS modules or preprocessors** — plain CSS
- **State management** — React `useState`/`useCallback` only, no external state library
- **Line IDs** — auto-incrementing integer via `genId()`, used as React keys and for focus management
- **Evaluation is stateless** — `evaluate()` creates a new `Evaluator` each call, so variable scope is rebuilt from scratch. This means line order matters (variables are assigned top-to-bottom)

## Common tasks

### Add a new slash command

1. Add the command to the `SLASH_COMMANDS` map in `Editor.jsx`
2. Add a handler case in `executeCommand()`
3. Create a modal component if needed, render it conditionally in the Editor return
4. Update `TutorialModal.jsx` to document the new command

### Add a new currency

Add an entry to the `currencies` object in `evaluator.js` with the USD rate and optional aliases. math.js `createUnit` handles the rest.

### Add a new preprocessing rule

Add a regex replace in the `preprocess()` function in `evaluator.js`. Rules are applied top-to-bottom — order matters. For example, `X% of Y` must be handled before standalone `X%`.

### Modify the dark theme

Edit the CSS custom properties in `:root` at the top of `src/App.css`. All component styles reference these variables.

### Change result formatting

Edit `formatResult()` and `formatNumber()` in `evaluator.js`. These handle number display, units, and special types.

### Add a new modal

1. Create `src/components/YourModal.jsx` following the pattern of existing modals (overlay + `.modal` div)
2. Add a state value to `modal` in `Editor.jsx`
3. Render conditionally alongside the other modals
4. Styles go in `src/App.css` — follow existing `.modal-*` patterns

## Testing

There is no test runner configured. To manually verify:

1. Run `npm run dev` and open in browser
2. Test expressions: `25 * 4`, `x = 6`, `x^2`, `10% of 200`, `5 km to miles`, `100 EUR to USD`
3. Test slash commands: `/tutorial`, `/clear`, `/export`, `/import`
4. Test export → import round-trip: export a session, clear, import the file

For programmatic evaluation testing, the evaluator can be run in Node:

```js
import { Evaluator } from './src/engine/evaluator.js';
const e = new Evaluator();
console.log(e.evaluateLine('25 * 4')); // { type: 'result', display: '100', ... }
```

## Build

```bash
npm run build    # output in dist/
npm run preview  # serve dist/ locally
```

math.js accounts for most of the bundle size (~240KB gzipped). There are no other significant dependencies.