Add `computeInvoice(lines, { taxRatePercent, discountPercent = 0 })` in a new module `src/tax.js`.

Input:

- `lines`: an array of `{ quantity, unitCents }`, both integers. A negative quantity is a credit line.
- `taxRatePercent` and `discountPercent`: numbers from 0 to 100 with at most two decimal places, such as `20`, `8.25`, or `12.5`.

Rules:

1. A line's net is `quantity × unitCents`.
2. The invoice discount is `discountPercent` of the sum of the positive line nets, rounded to whole cents with round-half-to-even.
3. Split the invoice discount across the lines that have a positive net, in proportion to their nets, with the largest-remainder method: give each line the floor of its exact share, then hand out the cents left over one at a time to the lines with the largest fractional remainders. Break ties in favour of the earlier line. Credit lines get no discount. The line discounts must add up exactly to the invoice discount.
4. A line's tax is `taxRatePercent` of its net minus its discount, rounded to whole cents with round-half-to-even. Rounding is symmetric for negative amounts, so -13.5 becomes -14.
5. A line's gross is its net minus its discount plus its tax.

Return `{ lines, netCents, discountCents, taxCents, grossCents }`. `lines` holds `{ netCents, discountCents, taxCents, grossCents }` for each input line, in order, and each total is the sum over the lines.

Every result must be exact: floating-point error must never change a cent.
