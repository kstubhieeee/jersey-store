export function isValidIndiaPincode(pin: string): boolean {
  if (!/^\d{6}$/.test(pin)) return false;
  if (/^(\d)\1{5}$/.test(pin)) return false;
  return /^[1-9]/.test(pin);
}
