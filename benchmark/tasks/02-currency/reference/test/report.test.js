import { test } from 'node:test';
import assert from 'node:assert/strict';
import { invoicesToCsv, shipmentsToCsv } from '../src/report.js';

test('exports invoices as CSV', () => {
  const csv = invoicesToCsv([
    { id: 'inv-1', customer: { name: 'Acme, Inc.' }, lines: [{ quantity: 2, unitCents: 1250 }] },
  ]);
  assert.equal(csv, 'id,customer,total,currency\ninv-1,"Acme, Inc.",25.00,USD');
});

test('exports shipments as CSV', () => {
  const csv = shipmentsToCsv([{ id: 's-1', zone: 'DOM', weightKg: 2 }]);
  assert.equal(csv, 'id,zone,weightKg,rateCents\ns-1,DOM,2,900');
});
