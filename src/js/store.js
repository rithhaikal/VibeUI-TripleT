// store.js - Unified Client-Side State management
class AppStore {
  constructor() {
    this.deliveryZones = [
      { id: 'ktf', name: 'Kolej Tun Fatimah (KTF)', fee: 2.00 },
      { id: 'kdo', name: 'Kolej Datin Onn Jaafar (KDOJ)', fee: 3.00 },
      { id: 'kdse', name: 'Kolej Dato Seri Endon (KDSE)', fee: 3.00 },
      { id: 'ktr', name: 'Kolej Tun Razak (KTR)', fee: 4.00 },
      { id: 'kp', name: 'Kolej Perdana (KP)', fee: 4.00 },
      { id: 'campus', name: 'UTM Campus Landmark', fee: 3.00 }
    ];

    this.state = {
      activeView: 'home', // 'home' | 'catalog' | 'checkout' | 'tracking' | 'apply' | 'track-order' | 'admin-dash' | 'admin-orders' | 'admin-customers'
      meals: [],
      customers: [],
      orders: [],
      delivery: [],
      ratings: [],
      cart: [], // [{ mealId, quantity }]
      activeOrder: null, // Order currently being tracked by customer
      selectedMealId: null, // For details modal
      adminSelectedCustomerId: null, // Admin details view drawer
      orderStatusTimers: {} // Dynamic simulated status updates
    };
    
    this.listeners = [];
  }

  // Register UI updates
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Dispatch state updates
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // Load local JS datasets into state memory
  async init() {
    try {
      this.state.meals = window.mealsData || [];
      this.state.customers = window.customersData || [];
      this.state.orders = window.ordersData || [];
      this.state.delivery = window.deliveryData || [];
      this.state.ratings = window.ratingsData || [];
      
      // Cart is strictly in-memory session state (no localStorage cache read)
      this.state.cart = [];

      this.notify();
    } catch (err) {
      console.error("Error loading local datasets:", err);
    }
  }

  // --- Cart Actions ---
  addToCart(mealId, qty = 1) {
    const cart = [...this.state.cart];
    const existingIndex = cart.findIndex(item => item.mealId === mealId);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({ mealId, quantity: qty });
    }

