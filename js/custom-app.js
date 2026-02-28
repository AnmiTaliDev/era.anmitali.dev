import { THEMES } from './events.js';
import { formatDate } from './utils.js';
import { applyEventTheme, updateThemeUI } from './ui.js';

const STORAGE_KEY = "era-custom-timers";

function loadTimers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTimers(timers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function buildShareUrl(name, date, theme) {
  const params = new URLSearchParams({ name, date });
  if (theme) params.set("theme", theme);
  const baseUrl = window.location.origin + window.location.pathname.replace('custom.html', 'index.html');
  return `${baseUrl}?${params.toString()}`;
}

const state = {
  timers: loadTimers(),
  themeId: localStorage.getItem('theme') || 'system',
};

const form = document.getElementById('custom-timer-form');
const themeSelect = document.getElementById('timer-theme');
const savedList = document.getElementById('saved-list');
const savedTitle = document.getElementById('saved-title');
const shareBox = document.getElementById('share-box');
const shareInput = document.getElementById('share-input');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');

function populateThemeSelect() {
  while (themeSelect.options.length > 1) {
    themeSelect.remove(1);
  }
  Object.values(THEMES).filter(entry => entry.id !== 'default').forEach(theme => {
    const opt = document.createElement('option');
    opt.value = theme.id;
    opt.textContent = theme.label;
    themeSelect.appendChild(opt);
  });
}

function init() {
  document.getElementById('timer-date').min = new Date().toISOString().slice(0, 10);

  populateThemeSelect();
  updateThemeUI(state.themeId);
  applyEventTheme(THEMES.default, state.themeId);
  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('timer-name').value;
    const date = document.getElementById('timer-date').value;
    const theme = themeSelect.value;

    const newTimer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      date,
      theme: theme || undefined,
      createdAt: Date.now(),
    };

    state.timers.unshift(newTimer);
    saveTimers(state.timers);

    const url = buildShareUrl(newTimer.name, newTimer.date, newTimer.theme);
    shareInput.value = url;
    shareBox.style.display = 'flex';

    form.reset();
    render();
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shareInput.value).then(() => {
      copyBtn.textContent = 'Скопировано';
      setTimeout(() => { copyBtn.textContent = 'Копировать'; }, 2000);
    });
  });

  themeToggle.addEventListener('click', () => {
    const modes = ['system', 'dark', 'light'];
    state.themeId = modes[(modes.indexOf(state.themeId) + 1) % modes.length];
    localStorage.setItem('theme', state.themeId);
    updateThemeUI(state.themeId);
    applyEventTheme(THEMES.default, state.themeId);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.themeId === 'system') {
      applyEventTheme(THEMES.default, state.themeId);
    }
  });
}

function render() {
  savedTitle.textContent = `Сохранённые таймеры (${state.timers.length})`;

  if (state.timers.length === 0) {
    savedList.innerHTML = `<p class="empty-msg">Пока нет сохранённых таймеров</p>`;
    return;
  }

  savedList.innerHTML = '';
  state.timers.forEach(timer => {
    const days = daysUntil(timer.date);
    const isPast = days < 0;
    const daysLabel = isPast
      ? `${Math.abs(days)} дн. назад`
      : days === 0
        ? 'сегодня'
        : `через ${days} дн.`;

    const baseUrl = window.location.pathname.replace('custom.html', 'index.html');
    const shareLink = `${baseUrl}?name=${encodeURIComponent(timer.name)}&date=${timer.date}${timer.theme ? `&theme=${timer.theme}` : ""}`;

    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `
      <div class="saved-item-left">
        <span class="saved-item-name">${timer.name}</span>
        <span class="saved-item-date">${formatDate(new Date(timer.date))}</span>
      </div>
      <div class="saved-item-right">
        <span class="saved-days">${daysLabel}</span>
        <a href="${shareLink}" class="open-btn">Открыть</a>
        <button class="delete-btn" data-id="${timer.id}">✕</button>
      </div>
    `;

    item.querySelector('.delete-btn').addEventListener('click', () => {
      state.timers = state.timers.filter(entry => entry.id !== timer.id);
      saveTimers(state.timers);
      render();
    });

    savedList.appendChild(item);
  });
}

init();
