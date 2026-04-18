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
 * Format a date in Thai locale
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
 * Truncate text with ellipsis if it exceeds max length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
