export const ZONES = {
  DOMESTIC: 'DOM',
  EUROPE: 'EUR',
  WORLD: 'WW',
};

const VOLUMETRIC_DIVISOR = 5000;

const RATES = {
  DOM: [
    [1, 500],
    [5, 900],
    [20, 1900],
    [Infinity, 4500],
  ],
  EUR: [
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

function roundUpToHalf(kg) {
  const halves = Math.round(kg * 2 * 1e9) / 1e9;
  return Math.ceil(halves) / 2;
}

export function chargeableWeightKg({ weightKg, lengthCm, widthCm, heightCm }) {
  const hasDimensions = [lengthCm, widthCm, heightCm].every((value) => typeof value === 'number');
  const volumetric = hasDimensions ? (lengthCm * widthCm * heightCm) / VOLUMETRIC_DIVISOR : 0;
  return roundUpToHalf(Math.max(weightKg, volumetric));
}

export function shippingRate(weightOrShipment, zone) {
  const weightKg = typeof weightOrShipment === 'object' ? chargeableWeightKg(weightOrShipment) : weightOrShipment;
  const table = RATES[zone];
  if (!table) {
    throw new Error(`Unknown zone: ${zone}`);
  }
  if (!(weightKg > 0)) {
    throw new Error(`Invalid weight: ${weightKg}`);
  }
  return table.find(([limit]) => weightKg <= limit)[1];
}
