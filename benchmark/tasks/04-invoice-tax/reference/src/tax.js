function hundredths(percent) {
  return BigInt(Math.round(percent * 100));
}

function divideHalfEven(numerator, denominator) {
  const negative = numerator < 0n;
  const magnitude = negative ? -numerator : numerator;
  let quotient = magnitude / denominator;
  const remainder = magnitude % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && quotient % 2n === 1n)) {
    quotient += 1n;
  }
  return negative ? -quotient : quotient;
}

export function computeInvoice(lines, { taxRatePercent, discountPercent = 0 }) {
  const nets = lines.map((item) => BigInt(item.quantity) * BigInt(item.unitCents));
  const positiveTotal = nets.reduce((sum, net) => (net > 0n ? sum + net : sum), 0n);
  const invoiceDiscount = divideHalfEven(positiveTotal * hundredths(discountPercent), 10000n);

  const discounts = nets.map(() => 0n);
  if (positiveTotal > 0n && invoiceDiscount > 0n) {
    const shares = [];
    let allocated = 0n;
    nets.forEach((net, index) => {
      if (net > 0n) {
        const exact = net * invoiceDiscount;
        discounts[index] = exact / positiveTotal;
        allocated += discounts[index];
        shares.push({ index, remainder: exact % positiveTotal });
      }
    });
    shares.sort((a, b) => (a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1));
    for (let left = invoiceDiscount - allocated, i = 0; left > 0n; left -= 1n, i += 1) {
      discounts[shares[i].index] += 1n;
    }
  }

  const rate = hundredths(taxRatePercent);
  const results = nets.map((net, index) => {
    const taxable = net - discounts[index];
    const tax = divideHalfEven(taxable * rate, 10000n);
    return { netCents: net, discountCents: discounts[index], taxCents: tax, grossCents: taxable + tax };
  });

  const total = (key) => results.reduce((sum, item) => sum + item[key], 0n);
  const toNumber = (item) => ({
    netCents: Number(item.netCents),
    discountCents: Number(item.discountCents),
    taxCents: Number(item.taxCents),
    grossCents: Number(item.grossCents),
  });

  return {
    lines: results.map(toNumber),
    ...toNumber({
      netCents: total('netCents'),
      discountCents: total('discountCents'),
      taxCents: total('taxCents'),
      grossCents: total('grossCents'),
    }),
  };
}
