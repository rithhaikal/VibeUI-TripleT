// admin.js - View controller for Admin screens

import { store } from '../store.js';
import { dataLoader } from '../data-loader.js';
import { renderOrderTable, renderCustomerTable, renderPagination } from '../components/table.js';
import { renderRevenueChart } from '../components/charts.js';

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

export const adminViews = {
  // Render Dashboard KPI summaries, Canvas Charts & Top meals lists
  renderDashboard(container) {
    const metrics = dataLoader.getAdminMetrics();
    
    container.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        <!-- Top Metrics row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- KPI 1 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Total Sales</span>
              <span class="text-2xl font-extrabold text-primary font-display">$${metrics.kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Total Orders</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.totalOrders}</span>
            </div>
          </div>

          <!-- KPI 3 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Active Orders</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.activeOrders}</span>
            </div>
          </div>

          <!-- KPI 4 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Average Rating</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.avgRating.toFixed(1)} / 5.0</span>
            </div>
          </div>

        </div>

        <!-- Sales Analytics Chart and Top popular items panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Chart pane -->
          <div class="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium flex flex-col justify-between">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-display font-bold text-lg text-primary">Revenue Timeline (7 Days)</h3>
              <span class="text-xs text-secondary-light">Sales volume aggregate</span>
            </div>
            <!-- Canvas target -->
            <div class="relative w-full h-64 md:h-80">
              <canvas id="revenueChartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Popular items ledger -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4 mb-4">Top 5 Popular Dishes</h3>
            <div class="space-y-4">
              ${metrics.popularMeals.map((meal, idx) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-background-dark text-primary font-bold text-xs flex items-center justify-center">${idx + 1}</span>
                    <div>
                      <h4 class="font-display font-semibold text-sm text-primary line-clamp-1">${meal.mealName}</h4>
                      <span class="text-[10px] text-secondary-light">${meal.category}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-primary block">${meal.quantity} orders</span>
                    <span class="text-[10px] text-secondary-light">$${(meal.price * meal.quantity).toFixed(2)}</span>
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
      renderRevenueChart('revenueChartCanvas', metrics.revenueChart);
    }, 100);
  },

  // Render order registry management interface
  renderOrders(container) {
    const results = dataLoader.queryOrders(ordersFilters);

    container.innerHTML = `
      <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <h2 class="font-display text-2xl font-bold text-primary">Order Management</h2>
          
          <!-- Filter elements -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="relative w-full md:w-60">
              <input 
                type="text" 
                placeholder="Search orders / names..."
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
              <option value="cooking" ${ordersFilters.status === 'cooking' ? 'selected' : ''}>Cooking</option>
              <option value="out_for_delivery" ${ordersFilters.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="delivered" ${ordersFilters.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </div>
        </div>

        <!-- Render orders table -->
        ${renderOrderTable(results.items)}
        ${renderPagination(results.page, results.totalPages, 'adminOrdersPage')}
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
    store.updateOrderStatus(orderId, status);
    this.refreshOrders();
  },

  refreshOrders() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'admin-orders' && container) {
      this.renderOrders(container);
    }
  },

  // Render Customer Directory View
  renderCustomers(container) {
    const results = dataLoader.queryCustomers(customersFilters);

    container.innerHTML = `
      <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <h2 class="font-display text-2xl font-bold text-primary">Customer Directory</h2>
          
          <!-- Search input -->
          <div class="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search customers..."
              value="${customersFilters.search}"
              oninput="window.app.adminCustomersSearch(this.value)"
              class="w-full pl-9 pr-4 py-2 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-xs"
            />
            <svg class="w-3.5 h-3.5 text-secondary/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <!-- Render customers table -->
        ${renderCustomerTable(results.items)}
        ${renderPagination(results.page, results.totalPages, 'adminCustomersPage')}
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
    if (store.state.activeView === 'admin-customers' && container) {
      this.renderCustomers(container);
    }
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.adminOrdersSearch = adminViews.adminOrdersSearch.bind(adminViews);
window.app.adminOrdersStatus = adminViews.adminOrdersStatus.bind(adminViews);
window.app.adminOrdersPage = adminViews.adminOrdersPage.bind(adminViews);
window.app.adminUpdateStatus = adminViews.adminUpdateStatus.bind(adminViews);
window.app.adminCustomersSearch = adminViews.adminCustomersSearch.bind(adminViews);
window.app.adminCustomersPage = adminViews.adminCustomersPage.bind(adminViews);
