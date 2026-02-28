/** Utility functions for Era */

export function formatTzOffset(offset) {
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `UTC${sign}${abs}`;
}

export function getTzOptions() {
  const options = [];
  for (let i = -12; i <= 14; i++) {
    options.push({ value: i, label: formatTzOffset(i) });
  }
  return options;
}

export function getUserTzOffset() {
  return -new Date().getTimezoneOffset() / 60;
}

export function parseTzParam(param) {
  if (!param) return null;
  const n = parseFloat(param);
  if (isNaN(n) || n < -12 || n > 14) return null;
  return n;
}

export function formatTimeLeft(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatDate(date) {
  return date.toLocaleDateString('ru-RU', {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function applyTzOffset(date, tzOffset) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + tzOffset * 3600000);
}

// Easter calculations
export function getOrthodoxEaster(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const f = Math.floor((d + e + 114) / 31);
  const g = ((d + e + 114) % 31) + 1;
  const julianDate = new Date(year, f - 1, g);
  julianDate.setDate(julianDate.getDate() + 13);
  return julianDate;
}

export function getCatholicEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Islamic calculations (JDN-based tabular calendar)
function islamicToJdn(iYear, iMonth, iDay) {
  return (
    iDay +
    Math.floor((11 * iMonth - 1) / 2) +
    (iYear - 1) * 354 +
    Math.floor((3 + 11 * iYear) / 30) +
    1948440 -
    385
  );
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function islamicToGregorianYear(iMonth, iDay, gregorianYear) {
  // Islamic year ~354 days vs Gregorian ~365, so ratio > 1
  const approxIYear = Math.round((gregorianYear - 622) * (365.25 / 354.367)) + 1;
  const candidates = [];
  for (let dy = -1; dy <= 1; dy++) {
    const iYear = approxIYear + dy;
    const jdn = islamicToJdn(iYear, iMonth, iDay);
    const g = jdnToGregorian(jdn);
    candidates.push(new Date(g.year, g.month - 1, g.day));
  }
  const inYear = candidates.filter((d) => d.getFullYear() === gregorianYear);
  if (inYear.length > 0) return inYear[0];
  const future = candidates
    .filter((d) => d.getFullYear() > gregorianYear)
    .sort((a, b) => a.getTime() - b.getTime());
  if (future.length > 0) return future[0];
  return candidates[candidates.length - 1];
}

export function getRamadanStart(gregorianYear) {
  return islamicToGregorianYear(9, 1, gregorianYear);
}

export function getEidAlFitr(gregorianYear) {
  return islamicToGregorianYear(10, 1, gregorianYear);
}

export function getEidAlAdha(gregorianYear) {
  return islamicToGregorianYear(12, 10, gregorianYear);
}

// Color helpers: factor for darken = multiplier (0..1), for lighten = interpolation toward white
export function darkenHex(hex, factor) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 0xff) * factor)));
  let g = Math.min(255, Math.max(0, Math.round(((n >> 8)  & 0xff) * factor)));
  let b = Math.min(255, Math.max(0, Math.round((n         & 0xff) * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function lightenHex(hex, factor) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * factor)));
  let g = Math.min(255, Math.max(0, Math.round(((n >> 8)  & 0xff) + (255 - ((n >> 8)  & 0xff)) * factor)));
  let b = Math.min(255, Math.max(0, Math.round((n         & 0xff) + (255 - (n         & 0xff)) * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Creates a Date for midnight on Y/M/D in the given UTC offset (hours). */
export function createZonalDate(year, month, day, tzOffset) {
  return new Date(Date.UTC(year, month, day) - tzOffset * 3600000);
}
