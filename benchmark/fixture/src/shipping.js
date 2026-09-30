export const ZONES = {
  DOMESTIC: 'DOM',
  EUROPE: 'EU',
  WORLD: 'WW',
};

const RATES = {
  DOM: [
    [1, 500],
    [5, 900],
    [20, 1900],
    [Infinity, 4500],
  ],
  EU: [
    [1, 1200],
    [5, 2400],
    [20, 5200],
    [Infinity, 11000],
  ],
  WW: [
    [1, 2500],
    [5, 4800],
    [20, 9900],
    [Infinity, 21000],
  ],
};

export function shippingRate(weightKg, zone) {
  const table = RATES[zone];
  if (!table) {
    throw new Error(`Unknown zone: ${zone}`);
  }
  if (!(weightKg > 0)) {
    throw new Error(`Invalid weight: ${weightKg}`);
  }
  return table.find(([limit]) => weightKg <= limit)[1];
}
