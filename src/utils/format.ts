import dayjs from "./dayjs";
import numeral from "numeral";

export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "฿0.00";
  return `฿${numeral(amount).format("0,0.00")}`;
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return numeral(value).format("0,0");
}

export function formatPrice(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0.00";
  return numeral(value).format("0,0.00");
}

export function formatPriceWithSymbol(value: number): string {
  return formatCurrency(value);
}

export function formatNum(value: number | string | null | undefined, decimals: number = 0): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num === undefined || num === null || isNaN(Number(num))) {
    return decimals > 0 ? '0.' + '0'.repeat(decimals) : '0'
  }
  const fmt = decimals > 0 ? `0,0.${'0'.repeat(decimals)}` : '0,0'
  return numeral(num).format(fmt)
}

export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = "D MMMM BBBB",
): string => {
  if (!date) return "-";
  return dayjs(date).format(formatStr);
};

export const formatDateTime = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "-";
  return dayjs(date).format("D MMM BBBB HH:mm");
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  return dayjs(date).format("HH:mm");
};

export const formatDateShort = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "-";
  return dayjs(date).format("DD/MM/BBBB");
};

export const fromNow = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  return dayjs(date).fromNow();
};

export const toLocal = (date: string | Date) => dayjs.tz(date, "Asia/Bangkok");

export const toIctDateRange = (
  dateStr: string,
): { gte: string; lte: string } => ({
  gte: dayjs.tz(`${dateStr} 00:00:00`, "Asia/Bangkok").toISOString(),
  lte: dayjs.tz(`${dateStr} 23:59:59`, "Asia/Bangkok").toISOString(),
});

export const toDateParam = (localDate: string): string => localDate;

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

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