    this.saveCart(cart);
  }

  removeFromCart(mealId) {
    const cart = this.state.cart.filter(item => item.mealId !== mealId);
    this.saveCart(cart);
  }

  updateCartQuantity(mealId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(mealId);
      return;
    }
    const cart = this.state.cart.map(item => 
      item.mealId === mealId ? { ...item, quantity } : item
    );
    this.saveCart(cart);
  }

  clearCart() {
    this.saveCart([]);
  }

  saveCart(cart) {
    this.state.cart = cart;
    // Strictly in-memory; do not save to localStorage
    this.notify();
  }

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => {
      const meal = this.state.meals.find(m => m.mealId === item.mealId);
      return sum + (meal ? meal.price * item.quantity : 0);
    }, 0);
  }

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getDeliveryZones() {
    return this.deliveryZones.map(zone => ({ ...zone }));
  }

  getDeliveryZone(zoneId) {
    return this.deliveryZones.find(zone => zone.id === zoneId) || this.deliveryZones[0];
  }

  // --- Checkout and Simulated Order Tracking ---
  placeOrder(addressDetails) {
    const orderId = `ord_${randomId(1000, 9999)}`;
    const trackingId = `track_${randomId(8000, 9999)}`;
    const cart = this.state.cart;
    
    if (cart.length === 0) return;

    // Calculate total quantity and amount
    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
    const subtotal = parseFloat(this.getCartTotal().toFixed(2));
    const deliveryZone = this.getDeliveryZone(addressDetails.zoneId || 'ktf');
    const deliveryFee = deliveryZone.fee;
    const totalAmount = parseFloat((subtotal + deliveryFee).toFixed(2));
    const commission = parseFloat((totalQty * 3.00).toFixed(2)); // RM 3.00 commission per pack
    const locationChangeDeadline = Date.now() + (5 * 60 * 1000);

    // Create new order record
    const newOrder = {
      orderId,
      customerId: 'cust_001', // Ahmad Farhan
      mealId: cart[0].mealId, // Main item reference
      quantity: totalQty,
      amount: totalAmount,
      subtotal,
      deliveryFee,
      paymentMethod: addressDetails.payment || 'wallet',
      locationChangeDeadline,
      commission: commission,
      status: 'received',
      orderDate: new Date().toISOString(),
      resellerId: 'reseller_001', // Default assigned reseller
      resellerName: 'Fakhrul Mustaqim (KTF)'
    };

    // Create delivery tracking record
    const newTracking = {
      trackingId,
      orderId,
      status: 'received',
      estimatedTime: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      driverName: 'Muhammad Harith',
      driverPhone: '+60 18-923 8847',
      details: {
        ...addressDetails,
        zoneId: deliveryZone.id,
        zoneName: deliveryZone.name
      },
      locationHistory: []
    };

    // Update memory cache
    this.state.orders.unshift(newOrder);
    this.state.delivery.unshift(newTracking);
    
    // Set active customer order being tracked
    this.state.activeOrder = newOrder;
    this.clearCart();
    this.setState({ activeView: 'tracking' });

    // Start simulation timer
    this.startOrderSimulation(orderId);
  }

  updateDeliveryLocation(orderId, locationDetails) {
    const order = this.state.orders.find(item => item.orderId === orderId);
    const trackingRecord = this.state.delivery.find(item => item.orderId === orderId);

    if (!order || !trackingRecord) {
      return { success: false, message: 'Order delivery details could not be found.' };
    }

    const deadline = order.locationChangeDeadline || 0;
    const lockedByStatus = ['out_for_delivery', 'delivered'].includes(order.status);
    if (Date.now() >= deadline || lockedByStatus) {
      return { success: false, message: 'The location change window has closed.' };
    }

    const newZone = this.getDeliveryZone(locationDetails.zoneId);
    const previousFee = order.deliveryFee ?? 2.00;
    const feeDifference = parseFloat((newZone.fee - previousFee).toFixed(2));
    const paymentMethod = order.paymentMethod || 'wallet';

    let adjustmentType = 'no_change';
    let adjustmentMessage = 'No delivery fee change.';
    let walletCredit = order.walletCredit || 0;

    if (feeDifference > 0 && paymentMethod === 'cash') {
      adjustmentType = 'cod_due';
      adjustmentMessage = `RM ${feeDifference.toFixed(2)} added to your cash-on-delivery total.`;
    } else if (feeDifference > 0) {
      adjustmentType = 'paid';
      adjustmentMessage = `Additional RM ${feeDifference.toFixed(2)} paid using your selected payment method.`;
    } else if (feeDifference < 0) {
      const credit = Math.abs(feeDifference);
      adjustmentType = 'wallet_credit';
      walletCredit = parseFloat((walletCredit + credit).toFixed(2));
      adjustmentMessage = `RM ${credit.toFixed(2)} returned as Hot Meal Bar wallet credit.`;
    }

    const previousAddress = trackingRecord.details ? trackingRecord.details.address : '';
    const changedAt = new Date().toISOString();
    const amount = parseFloat(((order.subtotal ?? (order.amount - previousFee)) + newZone.fee).toFixed(2));

    const orders = this.state.orders.map(item => item.orderId === orderId ? {
      ...item,
      amount,
      deliveryFee: newZone.fee,
      walletCredit,
      lastLocationAdjustment: {
        type: adjustmentType,
        difference: feeDifference,
        message: adjustmentMessage,
        changedAt
      }
    } : item);

    const delivery = this.state.delivery.map(item => item.orderId === orderId ? {
      ...item,
      details: {
        ...item.details,
        address: locationDetails.address,
        deliveryNote: locationDetails.deliveryNote || '',
        zoneId: newZone.id,
        zoneName: newZone.name
      },
      locationHistory: [
        ...(item.locationHistory || []),
        {
          previousAddress,
          newAddress: locationDetails.address,
          previousFee,
          newFee: newZone.fee,
          changedAt
        }
      ]
    } : item);

    const activeOrder = this.state.activeOrder && this.state.activeOrder.orderId === orderId
      ? orders.find(item => item.orderId === orderId)
      : this.state.activeOrder;

    this.setState({ orders, delivery, activeOrder });

    return {
      success: true,
      adjustmentType,
      adjustmentMessage,
      feeDifference,
      newFee: newZone.fee
    };
  }

  startOrderSimulation(orderId) {
    if (this.state.orderStatusTimers[orderId]) {
      clearInterval(this.state.orderStatusTimers[orderId]);
    }

    const statuses = ['received', 'preparing', 'cooking', 'out_for_delivery', 'delivered'];
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= statuses.length) {
        clearInterval(timer);
        delete this.state.orderStatusTimers[orderId];
        return;
      }
      
      const newStatus = statuses[currentStep];
      this.updateOrderStatus(orderId, newStatus);
    }, 15000); // Step every 15 seconds for demonstration

    this.state.orderStatusTimers[orderId] = timer;
  }

  updateOrderStatus(orderId, status) {
    const orders = this.state.orders.map(o => 
      o.orderId === orderId ? { ...o, status } : o
    );
    const delivery = this.state.delivery.map(d => 
      d.orderId === orderId ? { ...d, status } : d
    );
    
    // Check if updating currently tracked order
    let activeOrder = this.state.activeOrder;
    if (activeOrder && activeOrder.orderId === orderId) {
      activeOrder = { ...activeOrder, status };
    }

    this.setState({ orders, delivery, activeOrder });
  }

  // --- Admin operations ---
  deleteMeal(mealId) {
    const meals = this.state.meals.filter(m => m.mealId !== mealId);
    this.setState({ meals });
  }

  addReview(mealId, rating, reviewText) {
    const newRating = {
      ratingId: `rate_${randomId(9100, 9999)}`,
      customerId: 'cust_001',
      mealId,
      rating: parseInt(rating),
      review: reviewText
    };
    
    // Recalculating meal rating average
    const mealReviews = this.state.ratings.filter(r => r.mealId === mealId).concat(newRating);
    const avg = parseFloat((mealReviews.reduce((sum, r) => sum + r.rating, 0) / mealReviews.length).toFixed(1));

    const meals = this.state.meals.map(m => 
      m.mealId === mealId ? { ...m, rating: avg } : m
    );

    const ratings = [newRating, ...this.state.ratings];
    this.setState({ ratings, meals });
  }
}

function randomId(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.store = new AppStore();
