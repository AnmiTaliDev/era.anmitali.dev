/** Shared UI utilities for Era */

import { darkenHex, lightenHex, getTzOptions, formatTimeLeft, pad2 } from './utils.js';

const THEME_LABELS = { system: 'Авто', dark: 'Тёмная', light: 'Светлая' };
const THEME_ICONS  = { system: '○',    dark: '●',      light: '◑' };

export function applyEventTheme(theme, themeId) {
  const root = document.documentElement;
  const isDark = themeId === 'dark' ||
    (themeId === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.style.setProperty('--bg', darkenHex(theme.bg, 0.18));
    root.style.setProperty('--secondary-bg', darkenHex(theme.secondaryBg, 0.22));
    root.style.setProperty('--border', darkenHex(theme.border, 0.45));
    root.style.setProperty('--text', '#e8e8e8');
    root.style.setProperty('--accent', lightenHex(theme.accent, 0.35));
  } else {
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--secondary-bg', theme.secondaryBg);
    root.style.setProperty('--border', theme.border);
  }
}

export function updateThemeUI(themeId) {
  const labelEl = document.getElementById('theme-label');
  const iconEl  = document.getElementById('theme-icon');
  if (labelEl) labelEl.textContent = THEME_LABELS[themeId];
  if (iconEl)  iconEl.textContent  = THEME_ICONS[themeId];

  if (themeId === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
}

export function setupTzSelect(tzSelect, tzOffset) {
  tzSelect.innerHTML = getTzOptions()
    .map(opt => `<option value="${opt.value}" ${opt.value === tzOffset ? 'selected' : ''}>${opt.label}</option>`)
    .join('');
}

export function renderCountdownHTML(targetDate) {
  const ms = new Date(targetDate).getTime() - Date.now();
  const { days, hours, minutes, seconds } = formatTimeLeft(ms);
  return `
    <div class="countdown-unit">
      <span class="countdown-value">${days}</span>
      <span class="countdown-label">дней</span>
    </div>
    <span class="countdown-separator">:</span>
    <div class="countdown-unit">
      <span class="countdown-value">${pad2(hours)}</span>
      <span class="countdown-label">часов</span>
    </div>
    <span class="countdown-separator">:</span>
    <div class="countdown-unit">
      <span class="countdown-value">${pad2(minutes)}</span>
      <span class="countdown-label">минут</span>
    </div>
    <span class="countdown-separator">:</span>
    <div class="countdown-unit">
      <span class="countdown-value">${pad2(seconds)}</span>
      <span class="countdown-label">секунд</span>
    </div>
  `;
}
