export function lineAmount(line) {
  return line.quantity * line.unitCents;
}

export function calculateInvoiceTotal(lines) {
  return lines.reduce((sum, line) => sum + lineAmount(line), 0);
}

export function applyDiscount(totalCents, percent) {
  return totalCents - Math.round((totalCents * percent) / 100);
}
