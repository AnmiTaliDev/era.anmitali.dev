import { THEMES, getUpcomingEvents, getCurrentTheme } from './events.js';
import {
  parseTzParam,
  getUserTzOffset,
  formatDate,
  applyTzOffset,
  darkenHex,
  lightenHex,
} from './utils.js';
import { applyEventTheme, updateThemeUI, setupTzSelect, renderCountdownHTML } from './ui.js';

// --- State ---
const state = {
  tzOffset: getUserTzOffset(),
  themeId: 'system', // system, light, dark
  now: new Date(),
};

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
const tzSelect = document.getElementById('tz-select');
const themeToggle = document.getElementById('theme-toggle');

// --- Initialization ---
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const tzParam = parseTzParam(urlParams.get('tz'));
  if (tzParam !== null) {
    state.tzOffset = tzParam;
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    state.themeId = savedTheme;
  }

  updateThemeUI(state.themeId);
  setupTzSelect(tzSelect, state.tzOffset);
  render();

  setInterval(() => {
    state.now = new Date();
    updateCountdowns();
  }, 1000);

  themeToggle.addEventListener('click', toggleTheme);

  tzSelect.addEventListener('change', (e) => {
    state.tzOffset = parseFloat(e.target.value);
    const url = new URL(window.location);
    url.searchParams.set('tz', state.tzOffset);
    window.history.pushState({}, '', url);
    render();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.themeId === 'system') {
      applyCurrentTheme();
    }
  });
}

function toggleTheme() {
  const modes = ['system', 'dark', 'light'];
  state.themeId = modes[(modes.indexOf(state.themeId) + 1) % modes.length];
  localStorage.setItem('theme', state.themeId);
  updateThemeUI(state.themeId);
  applyCurrentTheme();
}

function applyCurrentTheme() {
  applyEventTheme(getCurrentTheme(state.now, state.tzOffset), state.themeId);
}

function render() {
  applyCurrentTheme();

  const currentTheme = getCurrentTheme(state.now, state.tzOffset);
  const upcoming = getUpcomingEvents(state.now, state.tzOffset);
  const nextEvent = upcoming[0];
  const restEvents = upcoming.slice(1);

  mainContent.innerHTML = '';

  // Custom event from URL
  const urlParams = new URLSearchParams(window.location.search);
  const customDateParam = urlParams.get('date');
  const customName = urlParams.get('name');
  const customThemeId = urlParams.get('theme');

  if (customDateParam && customName) {
    const parts = customDateParam.split('-'); // YYYY-MM-DD
    let customDate;
    if (parts.length === 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      customDate = new Date(Date.UTC(y, m, d) - state.tzOffset * 3600000);
    } else {
      customDate = new Date(customDateParam);
    }

    const customTheme = customThemeId ? (THEMES[customThemeId] || null) : null;

    const banner = document.createElement('div');
    banner.className = 'custom-banner';

    if (customTheme) {
      const isDark = state.themeId === 'dark' ||
        (state.themeId === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      let bg, border, text, accent;
      if (isDark) {
        bg = darkenHex(customTheme.secondaryBg, 0.22);
        border = darkenHex(customTheme.border, 0.45);
        text = '#e8e8e8';
        accent = lightenHex(customTheme.accent, 0.35);
      } else {
        bg = customTheme.secondaryBg;
        border = customTheme.accent;
        text = customTheme.text;
        accent = customTheme.accent;
      }

      banner.style.backgroundColor = bg;
      banner.style.borderColor = border;
      banner.style.color = text;
      banner.style.setProperty('--banner-accent', accent);
    }

    banner.innerHTML = `
      <span class="custom-label">Событие по ссылке</span>
      <span style="font-weight: 700; font-size: 1.1rem">${customName}</span>
      <span style="font-size: 0.85rem; opacity: 0.7">${formatDate(applyTzOffset(customDate, state.tzOffset))}</span>
      <div class="countdown" data-target="${customDate.toISOString()}">
        ${renderCountdownHTML(customDate)}
      </div>
    `;
    mainContent.appendChild(banner);
  }

  // Current period (previous event)
  if (currentTheme.id !== 'default') {
    const periodDiv = document.createElement('div');
    periodDiv.className = 'current-period';
    periodDiv.innerHTML = `
      <span class="period-label">Прошлое событие</span>
      <span class="period-name">${currentTheme.label}</span>
    `;
    mainContent.appendChild(periodDiv);
  }

  // Next event
  if (nextEvent) {
    const eventBlock = document.createElement('div');
    eventBlock.className = 'event-block';
    eventBlock.innerHTML = `
      <div class="event-header">
        <div>
          <div class="period-label">Следующее событие</div>
          <div class="event-name">${nextEvent.event.nameRu}</div>
        </div>
        <div class="event-meta">
          <span class="event-date">${formatDate(applyTzOffset(nextEvent.date, state.tzOffset))}</span>
          <a href="event.html?id=${nextEvent.event.id}&tz=${state.tzOffset}" class="event-link">Открыть страницу →</a>
        </div>
      </div>
      <div class="countdown" data-target="${nextEvent.date.toISOString()}">
        ${renderCountdownHTML(nextEvent.date)}
      </div>
    `;
    mainContent.appendChild(eventBlock);
  }

  // Upcoming list
  if (restEvents.length > 0) {
    const listDiv = document.createElement('div');
    listDiv.className = 'upcoming-list';
    listDiv.innerHTML = `<div class="upcoming-title">Скоро</div>`;
    restEvents.forEach(({ event, date }) => {
      const item = document.createElement('a');
      item.href = `event.html?id=${event.id}&tz=${state.tzOffset}`;
      item.className = 'upcoming-item';
      item.innerHTML = `
        <span class="upcoming-item-name">${event.nameRu}</span>
        <span class="upcoming-item-meta">
          <span>${formatDate(applyTzOffset(date, state.tzOffset))}</span>
          <span>→</span>
        </span>
      `;
      listDiv.appendChild(item);
    });
    mainContent.appendChild(listDiv);
  }
}

function updateCountdowns() {
  document.querySelectorAll('.countdown').forEach(el => {
    const target = el.getAttribute('data-target');
    el.innerHTML = renderCountdownHTML(target);
  });
}

init();
