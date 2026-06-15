// customer.js - View controller for Customer screens

import { store } from '../store.js';
import { dataLoader } from '../data-loader.js';
import { renderMealCard, renderCategoryChips, renderRatingStars } from '../components/cards.js';
import { renderPagination } from '../components/table.js';
import { renderTrackingStepper, renderMockMap } from '../components/tracking.js';

// Local catalog state
let catalogFilters = {
  search: '',
  category: 'All',
  sortBy: 'name',
  page: 1,
  limit: 12
};

let trackOrderResult = null;

export const customerViews = {
  // Render Customer Home View
  renderHome(container) {
    // Select popular meals (top 4 rated)
    const featuredMeals = [...store.state.meals]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    // Categories list
    const categories = ['All', 'Starters', 'Mains', 'Seafood', 'Vegetarian', 'Desserts', 'Beverages'];

    // Select recent orders for quick reorder
    const recentOrders = store.state.orders.slice(0, 3).map(o => {
      const meal = store.state.meals.find(m => m.mealId === o.mealId);
      return { ...o, meal };
    });

    container.innerHTML = `
      <!-- Hero Banner -->
      <section class="relative bg-primary rounded-[2rem] overflow-hidden mb-12 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium text-white">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent z-0"></div>
        
        <div class="max-w-xl relative z-10 space-y-5">
          <span class="text-accent bg-accent/15 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Gourmet Delivery</span>
          <h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-white font-extrabold leading-tight">
            Exquisite Hot Meals, Delivered to <span class="text-accent">Your Door</span>
          </h1>
          <p class="text-secondary-light text-sm md:text-base leading-relaxed">
            Experience premium restaurant culinary creations, curated fresh daily and delivered hot under 35 minutes.
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <button onclick="window.app.switchView('catalog')" class="bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 text-sm">
              Explore Catalog
            </button>
            <button onclick="window.app.switchView('catalog'); window.app.setCatalogCategory('Seafood');" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-7 py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 text-sm">
              View Seafood
            </button>
          </div>
        </div>
        
        <!-- Hero Image Mock -->
        <div class="relative z-10 w-full max-w-xs lg:max-w-md aspect-square rounded-full border-[8px] border-white/5 overflow-hidden shadow-2xl">
          <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80" alt="Premium Meal Platter" class="w-full h-full object-cover"/>
        </div>
      </section>

      <!-- Category quick selection -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold font-display text-primary">Browse Categories</h2>
          <button onclick="window.app.switchView('catalog')" class="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth no-scrollbar">
          ${renderCategoryChips(categories, 'All', 'setCatalogCategory')}
        </div>
      </section>

      <!-- Featured Meals grid -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold font-display text-primary mb-6">Trending Culinary Creations</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featuredMeals.map(meal => renderMealCard(meal)).join('')}
        </div>
      </section>

      <!-- Quick Reorder Panel for returnees -->
      <section class="glass-card rounded-[2rem] p-8 border border-secondary/5">
        <h3 class="font-display text-xl font-bold text-primary mb-2">Fast Reorder</h3>
        <p class="text-xs text-secondary-light mb-6">Reorder one of your recently ordered hot meals in one single tap.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${recentOrders.map(order => {
            if (!order.meal) return '';
            return `
              <div class="flex items-center justify-between p-4 bg-background rounded-2xl border border-secondary/5 hover:border-accent/30 hover:bg-white transition-all group">
                <div class="flex items-center gap-3">
                  <img src="${order.meal.image}" alt="${order.meal.mealName}" class="w-12 h-12 rounded-xl object-cover border border-secondary/10" />
                  <div>
                    <h4 class="font-display font-semibold text-sm text-primary line-clamp-1">${order.meal.mealName}</h4>
                    <span class="text-xs text-secondary-light">$${order.meal.price.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onclick="window.app.addToCart('${order.meal.mealId}'); window.app.openCartDrawer();"
                  class="bg-white hover:bg-accent hover:text-white text-accent border border-accent/20 p-2.5 rounded-xl cursor-pointer transition-all active:scale-90"
                  title="Reorder"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                  </svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  // Render Meals Catalog View (Search, Sort, Filters, and Paginated list)
  renderCatalog(container) {
    const categories = ['All', 'Starters', 'Mains', 'Seafood', 'Vegetarian', 'Desserts', 'Beverages'];
    
    // Fetch query results
    const results = dataLoader.queryMeals(catalogFilters);

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters (desktop persistent, mobile collapsible under drawer) -->
        <aside class="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-6">
            <div>
              <h3 class="font-display font-bold text-lg text-primary mb-4">Refine Catalog</h3>
              
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  id="catalogSearch"
                  value="${catalogFilters.search}" 
                  oninput="window.app.catalogSearch(this.value)"
                  placeholder="Search meals..."
                  class="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-sm"
                />
                <svg class="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            <!-- Category Filter -->
            <div>
              <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light mb-3">Category</h4>
              <div class="flex flex-col gap-2">
                ${categories.map(cat => {
                  const isActive = cat === catalogFilters.category;
                  return `
                    <button 
                      onclick="window.app.setCatalogCategory('${cat}')"
                      class="text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${isActive ? 'bg-accent/15 text-accent-dark font-semibold' : 'text-secondary hover:bg-background/60'}"
                    >
                      ${cat}
                      ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-accent"></span>' : ''}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Sorting -->
            <div>
              <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light mb-3">Sort By</h4>
              <select 
                onchange="window.app.catalogSort(this.value)"
                class="w-full px-3 py-2.5 bg-background border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="name" ${catalogFilters.sortBy === 'name' ? 'selected' : ''}>Alphabetical</option>
                <option value="price-asc" ${catalogFilters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-desc" ${catalogFilters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${catalogFilters.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Main Catalog Results Container -->
        <main class="flex-grow">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold font-display text-primary">Explore Menu</h2>
            <span class="text-xs text-secondary-light">${results.total} Gourmet dishes available</span>
          </div>

          <!-- Meals Grid -->
          ${results.items.length === 0 ? `
            <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
              <svg class="w-12 h-12 mx-auto mb-4 text-secondary/35" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              No meals matching your criteria. Try adjusting your filters.
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              ${results.items.map(meal => renderMealCard(meal)).join('')}
            </div>
            ${renderPagination(results.page, results.totalPages, 'catalogPage')}
          `}
        </main>
      </div>
    `;
  },

  // Set catalog categories and refresh
  setCatalogCategory(cat) {
    catalogFilters.category = cat;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  // Set catalog sorting and refresh
  catalogSort(sortBy) {
    catalogFilters.sortBy = sortBy;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  // Set catalog search query and refresh
  catalogSearch(search) {
    catalogFilters.search = search;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  // Set catalog page index and refresh
  catalogPage(page) {
    catalogFilters.page = page;
    this.refreshCatalog();
  },

  refreshCatalog() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'catalog' && container) {
      this.renderCatalog(container);
    }
  },

  // Render Meal Details Modal content
  renderMealDetails(mealId) {
    const meal = store.state.meals.find(m => m.mealId === mealId);
    if (!meal) return '';
    
    const reviews = dataLoader.getMealRatings(mealId);

    return `
      <div class="relative bg-white rounded-3xl max-w-4xl w-full mx-4 overflow-hidden border border-secondary/10 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-slide-up">
        
        <!-- Left Pane: Image -->
        <div class="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-background-dark">
          <img src="${meal.image}" alt="${meal.mealName}" class="w-full h-full object-cover"/>
          <button 
            onclick="window.app.closeMealDetails()"
            class="absolute top-4 left-4 md:hidden bg-white/90 backdrop-blur-md p-2 rounded-full text-primary shadow-md cursor-pointer hover:bg-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Right Pane: Info & Review Streams -->
        <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <!-- Close Button (desktop) -->
          <button 
            onclick="window.app.closeMealDetails()"
            class="hidden md:flex absolute top-6 right-6 bg-background hover:bg-background-dark p-2 rounded-full text-secondary hover:text-primary transition-all cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="space-y-5">
            <div>
              <span class="text-xs font-semibold text-accent uppercase tracking-wider">${meal.category}</span>
              <h2 class="font-display text-2xl font-bold text-primary mt-1">${meal.mealName}</h2>
              
              <div class="flex items-center gap-2 mt-2">
                <div class="flex text-accent">${renderRatingStars(meal.rating)}</div>
                <span class="text-xs font-semibold text-primary">${meal.rating.toFixed(1)}</span>
                <span class="text-xs text-secondary-light">(${reviews.length} reviews)</span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Description</h4>
              <p class="text-charcoal-light text-xs leading-relaxed">${meal.description}</p>
            </div>

            <!-- Ingredients -->
            <div>
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Key Ingredients</h4>
              <div class="flex flex-wrap gap-1.5">
                ${meal.ingredients.map(ing => `<span class="bg-background text-secondary text-[10px] px-2.5 py-1 rounded-md border border-secondary/5 font-medium">${ing}</span>`).join('')}
              </div>
            </div>

            <!-- Preparation details -->
            <div class="flex items-center gap-4 py-3 border-y border-secondary/5 text-xs text-secondary-light">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Prep: ${meal.prepTime} mins
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
                Fresh Gourmet
              </span>
            </div>

            <!-- Customer Reviews Section -->
            <div class="space-y-3">
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider">Reviews</h4>
              <div class="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                ${reviews.length === 0 ? `<p class="text-xs text-secondary-light italic">No reviews yet.</p>` : 
                  reviews.map(rev => `
                    <div class="bg-background/50 border border-secondary/5 rounded-xl p-3 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-primary font-display">${rev.customerName}</span>
                        <div class="flex text-accent">${renderRatingStars(rev.rating)}</div>
                      </div>
                      <p class="text-[11px] text-charcoal-light italic leading-relaxed">"${rev.review}"</p>
                    </div>
                  `).join('')
                }
              </div>
            </div>
          </div>

          <!-- Checkout / Action footer -->
          <div class="flex items-center justify-between border-t border-secondary/5 pt-4 mt-6">
            <div>
              <span class="text-xs text-secondary-light">Unit Price</span>
              <span class="text-xl font-extrabold text-primary block font-display">$${meal.price.toFixed(2)}</span>
            </div>
            <button 
              onclick="window.app.addToCart('${meal.mealId}'); window.app.closeMealDetails();"
              class="bg-accent hover:bg-accent-dark text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add to Cart
            </button>
          </div>
        </div>

      </div>
    `;
  },

  // Render Cart Drawer Contents
  renderCartDrawer() {
    const drawerContainer = document.getElementById('cart-drawer-items');
    const footerContainer = document.getElementById('cart-drawer-footer');
    if (!drawerContainer || !footerContainer) return;

    const cart = store.state.cart;
    
    if (cart.length === 0) {
      drawerContainer.innerHTML = `
        <div class="py-24 text-center text-secondary">
          <svg class="w-16 h-16 mx-auto mb-4 text-secondary/20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
          <p class="font-display font-semibold text-primary mb-1">Your cart is empty</p>
          <p class="text-xs text-secondary-light">Explore our catalog and add hot meals.</p>
        </div>
      `;
      footerContainer.innerHTML = `
        <button 
          onclick="window.app.closeCartDrawer(); window.app.switchView('catalog');" 
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
        >
          Browse Meals
        </button>
      `;
      return;
    }

    // Load Cart Item Cards
    drawerContainer.innerHTML = cart.map(item => {
      const meal = store.state.meals.find(m => m.mealId === item.mealId);
      if (!meal) return '';
      return `
        <div class="flex items-center gap-4 p-3.5 bg-background rounded-2xl border border-secondary/5">
          <img src="${meal.image}" alt="${meal.mealName}" class="w-16 h-16 rounded-xl object-cover border border-secondary/10" />
          <div class="flex-grow min-w-0">
            <h4 class="font-display font-semibold text-sm text-primary truncate">${meal.mealName}</h4>
            <span class="text-xs text-secondary-light block mb-2">$${meal.price.toFixed(2)}</span>
            
            <!-- Adjust Qty -->
            <div class="flex items-center gap-3">
              <button 
                onclick="window.app.updateCartQuantity('${meal.mealId}', ${item.quantity - 1})"
                class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark transition-all flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90"
              >
                -
              </button>
              <span class="text-xs font-semibold text-primary w-4 text-center">${item.quantity}</span>
              <button 
                onclick="window.app.updateCartQuantity('${meal.mealId}', ${item.quantity + 1})"
                class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark transition-all flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90"
              >
                +
              </button>
            </div>
          </div>
          
          <!-- Delete button -->
          <button 
            onclick="window.app.removeFromCart('${meal.mealId}')" 
            class="text-secondary/40 hover:text-accent p-2 rounded-xl hover:bg-accent/5 transition-colors cursor-pointer"
            aria-label="Remove item"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-1.816A2.25 2.25 0 0112.25 2.25h-2.5a2.25 2.25 0 00-2.25 2.25v1.816m-3 0h10.982"/></svg>
          </button>
        </div>
      `;
    }).join('');

    // Load Footer calculations
    const subtotal = store.getCartTotal();
    const deliveryFee = 3.99;
    const total = subtotal + deliveryFee;

    footerContainer.innerHTML = `
      <div class="space-y-2.5 mb-6 text-xs">
        <div class="flex items-center justify-between text-secondary-light">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between text-secondary-light">
          <span>Delivery Fee</span>
          <span>$${deliveryFee.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
          <span>Total Price</span>
          <span class="font-display">$${total.toFixed(2)}</span>
        </div>
      </div>
      <button 
        onclick="window.app.switchView('checkout'); window.app.closeCartDrawer();" 
        class="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm"
      >
        Proceed to Checkout
      </button>
    `;
  },

  // Render Checkout view layout
  renderCheckout(container) {
    const cart = store.state.cart;
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
          <p class="font-display font-bold text-lg text-primary mb-2">Checkout is unavailable</p>
          <p class="text-xs text-secondary-light mb-6">Your shopping cart is currently empty.</p>
          <button onclick="window.app.switchView('catalog')" class="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-xs">Explore Menu</button>
        </div>
      `;
      return;
    }

    const subtotal = store.getCartTotal();
    const deliveryFee = 3.99;
    const total = subtotal + deliveryFee;

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Delivery forms pane -->
        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Delivery Details</h2>
            
            <form id="checkoutForm" onsubmit="event.preventDefault(); window.app.submitCheckout(new FormData(this))" class="space-y-4">
              <!-- Name & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Name</label>
                  <input type="text" name="name" required placeholder="Evelyn Sterling" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Phone Number</label>
                  <input type="tel" name="phone" required placeholder="+1 (555) 019-2834" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>

              <!-- Address -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Delivery Address</label>
                <input type="text" name="address" required placeholder="Apt 4B, 742 Evergreen Terrace, Metropolis" class="form-input-premium text-sm py-2.5" />
              </div>

              <!-- Payment Method selection -->
              <div class="pt-4 border-t border-secondary/5">
                <h3 class="font-display font-semibold text-sm text-primary mb-3">Payment Method</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="card" checked class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Credit / Debit Card</span>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="wallet" class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Digital Wallet</span>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="cash" class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="pt-6 border-t border-secondary/5 flex justify-end gap-3">
                <button type="button" onclick="window.app.switchView('catalog')" class="px-6 py-3 border border-secondary/15 rounded-2xl text-secondary hover:bg-background-dark font-medium text-sm transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">
                  Place Order ($${total.toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </main>

        <!-- Right Summary side pane -->
        <aside class="w-full lg:w-96 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-6">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4">Order Summary</h3>
            
            <!-- Items list -->
            <div class="space-y-4 max-h-[240px] overflow-y-auto pr-1">
              ${cart.map(item => {
                const meal = store.state.meals.find(m => m.mealId === item.mealId);
                if (!meal) return '';
                return `
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2.5">
                      <img src="${meal.image}" alt="${meal.mealName}" class="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span class="font-bold text-primary font-display line-clamp-1">${meal.mealName}</span>
                        <span class="text-secondary-light">Qty: ${item.quantity}</span>
                      </div>
                    </div>
                    <span class="font-semibold text-primary font-display">$${(meal.price * item.quantity).toFixed(2)}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Ledger calculations -->
            <div class="space-y-2 border-t border-secondary/5 pt-4 text-xs">
              <div class="flex items-center justify-between text-secondary-light">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-secondary-light">
                <span>Delivery Fee</span>
                <span>$${deliveryFee.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
                <span>Total Amount</span>
                <span class="font-display">$${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
  },

  // Submit checkout form and place order
  submitCheckout(formData) {
    const address = formData.get('address');
    const name = formData.get('name');
    const phone = formData.get('phone');
    
    store.placeOrder({ address, name, phone });
  },

  // Render Live Order Tracking page
  renderTracking(container) {
    const activeOrder = store.state.activeOrder;
    
    if (!activeOrder) {
      container.innerHTML = `
        <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
          <p class="font-display font-bold text-lg text-primary mb-2">No active orders</p>
          <p class="text-xs text-secondary-light mb-6">You have no active orders being prepared or delivered right now.</p>
          <button onclick="window.app.switchView('catalog')" class="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-xs">Explore Menu</button>
        </div>
      `;
      return;
    }

    const tracking = store.state.delivery.find(d => d.orderId === activeOrder.orderId);
    const meal = store.state.meals.find(m => m.mealId === activeOrder.mealId);

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Timeline and steps -->
        <main class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div>
                <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Live tracking</span>
                <h2 class="font-display text-2xl font-bold text-primary mt-0.5">Order #${activeOrder.orderId.substring(4) || activeOrder.orderId}</h2>
              </div>
              <div class="text-left md:text-right">
                <span class="text-xs text-secondary-light block">Est. Arrival Time</span>
                <span class="text-lg font-bold text-primary font-display">${tracking ? tracking.estimatedTime : '--:--'}</span>
              </div>
            </div>

            <!-- Horizontal Stepper -->
            ${renderTrackingStepper(activeOrder.status)}

            <!-- Map Mock -->
            ${renderMockMap(activeOrder.status)}
          </div>
        </main>

        <!-- Right detail card panel (driver, ratings if arrived) -->
        <aside class="space-y-6">
          <!-- Order summary -->
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-5">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4">Delivery Address</h3>
            <div class="text-xs text-charcoal space-y-2 leading-relaxed">
              <p><strong class="text-primary">Recurrent:</strong> ${tracking && tracking.details ? tracking.details.name : 'Evelyn Sterling'}</p>
              <p><strong class="text-primary">Contact:</strong> ${tracking && tracking.details ? tracking.details.phone : '+1 (555) 019-2834'}</p>
              <p><strong class="text-primary">Address:</strong> ${tracking && tracking.details ? tracking.details.address : 'Apt 4B, 742 Evergreen Terrace, Metropolis'}</p>
            </div>
          </div>

          <!-- Add Review Form (Activated ONLY when order status === 'delivered') -->
          ${activeOrder.status === 'delivered' ? `
            <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 animate-slide-up space-y-4">
              <div>
                <h4 class="font-display font-bold text-base text-primary">Enjoyed your ${meal ? meal.mealName : 'meal'}?</h4>
                <p class="text-[11px] text-secondary-light mt-0.5">Please share your experience with us.</p>
              </div>

              <form onsubmit="event.preventDefault(); window.app.submitRating('${activeOrder.mealId}', this.rating.value, this.review.value)" class="space-y-3">
                <!-- Stars select -->
                <div class="flex items-center gap-1">
                  <span class="text-xs text-secondary-light mr-2">Your Rating:</span>
                  <select name="rating" required class="bg-white border border-secondary/15 rounded-lg text-xs px-2.5 py-1 focus:outline-none">
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>

                <!-- Textarea -->
                <textarea 
                  name="review" 
                  rows="3" 
                  placeholder="Tell us what you liked or how we can improve..." 
                  class="form-input-premium text-xs py-2 bg-white"
                  required
                ></textarea>

                <button type="submit" class="w-full bg-success hover:bg-success-dark text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-xs shadow-md">
                  Submit Review
                </button>
              </form>
            </div>
          ` : `
            <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 text-center py-8">
              <div class="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-3">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h4 class="font-display font-semibold text-sm text-primary mb-1">Cooking & Preparation</h4>
              <p class="text-[10px] text-secondary-light">Review submittal unlocks automatically upon delivery confirmation.</p>
            </div>
          `}
        </aside>
      </div>
    `;
  },

  renderApplyJob(container) {
    container.innerHTML = `
      <section class="relative bg-primary rounded-[2rem] overflow-hidden mb-12 p-8 md:p-16 shadow-premium text-white">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent z-0"></div>
        <div class="max-w-2xl relative z-10 space-y-5">
          <span class="text-accent bg-accent/15 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Opportunity</span>
          <h1 class="font-display text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight">
            Earn Extra Pocket Money as a <span class="text-accent">Dumpling Reseller</span>
          </h1>
          <p class="text-secondary-light text-sm md:text-base leading-relaxed">
            University students can join our reseller programme — sell premium frozen dumplings to your campus community and earn commission on every order.
          </p>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="w-full lg:w-80 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-5">
            <h3 class="font-display font-bold text-lg text-primary">Why Join Us?</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">Flexible Income</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">Earn commission on every sale — work around your class schedule.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">Campus-Friendly</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">No upfront cost, no inventory — designed for students.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v7.875m17.25 0h-1.5"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">We Handle Delivery</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">Collect orders and addresses — we ship directly to your customers.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">Community Network</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">Join a growing network of student entrepreneurs across campuses.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Student Reseller Application</h2>
            <form id="applyJobForm" onsubmit="event.preventDefault(); window.app.submitApplication(new FormData(this))" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Full Name</label>
                  <input type="text" name="fullName" required placeholder="e.g. Ahmad bin Abdullah" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Student ID</label>
                  <input type="text" name="studentId" required placeholder="e.g. A21CS1234" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">University / Institution</label>
                  <input type="text" name="university" required placeholder="e.g. Universiti Teknologi Malaysia" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Faculty / Department</label>
                  <input type="text" name="faculty" required placeholder="e.g. Faculty of Computing" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Email Address</label>
                  <input type="email" name="email" required placeholder="e.g. ahmad@graduate.utm.my" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Phone Number</label>
                  <input type="tel" name="phone" required placeholder="e.g. +60 12-345 6789" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Why do you want to become a reseller?</label>
                <textarea name="motivation" rows="4" required placeholder="Tell us about your motivation and how you plan to sell frozen dumplings on your campus..." class="form-input-premium text-sm py-2.5"></textarea>
              </div>
              <div class="pt-2">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agree" required class="accent-accent mt-0.5" />
                  <span class="text-xs text-secondary-light leading-relaxed">I confirm that I am a registered university student and agree to the reseller programme terms and conditions.</span>
                </label>
              </div>
              <div class="pt-6 border-t border-secondary/5 flex justify-end gap-3">
                <button type="button" onclick="window.app.switchView('home')" class="px-6 py-3 border border-secondary/15 rounded-2xl text-secondary hover:bg-background-dark font-medium text-sm transition-all cursor-pointer">Cancel</button>
                <button type="submit" class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">Submit Application</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    `;
  },

  submitApplication(formData) {
    const application = {
      fullName: formData.get('fullName'),
      studentId: formData.get('studentId'),
      university: formData.get('university'),
      faculty: formData.get('faculty'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      motivation: formData.get('motivation'),
      submittedAt: new Date().toISOString()
    };
    const apps = JSON.parse(localStorage.getItem('gk_applications') || '[]');
    apps.push(application);
    localStorage.setItem('gk_applications', JSON.stringify(apps));
    window.app.showFloatingAlert('Application submitted successfully! We will contact you soon.', 'success');
    window.app.switchView('home');
  },

  renderTrackOrder(container) {
    const statusLabels = {
      'received': 'Order Received', 'preparing': 'Preparing', 'cooking': 'Cooking',
      'out_for_delivery': 'Out for Delivery', 'delivered': 'Delivered'
    };
    const statusColors = {
      'received': 'bg-blue-100 text-blue-700', 'preparing': 'bg-yellow-100 text-yellow-700',
      'cooking': 'bg-orange-100 text-orange-700', 'out_for_delivery': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700'
    };

    const recentOrders = store.state.orders.slice(0, 8).map(o => {
      const meal = store.state.meals.find(m => m.mealId === o.mealId);
      return { ...o, meal };
    });

    let resultHtml = '';
    if (trackOrderResult) {
      if (trackOrderResult.order) {
        const { order, tracking, meal, customer } = trackOrderResult;
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6 animate-slide-up">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div>
                <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Order Found</span>
                <h2 class="font-display text-2xl font-bold text-primary mt-0.5">Order #${order.orderId}</h2>
              </div>
              <span class="px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}">
                ${statusLabels[order.status] || order.status}
              </span>
            </div>
            ${renderTrackingStepper(order.status)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-secondary/5">
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Order Details</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Meal:</strong> ${meal ? meal.mealName : 'N/A'}</p>
                  <p><strong class="text-primary">Quantity:</strong> ${order.quantity}</p>
                  <p><strong class="text-primary">Amount:</strong> $${order.amount.toFixed(2)}</p>
                  <p><strong class="text-primary">Date:</strong> ${new Date(order.orderDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Delivery Info</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Customer:</strong> ${customer ? customer.name : 'Guest'}</p>
                  <p><strong class="text-primary">Est. Arrival:</strong> ${tracking ? tracking.estimatedTime : 'N/A'}</p>
                  <p><strong class="text-primary">Driver:</strong> ${tracking ? tracking.driverName : 'N/A'}</p>
                  <p><strong class="text-primary">Contact:</strong> ${tracking ? tracking.driverPhone : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-12 text-center border border-secondary/5">
            <svg class="w-12 h-12 mx-auto mb-4 text-secondary/35" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <p class="font-display font-bold text-lg text-primary mb-2">Order Not Found</p>
            <p class="text-xs text-secondary-light">No order matches "${trackOrderResult.query}". Please check the order ID and try again.</p>
          </div>
        `;
      }
    } else {
      resultHtml = `
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5">
          <h3 class="font-display font-bold text-lg text-primary mb-4">Recent Orders</h3>
          ${recentOrders.length === 0 ? '<p class="text-xs text-secondary-light text-center py-8">No orders found.</p>' : `
            <div class="space-y-3">
              ${recentOrders.map(o => `
                <button onclick="window.app.trackOrderLookup('${o.orderId}')" class="w-full flex items-center justify-between p-4 bg-background rounded-2xl border border-secondary/5 hover:border-accent/30 hover:bg-white transition-all cursor-pointer text-left">
                  <div class="flex items-center gap-3">
                    ${o.meal ? `<img src="${o.meal.image}" alt="${o.meal.mealName}" class="w-10 h-10 rounded-xl object-cover border border-secondary/10" />` : ''}
                    <div>
                      <span class="font-display font-semibold text-sm text-primary block">${o.orderId}</span>
                      <span class="text-xs text-secondary-light">${o.meal ? o.meal.mealName : 'Unknown'} · $${o.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[10px] font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}">${statusLabels[o.status] || o.status}</span>
                </button>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    container.innerHTML = `
      <section class="max-w-3xl mx-auto space-y-8">
        <div class="text-center space-y-3">
          <h1 class="font-display text-3xl md:text-4xl font-extrabold text-primary">Track Your Order</h1>
          <p class="text-sm text-secondary-light">Enter your order ID to check the real-time status of your delivery.</p>
        </div>
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5">
          <form onsubmit="event.preventDefault(); window.app.trackOrderLookup(this.orderId.value)" class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-grow">
              <input type="text" name="orderId" id="trackOrderInput" placeholder="Enter Order ID (e.g. ord_1234)" class="form-input-premium text-sm py-3 pl-11" value="${trackOrderResult ? trackOrderResult.query : ''}" />
              <svg class="w-5 h-5 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button type="submit" class="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm whitespace-nowrap">Track Order</button>
          </form>
        </div>
        ${resultHtml}
      </section>
    `;
  },

  trackOrderLookup(query) {
    const q = query.trim();
    if (!q) return;
    const order = store.state.orders.find(o => o.orderId.toLowerCase() === q.toLowerCase());
    const tracking = order ? store.state.delivery.find(d => d.orderId === order.orderId) : null;
    const meal = order ? store.state.meals.find(m => m.mealId === order.mealId) : null;
    const customer = order ? store.state.customers.find(c => c.customerId === order.customerId) : null;
    trackOrderResult = { query: q, order, tracking, meal, customer };
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'track-order' && container) {
      this.renderTrackOrder(container);
    }
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.setCatalogCategory = customerViews.setCatalogCategory.bind(customerViews);
window.app.catalogSort = customerViews.catalogSort.bind(customerViews);
window.app.catalogSearch = customerViews.catalogSearch.bind(customerViews);
window.app.catalogPage = customerViews.catalogPage.bind(customerViews);
window.app.submitCheckout = customerViews.submitCheckout.bind(customerViews);
window.app.submitApplication = customerViews.submitApplication.bind(customerViews);
window.app.trackOrderLookup = customerViews.trackOrderLookup.bind(customerViews);
