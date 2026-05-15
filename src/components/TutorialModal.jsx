export default function TutorialModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to use calcl</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body tutorial">
          <section>
            <h3>Basic math</h3>
            <p>Type any expression and the result appears on the right.</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">25 * 4</span><span className="ex-arrow">→</span><span className="ex-result">100</span></div>
              <div className="example-line"><span className="ex-input">100 / 5</span><span className="ex-arrow">→</span><span className="ex-result">20</span></div>
              <div className="example-line"><span className="ex-input">(3 + 2) * 8</span><span className="ex-arrow">→</span><span className="ex-result">40</span></div>
            </div>
          </section>

          <section>
            <h3>Exponentiation</h3>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">2^10</span><span className="ex-arrow">→</span><span className="ex-result">1,024</span></div>
              <div className="example-line"><span className="ex-input">sqrt(144)</span><span className="ex-arrow">→</span><span className="ex-result">12</span></div>
            </div>
          </section>

          <section>
            <h3>Variables</h3>
            <p>Assign variables and use them on later lines.</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">x = 6</span><span className="ex-arrow">→</span><span className="ex-result">6</span></div>
              <div className="example-line"><span className="ex-input">x^2</span><span className="ex-arrow">→</span><span className="ex-result">36</span></div>
            </div>
          </section>

          <section>
            <h3>Functions</h3>
            <p>All math.js functions are available.</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">sin(pi / 2)</span><span className="ex-arrow">→</span><span className="ex-result">1</span></div>
              <div className="example-line"><span className="ex-input">log(e)</span><span className="ex-arrow">→</span><span className="ex-result">1</span></div>
            </div>
          </section>

          <section>
            <h3>Percentages</h3>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">10%</span><span className="ex-arrow">→</span><span className="ex-result">0.1</span></div>
              <div className="example-line"><span className="ex-input">10% of 200</span><span className="ex-arrow">→</span><span className="ex-result">20</span></div>
              <div className="example-line"><span className="ex-input">100 + 10%</span><span className="ex-arrow">→</span><span className="ex-result">110</span></div>
              <div className="example-line"><span className="ex-input">100 - 10%</span><span className="ex-arrow">→</span><span className="ex-result">90</span></div>
            </div>
          </section>

          <section>
            <h3>Unit conversion</h3>
            <p>Use <code>to</code> or <code>in</code> to convert units.</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">5 km to miles</span><span className="ex-arrow">→</span><span className="ex-result">3.107 miles</span></div>
              <div className="example-line"><span className="ex-input">100 kg in lbs</span><span className="ex-arrow">→</span><span className="ex-result">220.46 lbs</span></div>
            </div>
          </section>

          <section>
            <h3>Currencies</h3>
            <p>Convert between 15 currencies (approximate rates).</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">100 EUR to USD</span><span className="ex-arrow">→</span><span className="ex-result">108 USD</span></div>
              <div className="example-line"><span className="ex-input">50 GBP in USD</span><span className="ex-arrow">→</span><span className="ex-result">63.5 USD</span></div>
            </div>
          </section>

          <section>
            <h3>Comments</h3>
            <p>Lines starting with <code>//</code> are comments.</p>
            <div className="example-block">
              <div className="example-line"><span className="ex-input">// monthly budget</span><span className="ex-arrow">→</span><span className="ex-result" style={{fontStyle:'italic',color:'var(--comment)'}}>monthly budget</span></div>
            </div>
          </section>

          <section>
            <h3>Slash commands</h3>
            <div className="example-block commands">
              <div className="example-line"><code>/tutorial</code> — Show this guide</div>
              <div className="example-line"><code>/clear</code> — Clear all lines</div>
              <div className="example-line"><code>/export</code> — Export as text</div>
              <div className="example-line"><code>/import</code> — Import from .txt file</div>
            </div>
          </section>

          <section>
            <h3>Keyboard shortcuts</h3>
            <div className="example-block commands">
              <div className="example-line"><kbd>Enter</kbd> — New line (or split at cursor)</div>
              <div className="example-line"><kbd>⌫</kbd> at line start — Merge with previous line</div>
              <div className="example-line"><kbd>↑</kbd> <kbd>↓</kbd> — Navigate between lines</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}