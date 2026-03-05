// Hash-based router
const Router = {
  routes: {},
  currentPage: null,

  register(hash, renderFn, { requiresAuth = false, guestOnly = false } = {}) {
    this.routes[hash] = { render: renderFn, requiresAuth, guestOnly };
  },

  async navigate(hash) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
      return; // hashchange event will trigger resolve
    }
    await this.resolve();
  },

  async resolve() {
    const hash = window.location.hash || '#/login';
    const route = this.routes[hash];

    if (!route) {
      // Default redirect
      const isAuthed = window.__user != null;
      window.location.hash = isAuthed ? '#/dashboard' : '#/login';
      return;
    }

    const isAuthed = window.__user != null;

    // Auth guard
    if (route.requiresAuth && !isAuthed) {
      window.location.hash = '#/login';
      return;
    }

    // Guest guard (don't show login/register to authed users)
    if (route.guestOnly && isAuthed) {
      window.location.hash = '#/dashboard';
      return;
    }

    const app = document.getElementById('app');
    app.style.opacity = '0';
    app.style.transform = 'translateY(4px)';

    // Small delay for transition
    await new Promise((r) => setTimeout(r, 50));

    app.innerHTML = '';
    await route.render(app);

    // Fade in
    requestAnimationFrame(() => {
      app.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    });

    this.currentPage = hash;
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },
};

export default Router;
