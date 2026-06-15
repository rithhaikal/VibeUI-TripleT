// app.js - Main orchestrator tying Views, Components, and the State Store together
import { initHero3D } from './components/hero3d.js';

class App {
  constructor() {
    this.viewContainer = null;
    this.navHeader = null;
    this.navMobile = null;
    this.sidebarAdmin = null;
    this.cartDrawer = null;
    this.detailsModal = null;
    this._hero3d = null;  // Active Three.js hero instance
  }

  // Initialize Application
  async start() {
    // Select elements
    this.viewContainer = document.getElementById('view-container');
    this.navHeader = document.getElementById('nav-header');
    this.navMobile = document.getElementById('nav-mobile');
    this.sidebarAdmin = document.getElementById('sidebar-admin');
    this.cartDrawer = document.getElementById('cart-drawer');
    this.detailsModal = document.getElementById('details-modal');

    // Subscribe to State Changes for reactive rendering
    window.store.subscribe((state) => this.render(state));

    // Load initial datasets
    await window.store.init();

    // Default view
    this.switchView('home');
  }

  // View router
  switchView(view) {
    // Destroy hero 3D if navigating away from home
    if (view !== 'home' && this._hero3d) {
      this._hero3d.destroy();
      this._hero3d = null;
    }
    window.store.setState({ activeView: view });
    
    // Auto scroll to top on page switches
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Details Modal controls
  openMealDetails(mealId) {
    window.store.setState({ selectedMealId: mealId });
    this.detailsModal.classList.remove('hidden');
    this.detailsModal.classList.add('flex');
    this.renderModalContent(mealId);
  }

  closeMealDetails() {
    window.store.setState({ selectedMealId: null });
    this.detailsModal.classList.add('hidden');
    this.detailsModal.classList.remove('flex');
  }

  renderModalContent(mealId) {
    const modalInner = document.getElementById('modal-content-inner');
    if (modalInner) {
      modalInner.innerHTML = window.customerViews.renderMealDetails(mealId);
    }
  }

  // Cart Drawer controls
  openCartDrawer() {
    this.cartDrawer.classList.remove('translate-x-full');
    window.customerViews.renderCartDrawer();
  }

  closeCartDrawer() {
    this.cartDrawer.classList.add('translate-x-full');
  }

  // Proxies for cart mutations
  addToCart(mealId, qty = 1) {
    window.store.addToCart(mealId, qty);
    this.openCartDrawer(); // Automatically slide drawer open
  }

  removeFromCart(mealId) {
    window.store.removeFromCart(mealId);
  }

  updateCartQuantity(mealId, quantity) {
    window.store.updateCartQuantity(mealId, quantity);
  }

  // Rating form submittal
  submitRating(mealId, rating, reviewText) {
    window.store.addReview(mealId, rating, reviewText);
    
    // Clear tracked order tracking since review has been submitted
    window.store.setState({ activeOrder: null });
    
    // Alert customer (premium style)
    this.showFloatingAlert("Thank you! Your review has been submitted successfully.", "success");
    
    // Redirect home
    this.switchView('home');
  }

  // Display clean floating snackbar/alert
  showFloatingAlert(msg, type = "info") {
    const alertBox = document.createElement('div');
    alertBox.className = `fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border animate-slide-up flex items-center gap-3 text-xs font-semibold ${
      type === "success" 
        ? "bg-success text-white border-success-dark" 
        : "bg-primary text-white border-primary-dark"
    }`;
    
    alertBox.innerHTML = `
      <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
      ${msg}
    `;

    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.classList.add('opacity-0');
      setTimeout(() => alertBox.remove(), 300);
    }, 3500);
  }

  // Master layout rendering engine based on activeState
  render(state) {
    const isAdmin = state.activeView.startsWith('admin-');
    const isHome = state.activeView === 'home';
    
    // 1. Manage visible layouts Shell
    const contentWrapper = document.getElementById('content-wrapper');
    const mainBody = document.getElementById('main-body');

    if (isAdmin) {
      this.navHeader.classList.add('hidden');
      this.navMobile.classList.add('hidden');
      this.sidebarAdmin.classList.remove('hidden');
      this.sidebarAdmin.classList.add('flex');
      // Reset nav to solid
      this.navHeader.classList.remove('nav-transparent');
      this.navHeader.classList.add('nav-solid');
      
      contentWrapper.classList.remove('max-w-7xl', 'px-4', 'md:px-8', 'hero-content-wrapper');
      contentWrapper.classList.add('w-full', 'px-6', 'md:px-10');
      
      mainBody.classList.remove('pt-0', 'hero-main');
      mainBody.classList.add('lg:pl-64', 'pt-6');
      
      this.updateAdminSidebarActiveLink(state.activeView);
    } else {
      this.navHeader.classList.remove('hidden');
      this.navMobile.classList.remove('hidden');
      this.sidebarAdmin.classList.add('hidden');
      this.sidebarAdmin.classList.remove('flex');

      if (isHome) {
        // Hero view: full-screen, transparent nav, no padding-top on main
        contentWrapper.classList.remove('w-full', 'px-6', 'md:px-10', 'max-w-7xl', 'px-4', 'md:px-8');
        contentWrapper.classList.add('hero-content-wrapper');
        mainBody.classList.remove('lg:pl-64', 'pt-6', 'pt-24');
        mainBody.classList.add('pt-0', 'hero-main');
        this.navHeader.classList.remove('nav-solid');
        this.navHeader.classList.add('nav-transparent');
      } else {
        contentWrapper.classList.remove('w-full', 'px-6', 'md:px-10', 'hero-content-wrapper');
        contentWrapper.classList.add('max-w-7xl', 'px-4', 'md:px-8');
        mainBody.classList.remove('lg:pl-64', 'pt-6', 'pt-0', 'hero-main');
        mainBody.classList.add('pt-24');
        this.navHeader.classList.remove('nav-transparent');
        this.navHeader.classList.add('nav-solid');
      }
      
      this.updateHeaderCartBadge(window.store.getCartCount());
      this.updateHeaderActiveLinks(state.activeView);
    }

    // 2. Render view container
    if (this.viewContainer) {
      // Clear viewport
      this.viewContainer.innerHTML = '';
      
      switch (state.activeView) {
        case 'home':
          // Destroy any existing hero first
          if (this._hero3d) {
            this._hero3d.destroy();
            this._hero3d = null;
          }
          window.customerViews.renderHome(this.viewContainer);
          // Init 3D hero after DOM is ready
          requestAnimationFrame(() => {
            this._hero3d = initHero3D('hero-canvas');
          });
          break;
        case 'catalog':
          window.customerViews.renderCatalog(this.viewContainer);
          break;
        case 'checkout':
          window.customerViews.renderCheckout(this.viewContainer);
          break;
        case 'tracking':
          window.customerViews.renderTracking(this.viewContainer);
          break;
        case 'admin-dash':
          window.adminViews.renderDashboard(this.viewContainer);
          break;
        case 'admin-orders':
          window.adminViews.renderOrders(this.viewContainer);
          break;
        case 'apply':
          window.customerViews.renderApplyJob(this.viewContainer);
          break;
        case 'track-order':
          window.customerViews.renderTrackOrder(this.viewContainer);
          break;
        case 'admin-customers':
          window.adminViews.renderCustomers(this.viewContainer);
          break;
        default:
          window.customerViews.renderHome(this.viewContainer);
      }
    }

    // 3. Keep open drawers/modals refreshed
    if (state.selectedMealId) {
      this.renderModalContent(state.selectedMealId);
    }
    if (!this.cartDrawer.classList.contains('translate-x-full')) {
      window.customerViews.renderCartDrawer();
    }
  }

  // Update navbar visual links
  updateHeaderActiveLinks(activeView) {
    const links = document.querySelectorAll('[data-route]');
    links.forEach(link => {
      const route = link.getAttribute('data-route');
      if (route === activeView) {
        link.classList.add('text-accent', 'font-semibold');
        link.classList.remove('text-secondary-light');
      } else {
        link.classList.remove('text-accent', 'font-semibold');
        link.classList.add('text-secondary-light');
      }
    });
  }

  // Update admin sidebar links
  updateAdminSidebarActiveLink(activeView) {
    const links = document.querySelectorAll('[data-admin-route]');
    links.forEach(link => {
      const route = link.getAttribute('data-admin-route');
      if (route === activeView) {
        link.classList.add('bg-white/10', 'text-white', 'border-l-4', 'border-accent');
        link.classList.remove('text-white/60');
      } else {
        link.classList.remove('bg-white/10', 'text-white', 'border-l-4', 'border-accent');
        link.classList.add('text-white/60');
      }
    });
  }

  // Update cart badge numerical display
  updateHeaderCartBadge(count) {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Preserve any existing window.app bindings set by view scripts (customer.js, admin.js)
  // then bind all App class methods — class prototype methods need explicit binding
  window.app = window.app || {};

  // Core navigation & UI
  window.app.switchView           = app.switchView.bind(app);
  window.app.openMealDetails      = app.openMealDetails.bind(app);
  window.app.closeMealDetails     = app.closeMealDetails.bind(app);
  window.app.openCartDrawer       = app.openCartDrawer.bind(app);
  window.app.closeCartDrawer      = app.closeCartDrawer.bind(app);
  window.app.addToCart            = app.addToCart.bind(app);
  window.app.removeFromCart       = app.removeFromCart.bind(app);
  window.app.updateCartQuantity   = app.updateCartQuantity.bind(app);
  window.app.submitRating         = app.submitRating.bind(app);
  window.app.showFloatingAlert    = app.showFloatingAlert.bind(app);
  window.app.updatePlannerQty     = (type, change) => window.customerViews.updatePlannerQty(type, change);
  window.app.addCustomSteamerToCart = () => window.customerViews.addCustomSteamerToCart();

  // Navbar scroll transparency handler
  let navScrollListener = null;
  function setupNavScrollBehavior() {
    const header = document.getElementById('nav-header');
    if (!header) return;
    if (navScrollListener) window.removeEventListener('scroll', navScrollListener);
    navScrollListener = () => {
      if (header.classList.contains('nav-transparent')) {
        if (window.scrollY > 60) {
          header.classList.add('nav-scrolled');
        } else {
          header.classList.remove('nav-scrolled');
        }
      }
    };
    window.addEventListener('scroll', navScrollListener, { passive: true });
  }
  setupNavScrollBehavior();

  app.start();
});
