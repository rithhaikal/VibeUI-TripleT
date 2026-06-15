// auth.js - Prototype customer and reseller authentication view

let authMode = 'customer';
let authError = '';

window.authViews = {
  renderLogin(container) {
    const isResellerMode = authMode === 'reseller';

    container.innerHTML = `
      <section class="auth-shell animate-fade-in">
        <div class="auth-story-panel">
          <div class="relative z-10 max-w-lg">
            <div class="flex items-center gap-3 mb-10">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-xl">
                <svg class="w-full h-full text-primary" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M70 20 C40 20, 25 45, 25 65 C25 80, 40 90, 60 90 C45 90, 35 80, 35 65 C35 45, 50 30, 70 20 Z" fill="#1E352F"/>
                  <path d="M45 35 V75 M55 35 V75 M45 55 H55" stroke="#C49A45" stroke-width="8" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <span class="font-display font-bold text-xl text-white block">好米巴 Hot Meal Bar</span>
                <span class="text-[10px] text-white/55 font-semibold tracking-wide">Chinese Muslim · KTF Alumni UTM</span>
              </div>
            </div>

            <span class="inline-flex px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[10px] font-bold uppercase tracking-wider mb-5">Campus dumplings, made simple</span>
            <h1 class="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">One student account.<br><span class="text-accent">The right access.</span></h1>
            <p class="text-sm text-white/65 leading-relaxed max-w-md">Customers can order and track deliveries. Approved student resellers also unlock sales, order, and customer tools.</p>

            <div class="grid grid-cols-2 gap-3 mt-10">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span class="text-2xl font-extrabold text-white font-display block">Customer</span>
                <span class="text-[10px] text-white/50">Shop, checkout and track</span>
              </div>
              <div class="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <span class="text-2xl font-extrabold text-accent font-display block">Reseller</span>
                <span class="text-[10px] text-white/50">Approved accounts only</span>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="w-full max-w-md">
            <div class="mb-7">
              <span class="text-[10px] font-bold text-accent uppercase tracking-wider">Student access</span>
              <h2 class="font-display text-3xl font-extrabold text-primary mt-1">Welcome back</h2>
              <p class="text-xs text-secondary-light mt-2">Choose how you want to enter Hot Meal Bar.</p>
            </div>

            <div class="grid grid-cols-2 gap-2 bg-background-dark/60 rounded-2xl p-1.5 mb-6">
              <button type="button" onclick="window.app.setAuthMode('customer')" class="auth-role-button ${!isResellerMode ? 'is-active' : ''}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                Customer
              </button>
              <button type="button" onclick="window.app.setAuthMode('reseller')" class="auth-role-button ${isResellerMode ? 'is-active' : ''}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87l1.075.124 1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828a1.125 1.125 0 00-.43.992l.43.991 1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456-1.076.124-.644.869-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281-.644-.87-1.076-.124-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827.43-.991-.43-.992-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456 1.076-.124.644-.869.214-1.28z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Reseller
              </button>
            </div>

            <form onsubmit="event.preventDefault(); window.app.submitLogin(new FormData(this))" class="space-y-4">
              <input type="hidden" name="role" value="${authMode}" />
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-secondary block">UTM Email</label>
                <input id="login-email" type="email" name="email" required autocomplete="email" class="form-input-premium" placeholder="${isResellerMode ? 'fakhrul.m@graduate.utm.my' : 'farhan@graduate.utm.my'}" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-secondary block">Password</label>
                <input id="login-password" type="password" name="password" required autocomplete="current-password" class="form-input-premium" placeholder="Enter your password" />
              </div>

              ${authError ? `
                <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 animate-slide-up">${authError}</div>
              ` : ''}

              <button type="submit" class="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">
                Sign in as ${isResellerMode ? 'Reseller' : 'Customer'}
              </button>
            </form>

            <div class="mt-6 rounded-2xl border border-secondary/10 bg-background p-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <span class="text-[10px] uppercase tracking-wider font-bold text-secondary-light">Demo account</span>
                <button onclick="window.app.fillDemoLogin()" class="text-[10px] font-bold text-accent hover:text-accent-dark cursor-pointer">Use credentials</button>
              </div>
              <p class="text-xs font-semibold text-primary">${isResellerMode ? 'fakhrul.m@graduate.utm.my' : 'farhan@graduate.utm.my'}</p>
              <p class="text-[10px] text-secondary-light mt-1">Password: <strong>utm123</strong></p>
            </div>

            ${!isResellerMode ? '<p class="text-[10px] text-secondary-light text-center mt-5">Approved reseller accounts retain Seller Panel access even when entering as a customer.</p>' : ''}
          </div>
        </div>
      </section>
    `;
  },

  setAuthMode(mode) {
    authMode = mode === 'reseller' ? 'reseller' : 'customer';
    authError = '';
    this.renderLogin(document.getElementById('view-container'));
  },

  fillDemoLogin() {
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    if (email) email.value = authMode === 'reseller' ? 'fakhrul.m@graduate.utm.my' : 'farhan@graduate.utm.my';
    if (password) password.value = 'utm123';
  },

  submitLogin(formData) {
    const result = window.store.authenticate(
      formData.get('email'),
      formData.get('password'),
      formData.get('role')
    );

    if (!result.success) {
      authError = result.message;
      this.renderLogin(document.getElementById('view-container'));
      return;
    }

    authError = '';
    window.app.showFloatingAlert(`Welcome, ${result.user.name}.`, 'success');
  }
};

window.app = window.app || {};
window.app.setAuthMode = window.authViews.setAuthMode.bind(window.authViews);
window.app.fillDemoLogin = window.authViews.fillDemoLogin.bind(window.authViews);
window.app.submitLogin = window.authViews.submitLogin.bind(window.authViews);
