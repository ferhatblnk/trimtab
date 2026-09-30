import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateDelivery } from '../src/delivery.js';

test('ships a weekday morning order the same day', () => {
  assert.equal(estimateDelivery('2026-09-15T10:00:00+03:00', 2), '2026-09-17');
});
