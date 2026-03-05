import api from './api.js';
import Router from './router.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';

// --- Toast system ---
export function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');

  const colors = {
    success: 'bg-income text-white',
    error: 'bg-expense text-white',
    info: 'bg-accent text-white',
  };

  const icons = {
    success: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
    info: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>',
  };

  el.className = `toast-enter flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colors[type] || colors.info}`;
  el.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.remove('toast-enter');
    el.classList.add('toast-exit');
    el.addEventListener('animationend', () => el.remove());
  }, 3000);
}

// --- Dark mode ---
function initDarkMode() {
  const saved = localStorage.getItem('fintrack-dark');
  if (saved === '1' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

// --- Auth check & init ---
async function init() {
  initDarkMode();

  // Check auth status
  try {
    const res = await api.checkAuth();
    if (res.success) {
      window.__user = res.data;
    } else {
      window.__user = null;
    }
  } catch {
    window.__user = null;
  }

  // Register routes
  Router.register('#/login', renderLogin, { guestOnly: true });
  Router.register('#/register', renderRegister, { guestOnly: true });
  Router.register('#/dashboard', renderDashboard, { requiresAuth: true });

  // Start router
  Router.init();
}

init();
