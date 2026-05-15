import { useState, useCallback, useRef } from 'react';

export default function ImportModal({ onImport, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.endsWith('.txt') && !file.type.startsWith('text/')) {
        setError('Please select a .txt file exported from calcl.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter((l) => l.trim() !== '');
        if (lines.length === 0) {
          setError('File is empty.');
          return;
        }
        onImport(text);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsText(file);
    },
    [onImport]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      processFile(file);
    },
    [processFile]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div
            className={`import-drop-zone ${dragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="import-drop-icon">📄</div>
            <div className="import-drop-text">
              {dragging ? 'Drop file here' : 'Drop a .txt file here, or click to browse'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileSelect}
              className="import-file-input"
            />
          </div>
          {error && <div className="import-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}