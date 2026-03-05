import api from '../api.js';
import { toast } from '../app.js';
import Router from '../router.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-white mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-txt-primary dark:text-txt-primary-dark">Welcome back</h1>
          <p class="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">Sign in to your FinTrack account</p>
        </div>

        <!-- Form Card -->
        <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-6 shadow-sm">
          <form id="login-form" class="flex flex-col gap-4">
            <div>
              <label for="login-username" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Username</label>
              <input
                type="text"
                id="login-username"
                name="username"
                required
                autocomplete="username"
                placeholder="Enter your username"
                class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark placeholder:text-txt-secondary/50 dark:placeholder:text-txt-secondary-dark/50 text-sm"
              />
            </div>

            <div>
              <label for="login-password" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Password</label>
              <div class="relative">
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  required
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark placeholder:text-txt-secondary/50 dark:placeholder:text-txt-secondary-dark/50 text-sm pr-10"
                />
                <button type="button" id="login-toggle-pw" class="absolute right-3 top-1/2 -translate-y-1/2 text-txt-secondary dark:text-txt-secondary-dark hover:text-txt-primary dark:hover:text-txt-primary-dark" aria-label="Toggle password visibility">
                  <svg class="w-4 h-4" id="login-eye-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div id="login-error" class="hidden text-sm text-expense rounded-lg bg-expense-light dark:bg-expense-darkbg dark:text-red-300 px-3 py-2"></div>

            <button
              type="submit"
              id="login-submit"
              class="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              Sign in
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-txt-secondary dark:text-txt-secondary-dark mt-6">
          Don't have an account?
          <a href="#/register" class="text-accent hover:text-accent-hover font-medium">Create one</a>
        </p>
      </div>
    </div>
  `;

  // Toggle password visibility
  const toggleBtn = document.getElementById('login-toggle-pw');
  const pwInput = document.getElementById('login-password');
  toggleBtn.addEventListener('click', () => {
    const isPassword = pwInput.type === 'password';
    pwInput.type = isPassword ? 'text' : 'password';
  });

  // Form submit
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      errorEl.textContent = 'Please fill in all fields.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
      return;
    }

    try {
      await api.login(username, password);
      // Fetch user data
      const meRes = await api.checkAuth();
      window.__user = meRes.data;
      toast('Logged in successfully', 'success');
      Router.navigate('#/dashboard');
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid username or password.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  });
}
