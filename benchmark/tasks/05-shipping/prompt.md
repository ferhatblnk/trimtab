Update shipping.

1. Add `chargeableWeightKg(shipment)` to `src/shipping.js`. A shipment is `{ weightKg, lengthCm, widthCm, heightCm }`. The volumetric weight is `lengthCm × widthCm × heightCm / 5000`. The chargeable weight is the larger of the actual and the volumetric weight, rounded up to the next 0.5 kg; a value that is already a multiple of 0.5 stays as it is. When any dimension is missing, use the actual weight, still rounded up to 0.5 kg.
2. `shippingRate` keeps accepting a weight in kg, and also accepts a shipment object, in which case it prices by the chargeable weight.
3. Rename the Europe zone code from `EU` to `EUR` everywhere: the constant, the rate table, the tests, and the README.
4. `shipmentsToCsv` gets a `chargeableWeightKg` column after `weightKg`, and prices each shipment by its chargeable weight.
5. Document the chargeable weight rule in the README's Shipping section.
