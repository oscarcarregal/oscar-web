export function formatPhoneNumber(phoneNumber?: string): string {
  if (!phoneNumber) return "";

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }

  return phoneNumber;
}
