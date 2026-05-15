import { useState, useCallback, useRef, useEffect } from 'react';
import Evaluator from '../engine/evaluator';
import TutorialModal from './TutorialModal';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';

let nextId = 1;
const genId = () => nextId++;

const SLASH_COMMANDS = {
  '/tutorial': 'tutorial',
  '/clear': 'clear',
  '/export': 'export',
  '/import': 'import',
};

export default function Editor() {
  const [lines, setLines] = useState([{ id: genId(), text: '' }]);
  const [results, setResults] = useState([{ type: 'empty' }]);
  const [modal, setModal] = useState(null); // null | 'tutorial' | 'export' | 'import'
  const inputRefs = useRef({});
  const focusRequest = useRef(null);

  // ── Evaluate all lines ──────────────────────────────────────

  const evaluate = useCallback((updatedLines) => {
    const evaluator = new Evaluator();
    const res = evaluator.evaluateAll(updatedLines.map((l) => l.text));
    setResults(res);
  }, []);

  // ── Handle focus requests ────────────────────────────────────

  useEffect(() => {
    if (focusRequest.current) {
      const { id, pos } = focusRequest.current;
      focusRequest.current = null;
      requestAnimationFrame(() => {
        const el = inputRefs.current[id];
        if (el) {
          el.focus();
          if (pos !== undefined) {
            el.selectionStart = el.selectionEnd = pos;
          }
        }
      });
    }
  }, [lines]);

  // ── Update a line's text ─────────────────────────────────────

  const updateLine = useCallback(
    (id, text) => {
      setLines((prev) => {
        const next = prev.map((l) => (l.id === id ? { ...l, text } : l));
        evaluate(next);
        return next;
      });
    },
    [evaluate]
  );

  // ── Import lines from file ───────────────────────────────────

  const handleImport = useCallback(
    (text) => {
      const parsed = parseExportFile(text);
      const newLines = parsed.map((t) => ({ id: genId(), text: t }));
      setLines(newLines);
      evaluate(newLines);
      if (newLines.length > 0) {
        focusRequest.current = { id: newLines[newLines.length - 1].id, pos: newLines[newLines.length - 1].text.length };
      }
    },
    [evaluate]
  );

  // ── Execute slash command ─────────────────────────────────────

  const executeCommand = useCallback(
    (command, line, idx) => {
      const action = SLASH_COMMANDS[command];

      if (action === 'clear') {
        const newLine = { id: genId(), text: '' };
        setLines([newLine]);
        setResults([{ type: 'empty' }]);
        focusRequest.current = { id: newLine.id, pos: 0 };
        return true;
      }

      if (action === 'tutorial' || action === 'export' || action === 'import') {
        // Remove just the command line, keep other lines intact
        setLines((prev) => {
          if (prev.length <= 1) {
            const newLine = { id: genId(), text: '' };
            focusRequest.current = { id: newLine.id, pos: 0 };
            setResults([{ type: 'empty' }]);
            return [newLine];
          }
          const next = prev.filter((l) => l.id !== line.id);
          evaluate(next);
          focusRequest.current = { id: next[Math.min(idx, next.length - 1)].id, pos: 0 };
          return next;
        });
        setModal(action);
        return true;
      }

      return false;
    },
    [evaluate]
  );

  // ── Key handling ─────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e, line, idx) => {
      const el = e.target;
      const cursorPos = el.selectionStart;
      const atLineEnd = cursorPos === line.text.length;
      const atLineStart = cursorPos === 0 && el.selectionEnd === 0;

      // Enter → check for slash command or create new line
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = line.text.trim().toLowerCase();

        if (SLASH_COMMANDS[trimmed]) {
          executeCommand(trimmed, line, idx);
          return;
        }

        const textAfter = line.text.slice(cursorPos);
        const textBefore = line.text.slice(0, cursorPos);
        const newLineId = genId();

        setLines((prev) => {
          const next = [...prev];
          next[idx] = { ...line, text: textBefore };
          next.splice(idx + 1, 0, { id: newLineId, text: textAfter });
          evaluate(next);
          return next;
        });

        focusRequest.current = { id: newLineId, pos: 0 };
      }

      // Backspace at start → merge with previous line
      if (e.key === 'Backspace' && atLineStart && idx > 0) {
        e.preventDefault();
        setLines((prev) => {
          const prevLine = prev[idx - 1];
          const mergePos = prevLine.text.length;
          const mergedText = prevLine.text + line.text;
          const next = [...prev];
          next[idx - 1] = { ...prevLine, text: mergedText };
          next.splice(idx, 1);
          evaluate(next);
          focusRequest.current = { id: prevLine.id, pos: mergePos };
          return next;
        });
      }

      // Delete at end → merge with next line
      if (e.key === 'Delete' && atLineEnd && idx < lines.length - 1) {
        e.preventDefault();
        const nextLine = lines[idx + 1];
        setLines((prev) => {
          const mergedText = line.text + nextLine.text;
          const next = [...prev];
          next[idx] = { ...line, text: mergedText };
          next.splice(idx + 1, 1);
          evaluate(next);
          focusRequest.current = { id: line.id, pos: cursorPos };
          return next;
        });
      }

      // Arrow Up
      if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault();
        const prevLine = lines[idx - 1];
        const pos = Math.min(cursorPos, prevLine.text.length);
        const target = inputRefs.current[prevLine.id];
        if (target) {
          target.focus();
          target.selectionStart = target.selectionEnd = pos;
        }
      }

      // Arrow Down
      if (e.key === 'ArrowDown' && idx < lines.length - 1) {
        e.preventDefault();
        const nxtLine = lines[idx + 1];
        const pos = Math.min(cursorPos, nxtLine.text.length);
        const target = inputRefs.current[nxtLine.id];
        if (target) {
          target.focus();
          target.selectionStart = target.selectionEnd = pos;
        }
      }
    },
    [lines, evaluate, executeCommand]
  );

  // ── Initial focus ────────────────────────────────────────────

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = inputRefs.current[lines[0].id];
      if (el) el.focus();
    });
  }, []);

  // ── Modal close ──────────────────────────────────────────────

  const closeModal = useCallback(() => {
    setModal(null);
    requestAnimationFrame(() => {
      const lastLine = lines[lines.length - 1];
      const el = inputRefs.current[lastLine.id];
      if (el) el.focus();
    });
  }, [lines]);

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      <div className="editor">
        <div className="lines">
          {lines.map((line, idx) => {
            const result = results[idx] || { type: 'empty' };
            const isCommand = line.text.trim().toLowerCase() in SLASH_COMMANDS;

            return (
              <div className="line" key={line.id}>
                <div className="line-number">{idx + 1}</div>
                <input
                  ref={(el) => (inputRefs.current[line.id] = el)}
                  className={`line-input ${isCommand ? 'slash-command' : ''}`}
                  type="text"
                  value={line.text}
                  onChange={(e) => updateLine(line.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, line, idx)}
                  placeholder={idx === 0 && lines.length === 1 ? 'Type an expression, or try /tutorial…' : ''}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <div className={`line-result ${result.type}`}>
                  {result.type === 'result' && result.display}
                  {result.type === 'error' && (
                    <span className="error-indicator" title={result.message}>⚠</span>
                  )}
                  {result.type === 'comment' && (
                    <span className="comment-text">{result.text}</span>
                  )}
                  {isCommand && result.type === 'empty' && (
                    <span className="command-hint">↵ run</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal === 'tutorial' && <TutorialModal onClose={closeModal} />}
      {modal === 'export' && <ExportModal lines={lines} results={results} onClose={closeModal} />}
      {modal === 'import' && <ImportModal onImport={handleImport} onClose={closeModal} />}
    </>
  );
}

// ── Parse exported .txt files ─────────────────────────────────

function parseExportFile(text) {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trimEnd();
      if (!trimmed) return '';

      // Export format: "expression    = result"
      // Split on the "    = " separator (4+ spaces then = then space)
      const match = trimmed.match(/^(.+?)\s{4}=\s(.+)$/);
      if (match) {
        return match[1].trim();
      }

      // Lines without "=" are comments or bare expressions — keep as-is
      return trimmed;
    })
    .filter((line, idx, arr) => {
      // Keep trailing empty line for typing, but strip excessive blank lines
      if (line === '' && idx === arr.length - 1) return false;
      return true;
    });
}