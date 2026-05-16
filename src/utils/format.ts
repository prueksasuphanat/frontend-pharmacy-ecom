/**
 * Formatting utility functions
 *
 * **Validates: Requirements 5.2**
 */

/**
 * Format a number as Thai Baht currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "฿1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

/**
 * Format number with Thai locale + comma separator (no decimal)
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("th-TH").format(value);
}

/**
 * Format price with 2 decimal places + comma separator (no currency symbol)
 * ใช้แทน inline fmt(n) ที่กระจายอยู่ทุกหน้า
 * @example formatPrice(1234.5) → "1,234.50"
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format price with ฿ prefix
 * @example formatPriceWithSymbol(1234.5) → "฿1,234.50"
 */
export function formatPriceWithSymbol(value: number): string {
  return `฿${formatPrice(value)}`;
}

/**
 * Format datetime in Thai locale (short) — ใช้แทน inline fmtDate/fmtTime
 * @example formatDateTime("2026-05-17T10:30:00") → "17 พ.ค. 2569 10:30"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Format a date in Thai locale (long, no time)
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string (e.g., "15 มกราคม 2567")
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Get display name for a user — ใช้ first_name+last_name ถ้ามี, fallback pmc_name, fallback username
 */
export function formatUserName(user: {
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  pmc_name?: string | null;
  username?: string | null;
}): string {
  const parts = [user.title, user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return parts || user.pmc_name || user.username || "";
}

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
