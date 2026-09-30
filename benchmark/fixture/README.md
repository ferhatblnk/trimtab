# parcel-desk

## Money

Amounts are integer cents. `toCents("12.50")` returns `1250`, and `formatAmount(1250)` returns `"12.50"`.

## Shipping

Rates depend on the destination zone and the parcel weight.

| Zone | Code |
| --- | --- |
| Domestic | `DOM` |
| Europe | `EU` |
| Rest of the world | `WW` |

## Delivery

`estimateDelivery(orderedAt, transitDays)` returns the expected delivery date in Istanbul time.
