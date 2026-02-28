import { getEventById } from './events.js';
import {
  parseTzParam,
  getUserTzOffset,
  formatDate,
  applyTzOffset,
} from './utils.js';
import { applyEventTheme, updateThemeUI, setupTzSelect, renderCountdownHTML } from './ui.js';

// --- State ---
const state = {
  tzOffset: getUserTzOffset(),
  themeId: 'system',
  now: new Date(),
  eventId: new URLSearchParams(window.location.search).get('id'),
};

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
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
  render();

  setInterval(() => {
    state.now = new Date();
    updateCountdowns();
  }, 1000);

  themeToggle.addEventListener('click', () => {
    const modes = ['system', 'dark', 'light'];
    state.themeId = modes[(modes.indexOf(state.themeId) + 1) % modes.length];
    localStorage.setItem('theme', state.themeId);
    updateThemeUI(state.themeId);
    render();
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
      render();
    }
  });
}

function render() {
  const event = getEventById(state.eventId);
  if (!event) {
    mainContent.innerHTML = `<h1>Событие не найдено</h1><a href="index.html">Вернуться на главную</a>`;
    return;
  }

  const absoluteEventDate = event.getDate(state.now.getFullYear(), state.tzOffset);
  const localNow = applyTzOffset(state.now, state.tzOffset);
  const localEventDate = applyTzOffset(absoluteEventDate, state.tzOffset);

  let targetDate = absoluteEventDate;
  if (localEventDate.getTime() <= localNow.getTime()) {
    targetDate = event.getDate(state.now.getFullYear() + 1, state.tzOffset);
  }

  const displayDate = applyTzOffset(targetDate, state.tzOffset);

  applyEventTheme(event.theme, state.themeId);

  mainContent.innerHTML = `
    <div class="event-header">
      <div>
        <div class="period-label">Обратный отсчёт</div>
        <h1 class="event-name" style="font-size: 3rem;">${event.nameRu}</h1>
        <p style="opacity: 0.7; margin-top: 1rem;">${event.description || ''}</p>
      </div>
      <div class="event-meta">
        <span class="event-date" style="font-size: 1.2rem;">${formatDate(displayDate)}</span>
      </div>
    </div>
    <div class="countdown countdown-large" data-target="${targetDate.toISOString()}">
      ${renderCountdownHTML(targetDate)}
    </div>
    <div style="margin-top: 4rem;">
        <a href="index.html?tz=${state.tzOffset}" class="nav-link">← Вернуться на главную</a>
    </div>
  `;
}

function updateCountdowns() {
  document.querySelectorAll('.countdown').forEach(el => {
    const target = el.getAttribute('data-target');
    el.innerHTML = renderCountdownHTML(target);
  });
}

init();
