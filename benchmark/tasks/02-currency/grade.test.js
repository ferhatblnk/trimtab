import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCustomer } from '../src/customers.js';
import { invoicesToCsv } from '../src/report.js';

const base = { id: 'c1', name: 'Acme', email: 'ops@acme.test', country: 'TR' };

test('defaults the currency to USD', () => {
  assert.equal(createCustomer(base).currency, 'USD');
});

test('keeps a valid currency', () => {
  assert.equal(createCustomer({ ...base, currency: 'EUR' }).currency, 'EUR');
  assert.equal(createCustomer({ ...base, currency: 'TRY' }).currency, 'TRY');
});

test('rejects invalid currencies with the exact message', () => {
  for (const currency of ['eur', 'EURO', 'E1R', 'US', ' EUR', '']) {
    assert.throws(() => createCustomer({ ...base, currency }), { message: `Invalid currency: ${currency}` });
  }
});

test('adds a currency column to the invoice export', () => {
  const csv = invoicesToCsv([
    { id: 'inv-1', customer: { name: 'Acme', currency: 'EUR' }, lines: [{ quantity: 2, unitCents: 1250 }] },
    { id: 'inv-2', customer: { name: 'Beta' }, lines: [{ quantity: 1, unitCents: 99 }] },
  ]);
  assert.equal(csv, 'id,customer,total,currency\ninv-1,Acme,25.00,EUR\ninv-2,Beta,0.99,USD');
});
