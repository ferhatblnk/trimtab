import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAmount, formatCents, toCents } from '../src/money.js';

test('parses decimal strings into cents', () => {
  assert.equal(toCents('12.50'), 1250);
  assert.equal(toCents('-3.1'), -310);
  assert.equal(toCents('7'), 700);
});

test('rejects malformed amounts', () => {
  assert.throws(() => toCents('12.505'), /Invalid amount/);
});

test('formats cents', () => {
  assert.equal(formatAmount(1250), '12.50');
  assert.equal(formatAmount(-5), '-0.05');
  assert.equal(formatCents(99, 'EUR'), '0.99 EUR');
});
