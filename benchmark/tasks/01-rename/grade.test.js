import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as invoice from '../src/invoice.js';
import { invoicesToCsv } from '../src/report.js';

function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sources(join(dir, entry.name)) : entry.name.endsWith('.js') ? [join(dir, entry.name)] : [],
  );
}

test('exports calculateInvoiceTotal and no longer exports calcTotal', () => {
  assert.equal(typeof invoice.calculateInvoiceTotal, 'function');
  assert.equal(invoice.calcTotal, undefined);
  assert.equal(invoice.calculateInvoiceTotal([{ quantity: 3, unitCents: 333 }, { quantity: 1, unitCents: 1 }]), 1000);
});

test('leaves no reference to calcTotal', () => {
  for (const file of [...sources('src'), ...sources('test')].filter((file) => !file.endsWith('zz-grade.test.js'))) {
    assert.ok(!readFileSync(file, 'utf8').includes('calcTotal'), `${file} still mentions calcTotal`);
  }
});

test('keeps the invoice export working', () => {
  const csv = invoicesToCsv([{ id: 'i', customer: { name: 'A' }, lines: [{ quantity: 4, unitCents: 25 }] }]);
  assert.equal(csv.split('\n')[1], 'i,A,1.00');
});
