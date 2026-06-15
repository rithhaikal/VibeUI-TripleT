// customer.js - View controller for Customer screens

// Local catalog state
let catalogFilters = {
  search: '',
  category: 'All',
  sortBy: 'name',
  page: 1,
  limit: 12
};

let trackOrderResult = null;
let locationGraceTimer = null;

function escapeAttribute(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Dumpling customizer state
let plannerState = {
  chicken: 4,
  beef: 4,
  veg: 4
};

window.customerViews = {
  // Render Customer Home View
  renderHome(container) {
    // Select popular meals (top 4 rated)
    const featuredMeals = [...window.store.state.meals]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    // Categories list
    const categories = ['All', 'Chicken', 'Beef', 'Vegetarian', 'Signature Mix'];

    // Select recent orders for quick reorder
    const recentOrders = window.store.state.orders.slice(0, 3).map(o => {
      const meal = window.store.state.meals.find(m => m.mealId === o.mealId);
      return { ...o, meal };
    });

    container.innerHTML = `
      <!-- Hero Banner -->
      <section class="relative bg-primary rounded-[2rem] overflow-hidden mb-12 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium text-white">
        <!-- White Crescent Decorative Motif in Background -->
        <div class="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full pointer-events-none z-0"></div>
        <div class="absolute right-10 top-10 w-24 h-24 border-4 border-white/5 rounded-full pointer-events-none z-0"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent z-0"></div>
        
        <div class="max-w-xl relative z-10 space-y-5">
          <div class="flex items-center gap-2">
            <span class="text-accent bg-accent/15 border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">好米巴 · Chinese Muslim</span>
            <span class="text-white bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold">KTF Alumni UTM</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight">
            Hand-Folded Frozen Dumplings <span class="text-accent">Delivered to Campus</span>
          </h1>
          <p class="text-secondary-light text-sm md:text-base leading-relaxed">
            Order premium Chinese Muslim frozen dumplings prepared by Hot Meal Bar at KTF Alumni Area. Support student resellers and get them shipped directly to your hostel block!
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <button onclick="window.app.switchView('catalog')" class="bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 text-sm">
              Order Dumplings Now
            </button>
            <button onclick="window.app.switchView('apply')" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-7 py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 text-sm">
              Become a Reseller
            </button>
          </div>
        </div>
        
        <!-- Hero Image (Sponsor Logo beautifully displayed in premium circular tray) -->
        <div class="relative z-10 w-full max-w-[240px] md:max-w-[280px] aspect-square rounded-[2rem] border-[6px] border-white/10 overflow-hidden shadow-2xl bg-white flex items-center justify-center p-4">
          <img src="assets/sponsor/logo.jpeg" alt="Hot Meal Bar Logo" class="w-full h-full object-contain rounded-2xl" onerror="this.src='https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500'"/>
        </div>
      </section>

      <!-- Signature Visual Design Element: Bamboo Steamer Plate Planner -->
      <section class="mb-12 bg-white rounded-[2rem] p-6 md:p-10 border border-secondary/10 shadow-premium">
        <div class="flex flex-col lg:flex-row gap-8 items-center">
          <div class="w-full lg:w-1/2 space-y-4">
            <span class="text-xs font-bold text-accent uppercase tracking-wider">Interactive Customizer</span>
            <h2 class="text-2xl font-bold font-display text-primary">Build Your Dumpling Steamer</h2>
            <p class="text-xs text-secondary-light leading-relaxed">
              Design a custom assortment of 12 hand-folded dumplings. Tap the selectors below to adjust counts. Fill up all 12 slots to add your personalized mix to the cart!
            </p>
            
            <div class="space-y-4 pt-2">
              <!-- Chicken Dumplings -->
              <div class="flex items-center justify-between p-3.5 bg-background rounded-2xl border border-secondary/5">
                <div>
                  <h4 class="font-display font-semibold text-xs text-primary">Chicken & Mushroom</h4>
                  <span class="text-[10px] text-secondary-light">Juicy & Fragrant</span>
                </div>
                <div class="flex items-center gap-3">
                  <button onclick="window.app.updatePlannerQty('chicken', -1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">-</button>
                  <span id="planner-chicken-qty" class="text-xs font-bold text-primary w-4 text-center">4</span>
                  <button onclick="window.app.updatePlannerQty('chicken', 1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">+</button>
                </div>
              </div>

              <!-- Beef Dumplings -->
              <div class="flex items-center justify-between p-3.5 bg-background rounded-2xl border border-secondary/5">
                <div>
                  <h4 class="font-display font-semibold text-xs text-primary">Savory Cumin Beef</h4>
                  <span class="text-[10px] text-secondary-light">Rich & Spiced</span>
                </div>
                <div class="flex items-center gap-3">
                  <button onclick="window.app.updatePlannerQty('beef', -1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">-</button>
                  <span id="planner-beef-qty" class="text-xs font-bold text-primary w-4 text-center">4</span>
                  <button onclick="window.app.updatePlannerQty('beef', 1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">+</button>
                </div>
              </div>

              <!-- Veg Dumplings -->
              <div class="flex items-center justify-between p-3.5 bg-background rounded-2xl border border-secondary/5">
                <div>
                  <h4 class="font-display font-semibold text-xs text-primary">Chives & Eggs</h4>
                  <span class="text-[10px] text-secondary-light">Traditional Vegetarian</span>
                </div>
                <div class="flex items-center gap-3">
                  <button onclick="window.app.updatePlannerQty('veg', -1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">-</button>
                  <span id="planner-veg-qty" class="text-xs font-bold text-primary w-4 text-center">4</span>
                  <button onclick="window.app.updatePlannerQty('veg', 1)" class="w-7 h-7 bg-white border border-secondary/15 rounded-lg text-primary hover:bg-background-dark flex items-center justify-center cursor-pointer text-sm font-bold active:scale-90">+</button>
                </div>
              </div>
            </div>

            <!-- Price and Cart Action -->
            <div class="flex items-center justify-between pt-4 border-t border-secondary/5">
              <div>
                <span class="text-[10px] text-secondary-light block">Custom Price</span>
                <span class="text-xl font-extrabold text-primary block font-display">RM 16.50</span>
              </div>
              <button 
                id="add-custom-steamer-btn"
                onclick="window.app.addCustomSteamerToCart()" 
                class="bg-accent hover:bg-accent-dark text-white font-semibold text-xs px-6 py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                Add Custom Steamer
              </button>
            </div>
          </div>
          
          <!-- Steamer Visual Display -->
          <div class="w-full lg:w-1/2 flex items-center justify-center">
            <div class="relative w-72 h-72 rounded-full bg-[#D4C3A3] border-8 border-[#BFA781] shadow-lg flex items-center justify-center overflow-hidden">
              <!-- Bamboo texture background -->
              <div class="absolute inset-2 rounded-full border-4 border-[#A3885F] bg-[#E5D7BE] flex items-center justify-center opacity-90"></div>
              
              <!-- Bamboo weave lines -->
              <div class="absolute inset-0 border-t border-black/5 rotate-12 pointer-events-none"></div>
              <div class="absolute inset-0 border-t border-black/5 rotate-45 pointer-events-none"></div>
              <div class="absolute inset-0 border-t border-black/5 -rotate-45 pointer-events-none"></div>

              <!-- Dumplings Grid inside Steamer -->
              <div id="steamer-slots" class="relative z-10 w-56 h-56 rounded-full grid grid-cols-4 gap-3 p-4 items-center justify-center">
                <!-- Rendered Dynamically -->
              </div>
              
              <div class="absolute bottom-2 text-[10px] font-bold text-[#8A6A3A] bg-[#F4ECD8]/80 px-2 py-0.5 rounded-full border border-[#D4C3A3] z-20">12 PCS BASKET</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category quick selection -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold font-display text-primary">Explore Dumpling Categories</h2>
          <button onclick="window.app.switchView('catalog')" class="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth no-scrollbar">
          ${window.renderCategoryChips(categories, 'All', 'setCatalogCategory')}
        </div>
      </section>

      <!-- Featured Meals grid -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold font-display text-primary mb-6">Popular Frozen Dumplings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featuredMeals.map(meal => window.renderMealCard(meal)).join('')}
        </div>
      </section>

      <!-- Quick Reorder Panel for returnees -->
      <section class="glass-card rounded-[2rem] p-8 border border-secondary/15">
        <h3 class="font-display text-xl font-bold text-primary mb-2">Fast Reorder</h3>
        <p class="text-xs text-secondary-light mb-6">Instantly reorder your favorite dumpling packs from previous campus purchases.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${recentOrders.map(order => {
            if (!order.meal) return '';
            return `
              <div class="flex items-center justify-between p-4 bg-background rounded-2xl border border-secondary/5 hover:border-accent/30 hover:bg-white transition-all group">
                <div class="flex items-center gap-3">
                  <img src="${order.meal.image}" alt="${order.meal.mealName}" class="w-12 h-12 rounded-xl object-cover border border-secondary/10" />
                  <div>
                    <h4 class="font-display font-semibold text-xs text-primary line-clamp-1">${order.meal.mealName}</h4>
                    <span class="text-xs text-secondary-light">RM ${order.meal.price.toFixed(2)}</span>
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

    this.renderSteamerVisual();
  },

  // Update Dumpling Planner quantity
  updatePlannerQty(type, change) {
    const total = plannerState.chicken + plannerState.beef + plannerState.veg;
    
    if (change > 0 && total >= 12) {
      window.app.showFloatingAlert("Steamer is full! Only 12 dumplings per basket.", "info");
      return;
    }
    
    if (plannerState[type] + change < 0) return;

    plannerState[type] += change;
    
    // Update quantities in DOM
    document.getElementById(`planner-${type}-qty`).textContent = plannerState[type];
    
    // Rerender visual slots
    this.renderSteamerVisual();
  },

  // Render Steamer graphics
  renderSteamerVisual() {
    const slotsContainer = document.getElementById('steamer-slots');
    if (!slotsContainer) return;

    slotsContainer.innerHTML = '';
    
    const colors = {
      chicken: 'bg-[#F2D7B4] border-[#D1B187]', // Creamy yellow
      beef: 'bg-[#C58B70] border-[#9E654C]',    // Light brown
      veg: 'bg-[#C2E3C4] border-[#8FB892]'      // Light green
    };

    const dumplingItems = [];
    for (let i = 0; i < plannerState.chicken; i++) dumplingItems.push('chicken');
    for (let i = 0; i < plannerState.beef; i++) dumplingItems.push('beef');
    for (let i = 0; i < plannerState.veg; i++) dumplingItems.push('veg');

    // Fill remaining empty slots up to 12
    const totalCount = dumplingItems.length;

    for (let i = 0; i < 12; i++) {
      const type = dumplingItems[i];
      if (type) {
        slotsContainer.innerHTML += `
          <div class="w-10 h-8 rounded-t-full rounded-b-2xl border-2 shadow-sm flex items-center justify-center text-[8px] font-bold text-black/50 ${colors[type]} animate-slide-up transform hover:scale-110 transition-transform cursor-pointer" title="${type} Dumpling">
            🥟
          </div>
        `;
      } else {
        slotsContainer.innerHTML += `
          <div class="w-10 h-8 rounded-full border border-dashed border-black/10 flex items-center justify-center text-[8px] font-bold text-black/10">
            +
          </div>
        `;
      }
    }

    const addBtn = document.getElementById('add-custom-steamer-btn');
    if (addBtn) {
      if (totalCount === 12) {
        addBtn.disabled = false;
        addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        addBtn.disabled = true;
        addBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  },

  // Add customized mix to in-memory cart
  addCustomSteamerToCart() {
    const total = plannerState.chicken + plannerState.beef + plannerState.veg;
    if (total !== 12) {
      window.app.showFloatingAlert("Please select exactly 12 dumplings to complete your basket.", "info");
      return;
    }

    // Generate unique custom item
    const customMealId = `custom_meal_${Date.now()}`;
    const customMeal = {
      mealId: customMealId,
      mealName: `Custom Steamer Basket (${plannerState.chicken} Chicken, ${plannerState.beef} Beef, ${plannerState.veg} Veg)`,
      chineseName: "自选水饺蒸笼",
      category: "Signature Mix",
      price: 16.50,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
      description: `Your custom hand-folded dumpling collection. Includes ${plannerState.chicken} Chicken & Mushroom, ${plannerState.beef} Savory Beef, and ${plannerState.veg} Chives & Eggs.`,
      ingredients: ["Custom Selection"]
    };

    // Push into store meals temporarily
    window.store.state.meals.push(customMeal);
    
    // Add to cart
    window.store.addToCart(customMealId, 1);
    window.app.openCartDrawer();
    window.app.showFloatingAlert("Custom Steamer added to cart!", "success");
    
    // Reset planner
    plannerState = { chicken: 4, beef: 4, veg: 4 };
    this.renderHome(document.getElementById('view-container'));
  },

  // Render Meals Catalog View (Search, Sort, Filters, and Paginated list)
  renderCatalog(container) {
    const categories = ['All', 'Chicken', 'Beef', 'Vegetarian', 'Signature Mix'];
    
    // Fetch query results
    const results = window.dataLoader.queryMeals(catalogFilters);

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/15 space-y-6">
            <div>
              <h3 class="font-display font-bold text-lg text-primary mb-4">Refine Catalog</h3>
              
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  id="catalogSearch"
                  value="${catalogFilters.search}" 
                  oninput="window.app.catalogSearch(this.value)"
                  placeholder="Search dumplings..."
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
            <h2 class="text-2xl font-bold font-display text-primary">Explore Dumpling Menu</h2>
            <span class="text-xs text-secondary-light">${results.total} Packs available</span>
          </div>

          <!-- Meals Grid -->
          ${results.items.length === 0 ? `
            <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
              <svg class="w-12 h-12 mx-auto mb-4 text-secondary/35" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              No dumplings matching your criteria. Try adjusting your filters.
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              ${results.items.map(meal => window.renderMealCard(meal)).join('')}
            </div>
            ${window.renderPagination(results.page, results.totalPages, 'catalogPage')}
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
    if (window.store.state.activeView === 'catalog' && container) {
      this.renderCatalog(container);
    }
  },

  // Render Meal Details Modal content
  renderMealDetails(mealId) {
    const meal = window.store.state.meals.find(m => m.mealId === mealId);
    if (!meal) return '';
    
    const reviews = window.dataLoader.getMealRatings(mealId);

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
              <p class="text-sm font-semibold text-secondary-light font-display mt-0.5">${meal.chineseName || ''}</p>
              
              <div class="flex items-center gap-2 mt-2">
                <div class="flex text-accent">${window.renderRatingStars(meal.rating)}</div>
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
                Cooking: ${meal.prepTime} mins
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
                Chinese Muslim (好米巴)
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
                        <div class="flex text-accent">${window.renderRatingStars(rev.rating)}</div>
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
              <span class="text-xs text-secondary-light">Pack Price</span>
              <span class="text-xl font-extrabold text-primary block font-display">RM ${meal.price.toFixed(2)}</span>
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

    const cart = window.store.state.cart;
    
    if (cart.length === 0) {
      drawerContainer.innerHTML = `
        <div class="py-24 text-center text-secondary">
          <svg class="w-16 h-16 mx-auto mb-4 text-secondary/20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
          <p class="font-display font-semibold text-primary mb-1">Your cart is empty</p>
          <p class="text-xs text-secondary-light">Explore our dumpling catalog and support resellers.</p>
        </div>
      `;
      footerContainer.innerHTML = `
        <button 
          onclick="window.app.closeCartDrawer(); window.app.switchView('catalog');" 
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
        >
          Browse Dumplings
        </button>
      `;
      return;
    }

    // Load Cart Item Cards
    drawerContainer.innerHTML = cart.map(item => {
      const meal = window.store.state.meals.find(m => m.mealId === item.mealId);
      if (!meal) return '';
      return `
        <div class="flex items-center gap-4 p-3.5 bg-background rounded-2xl border border-secondary/5">
          <img
            src="${meal.image}"
            alt="${meal.mealName}"
            class="w-16 h-16 flex-shrink-0 rounded-xl object-cover border border-secondary/10 bg-white"
            onerror="this.onerror=null; this.src='assets/dumplings.gif'; this.classList.remove('object-cover'); this.classList.add('object-contain', 'p-1');"
          />
          <div class="flex-grow min-w-0">
            <h4 class="font-display font-semibold text-sm text-primary truncate">${meal.mealName}</h4>
            <span class="text-xs text-secondary-light block mb-2">RM ${meal.price.toFixed(2)}</span>
            
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
    const subtotal = window.store.getCartTotal();
    const deliveryFee = 2.00; // Flat RM 2.00 delivery on campus
    const total = subtotal + deliveryFee;

    footerContainer.innerHTML = `
      <div class="space-y-2.5 mb-6 text-xs">
        <div class="flex items-center justify-between text-secondary-light">
          <span>Subtotal</span>
          <span>RM ${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between text-secondary-light">
          <span>Campus Delivery Fee</span>
          <span>RM ${deliveryFee.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
          <span>Total Price</span>
          <span class="font-display">RM ${total.toFixed(2)}</span>
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
    const cart = window.store.state.cart;
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

    const subtotal = window.store.getCartTotal();
    const deliveryFee = window.store.getDeliveryZone('ktf').fee;
    const total = subtotal + deliveryFee;

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Delivery forms pane -->
        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Delivery Details</h2>
            
            <form id="checkoutForm" onsubmit="event.preventDefault(); window.app.submitCheckout(new FormData(this))" class="space-y-4">
              <!-- Name & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Name</label>
                  <input type="text" name="name" required placeholder="Ahmad Farhan" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Phone Number</label>
                  <input type="tel" name="phone" required placeholder="+60 12-345 6789" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>

              <!-- Address -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Hostel Block / Room Number (UTM JB)</label>
                <input type="text" name="address" required placeholder="KTF Block M02, Room 304, Universiti Teknologi Malaysia" class="form-input-premium text-sm py-2.5" />
                <input type="hidden" name="zoneId" value="ktf" />
                <p class="text-[10px] text-secondary-light">Initial checkout uses the KTF campus delivery zone. You can correct the location briefly after ordering.</p>
              </div>

              <!-- Payment Method selection -->
              <div class="pt-4 border-t border-secondary/5">
                <h3 class="font-display font-semibold text-sm text-primary mb-3">Payment Method</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="wallet" checked class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">DuitNow QR / E-Wallet</span>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="fpx" class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">FPX Online Banking</span>
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
                  Place Order (RM ${total.toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </main>

        <!-- Right Summary side pane -->
        <aside class="w-full lg:w-96 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/15 space-y-6">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4">Order Summary</h3>
            
            <!-- Items list -->
            <div class="space-y-4 max-h-[240px] overflow-y-auto pr-1">
              ${cart.map(item => {
                const meal = window.store.state.meals.find(m => m.mealId === item.mealId);
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
                    <span class="font-semibold text-primary font-display">RM ${(meal.price * item.quantity).toFixed(2)}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Ledger calculations -->
            <div class="space-y-2 border-t border-secondary/5 pt-4 text-xs">
              <div class="flex items-center justify-between text-secondary-light">
                <span>Subtotal</span>
                <span>RM ${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-secondary-light">
                <span>Campus Delivery</span>
                <span>RM ${deliveryFee.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
                <span>Total Amount</span>
                <span class="font-display">RM ${total.toFixed(2)}</span>
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
    const payment = formData.get('payment');
    const zoneId = formData.get('zoneId');
    
    window.store.placeOrder({ address, name, phone, payment, zoneId });
  },

  // Render Live Order Tracking page
  renderTracking(container) {
    const activeOrder = window.store.state.activeOrder;
    
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

    const tracking = window.store.state.delivery.find(d => d.orderId === activeOrder.orderId);
    const meal = window.store.state.meals.find(m => m.mealId === activeOrder.mealId);
    const locationChangeDeadline = activeOrder.locationChangeDeadline || 0;
    const locationChangeLocked = ['out_for_delivery', 'delivered'].includes(activeOrder.status);
    const locationChangeAvailable = !locationChangeLocked && Date.now() < locationChangeDeadline;
    const latestAdjustment = activeOrder.lastLocationAdjustment;

    container.innerHTML = `
      <!-- Back Button -->
      <div class="mb-6">
        <button
          onclick="window.app.switchView('track-order')"
          class="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors cursor-pointer group"
        >
          <span class="w-8 h-8 rounded-xl border border-secondary/20 bg-white flex items-center justify-center group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </span>
          Back to Order List
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Timeline and steps -->
        <main class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15 space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div>
                <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Live tracking</span>
                <h2 class="font-display text-2xl font-bold text-primary mt-0.5">Order #${activeOrder.orderId}</h2>
              </div>
              <div class="text-left md:text-right">
                <span class="text-xs text-secondary-light block">Est. Arrival Time</span>
                <span class="text-lg font-bold text-primary font-display">${tracking ? tracking.estimatedTime : '--:--'}</span>
              </div>
            </div>

            <!-- Horizontal Stepper -->
            ${window.renderTrackingStepper(activeOrder.status)}

            <!-- Map Mock -->
            ${window.renderMockMap(activeOrder.status)}
          </div>
        </main>

        <!-- Right detail card panel -->
        <aside class="space-y-6">
          <!-- Order summary -->
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/15 space-y-5">
            <div class="flex items-center justify-between gap-3 border-b border-secondary/5 pb-4">
              <h3 class="font-display font-bold text-lg text-primary">Delivery Address</h3>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${locationChangeAvailable ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary-light'}">
                ${locationChangeAvailable ? 'Grace period active' : 'Location locked'}
              </span>
            </div>
            <div class="text-xs text-charcoal space-y-2 leading-relaxed">
              <p><strong class="text-primary">Recipient:</strong> ${tracking && tracking.details ? tracking.details.name : 'Ahmad Farhan'}</p>
              <p><strong class="text-primary">Contact:</strong> ${tracking && tracking.details ? tracking.details.phone : '+60 12-738 9201'}</p>
              <p><strong class="text-primary">Address:</strong> ${tracking && tracking.details ? tracking.details.address : 'KTF Block M02, Room 304, UTM JB'}</p>
              <p><strong class="text-primary">Delivery Fee:</strong> RM ${(activeOrder.deliveryFee ?? 2).toFixed(2)}</p>
            </div>
            ${locationChangeAvailable ? `
              <div class="rounded-2xl bg-accent/5 border border-accent/15 p-3.5">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-accent">Fix My Delivery Location</span>
                  <span id="location-grace-countdown" data-deadline="${locationChangeDeadline}" class="text-xs font-bold text-primary">05:00</span>
                </div>
                <p class="text-[10px] text-secondary-light leading-relaxed mb-3">Change your campus location before the timer ends or the courier starts delivery.</p>
                <button onclick="window.app.openLocationChangeModal()" class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-xs">
                  Change Location
                </button>
              </div>
            ` : `
              <button onclick="window.app.showFloatingAlert('Please contact your assigned reseller for urgent location help.', 'info')" class="w-full border border-secondary/15 text-secondary hover:bg-background-dark font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-xs">
                Contact Reseller
              </button>
            `}
            ${latestAdjustment ? `
              <div class="rounded-xl bg-success/5 border border-success/15 px-3.5 py-3 text-[10px] text-success-dark leading-relaxed">
                <strong>Latest update:</strong> ${latestAdjustment.message}
              </div>
            ` : ''}
          </div>

          <!-- Add Review Form -->
          ${activeOrder.status === 'delivered' ? (
            activeOrder.reviewed ? `
              <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 text-center py-8">
                <span class="text-2xl">⭐</span>
                <h4 class="font-display font-semibold text-sm text-primary mt-2">Feedback Submitted</h4>
                <p class="text-[10px] text-secondary-light">Thank you for sharing your experience with us!</p>
              </div>
            ` : `
              <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 animate-slide-up space-y-4">
                <div>
                  <h4 class="font-display font-bold text-base text-primary">Enjoyed your ${meal ? meal.mealName : 'dumplings'}?</h4>
                  <p class="text-[11px] text-secondary-light mt-0.5">Please share your experience with us.</p>
                </div>

                <form onsubmit="event.preventDefault(); window.app.submitRating('${activeOrder.orderId}', '${activeOrder.mealId}', this.rating.value, this.review.value)" class="space-y-3">
                  <!-- Stars select -->
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-secondary-light mr-2">Your Rating:</span>
                    <input type="hidden" name="rating" class="review-rating-val" value="5" required />
                    <div class="flex items-center gap-1">
                      ${[1, 2, 3, 4, 5].map(num => `
                        <button 
                          type="button" 
                          onclick="window.app.setInteractiveRating(${num}, this)" 
                          class="star-btn text-accent hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                          title="${num} Star${num > 1 ? 's' : ''}"
                        >
                          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>
                      `).join('')}
                    </div>
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
            `
          ) : `
            <div class="glass-card rounded-[2rem] p-6 border border-secondary/15 text-center py-8">
              <img src="assets/dumplings.gif" alt="Preparing order..." class="w-16 h-16 object-contain mx-auto mb-3 dumpling-bounce" />
              <h4 class="font-display font-semibold text-sm text-primary mb-1">Preparing & Shipping</h4>
              <p class="text-[10px] text-secondary-light">Review submission unlocks automatically upon delivery confirmation.</p>
            </div>
          `}
        </aside>
      </div>
    `;

    this.startLocationGraceCountdown(locationChangeDeadline);
  },

  startLocationGraceCountdown(deadline) {
    if (locationGraceTimer) {
      clearInterval(locationGraceTimer);
      locationGraceTimer = null;
    }

    const countdown = document.getElementById('location-grace-countdown');
    if (!countdown || !deadline) return;

    const updateCountdown = () => {
      if (!document.body.contains(countdown)) {
        clearInterval(locationGraceTimer);
        locationGraceTimer = null;
        return;
      }

      const remaining = Math.max(0, deadline - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      countdown.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(locationGraceTimer);
        locationGraceTimer = null;
        const container = document.getElementById('view-container');
        if (window.store.state.activeView === 'tracking' && container) {
          this.renderTracking(container);
        }
      }
    };

    updateCountdown();
    locationGraceTimer = setInterval(updateCountdown, 1000);
  },

  openLocationChangeModal() {
    const activeOrder = window.store.state.activeOrder;
    if (!activeOrder) return;

    const tracking = window.store.state.delivery.find(item => item.orderId === activeOrder.orderId);
    const deadlinePassed = Date.now() >= (activeOrder.locationChangeDeadline || 0);
    const statusLocked = ['out_for_delivery', 'delivered'].includes(activeOrder.status);

    if (deadlinePassed || statusLocked) {
      window.app.showFloatingAlert('The location change window has closed.', 'info');
      return;
    }

    let modal = document.getElementById('location-change-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'location-change-modal';
      modal.className = 'location-change-modal';
      document.body.appendChild(modal);
    }

    const currentZoneId = tracking && tracking.details && tracking.details.zoneId
      ? tracking.details.zoneId
      : 'ktf';
    const currentAddress = tracking && tracking.details ? tracking.details.address : '';
    const zones = window.store.getDeliveryZones();

    modal.innerHTML = `
      <div class="location-change-backdrop" onclick="window.app.closeLocationChangeModal()"></div>
      <div class="location-change-panel animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="location-change-title">
        <div class="flex items-start justify-between gap-4 border-b border-secondary/10 pb-4">
          <div>
            <span class="text-[10px] uppercase tracking-wider font-bold text-accent">Location grace period</span>
            <h2 id="location-change-title" class="font-display text-xl font-bold text-primary mt-1">Change Delivery Location</h2>
            <p class="text-xs text-secondary-light mt-1">Review any fee difference before confirming.</p>
          </div>
          <button type="button" onclick="window.app.closeLocationChangeModal()" class="p-2 rounded-xl text-secondary-light hover:bg-background-dark cursor-pointer" aria-label="Close location editor">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onsubmit="event.preventDefault(); window.app.submitLocationChange(new FormData(this))" class="space-y-4 pt-5">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-secondary-light block">Campus delivery zone</label>
            <select name="zoneId" onchange="window.app.previewLocationFee(this.value)" class="form-input-premium text-sm" required>
              ${zones.map(zone => `
                <option value="${zone.id}" ${zone.id === currentZoneId ? 'selected' : ''}>${zone.name} - RM ${zone.fee.toFixed(2)}</option>
              `).join('')}
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-secondary-light block">Block, room, or pickup point</label>
            <input type="text" name="address" value="${escapeAttribute(currentAddress)}" required class="form-input-premium text-sm" placeholder="Example: KTR Block H, Main Lobby" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-secondary-light block">Delivery note (optional)</label>
            <input type="text" name="deliveryNote" class="form-input-premium text-sm" placeholder="Example: Message me, please do not call" />
          </div>

          <div id="location-fee-preview" class="rounded-2xl border border-secondary/10 bg-background p-4"></div>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onclick="window.app.closeLocationChangeModal()" class="px-5 py-3 border border-secondary/15 rounded-xl text-secondary font-semibold text-xs cursor-pointer">Keep Current Location</button>
            <button id="confirm-location-change" type="submit" class="px-5 py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold text-xs shadow-accent-glow cursor-pointer">Update Location</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('is-open');
    this.previewLocationFee(currentZoneId);
  },

  closeLocationChangeModal() {
    const modal = document.getElementById('location-change-modal');
    if (modal) modal.classList.remove('is-open');
  },

  previewLocationFee(zoneId) {
    const activeOrder = window.store.state.activeOrder;
    const preview = document.getElementById('location-fee-preview');
    const button = document.getElementById('confirm-location-change');
    if (!activeOrder || !preview || !button) return;

    const zone = window.store.getDeliveryZone(zoneId);
    const currentFee = activeOrder.deliveryFee ?? 2.00;
    const difference = parseFloat((zone.fee - currentFee).toFixed(2));
    const paymentMethod = activeOrder.paymentMethod || 'wallet';

    let summary = '<span class="text-success-dark font-semibold">No additional delivery charge.</span>';
    let buttonLabel = 'Update Location';

    if (difference > 0 && paymentMethod === 'cash') {
      summary = `<span class="text-accent-dark font-semibold">RM ${difference.toFixed(2)} will be added to the cash-on-delivery total.</span>`;
      buttonLabel = `Add RM ${difference.toFixed(2)} & Update`;
    } else if (difference > 0) {
      summary = `<span class="text-accent-dark font-semibold">Pay an additional RM ${difference.toFixed(2)} using your original payment method.</span>`;
      buttonLabel = `Pay RM ${difference.toFixed(2)} & Update`;
    } else if (difference < 0) {
      summary = `<span class="text-success-dark font-semibold">RM ${Math.abs(difference).toFixed(2)} will be returned as wallet credit.</span>`;
      buttonLabel = 'Update & Receive Credit';
    }

    preview.innerHTML = `
      <div class="flex items-center justify-between text-xs text-secondary-light mb-2">
        <span>Current delivery fee</span>
        <span>RM ${currentFee.toFixed(2)}</span>
      </div>
      <div class="flex items-center justify-between text-xs text-primary font-bold mb-3">
        <span>New delivery fee</span>
        <span>RM ${zone.fee.toFixed(2)}</span>
      </div>
      <div class="pt-3 border-t border-secondary/10 text-[11px] leading-relaxed">${summary}</div>
    `;
    button.textContent = buttonLabel;
  },

  submitLocationChange(formData) {
    const activeOrder = window.store.state.activeOrder;
    if (!activeOrder) return;

    const result = window.store.updateDeliveryLocation(activeOrder.orderId, {
      zoneId: formData.get('zoneId'),
      address: formData.get('address').trim(),
      deliveryNote: formData.get('deliveryNote').trim()
    });

    if (!result.success) {
      window.app.showFloatingAlert(result.message, 'info');
      this.closeLocationChangeModal();
      return;
    }

    this.closeLocationChangeModal();
    window.app.showFloatingAlert(`Location updated. ${result.adjustmentMessage}`, 'success');
  },

  renderApplyJob(container) {
    container.innerHTML = `
      <section class="relative bg-primary rounded-[2rem] overflow-hidden mb-12 p-8 md:p-16 shadow-premium text-white">
        <!-- Crescent Motif -->
        <div class="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full pointer-events-none z-0"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent z-0"></div>
        <div class="max-w-2xl relative z-10 space-y-5">
          <span class="text-accent bg-accent/15 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Join KTF Campus Reseller Network</span>
          <h1 class="font-display text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight">
            Earn Commission as a <span class="text-accent">Dumpling Reseller</span>
          </h1>
          <p class="text-secondary-light text-sm md:text-base leading-relaxed">
            Pocket extra income by selling Hot Meal Bar frozen dumplings directly to your fellow students in the hostel blocks. Manage orders, earn commissions, and work at your convenience.
          </p>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="w-full lg:w-80 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/15 space-y-5">
            <h3 class="font-display font-bold text-lg text-primary">Value Proposition</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">RM 3.00 Per Pack Commission</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">Earn RM 3.00 directly for every single frozen dumpling bag you sell on campus.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">Completely Flexible</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">No fixed hours. Work during evenings or weekends when students are in hostiles.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v7.875m17.25 0h-1.5"/></svg>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-sm text-primary">No Upfront Cost</h4>
                  <p class="text-xs text-secondary-light leading-relaxed">We provide the marketing resources and initial training. Zero start-up capital required.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Student Reseller Application</h2>
            <form id="applyJobForm" onsubmit="event.preventDefault(); window.app.submitApplication(new FormData(this))" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Full Name</label>
                  <input type="text" name="fullName" required placeholder="e.g. Ahmad bin Abdullah" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Matric / Student ID Number</label>
                  <input type="text" name="studentId" required placeholder="e.g. A22CS0102" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">University / Institution</label>
                  <input type="text" name="university" required readonly value="Universiti Teknologi Malaysia (UTM)" class="form-input-premium text-sm py-2.5 bg-gray-50 cursor-not-allowed" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Hostel Block / College Name</label>
                  <input type="text" name="faculty" required placeholder="e.g. Kolej Tun Fatimah (KTF)" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Email Address</label>
                  <input type="email" name="email" required placeholder="e.g. ahmad@graduate.utm.my" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">WhatsApp Phone Number</label>
                  <input type="tel" name="phone" required placeholder="e.g. +60 12-345 6789" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Why do you want to become a reseller? (Motivation)</label>
                <textarea name="motivation" rows="4" required placeholder="Describe how you plan to market frozen dumplings to students in your block..." class="form-input-premium text-sm py-2.5"></textarea>
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
    
    // In-memory/session only storage simulation
    if (!window.GK_APPLICATIONS) window.GK_APPLICATIONS = [];
    window.GK_APPLICATIONS.push(application);
    
    window.app.showFloatingAlert('Application submitted successfully! We will contact you soon.', 'success');
    window.app.switchView('home');
  },

  renderTrackOrder(container) {
    const statusLabels = {
      'received': 'Placed', 'preparing': 'Preparing', 'cooking': 'Ready for Shipping',
      'out_for_delivery': 'Out for Delivery', 'delivered': 'Delivered'
    };
    const statusColors = {
      'received': 'bg-blue-100 text-blue-700', 'preparing': 'bg-yellow-100 text-yellow-700',
      'cooking': 'bg-orange-100 text-orange-700', 'out_for_delivery': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700'
    };

    const recentOrders = window.store.state.orders.slice(0, 8).map(o => {
      const meal = window.store.state.meals.find(m => m.mealId === o.mealId);
      return { ...o, meal };
    });

    let resultHtml = '';
    if (trackOrderResult) {
      if (trackOrderResult.order) {
        const { order, tracking, meal, customer } = trackOrderResult;
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15 space-y-6 animate-slide-up">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div class="flex items-center gap-3">
                <button
                  onclick="window.app.clearTrackResult()"
                  class="w-8 h-8 rounded-xl border border-secondary/20 bg-white flex items-center justify-center hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer flex-shrink-0"
                  title="Back to order list"
                >
                  <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                  </svg>
                </button>
                <div>
                  <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Order Found</span>
                  <h2 class="font-display text-2xl font-bold text-primary mt-0.5">Order #${order.orderId}</h2>
                </div>
              </div>
              <span class="px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}">
                ${statusLabels[order.status] || order.status}
              </span>
            </div>
            ${window.renderTrackingStepper(order.status)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-secondary/5">
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Order Details</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Meal:</strong> ${meal ? meal.mealName : 'N/A'}</p>
                  <p><strong class="text-primary">Quantity:</strong> ${order.quantity}</p>
                  <p><strong class="text-primary">Amount:</strong> RM ${order.amount.toFixed(2)}</p>
                  <p><strong class="text-primary">Date:</strong> ${new Date(order.orderDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Delivery Info</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Customer:</strong> ${customer ? customer.name : 'Guest'}</p>
                  <p><strong class="text-primary">Est. Arrival:</strong> ${tracking ? tracking.estimatedTime : 'N/A'}</p>
                  <p><strong class="text-primary">Courier:</strong> ${tracking ? tracking.driverName : 'N/A'}</p>
                  <p><strong class="text-primary">Contact:</strong> ${tracking ? tracking.driverPhone : 'N/A'}</p>
                </div>
              </div>
            </div>
            ${order.status === 'delivered' ? (
              order.reviewed ? `
                <div class="pt-6 border-t border-secondary/5 mt-4">
                  <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 text-center py-8">
                    <span class="text-2xl">⭐</span>
                    <h4 class="font-display font-semibold text-sm text-primary mt-2">Feedback Submitted</h4>
                    <p class="text-[10px] text-secondary-light">Thank you for sharing your experience with us!</p>
                  </div>
                </div>
              ` : `
                <div class="pt-6 border-t border-secondary/5 mt-4 space-y-4">
                  <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 animate-slide-up space-y-4">
                    <div>
                      <h4 class="font-display font-bold text-base text-primary">Enjoyed your ${meal ? meal.mealName : 'dumplings'}?</h4>
                      <p class="text-[11px] text-secondary-light mt-0.5">Please share your experience with us.</p>
                    </div>

                    <form onsubmit="event.preventDefault(); window.app.submitRating('${order.orderId}', '${order.mealId}', this.rating.value, this.review.value)" class="space-y-3">
                      <!-- Stars select -->
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs text-secondary-light mr-2">Your Rating:</span>
                        <input type="hidden" name="rating" class="review-rating-val" value="5" required />
                        <div class="flex items-center gap-1">
                          ${[1, 2, 3, 4, 5].map(num => `
                            <button 
                              type="button" 
                              onclick="window.app.setInteractiveRating(${num}, this)" 
                              class="star-btn text-accent hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                              title="${num} Star${num > 1 ? 's' : ''}"
                            >
                              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            </button>
                          `).join('')}
                        </div>
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
                </div>
              `
            ) : ''}
          </div>
        `;
      } else {
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-12 text-center border border-secondary/5 relative">
            <button
              onclick="window.app.clearTrackResult()"
              class="absolute top-6 left-6 w-8 h-8 rounded-xl border border-secondary/20 bg-white flex items-center justify-center hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
              title="Back to order list"
            >
              <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
              </svg>
            </button>
            <svg class="w-12 h-12 mx-auto mb-4 text-secondary/35" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <p class="font-display font-bold text-lg text-primary mb-2">Order Not Found</p>
            <p class="text-xs text-secondary-light">No order matches "${escapeAttribute(trackOrderResult.query)}". Please check the order ID and try again.</p>
          </div>
        `;
      }
    } else {
      resultHtml = `
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15">
          <h3 class="font-display font-bold text-lg text-primary mb-4">Your Recent Purchases</h3>
          ${recentOrders.length === 0 ? '<p class="text-xs text-secondary-light text-center py-8">No orders found.</p>' : `
            <div class="space-y-3">
              ${recentOrders.map(o => `
                <button onclick="window.app.trackOrderLookup('${o.orderId}')" class="w-full flex items-center justify-between p-4 bg-background rounded-2xl border border-secondary/5 hover:border-accent/30 hover:bg-white transition-all cursor-pointer text-left">
                  <div class="flex items-center gap-3">
                    ${o.meal ? `<img src="${o.meal.image}" alt="${o.meal.mealName}" class="w-10 h-10 rounded-xl object-cover border border-secondary/10" />` : ''}
                    <div>
                      <span class="font-display font-semibold text-sm text-primary block">${o.orderId}</span>
                      <span class="text-xs text-secondary-light">${o.meal ? o.meal.mealName : 'Unknown'} · RM ${o.amount.toFixed(2)}</span>
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
          <p class="text-sm text-secondary-light">Enter your order ID (e.g. ord_2001) to view real-time delivery status.</p>
        </div>
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/15">
          <form onsubmit="event.preventDefault(); window.app.trackOrderLookup(this.orderId.value)" class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-grow">
              <input type="text" name="orderId" id="trackOrderInput" placeholder="Enter Order ID (e.g. ord_2001)" class="form-input-premium text-sm py-3 pl-11" value="${trackOrderResult ? trackOrderResult.query : ''}" />
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
    const order = window.store.state.orders.find(o => o.orderId.toLowerCase() === q.toLowerCase());
    const tracking = order ? window.store.state.delivery.find(d => d.orderId === order.orderId) : null;
    const meal = order ? window.store.state.meals.find(m => m.mealId === order.mealId) : null;
    const customer = order ? window.store.state.customers.find(c => c.customerId === order.customerId) : null;
    
    if (order && order.status !== 'delivered') {
      window.store.setState({ activeOrder: order, activeView: 'tracking' });
      return;
    }

    trackOrderResult = { query: q, order, tracking, meal, customer };
    const container = document.getElementById('view-container');
    if (window.store.state.activeView === 'track-order' && container) {
      this.renderTrackOrder(container);
    }
  },

  clearTrackResult() {
    trackOrderResult = null;
    const container = document.getElementById('view-container');
    if (container) this.renderTrackOrder(container);
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.setCatalogCategory = window.customerViews.setCatalogCategory.bind(window.customerViews);
window.app.catalogSort = window.customerViews.catalogSort.bind(window.customerViews);
window.app.catalogSearch = window.customerViews.catalogSearch.bind(window.customerViews);
window.app.catalogPage = window.customerViews.catalogPage.bind(window.customerViews);
window.app.submitCheckout = window.customerViews.submitCheckout.bind(window.customerViews);
window.app.submitApplication = window.customerViews.submitApplication.bind(window.customerViews);
window.app.trackOrderLookup = window.customerViews.trackOrderLookup.bind(window.customerViews);
window.app.updatePlannerQty = window.customerViews.updatePlannerQty.bind(window.customerViews);
window.app.addCustomSteamerToCart = window.customerViews.addCustomSteamerToCart.bind(window.customerViews);
window.app.clearTrackResult      = window.customerViews.clearTrackResult.bind(window.customerViews);
window.app.openLocationChangeModal = window.customerViews.openLocationChangeModal.bind(window.customerViews);
window.app.closeLocationChangeModal = window.customerViews.closeLocationChangeModal.bind(window.customerViews);
window.app.previewLocationFee = window.customerViews.previewLocationFee.bind(window.customerViews);
window.app.submitLocationChange = window.customerViews.submitLocationChange.bind(window.customerViews);
