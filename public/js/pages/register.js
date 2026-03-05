import api from '../api.js';
import { toast } from '../app.js';
import Router from '../router.js';

export function renderRegister(container) {
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
          <h1 class="text-2xl font-bold text-txt-primary dark:text-txt-primary-dark">Create account</h1>
          <p class="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">Start tracking your finances today</p>
        </div>

        <!-- Form Card -->
        <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-6 shadow-sm">
          <form id="register-form" class="flex flex-col gap-4">
            <div>
              <label for="reg-username" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Username</label>
              <input
                type="text"
                id="reg-username"
                name="username"
                required
                autocomplete="username"
                placeholder="Choose a username"
                class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark placeholder:text-txt-secondary/50 dark:placeholder:text-txt-secondary-dark/50 text-sm"
              />
            </div>

            <div>
              <label for="reg-password" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Password</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                required
                autocomplete="new-password"
                placeholder="Create a password"
                class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark placeholder:text-txt-secondary/50 dark:placeholder:text-txt-secondary-dark/50 text-sm"
              />
            </div>

            <div>
              <label for="reg-confirm" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Confirm Password</label>
              <input
                type="password"
                id="reg-confirm"
                name="confirm"
                required
                autocomplete="new-password"
                placeholder="Repeat your password"
                class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark placeholder:text-txt-secondary/50 dark:placeholder:text-txt-secondary-dark/50 text-sm"
              />
            </div>

            <div id="register-error" class="hidden text-sm text-expense rounded-lg bg-expense-light dark:bg-expense-darkbg dark:text-red-300 px-3 py-2"></div>

            <button
              type="submit"
              id="register-submit"
              class="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              Create account
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-txt-secondary dark:text-txt-secondary-dark mt-6">
          Already have an account?
          <a href="#/login" class="text-accent hover:text-accent-hover font-medium">Sign in</a>
        </p>
      </div>
    </div>
  `;

  // Form submit
  const form = document.getElementById('register-form');
  const errorEl = document.getElementById('register-error');
  const submitBtn = document.getElementById('register-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!username || !password || !confirm) {
      errorEl.textContent = 'Please fill in all fields.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (username.length < 3) {
      errorEl.textContent = 'Username must be at least 3 characters.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      await api.register(username, password);
      toast('Account created! Please sign in.', 'success');
      Router.navigate('#/login');
    } catch (err) {
      errorEl.textContent = err.message || 'Registration failed. Try a different username.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });
}
