import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shippingRate, ZONES } from '../src/shipping.js';

test('prices by weight band and zone', () => {
  assert.equal(shippingRate(0.5, ZONES.DOMESTIC), 500);
  assert.equal(shippingRate(5, ZONES.EUROPE), 2400);
  assert.equal(shippingRate(21, ZONES.WORLD), 21000);
});

test('rejects unknown zones and bad weights', () => {
  assert.throws(() => shippingRate(1, 'XX'), /Unknown zone/);
  assert.throws(() => shippingRate(0, ZONES.DOMESTIC), /Invalid weight/);
});
