# calcl

A minimal, open-source web-based calculator — inspired by [Numi](https://numi.app), but in the browser.

Type expressions on the left, see results on the right:

```
25 * 4                100
100 / 5                20
x = 6                   6
x^2                    36
5 km to miles    3.107 miles
```

## Features

- **Arithmetic** — `25 * 4`, `(3 + 2) * 8`
- **Variables** — `x = 6`, then use `x^2` on any later line
- **Functions** — `sin(pi/2)`, `sqrt(144)`, `log(e)`, and all [math.js](https://mathjs.org/) functions
- **Percentages** — `10%`, `10% of 200`, `100 + 10%`, `100 - 10%`
- **Unit conversion** — `5 km to miles`, `100 kg in lbs`
- **Currencies** — `100 EUR to USD`, `50 GBP to USD` (15 currencies with approximate rates)
- **Comments** — Lines starting with `//` are treated as comments
- **Slash commands** — `/tutorial`, `/clear`, `/export`, `/import`
- **Export** — Download or copy all expressions and results as plain text
- **Import** — Drag-and-drop a previously exported `.txt` file to restore a session
- **Dark theme** — Minimal dark UI with JetBrains Mono

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server.

## Project structure

```
src/
  engine/
    evaluator.js        # Expression evaluation (math.js + preprocessing)
  components/
    Editor.jsx          # Main multiline editor, key handling, slash commands
    TutorialModal.jsx   # /tutorial — how-to guide
    ExportModal.jsx      # /export — copy/download as plain text
    ImportModal.jsx      # /import — drag-and-drop .txt file restore
  App.jsx               # Root component
  App.css               # All styles (dark theme)
  index.css             # Font import + reset
  main.jsx              # React entry point
```

## Slash commands

| Command     | Description                        |
|-------------|------------------------------------|
| `/tutorial` | Show a how-to guide                |
| `/clear`    | Clear all lines                    |
| `/export`   | Export expressions as plain text   |
| `/import`   | Import from a previously exported `.txt` file |

## Keyboard shortcuts

| Key                  | Action                              |
|----------------------|-------------------------------------|
| `Enter`              | New line (or split at cursor)       |
| `Backspace` at start | Merge with previous line            |
| `Delete` at end      | Merge with next line                |
| `↑` / `↓`           | Navigate between lines              |

## Tech stack

- **React 19** + **Vite** — fast dev server and build
- **math.js** — expression parsing, units, and functions
- No backend required — runs entirely in the browser

## License

MIT
