// table.js - Dynamic table layouts and pagination helpers for Admin view screens

export function renderPagination(page, totalPages, targetMethodName) {
  if (totalPages <= 1) return '';
  
  let buttons = '';
  
  // Previous button
  buttons += `
    <button 
      onclick="window.app.${targetMethodName}(${page - 1})"
      class="px-3.5 py-2 rounded-xl text-sm border border-secondary/15 bg-white text-secondary hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
      ${page <= 1 ? 'disabled' : ''}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </button>
  `;

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      const isActive = i === page;
      const activeClass = isActive 
        ? 'bg-primary text-white border-primary shadow-sm' 
        : 'bg-white hover:bg-background-dark text-secondary border-secondary/15';
      buttons += `
        <button 
          onclick="window.app.${targetMethodName}(${i})"
          class="px-4 py-2 rounded-xl text-sm border font-medium cursor-pointer transition-all active:scale-95 ${activeClass}"
        >
          ${i}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      buttons += `<span class="px-2 text-secondary/40 text-sm">...</span>`;
    }
  }

  // Next button
  buttons += `
    <button 
      onclick="window.app.${targetMethodName}(${page + 1})"
      class="px-3.5 py-2 rounded-xl text-sm border border-secondary/15 bg-white text-secondary hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
      ${page >= totalPages ? 'disabled' : ''}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
    </button>
  `;

  return `
    <div class="flex items-center justify-between border-t border-secondary/10 pt-4 mt-6">
      <span class="text-xs text-secondary-light">Showing page ${page} of ${totalPages}</span>
      <div class="flex items-center gap-2">
        ${buttons}
      </div>
    </div>
  `;
}

export function renderOrderTable(items) {
  if (items.length === 0) {
    return `
      <div class="py-12 text-center text-secondary-light">
        <svg class="w-12 h-12 mx-auto mb-3 text-secondary/30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M9.663 5.378A4 4 0 100 11.25c0 .621.504 1.125 1.125 1.125H9.75M12 3v18M3 12h18"/></svg>
        No matching orders found.
      </div>
    `;
  }

  const rows = items.map(order => {
    // Status color classes
    let statusClass = '';
    let statusLabel = '';
    
    switch (order.status) {
      case 'received':
        statusClass = 'bg-secondary/10 text-secondary border-secondary/20';
        statusLabel = 'Received';
        break;
      case 'preparing':
        statusClass = 'bg-accent/10 text-accent border-accent/20';
        statusLabel = 'Preparing';
        break;
      case 'cooking':
        statusClass = 'bg-accent/20 text-accent-dark border-accent/30';
        statusLabel = 'Cooking';
        break;
      case 'out_for_delivery':
        statusClass = 'bg-primary/10 text-primary border-primary/20';
        statusLabel = 'Out for Delivery';
        break;
      case 'delivered':
        statusClass = 'bg-success/10 text-success-dark border-success/20';
        statusLabel = 'Delivered';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800 border-gray-200';
        statusLabel = order.status;
    }

    const orderTime = new Date(order.orderDate).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <tr class="hover:bg-background/20 transition-colors border-b border-secondary/5">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary font-display">
          #${order.orderId.substring(4) || order.orderId}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-charcoal">${order.customerName}</div>
          <div class="text-xs text-secondary-light">Guest Account</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-charcoal font-medium">${order.mealName}</div>
          <div class="text-xs text-secondary-light">Qty: ${order.quantity}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal font-semibold">
          $${order.amount.toFixed(2)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-xs text-secondary-light">
          ${orderTime}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <select 
            onchange="window.app.adminUpdateStatus('${order.orderId}', this.value)"
            class="bg-white border border-secondary/15 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer transition-colors"
          >
            <option value="received" ${order.status === 'received' ? 'selected' : ''}>Received</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="cooking" ${order.status === 'cooking' ? 'selected' : ''}>Cooking</option>
            <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary/10">
        <thead>
          <tr class="bg-background-dark/30">
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">ID</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Meal Item</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Total</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Order Date</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
            <th class="px-6 py-3.5 text-right text-xs font-bold text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary/5">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

export function renderCustomerTable(items) {
  if (items.length === 0) {
    return `
      <div class="py-12 text-center text-secondary-light">
        No customer profiles found.
      </div>
    `;
  }

  const rows = items.map(c => {
    return `
      <tr class="hover:bg-background/20 transition-colors border-b border-secondary/5">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-semibold text-primary font-display">${c.name}</div>
          <div class="text-xs text-secondary-light">${c.email}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
          ${c.phone}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal max-w-xs truncate" title="${c.location}">
          ${c.location}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-light">
          ${new Date(c.joinDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-primary">
          ${c.orderCount}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary text-right font-display">
          $${c.totalSpend.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary/10">
        <thead>
          <tr class="bg-background-dark/30">
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Name</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Location</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Member Since</th>
            <th class="px-6 py-3.5 text-center text-xs font-bold text-secondary uppercase tracking-wider">Orders Count</th>
            <th class="px-6 py-3.5 text-right text-xs font-bold text-secondary uppercase tracking-wider">Total Spend</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary/5">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}
