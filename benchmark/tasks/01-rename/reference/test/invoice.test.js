import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, calculateInvoiceTotal } from '../src/invoice.js';

test('totals invoice lines', () => {
  assert.equal(calculateInvoiceTotal([{ quantity: 2, unitCents: 1250 }, { quantity: 1, unitCents: 99 }]), 2599);
  assert.equal(calculateInvoiceTotal([]), 0);
});

test('applies a percentage discount', () => {
  assert.equal(applyDiscount(10000, 15), 8500);
});
