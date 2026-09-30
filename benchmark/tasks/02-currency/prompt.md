Customers need a currency.

- `createCustomer` accepts an optional `currency`: a three-letter ISO 4217 code in upper case, such as `EUR`. When it's missing, use `USD`. Reject anything else with an error whose message is `Invalid currency: <value>`.
- `invoicesToCsv` gets a `currency` column after `total`, filled from the invoice's customer (`USD` when the customer has none).
