import {
  getOrthodoxEaster,
  getCatholicEaster,
  getRamadanStart,
  getEidAlFitr,
  getEidAlAdha,
  applyTzOffset,
  createZonalDate
} from './utils.js';

export const THEMES = {
  spring:         { id: "spring",         bg: "#e8f5e9", text: "#2e7d32", accent: "#4caf50", secondaryBg: "#c8e6c9", border: "#81c784", label: "Весна" },
  summer:         { id: "summer",         bg: "#fffde7", text: "#f57f17", accent: "#fbc02d", secondaryBg: "#fff9c4", border: "#fff176", label: "Лето" },
  autumn:         { id: "autumn",         bg: "#fff3e0", text: "#e65100", accent: "#ff9800", secondaryBg: "#ffe0b2", border: "#ffb74d", label: "Осень" },
  winter:         { id: "winter",         bg: "#e3f2fd", text: "#0d47a1", accent: "#2196f3", secondaryBg: "#bbdefb", border: "#64b5f6", label: "Зима" },
  newYear:        { id: "newYear",        bg: "#1a1a2e", text: "#ffd700", accent: "#ffd700", secondaryBg: "#16213e", border: "#b8860b", label: "Новый год" },
  march8:         { id: "march8",         bg: "#fce4ec", text: "#c2185b", accent: "#e91e63", secondaryBg: "#f8bbd0", border: "#f06292", label: "8 марта" },
  nauryz:         { id: "nauryz",         bg: "#f1f8e9", text: "#33691e", accent: "#7cb342", secondaryBg: "#dcedc8", border: "#aed581", label: "Наурыз" },
  maslenitsa:     { id: "maslenitsa",     bg: "#fff3e0", text: "#bf360c", accent: "#ff6f00", secondaryBg: "#ffe0b2", border: "#ffcc80", label: "Масленица" },
  easter:         { id: "easter",         bg: "#fffde7", text: "#f57f17", accent: "#ffc107", secondaryBg: "#fff9c4", border: "#fff176", label: "Пасха" },
  catholicEaster: { id: "catholicEaster", bg: "#f3e5f5", text: "#4a148c", accent: "#9c27b0", secondaryBg: "#e1bee7", border: "#ba68c8", label: "Католическая Пасха" },
  ramadan:        { id: "ramadan",        bg: "#f5f5f5", text: "#37474f", accent: "#455a64", secondaryBg: "#e0e0e0", border: "#cfd8dc", label: "Рамадан" },
  eidFitr:        { id: "eidFitr",        bg: "#e0f2f1", text: "#004d40", accent: "#009688", secondaryBg: "#b2dfdb", border: "#4db6ac", label: "Ораза Айт" },
  eidAdha:        { id: "eidAdha",        bg: "#efebe9", text: "#3e2723", accent: "#795548", secondaryBg: "#d7ccc8", border: "#a1887f", label: "Курбан Айт" },
  halloween:      { id: "halloween",      bg: "#121212", text: "#ff6d00", accent: "#ff6d00", secondaryBg: "#1e1e1e", border: "#e65100", label: "Хэллоуин" },
  christmas:      { id: "christmas",      bg: "#0a2e0a", text: "#d4af37", accent: "#d4af37", secondaryBg: "#0d3d0d", border: "#b8860b", label: "Рождество" },
  gtavi:          { id: "gtavi",          bg: "#0a0a0a", text: "#ff6b35", accent: "#ff6b35", secondaryBg: "#1a0a05", border: "#4a1a08", label: "GTA VI" },
  default:        { id: "default",        bg: "#f5f5f5", text: "#212121", accent: "#607d8b", secondaryBg: "#eeeeee", border: "#bdbdbd", label: "Era" }
};

