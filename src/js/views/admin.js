// admin.js - View controller for Admin/Reseller screens

// Local admin states
let ordersFilters = {
  search: '',
  status: 'All',
  page: 1,
  limit: 12
};

let customersFilters = {
  search: '',
  page: 1,
  limit: 12
};

window.adminViews = {
  // Render Dashboard KPI summaries, Canvas Charts & Top meals lists
  renderDashboard(container) {
    const metrics = window.dataLoader.getAdminMetrics();
    
    // Calculate commission payouts
    const totalCommission = window.store.state.orders.reduce((sum, o) => sum + (o.commission || 0), 0);

    container.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        <!-- Top Metrics row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- KPI 1 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/10 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Total Sales (RM)</span>
              <span class="text-xl font-extrabold text-primary font-display">RM ${metrics.kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/10 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            </div>
            <div>
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Total Orders</span>
              <span class="text-xl font-extrabold text-primary font-display">${metrics.kpis.totalOrders}</span>
            </div>
          </div>

          <!-- KPI 3 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/10 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
            </div>
            <div>
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Reseller Payouts</span>
              <span class="text-xl font-extrabold text-success-dark font-display">RM ${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- KPI 4 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/10 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
            </div>
            <div>
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Active Resellers</span>
              <span class="text-xl font-extrabold text-primary font-display">5 Students</span>
            </div>
          </div>

        </div>

        <!-- Sales Analytics Chart and Top popular items panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Chart pane -->
          <div class="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/10 shadow-premium flex flex-col justify-between">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-display font-bold text-base text-primary">Reseller Revenue Timeline (7 Days)</h3>
              <span class="text-xs text-secondary-light">Sales Volume Aggregate</span>
            </div>
            <!-- Canvas target -->
            <div class="relative w-full h-64 md:h-80">
              <canvas id="revenueChartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Popular items ledger -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/10 shadow-premium">
            <h3 class="font-display font-bold text-base text-primary border-b border-secondary/5 pb-4 mb-4">Top 5 Dumpling Packs</h3>
            <div class="space-y-4">
              ${metrics.popularMeals.map((meal, idx) => `
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-background-dark text-primary font-bold text-[10px] flex items-center justify-center">${idx + 1}</span>
                    <div>
                      <h4 class="font-display font-semibold text-primary line-clamp-1">${meal.mealName}</h4>
                      <span class="text-[9px] text-secondary-light">${meal.category}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-primary block">${meal.quantity} packs</span>
                    <span class="text-[9px] text-secondary-light">RM ${(meal.price * meal.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    `;

    // Trigger Canvas Drawing loop asynchronously
    setTimeout(() => {
      window.renderRevenueChart('revenueChartCanvas', metrics.revenueChart);
    }, 100);
  },

  // Render order registry management interface
  renderOrders(container) {
    const results = window.dataLoader.queryOrders(ordersFilters);

    container.innerHTML = `
      <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/10 shadow-premium space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <div>
            <h2 class="font-display text-xl font-bold text-primary">Reseller Orders Ledger</h2>
            <p class="text-xs text-secondary-light mt-0.5">Manage student bulk order disbursements and tracking status.</p>
          </div>
          
          <!-- Filter elements -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="relative w-full md:w-60">
              <input 
                type="text" 
                placeholder="Search by ID, Reseller or Customer..."
                value="${ordersFilters.search}"
                oninput="window.app.adminOrdersSearch(this.value)"
                class="w-full pl-9 pr-4 py-2 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-xs"
              />
              <svg class="w-3.5 h-3.5 text-secondary/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>

            <!-- Status Dropdown -->
            <select 
              onchange="window.app.adminOrdersStatus(this.value)"
              class="bg-background border border-secondary/10 rounded-xl text-xs px-3 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="All" ${ordersFilters.status === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="received" ${ordersFilters.status === 'received' ? 'selected' : ''}>Received</option>
              <option value="preparing" ${ordersFilters.status === 'preparing' ? 'selected' : ''}>Preparing</option>
              <option value="cooking" ${ordersFilters.status === 'cooking' ? 'selected' : ''}>Ready for Ship</option>
              <option value="out_for_delivery" ${ordersFilters.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="delivered" ${ordersFilters.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </div>
        </div>

        <!-- Render orders table -->
        ${window.renderOrderTable(results.items)}
        ${window.renderPagination(results.page, results.totalPages, 'adminOrdersPage')}
      </div>
    `;
  },

  // Search input change callback
  adminOrdersSearch(query) {
    ordersFilters.search = query;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Status select change callback
  adminOrdersStatus(status) {
    ordersFilters.status = status;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Page index trigger callback
  adminOrdersPage(page) {
    ordersFilters.page = page;
    this.refreshOrders();
  },

  // Inline table status override callback
  adminUpdateStatus(orderId, status) {
    window.store.updateOrderStatus(orderId, status);
    this.refreshOrders();
  },

  refreshOrders() {
    const container = document.getElementById('view-container');
    if (window.store.state.activeView === 'admin-orders' && container) {
      this.renderOrders(container);
    }
  },

  // Render Customer Directory View
  renderCustomers(container) {
    const results = window.dataLoader.queryCustomers(customersFilters);

    container.innerHTML = `
      <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/10 shadow-premium space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <div>
            <h2 class="font-display text-xl font-bold text-primary">Student Customer Directory</h2>
            <p class="text-xs text-secondary-light mt-0.5">View member profiles and total spending records.</p>
          </div>
          
          <!-- Search input -->
          <div class="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search students..."
              value="${customersFilters.search}"
              oninput="window.app.adminCustomersSearch(this.value)"
              class="w-full pl-9 pr-4 py-2 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-xs"
            />
            <svg class="w-3.5 h-3.5 text-secondary/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <!-- Render customers table -->
        ${window.renderCustomerTable(results.items)}
        ${window.renderPagination(results.page, results.totalPages, 'adminCustomersPage')}
      </div>
    `;
  },

  // Search input change callback
  adminCustomersSearch(query) {
    customersFilters.search = query;
    customersFilters.page = 1;
    this.refreshCustomers();
  },

  // Page selection change callback
  adminCustomersPage(page) {
    customersFilters.page = page;
    this.refreshCustomers();
  },

  refreshCustomers() {
    const container = document.getElementById('view-container');
    if (window.store.state.activeView === 'admin-customers' && container) {
      this.renderCustomers(container);
    }
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.adminOrdersSearch = window.adminViews.adminOrdersSearch.bind(window.adminViews);
window.app.adminOrdersStatus = window.adminViews.adminOrdersStatus.bind(window.adminViews);
window.app.adminOrdersPage = window.adminViews.adminOrdersPage.bind(window.adminViews);
window.app.adminUpdateStatus = window.adminViews.adminUpdateStatus.bind(window.adminViews);
window.app.adminCustomersSearch = window.adminViews.adminCustomersSearch.bind(window.adminViews);
window.app.adminCustomersPage = window.adminViews.adminCustomersPage.bind(window.adminViews);
