import dayjs from "dayjs";
import "dayjs/locale/th";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import duration from "dayjs/plugin/duration";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(buddhistEra);
dayjs.locale("th");

// Default locale & timezone
dayjs.locale("th");
dayjs.tz.setDefault("Asia/Bangkok");

export default dayjs;

// ─── Format helpers ───────────────────────────────────────────────────────────

/** "15 ม.ค. 2568" — หรือกำหนด format เองได้
 * @example
 * formatDate(date)                    // "15 ม.ค. 2568"
 * formatDate(date, "DD/MM/BBBB")      // "15/01/2568"
 * formatDate(date, "DD/MM/BBBB HH:mm") // "15/01/2568 14:30"
 * formatDate(date, "YYYY-MM-DD")      // "2025-01-15" (ค.ศ.)
 */
export const formatDate = (
  date: string | Date | null | undefined,
  format: string = "D MMM BBBB",
): string => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/** "15 ม.ค. 2568 14:30" */
export const formatDateTime = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "-";
  return dayjs(date).format("D MMM BBBB HH:mm");
};

/** "14:30" */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  return dayjs(date).format("HH:mm");
};

/** "2568-01-15" (ISO-like แต่ปี พ.ศ.) */
export const formatDateShort = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "-";
  return dayjs(date).format("DD/MM/BBBB");
};

/** relative time เช่น "3 ชั่วโมงที่แล้ว" */
export const fromNow = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  return dayjs(date).fromNow();
};

/** แปลง Date object / ISO string → dayjs instance (tz Bangkok) */
export const toLocal = (date: string | Date) => dayjs.tz(date, "Asia/Bangkok");

// ─── Date range helpers ───────────────────────────────────────────────────────

/**
 * แปลง YYYY-MM-DD (local ICT) เป็น UTC range สำหรับ API filter
 * ใช้คู่กับ backend toIctDateRange()
 *
 * @example
 * toIctDateRange("2026-04-20")
 * // { gte: "2026-04-19T17:00:00.000Z", lte: "2026-04-20T16:59:59.000Z" }
 */
export const toIctDateRange = (
  dateStr: string,
): { gte: string; lte: string } => ({
  gte: dayjs.tz(`${dateStr} 00:00:00`, "Asia/Bangkok").toISOString(),
  lte: dayjs.tz(`${dateStr} 23:59:59`, "Asia/Bangkok").toISOString(),
});

/**
 * แปลง YYYY-MM-DD (local ICT) เป็น string วันที่ UTC
 * ใช้สำหรับส่ง query param ไป backend
 *
 * @example
 * toUtcDateParam("2026-04-20") // "2026-04-20"  (ส่งตรงๆ ไม่ต้องแปลง)
 */
export const toDateParam = (localDate: string): string => localDate;
