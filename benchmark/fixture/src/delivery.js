const CUTOFF_HOUR = 15;

/**
 * Expected delivery date of an order, as YYYY-MM-DD in Istanbul time (Europe/Istanbul, UTC+3 all year).
 *
 * - An order placed before 15:00 Istanbul time on a business day ships the same day.
 * - An order placed at or after 15:00, or on a Saturday or Sunday, ships on the next business day.
 * - Delivery is `transitDays` business days after the ship date.
 * - Business days are Monday to Friday.
 */
export function estimateDelivery(orderedAt, transitDays) {
  const date = new Date(orderedAt);
  if (date.getHours() >= CUTOFF_HOUR) {
    date.setDate(date.getDate() + 1);
  }
  let remaining = transitDays;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--;
    }
  }
  return date.toISOString().slice(0, 10);
}
