# parcel-desk

## Money

Amounts are integer cents. `toCents("12.50")` returns `1250`, and `formatAmount(1250)` returns `"12.50"`.

## Shipping

Rates depend on the destination zone and the chargeable weight: the larger of the actual weight and the volumetric weight (length × width × height in cm / 5000), rounded up to the next 0.5 kg.

| Zone | Code |
| --- | --- |
| Domestic | `DOM` |
| Europe | `EUR` |
| Rest of the world | `WW` |

## Delivery

`estimateDelivery(orderedAt, transitDays)` returns the expected delivery date in Istanbul time.
