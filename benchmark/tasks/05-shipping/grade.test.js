import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chargeableWeightKg, shippingRate, ZONES } from '../src/shipping.js';
import { shipmentsToCsv } from '../src/report.js';

test('rounds the actual weight up to 0.5 kg', () => {
  assert.equal(chargeableWeightKg({ weightKg: 1.2 }), 1.5);
  assert.equal(chargeableWeightKg({ weightKg: 2 }), 2);
  assert.equal(chargeableWeightKg({ weightKg: 2.01 }), 2.5);
  assert.equal(chargeableWeightKg({ weightKg: 2.5 }), 2.5);
  assert.equal(chargeableWeightKg({ weightKg: 0.1 + 0.2 }), 0.5);
});

test('uses the volumetric weight when it is larger', () => {
  assert.equal(chargeableWeightKg({ weightKg: 1, lengthCm: 30, widthCm: 20, heightCm: 10 }), 1.5);
  assert.equal(chargeableWeightKg({ weightKg: 3, lengthCm: 50, widthCm: 40, heightCm: 30 }), 12);
  assert.equal(chargeableWeightKg({ weightKg: 0.2, lengthCm: 10, widthCm: 10, heightCm: 10 }), 0.5);
  assert.equal(chargeableWeightKg({ weightKg: 1.5, lengthCm: 25, widthCm: 20, heightCm: 15 }), 1.5);
  assert.equal(chargeableWeightKg({ weightKg: 9, lengthCm: 50, widthCm: 40, heightCm: 30 }), 12);
});

test('ignores incomplete dimensions', () => {
  assert.equal(chargeableWeightKg({ weightKg: 4.6, lengthCm: 100 }), 5);
});

test('prices a shipment object by chargeable weight and a number as before', () => {
  assert.equal(shippingRate({ weightKg: 1, lengthCm: 30, widthCm: 20, heightCm: 10 }, 'DOM'), 900);
  assert.equal(shippingRate(1, 'DOM'), 500);
});

test('renames the Europe zone to EUR', () => {
  assert.equal(ZONES.EUROPE, 'EUR');
  assert.equal(shippingRate(5, 'EUR'), 2400);
  assert.throws(() => shippingRate(5, 'EU'), /Unknown zone/);
  assert.ok(!/\bEU\b/.test(readFileSync('src/shipping.js', 'utf8')), 'src/shipping.js still uses EU');
  assert.ok(!/\bEU\b/.test(readFileSync('README.md', 'utf8')), 'README.md still uses EU');
});

test('exports the chargeable weight and prices by it', () => {
  const csv = shipmentsToCsv([
    { id: 's-1', zone: 'DOM', weightKg: 2 },
    { id: 's-2', zone: 'EUR', weightKg: 1, lengthCm: 30, widthCm: 20, heightCm: 10 },
  ]);
  assert.equal(csv, 'id,zone,weightKg,chargeableWeightKg,rateCents\ns-1,DOM,2,2,900\ns-2,EUR,1,1.5,2400');
});

test('documents the rule in the README', () => {
  const readme = readFileSync('README.md', 'utf8');
  const shipping = readme.slice(readme.indexOf('## Shipping'));
  assert.match(shipping, /5000/);
  assert.match(shipping, /0\.5/);
});
