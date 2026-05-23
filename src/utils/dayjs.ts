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

dayjs.locale("th");
dayjs.tz.setDefault("Asia/Bangkok");

export default dayjs;

export const formatDate = (
  date: string | Date | null | undefined,
  format: string = "D MMM BBBB",
): string => {
  if (!date) return "-";
  return dayjs(date).format(format);
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
