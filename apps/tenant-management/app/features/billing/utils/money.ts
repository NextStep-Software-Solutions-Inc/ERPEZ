import type { CardBrand } from "../types";

/**
 * Formats an integer value in cents into a localized currency string.
 * e.g. 29900 -> "$299.00"
 */
export function formatMoney(cents: number, currency = "USD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates tax in cents with explicit rounding to the nearest cent.
 * tax = Math.round(subtotalCents * rate)
 */
export function calculateTax(subtotalCents: number, rate: number): number {
  if (rate <= 0 || subtotalCents <= 0) return 0;
  return Math.round(subtotalCents * rate);
}

/**
 * Converts decimal amount (e.g. 299.00) to integer cents (29900).
 */
export function decimalToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts integer cents (29900) to decimal amount (299.00).
 */
export function centsToDecimal(cents: number): number {
  return cents / 100;
}

/**
 * Detects card brand from card number prefix.
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\D/g, "");
  if (/^4/.test(cleaned)) return "visa";
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  return "other";
}

/**
 * Formats card number with spaces every 4 digits for input display.
 */
export function formatCardNumberInput(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
  return parts.join(" ");
}
