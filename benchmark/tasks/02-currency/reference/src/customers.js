const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function createCustomer({ id, name, email, country, currency = 'USD' }) {
  if (!id) {
    throw new Error('Missing id');
  }
  if (!name || !name.trim()) {
    throw new Error('Missing name');
  }
  if (!EMAIL.test(email ?? '')) {
    throw new Error(`Invalid email: ${email}`);
  }
  if (!/^[A-Z]{2}$/.test(country ?? '')) {
    throw new Error(`Invalid country: ${country}`);
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error(`Invalid currency: ${currency}`);
  }
  return { id, name: name.trim(), email, country, currency };
}
