import { useState, useCallback } from 'react';

export default function ExportModal({ lines, results, onClose }) {
  const [copied, setCopied] = useState(false);

  const content = lines
    .map((line, i) => ({ text: line.text, result: results[i] }))
    .filter((item) => item.text.trim() !== '')
    .map((item) => {
      if (item.result.type === 'result') {
        return `${item.text}    = ${item.result.display}`;
      }
      return item.text;
    })
    .join('\n');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calcl-export.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <pre className="export-preview">{content || 'Nothing to export.'}</pre>
          <div className="export-actions">
            <button className="action-btn" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy to clipboard'}
            </button>
            <button className="action-btn secondary" onClick={handleDownload} disabled={!content}>
              Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}