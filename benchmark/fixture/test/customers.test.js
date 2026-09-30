import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCustomer } from '../src/customers.js';

test('creates a customer', () => {
  const customer = createCustomer({ id: 'c1', name: ' Acme ', email: 'ops@acme.test', country: 'TR' });
  assert.equal(customer.name, 'Acme');
  assert.equal(customer.country, 'TR');
});

test('validates email and country', () => {
  assert.throws(() => createCustomer({ id: 'c1', name: 'A', email: 'nope', country: 'TR' }), /Invalid email/);
  assert.throws(() => createCustomer({ id: 'c1', name: 'A', email: 'a@b.test', country: 'tr' }), /Invalid country/);
});
