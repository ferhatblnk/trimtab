import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeInvoice } from '../src/tax.js';

function line(netCents, discountCents, taxCents, grossCents) {
  return { netCents, discountCents, taxCents, grossCents };
}

function check(result, lines, totals) {
  assert.deepEqual(
    result.lines.map((item) => line(item.netCents, item.discountCents, item.taxCents, item.grossCents)),
    lines,
  );
  assert.deepEqual(
    { netCents: result.netCents, discountCents: result.discountCents, taxCents: result.taxCents, grossCents: result.grossCents },
    totals,
  );
}

test('plain tax without discount', () => {
  check(
    computeInvoice([{ quantity: 2, unitCents: 1250 }, { quantity: 1, unitCents: 500 }], { taxRatePercent: 20 }),
    [line(2500, 0, 500, 3000), line(500, 0, 100, 600)],
    { netCents: 3000, discountCents: 0, taxCents: 600, grossCents: 3600 },
  );
});

test('tax rounds half to even', () => {
  check(
    computeInvoice([{ quantity: 1, unitCents: 125 }, { quantity: 1, unitCents: 135 }], { taxRatePercent: 10 }),
    [line(125, 0, 12, 137), line(135, 0, 14, 149)],
    { netCents: 260, discountCents: 0, taxCents: 26, grossCents: 286 },
  );
});

test('credit lines round symmetrically', () => {
  check(
    computeInvoice([{ quantity: 1, unitCents: 1000 }, { quantity: -1, unitCents: 135 }], { taxRatePercent: 10 }),
    [line(1000, 0, 100, 1100), line(-135, 0, -14, -149)],
    { netCents: 865, discountCents: 0, taxCents: 86, grossCents: 951 },
  );
});

test('invoice discount rounds half to even', () => {
  check(
    computeInvoice([{ quantity: 1, unitCents: 1000 }], { taxRatePercent: 20, discountPercent: 7.25 }),
    [line(1000, 72, 186, 1114)],
    { netCents: 1000, discountCents: 72, taxCents: 186, grossCents: 1114 },
  );
});

test('discount is shared by largest remainder and skips credit lines', () => {
  check(
    computeInvoice(
      [
        { quantity: 1, unitCents: 700 },
        { quantity: 1, unitCents: 200 },
        { quantity: 1, unitCents: 100 },
        { quantity: -1, unitCents: 300 },
      ],
      { taxRatePercent: 20, discountPercent: 10 },
    ),
    [line(700, 70, 126, 756), line(200, 20, 36, 216), line(100, 10, 18, 108), line(-300, 0, -60, -360)],
    { netCents: 700, discountCents: 100, taxCents: 120, grossCents: 720 },
  );
});

test('left-over cents go to the largest remainders', () => {
  check(
    computeInvoice(
      [
        { quantity: 1, unitCents: 333 },
        { quantity: 1, unitCents: 333 },
        { quantity: 1, unitCents: 334 },
      ],
      { taxRatePercent: 0, discountPercent: 10 },
    ),
    [line(333, 33, 0, 300), line(333, 33, 0, 300), line(334, 34, 0, 300)],
    { netCents: 1000, discountCents: 100, taxCents: 0, grossCents: 900 },
  );
});

test('ties go to the earlier line', () => {
  check(
    computeInvoice([{ quantity: 1, unitCents: 1 }, { quantity: 1, unitCents: 1 }, { quantity: 1, unitCents: 1 }], {
      taxRatePercent: 0,
      discountPercent: 50,
    }),
    [line(1, 1, 0, 0), line(1, 1, 0, 0), line(1, 0, 0, 1)],
    { netCents: 3, discountCents: 2, taxCents: 0, grossCents: 1 },
  );
  check(
    computeInvoice([{ quantity: 1, unitCents: 50 }, { quantity: 1, unitCents: 50 }], { taxRatePercent: 0, discountPercent: 1 }),
    [line(50, 1, 0, 49), line(50, 0, 0, 50)],
    { netCents: 100, discountCents: 1, taxCents: 0, grossCents: 99 },
  );
});

test('a full discount leaves credit lines alone', () => {
  check(
    computeInvoice([{ quantity: 1, unitCents: 999 }, { quantity: 2, unitCents: 1 }, { quantity: -1, unitCents: 10 }], {
      taxRatePercent: 0,
      discountPercent: 100,
    }),
    [line(999, 999, 0, 0), line(2, 2, 0, 0), line(-10, 0, 0, -10)],
    { netCents: 991, discountCents: 1001, taxCents: 0, grossCents: -10 },
  );
});

test('an empty invoice is all zeros', () => {
  check(computeInvoice([], { taxRatePercent: 20, discountPercent: 5 }), [], {
    netCents: 0,
    discountCents: 0,
    taxCents: 0,
    grossCents: 0,
  });
});

test('large amounts stay exact', () => {
  check(
    computeInvoice([{ quantity: 1000000, unitCents: 99999 }], { taxRatePercent: 18, discountPercent: 12.5 }),
    [line(99999000000, 12499875000, 15749842500, 103248967500)],
    { netCents: 99999000000, discountCents: 12499875000, taxCents: 15749842500, grossCents: 103248967500 },
  );
});
