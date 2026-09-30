import { calcTotal } from './invoice.js';
import { formatAmount } from './money.js';
import { shippingRate } from './shipping.js';

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function invoicesToCsv(invoices) {
  const rows = [['id', 'customer', 'total']];
  for (const invoice of invoices) {
    rows.push([invoice.id, invoice.customer.name, formatAmount(calcTotal(invoice.lines))]);
  }
  return toCsv(rows);
}

export function shipmentsToCsv(shipments) {
  const rows = [['id', 'zone', 'weightKg', 'rateCents']];
  for (const shipment of shipments) {
    rows.push([shipment.id, shipment.zone, shipment.weightKg, shippingRate(shipment.weightKg, shipment.zone)]);
  }
  return toCsv(rows);
}
