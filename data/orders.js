// data/orders.js - Dynamic Generator for 200+ Simulated Reseller Orders
(function() {
  const meals = [
    { id: "meal_001", price: 15.00 },
    { id: "meal_002", price: 15.00 },
    { id: "meal_003", price: 15.00 },
    { id: "meal_004", price: 16.00 },
    { id: "meal_005", price: 18.00 },
    { id: "meal_006", price: 18.00 },
    { id: "meal_007", price: 19.00 },
    { id: "meal_008", price: 14.00 },
    { id: "meal_009", price: 14.00 },
    { id: "meal_010", price: 22.00 }
  ];

  const resellers = [
    { id: "reseller_001", name: "Fakhrul Mustaqim (KTF)" },
    { id: "reseller_002", name: "Sarah Tan (KDO)" },
    { id: "reseller_003", name: "Mohd Danial (KDSE)" },
    { id: "reseller_004", name: "Muneswaran (KTR)" },
    { id: "reseller_005", name: "Nabilah Yusof (KP)" }
  ];

  const statuses = ["received", "preparing", "cooking", "out_for_delivery", "delivered"];
  const orders = [];

  // Deterministic seed helper
  let seed = 42;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate 220 orders
  for (let i = 1; i <= 220; i++) {
    const meal = meals[Math.floor(random() * meals.length)];
    const reseller = resellers[Math.floor(random() * resellers.length)];
    const quantity = Math.floor(random() * 3) + 1; // 1 to 3 packs
    const amount = meal.price * quantity;
    const commission = quantity * 3.00; // RM 3.00 commission per pack
    
    // Status distribution (mostly delivered for historical records)
    let status = "delivered";
    if (i > 200) {
      status = statuses[Math.floor(random() * (statuses.length - 1))]; // recent active orders
    }

    // Dates distributed over last 15 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(random() * 15));
    date.setHours(Math.floor(random() * 12) + 9); // 9am to 9pm
    date.setMinutes(Math.floor(random() * 60));

    const customerIndex = Math.floor(random() * 25) + 1;
    const custId = `cust_${String(customerIndex).padStart(3, '0')}`;

    orders.push({
      orderId: `ord_${2000 + i}`,
      customerId: custId,
      mealId: meal.id,
      quantity: quantity,
      amount: parseFloat(amount.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      status: status,
      orderDate: date.toISOString(),
      resellerId: reseller.id,
      resellerName: reseller.name
    });
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  window.ordersData = orders;
})();
