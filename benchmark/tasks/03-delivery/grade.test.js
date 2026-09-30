import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateDelivery } from '../src/delivery.js';

const cases = [
  ['weekday morning', '2026-09-15T10:00:00+03:00', 2, '2026-09-17'],
  ['one minute before cutoff', '2026-09-15T14:59:00+03:00', 1, '2026-09-16'],
  ['exactly at cutoff', '2026-09-15T15:00:00+03:00', 1, '2026-09-17'],
  ['Friday morning', '2026-09-18T10:00:00+03:00', 1, '2026-09-21'],
  ['Friday evening', '2026-09-18T16:00:00+03:00', 1, '2026-09-22'],
  ['Friday late night, zero transit', '2026-09-18T23:30:00+03:00', 0, '2026-09-21'],
  ['Saturday', '2026-09-19T10:00:00+03:00', 1, '2026-09-22'],
  ['Sunday night', '2026-09-20T23:30:00+03:00', 2, '2026-09-23'],
  ['just after midnight Istanbul', '2026-09-16T00:30:00+03:00', 1, '2026-09-17'],
  ['late evening, zero transit', '2026-09-14T23:59:00+03:00', 0, '2026-09-15'],
  ['across a month end', '2026-09-30T16:00:00+03:00', 2, '2026-10-05'],
];

for (const [name, orderedAt, transitDays, expected] of cases) {
  test(`${name}: ${orderedAt} + ${transitDays}`, () => {
    assert.equal(estimateDelivery(orderedAt, transitDays), expected);
  });
}

test('accepts a Date', () => {
  assert.equal(estimateDelivery(new Date('2026-09-18T13:30:00Z'), 1), '2026-09-22');
});
