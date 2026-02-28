import { getAllEventsForYear, THEMES } from './events.js';
import {
  parseTzParam,
  getUserTzOffset,
  formatDate,
  applyTzOffset,
} from './utils.js';
import { applyEventTheme, updateThemeUI, setupTzSelect } from './ui.js';

const state = {
  tzOffset: getUserTzOffset(),
  themeId: 'system',
  now: new Date(),
};

const eventsList = document.getElementById('events-list');
const tzSelect = document.getElementById('tz-select');
const themeToggle = document.getElementById('theme-toggle');

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const tzParam = parseTzParam(urlParams.get('tz'));
  if (tzParam !== null) state.tzOffset = tzParam;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    state.themeId = savedTheme;
  }

  updateThemeUI(state.themeId);
  setupTzSelect(tzSelect, state.tzOffset);
  applyEventTheme(THEMES.default, state.themeId);
  render();

  themeToggle.addEventListener('click', () => {
    const modes = ['system', 'dark', 'light'];
    state.themeId = modes[(modes.indexOf(state.themeId) + 1) % modes.length];
    localStorage.setItem('theme', state.themeId);
    updateThemeUI(state.themeId);
    applyEventTheme(THEMES.default, state.themeId);
  });

  tzSelect.addEventListener('change', (e) => {
    state.tzOffset = parseFloat(e.target.value);
    const url = new URL(window.location);
    url.searchParams.set('tz', state.tzOffset);
    window.history.pushState({}, '', url);
    render();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.themeId === 'system') {
      applyEventTheme(THEMES.default, state.themeId);
    }
  });
}

function render() {
  const currentYear = state.now.getFullYear();
  const allEvents = getAllEventsForYear(currentYear, state.tzOffset);
  const localNow = applyTzOffset(state.now, state.tzOffset);

  eventsList.innerHTML = `<div class="upcoming-title">События ${currentYear} года</div>`;

  allEvents.forEach(({ event, date }) => {
    const localDate = applyTzOffset(date, state.tzOffset);
    const hasPassed = localDate.getTime() <= localNow.getTime();

    const item = document.createElement('a');
    item.href = `event.html?id=${event.id}&tz=${state.tzOffset}`;
    item.className = 'upcoming-item';
    if (hasPassed) {
      item.style.opacity = '0.5';
    }
    item.innerHTML = `
      <span class="upcoming-item-name">${event.nameRu}</span>
      <span class="upcoming-item-meta">
        <span>${formatDate(localDate)}</span>
        <span>→</span>
      </span>
    `;
    eventsList.appendChild(item);
  });
}

init();
