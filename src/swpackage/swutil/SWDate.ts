/**
 * Date helpers matching SWDateExtension.swift.
 * Language follows localStorage key "appLanguage" ("en" / "zh-Hans").
 */

const LANGUAGE_KEY = "appLanguage";

export function getAppLanguage(): string {
  return localStorage.getItem(LANGUAGE_KEY) ?? "en";
}

export function setAppLanguage(language: string): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}

function isEnglish(): boolean {
  return getAppLanguage() === "en";
}

function locale(): string {
  return getAppLanguage();
}

export function formatMonth(date: Date = new Date()): string {
  if (isEnglish()) {
    return new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  }
  return `${date.getMonth() + 1}月`;
}

export function formatDay(date: Date = new Date()): string {
  return String(date.getDate());
}

export function formatMonthDay(date: Date = new Date()): string {
  if (isEnglish()) {
    return `${formatMonth(date)} ${date.getDate()}`;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatFullDate(date: Date = new Date()): string {
  if (isEnglish()) {
    return `${formatMonth(date)} ${date.getDate()}, ${date.getFullYear()}`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDateTime(date: Date = new Date()): string {
  return `${formatMonthDay(date)} ${formatTime(date)}`;
}

export function timeAgo(date: Date, now = new Date()): string {
  const interval = (now.getTime() - date.getTime()) / 1000;
  if (interval < 0) return formatMonthDay(date);
  if (interval < 60) return isEnglish() ? "Just now" : "刚刚";
  if (interval < 3600) {
    const minutes = Math.floor(interval / 60);
    return isEnglish() ? `${minutes} min ago` : `${minutes}分钟前`;
  }
  if (interval < 86400) {
    const hours = Math.floor(interval / 3600);
    return isEnglish()
      ? `${hours} hour${hours > 1 ? "s" : ""} ago`
      : `${hours}小时前`;
  }
  if (isYesterday(date, now)) return isEnglish() ? "Yesterday" : "昨天";
  if (interval < 604800) {
    const days = Math.floor(interval / 86400);
    return isEnglish()
      ? `${days} day${days > 1 ? "s" : ""} ago`
      : `${days}天前`;
  }
  return formatMonthDay(date);
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  d.setMilliseconds(d.getMilliseconds() - 1);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isToday(date: Date, now = new Date()): boolean {
  return isSameDay(date, now);
}

export function isYesterday(date: Date, now = new Date()): boolean {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return isSameDay(date, y);
}

export function isTomorrow(date: Date, now = new Date()): boolean {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  return isSameDay(date, t);
}

export function addingDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addingMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addingYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function daysFrom(date: Date, other: Date): number {
  const ms = startOfDay(date).getTime() - startOfDay(other).getTime();
  return Math.round(ms / 86_400_000);
}

export function shouldResetDaily(dateKey: string): boolean {
  const raw = localStorage.getItem(dateKey);
  const last = raw ? new Date(raw) : new Date(0);
  return !isSameDay(startOfDay(), last);
}

export function updateDailyResetDate(dateKey: string): void {
  localStorage.setItem(dateKey, startOfDay().toISOString());
}

export { locale };
