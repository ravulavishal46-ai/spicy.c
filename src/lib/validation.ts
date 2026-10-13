/** Small hand-written validators. Each returns an error message or null. */

export const validators = {
  required: (label: string) => (v: string) => (v.trim() ? null : `${label} is required.`),
  name: (v: string) =>
    !v.trim() ? "Name is required." : v.trim().length < 2 ? "Name looks too short." : /[<>]/.test(v) ? "Please remove < and >." : null,
  email: (v: string) =>
    !v.trim() ? "Email is required." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Enter a valid email, like name@example.com.",
  phone: (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "Phone number is required.";
    return /^(91)?[6-9]\d{9}$/.test(digits) ? null : "Enter a 10-digit Indian mobile number.";
  },
  password: (v: string) =>
    !v ? "Password is required." : v.length < 8 ? "Use at least 8 characters." : !/\d/.test(v) || !/[a-z]/i.test(v) ? "Mix letters and numbers." : null,
  pincode: (v: string) => (!v.trim() ? "PIN code is required." : /^[1-9]\d{5}$/.test(v.trim()) ? null : "PIN codes are 6 digits."),
  cardNumber: (v: string) => {
    const digits = v.replace(/\s/g, "");
    if (!digits) return "Card number is required.";
    if (!/^\d{13,19}$/.test(digits)) return "Card numbers are 13–19 digits.";
    return luhn(digits) ? null : "That card number doesn't look right.";
  },
  expiry: (v: string) => {
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
    if (!m) return "Use MM/YY.";
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    if (month < 1 || month > 12) return "Month must be 01–12.";
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "This card has expired.";
    return null;
  },
  cvc: (v: string) => (/^\d{3,4}$/.test(v.trim()) ? null : "3 or 4 digits on the back."),
  upi: (v: string) => (/^[\w.-]{2,}@[a-z]{2,}$/i.test(v.trim()) ? null : "Enter a UPI ID like name@bank."),
};

export function luhn(digits: string) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export type Errors<T> = Partial<Record<keyof T, string | null>>;

export function hasErrors<T>(errors: Errors<T>) {
  return Object.values(errors).some(Boolean);
}
