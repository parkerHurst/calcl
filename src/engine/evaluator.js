import { create, all } from 'mathjs';

const math = create(all);

// ── Define currency units (approximate exchange rates) ─────────
// Users can write: 100 EUR to USD, 50 GBP in USD, etc.

// Define a base currency dimension, then all currencies against USD
math.createUnit('currency');
math.createUnit('USD', '1 currency', { aliases: ['usd', '$'] });

const currencies = {
  EUR: { rate: 1.08, aliases: ['eur', '€'] },
  GBP: { rate: 1.27, aliases: ['gbp', '£'] },
  JPY: { rate: 0.0064, aliases: ['jpy'] },
  CNY: { rate: 0.14, aliases: ['cny'] },
  INR: { rate: 0.012, aliases: ['inr', '₹'] },
  CAD: { rate: 0.73, aliases: ['cad'] },
  AUD: { rate: 0.65, aliases: ['aud'] },
  CHF: { rate: 1.12, aliases: ['chf'] },
  KRW: { rate: 0.00073, aliases: ['krw', '₩'] },
  BRL: { rate: 0.018, aliases: ['brl'] },
  MXN: { rate: 0.059, aliases: ['mxn'] },
  SEK: { rate: 0.097, aliases: ['sek'] },
  NOK: { rate: 0.093, aliases: ['nok'] },
  NZD: { rate: 0.60, aliases: ['nzd'] },
};

for (const [code, { rate, aliases }] of Object.entries(currencies)) {
  try {
    math.createUnit(code, { definition: `${rate} USD`, aliases });
  } catch {
    // Unit may already exist
  }
}

// ── Evaluator ───────────────────────────────────────────────────

export class Evaluator {
  constructor() {
    this.scope = {};
  }

  evaluateAll(lines) {
    this.scope = {};
    return lines.map((text) => this.evaluateLine(text));
  }

  evaluateLine(raw) {
    const text = raw.trim();
    if (!text) return { type: 'empty' };
    if (text.startsWith('//')) return { type: 'comment', text: text.slice(2).trim() };

    try {
      const processed = preprocess(text);
      const result = math.evaluate(processed, this.scope);

      // Suppress undefined/null results
      if (result === undefined || result === null) {
        return { type: 'empty' };
      }

      return { type: 'result', value: result, display: formatResult(result) };
    } catch (e) {
      return { type: 'error', message: e.message };
    }
  }
}

// ── Preprocessing ───────────────────────────────────────────────

function preprocess(expr) {
  let s = expr;

  // "X% of Y" → ((X/100) * Y)
  s = s.replace(/([\d.]+)\s*%\s+of\s+/gi, '($1/100) * ');

  // "Y + X%" → Y * (1 + X/100)
  s = s.replace(/([\w.]+)\s*\+\s*([\d.]+)\s*%/g, '$1 * (1 + $2/100)');

  // "Y - X%" → Y * (1 - X/100)
  s = s.replace(/([\w.]+)\s*-\s*([\d.]+)\s*%/g, '$1 * (1 - $2/100)');

  // Standalone "X%" → (X/100)
  s = s.replace(/([\d.]+)\s*%/g, '($1/100)');

  // "X unit in Y" → "X unit to Y" (casual syntax for conversion)
  s = s.replace(/\s+in\s+/gi, ' to ');

  return s;
}

// ── Result formatting ───────────────────────────────────────────

function formatResult(value) {
  if (value === null || value === undefined) return '';

  // math.js Unit objects
  if (value && typeof value === 'object' && value.constructor?.name === 'Unit') {
    return formatUnit(value);
  }

  // BigNumbers
  if (typeof value === 'object' && value.toNumber) {
    return formatNumber(value.toNumber());
  }

  // Functions (e.g. user typed just `log` without parens)
  if (typeof value === 'function') {
    const name = value.name || value.fn?.name || 'function';
    return `${name}()`;
  }

  // Regular numbers
  if (typeof value === 'number') {
    return formatNumber(value);
  }

  // Booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Arrays / matrices
  if (Array.isArray(value) || (value && typeof value.toArray === 'function')) {
    const arr = value.toArray ? value.toArray() : value;
    return arr.map(formatResult).join(', ');
  }

  // Fallback: don't dump function source or object internals
  if (typeof value === 'object') {
    return String(value);
  }

  return '';
}

function formatNumber(n) {
  if (!isFinite(n)) return String(n);

  // Integers
  if (Number.isInteger(n) && Math.abs(n) < 1e15) {
    return n.toLocaleString('en-US');
  }

  if (Number.isInteger(n)) {
    return n.toExponential(4);
  }

  // Floating point: up to 10 significant digits, strip trailing zeros
  const s = parseFloat(n.toPrecision(10)).toString();
  return s;
}

function formatUnit(unit) {
  try {
    return unit.format({ precision: 10 });
  } catch {
    return unit.toString();
  }
}

export default Evaluator;