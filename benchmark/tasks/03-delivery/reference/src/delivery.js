const CUTOFF_HOUR = 15;
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function isBusinessDay(day) {
  const weekday = day.getUTCDay();
  return weekday !== 0 && weekday !== 6;
}

function nextBusinessDay(day) {
  let next = new Date(day.getTime() + DAY_MS);
  while (!isBusinessDay(next)) {
    next = new Date(next.getTime() + DAY_MS);
  }
  return next;
}

/**
 * Expected delivery date of an order, as YYYY-MM-DD in Istanbul time (Europe/Istanbul, UTC+3 all year).
 *
 * - An order placed before 15:00 Istanbul time on a business day ships the same day.
 * - An order placed at or after 15:00, or on a Saturday or Sunday, ships on the next business day.
 * - Delivery is `transitDays` business days after the ship date.
 * - Business days are Monday to Friday.
 */
export function estimateDelivery(orderedAt, transitDays) {
  const local = new Date(new Date(orderedAt).getTime() + ISTANBUL_OFFSET_MS);
  let day = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  if (!isBusinessDay(day) || local.getUTCHours() >= CUTOFF_HOUR) {
    day = nextBusinessDay(day);
  }
  for (let remaining = transitDays; remaining > 0; remaining--) {
    day = nextBusinessDay(day);
  }
  return day.toISOString().slice(0, 10);
}
