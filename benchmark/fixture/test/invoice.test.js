import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, calcTotal } from '../src/invoice.js';

test('totals invoice lines', () => {
  assert.equal(calcTotal([{ quantity: 2, unitCents: 1250 }, { quantity: 1, unitCents: 99 }]), 2599);
  assert.equal(calcTotal([]), 0);
});

test('applies a percentage discount', () => {
  assert.equal(applyDiscount(10000, 15), 8500);
});
