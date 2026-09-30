export function toCents(amount) {
  if (typeof amount === 'number') {
    return Math.round(amount * 100);
  }
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(String(amount).trim());
  if (!match) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  const [, sign, whole, fraction = ''] = match;
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return sign ? -cents : cents;
}

export function formatAmount(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export function formatCents(cents, currency = 'USD') {
  return `${formatAmount(cents)} ${currency}`;
}