export const EVENTS = [
  { id: "spring",          nameRu: "Весна",               getDate: (y, tz) => createZonalDate(y, 2, 1, tz),  theme: THEMES.spring },
  { id: "maslenitsa",      nameRu: "Масленица",            getDate: (y, tz) => {
    const easter = getOrthodoxEaster(y);
    const d = new Date(easter);
    d.setDate(d.getDate() - 49);
    return createZonalDate(d.getFullYear(), d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.maslenitsa },
  { id: "march-8",         nameRu: "8 марта",              getDate: (y, tz) => createZonalDate(y, 2, 8, tz),  theme: THEMES.march8 },
  { id: "nauryz",          nameRu: "Наурыз",               getDate: (y, tz) => createZonalDate(y, 2, 21, tz), theme: THEMES.nauryz },
  { id: "catholic-easter", nameRu: "Католическая Пасха",   getDate: (y, tz) => {
    const d = getCatholicEaster(y);
    return createZonalDate(y, d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.catholicEaster },
  { id: "easter",          nameRu: "Пасха",                getDate: (y, tz) => {
    const d = getOrthodoxEaster(y);
    return createZonalDate(y, d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.easter },
  { id: "ramadan",         nameRu: "Рамадан",              getDate: (y, tz) => {
    const d = getRamadanStart(y);
    return createZonalDate(y, d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.ramadan },
  { id: "eid-fitr",        nameRu: "Ораза Айт",            getDate: (y, tz) => {
    const d = getEidAlFitr(y);
    return createZonalDate(y, d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.eidFitr },
  { id: "summer",          nameRu: "Лето",                 getDate: (y, tz) => createZonalDate(y, 5, 1, tz),  theme: THEMES.summer },
  { id: "eid-adha",        nameRu: "Курбан Айт",           getDate: (y, tz) => {
    const d = getEidAlAdha(y);
    return createZonalDate(y, d.getMonth(), d.getDate(), tz);
  }, theme: THEMES.eidAdha },
  { id: "autumn",          nameRu: "Осень",                getDate: (y, tz) => createZonalDate(y, 8, 1, tz),  theme: THEMES.autumn },
  { id: "halloween",       nameRu: "Хэллоуин",             getDate: (y, tz) => createZonalDate(y, 9, 31, tz), theme: THEMES.halloween },
  { id: "gta-vi",          nameRu: "GTA VI",               getDate: (y, tz) => createZonalDate(2026, 10, 19, tz), theme: THEMES.gtavi },
  { id: "winter",          nameRu: "Зима",                 getDate: (y, tz) => createZonalDate(y, 11, 1, tz), theme: THEMES.winter },
  { id: "christmas",       nameRu: "Рождество",            getDate: (y, tz) => createZonalDate(y, 11, 25, tz), theme: THEMES.christmas },
  { id: "new-year",        nameRu: "Новый год",            getDate: (y, tz) => createZonalDate(y, 0, 1, tz),  theme: THEMES.newYear },
];

export function getEventById(id) {
  return EVENTS.find((e) => e.id === id);
}

export function getAllEventsForYear(year, tzOffset = 0) {
  const result = EVENTS.map((event) => ({
    event,
    date: event.getDate(year, tzOffset),
  }));
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

export function getUpcomingEvents(now, tzOffset) {
  const localNow = applyTzOffset(now, tzOffset);
  const year = localNow.getFullYear();

  const thisYear = getAllEventsForYear(year, tzOffset);
  const nextYear = getAllEventsForYear(year + 1, tzOffset);
  const all = [...thisYear, ...nextYear];

  return all
    .filter(({ date }) => applyTzOffset(date, tzOffset).getTime() > localNow.getTime())
    .map(({ event, date }) => ({
      event,
      date,
    }))
    .slice(0, 5);
}

export function getCurrentTheme(now, tzOffset) {
  const localNow = applyTzOffset(now, tzOffset);
  const year = localNow.getFullYear();

  const thisYear = getAllEventsForYear(year, tzOffset);
  const lastPassed = thisYear
    .filter(({ date }) => applyTzOffset(date, tzOffset).getTime() <= localNow.getTime())
    .pop();

  return lastPassed ? lastPassed.event.theme : THEMES.default;
}
