const saleRepository = require("../repositories/sale.repository");
const purchaseRepository = require("../repositories/purchase.repository");
const productRepository = require("../repositories/product.repository");
const supplierRepository = require("../repositories/supplier.repository");
const customerRepository = require("../repositories/customer.repository");
const userRepository = require("../repositories/user.repository");
const categoryRepository = require("../repositories/category.repository");

const reportService = {
  async dailySales(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date('2024-01-01');
    const end = endDate
      ? new Date(endDate)
      : new Date();

    try {
      // Fetch sales data with proper includes
      const sales = await saleRepository.findMany({
        where: {
          isDeleted: false,
          createdAt: { gte: start, lte: end },
        },
        include: { 
          customer: true,
          user: true 
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log("Daily Sales - Found sales:", sales.length);
      console.log("Daily Sales - Sample sale:", sales[0]);

      return sales.map((sale) => ({
        id: sale.id,
        date: sale.createdAt,
        created_at: sale.createdAt,
        customer: sale.customer?.name || sale.customer?.firstName || "Unknown",
        customer_name: sale.customer?.name || sale.customer?.firstName || "Unknown",
        amount: sale.totalPrice || sale.total_amount || sale.amount || 0,
        total_amount: sale.totalPrice || sale.total_amount || sale.amount || 0,
        status: sale.status || "completed",
        payment_method: sale.paymentMethod || sale.payment_method || "Cash",
        order_id: sale.orderNumber || sale.order_number || sale.id,
        user_name: sale.user ? `${sale.user.firstName || ''} ${sale.user.lastName || ''}`.trim() || sale.user.name : "Unknown"
      }));
    } catch (error) {
      console.error("Error in dailySales report:", error);
      return [];
    }
  },

  async inventory(query) {
    const { category, sortBy, sortOrder } = query;
    
    // Build where clause
    const whereClause = { isDeleted: false };
    if (category) {
      whereClause.category = { name: category };
    }
    
    // Build orderBy clause
    let orderByClause = { name: 'asc' };
    if (sortBy) {
      const order = sortOrder === 'desc' ? 'desc' : 'asc';
      switch (sortBy) {
        case 'name':
          orderByClause = { name: order };
          break;
        case 'quantity':
          orderByClause = { quantity: order };
          break;
        case 'price':
          orderByClause = { price: order };
          break;
        case 'status':
          orderByClause = { quantity: order };
          break;
        default:
          orderByClause = { name: order };
      }
    }
    
    const products = await productRepository.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: orderByClause
    });
    
    console.log("Inventory - Found products:", products.length);
    console.log("Inventory - Sample product:", products[0]);
    
    return products.map((product) => ({
      name: product.name,
      product_name: product.name,
      category: product.category?.name || "Uncategorized",
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity || 0,
      price: product.price || 0,
      status: product.quantity > 20 ? "In Stock" : 
              product.quantity > 10 ? "Low Stock" : 
              product.quantity > 0 ? "Critical" : "Out of Stock",
      last_updated: product.updatedAt,
      total_value: (product.quantity || 0) * (product.price || 0)
    }));
  },

  async purchaseOrders(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date('2024-01-01');
    const end = endDate
      ? new Date(endDate)
      : new Date();

    const purchases = await purchaseRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { 
        supplier: true,
        user: true,
        productPurchases: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log("Purchase Orders - Found purchases:", purchases.length);
    if (purchases.length > 0) {
      console.log("Purchase Orders - Sample purchase:", {
        id: purchases[0].id,
        poNumber: purchases[0].poNumber,
        totalCost: purchases[0].totalCost,
        status: purchases[0].status
      });
    }

    return purchases.map((purchase) => ({
      id: purchase.id,
      date: purchase.createdAt,
      created_at: purchase.createdAt,
      supplier: purchase.supplier?.name || "Unknown",
      supplier_name: purchase.supplier?.name || "Unknown",
      amount: purchase.totalCost,
      total_amount: purchase.totalCost,
      status: purchase.status,
      order_number: purchase.poNumber || purchase.id,
      expected_delivery: purchase.expectedDeliveryDate || (() => {
        const createdDate = new Date(purchase.createdAt);
        const expectedDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add 7 days
        return expectedDate.toISOString();
      })(),
      user_name: purchase.user ? `${purchase.user.firstName} ${purchase.user.lastName}` : "Unknown",
      product_count: purchase.productPurchases?.length || 0,
      supplier_contact: purchase.supplier?.email || "N/A"
    }));
  },

  async monthlyRevenue(query) {
    const { startDate, endDate, status } = query;
    
    // Build where clause
    const whereClause = { isDeleted: false };
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (status) {
      whereClause.status = status;
    }
    
    const sales = await saleRepository.findMany({
      where: whereClause,
      include: { customer: true }
    });
    
    const revenueByMonth = {};
    const orderCountByMonth = {};
    
    sales.forEach((sale) => {
      const month = sale.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = 0;
        orderCountByMonth[month] = 0;
      }
      revenueByMonth[month] += sale.totalPrice;
      orderCountByMonth[month] += 1;
    });
    
    // Calculate growth percentage
    const months = Object.keys(revenueByMonth).sort();
    const result = months.map((month, index) => {
      const currentRevenue = revenueByMonth[month];
      const previousRevenue = index > 0 ? revenueByMonth[months[index - 1]] : 0;
      const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      return {
        month,
        total: currentRevenue,
        growth: Math.round(growth * 100) / 100,
        orders_count: orderCountByMonth[month]
      };
    });
    
    return result;
  },

  async topProducts(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    try {
      // Get sales with product sales included
      const sales = await saleRepository.findMany({
        where: {
          isDeleted: false,
          createdAt: { gte: start, lte: end },
        },
        include: {
          productSales: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      // Aggregate product sales
      const productStats = {};
      
      sales.forEach(sale => {
        sale.productSales.forEach(ps => {
          const productName = ps.product?.name || "Unknown Product";
          const category = ps.product?.category?.name || "Uncategorized";
          
          if (!productStats[productName]) {
            productStats[productName] = {
              product_name: productName,
              category: category,
              total_sold: 0,
              total_revenue: 0
            };
          }
          
          productStats[productName].total_sold += ps.sale_quantity || 0;
          productStats[productName].total_revenue += (ps.sale_quantity || 0) * (ps.unit_price || 0);
        });
      });

      // Convert to array and sort by total sold
      const result = Object.values(productStats)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 10)
        .map(item => ({
          product_name: item.product_name,
          category: item.category,
          total_sold: item.total_sold,
          revenue: item.total_revenue,
          total_revenue: item.total_revenue,
          total_amount: item.total_revenue,
          total_value: item.total_revenue
        }));

      return result;
    } catch (error) {
      console.error("Error in topProducts report:", error);
      return [];
    }
  },

  async lowStock(query) {
    const { category, sortBy, sortOrder } = query;
    
    // Build where clause
    const whereClause = { isDeleted: false, quantity: { lt: 10 } };
    if (category) {
      whereClause.category = { name: category };
    }
    
    // Build orderBy clause
    let orderByClause = { quantity: 'asc' };
    if (sortBy) {
      const order = sortOrder === 'desc' ? 'desc' : 'asc';
      switch (sortBy) {
        case 'name':
          orderByClause = { name: order };
          break;
        case 'quantity':
          orderByClause = { quantity: order };
          break;
        case 'price':
          orderByClause = { price: order };
          break;
        case 'urgency':
          orderByClause = { quantity: order };
          break;
        default:
          orderByClause = { quantity: order };
      }
    }
    
    const products = await productRepository.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: orderByClause
    });
    return products.map((product) => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price,
      min_stock: 10, // Default minimum stock level
      urgency: product.quantity === 0 ? "Critical" : 
               product.quantity < 5 ? "High" : "Medium",
      last_updated: product.updatedAt,
      total_value: product.quantity * product.price
    }));
  },

  async inventoryValue(query) {
    const { category, sortBy, sortOrder } = query;
    
    // Build where clause
    const whereClause = { isDeleted: false };
    if (category) {
      whereClause.category = { name: category };
    }
    
    // Build orderBy clause
    let orderByClause = { name: 'asc' };
    if (sortBy) {
      const order = sortOrder === 'desc' ? 'desc' : 'asc';
      switch (sortBy) {
        case 'name':
          orderByClause = { name: order };
          break;
        case 'quantity':
          orderByClause = { quantity: order };
          break;
        case 'price':
          orderByClause = { price: order };
          break;
        case 'value':
          orderByClause = { name: order }; // Will be sorted by calculated value later
          break;
        default:
          orderByClause = { name: order };
      }
    }
    
    const products = await productRepository.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: orderByClause
    });
    
    // Calculate category totals
    const categoryTotals = {};
    products.forEach(product => {
      const category = product.category?.name || "Uncategorized";
      const value = product.price * product.quantity;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total_value: 0, total_quantity: 0, product_count: 0 };
      }
      
      categoryTotals[category].total_value += value;
      categoryTotals[category].total_quantity += product.quantity;
      categoryTotals[category].product_count += 1;
    });
    
    return products.map((product) => ({
      name: product.name,
      product_name: product.name,
      category: product.category?.name || "Uncategorized",
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price,
      unit_price: product.price,
      total_value: product.price * product.quantity,
      last_updated: product.updatedAt,
      category_total_value: categoryTotals[product.category?.name || "Uncategorized"]?.total_value || 0,
      category_product_count: categoryTotals[product.category?.name || "Uncategorized"]?.product_count || 0
    }));
  },

  async supplierAnalysis() {
    const purchases = await purchaseRepository.findMany({
      where: { isDeleted: false },
      include: { 
        supplier: true,
        productPurchases: {
          include: {
            product: true
          }
        }
      },
    });
    
    const analysis = {};
    purchases.forEach((purchase) => {
      const supplier = purchase.supplier?.name || "Unknown";
      if (!analysis[supplier]) {
        analysis[supplier] = { 
          total_orders: 0, 
          total_spent: 0,
          total_products: 0,
          average_order_value: 0,
          last_order_date: null,
          supplier_contact: purchase.supplier?.email || "N/A"
        };
      }
      analysis[supplier].total_orders += 1;
      analysis[supplier].total_spent += purchase.totalCost;
      analysis[supplier].total_products += purchase.productPurchases?.length || 0;
      analysis[supplier].average_order_value = analysis[supplier].total_spent / analysis[supplier].total_orders;
      
      if (!analysis[supplier].last_order_date || purchase.createdAt > analysis[supplier].last_order_date) {
        analysis[supplier].last_order_date = purchase.createdAt;
      }
    });
    
    return Object.entries(analysis).map(([supplier_name, stats]) => ({
      supplier_name,
      total_orders: stats.total_orders,
      total_spent: stats.total_spent,
      total_products: stats.total_products,
      average_order_value: Math.round(stats.average_order_value * 100) / 100,
      last_order_date: stats.last_order_date,
      supplier_contact: stats.supplier_contact
    }));
  },

  // New report methods
  async customerSales(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const sales = await saleRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { customer: true },
    });

    const customerAnalysis = {};
    sales.forEach((sale) => {
      const customerName = sale.customer?.name || "Unknown";
      if (!customerAnalysis[customerName]) {
        customerAnalysis[customerName] = {
          total_orders: 0,
          total_spent: 0,
          last_order: null,
        };
      }
      customerAnalysis[customerName].total_orders += 1;
      customerAnalysis[customerName].total_spent += sale.totalPrice;
      if (
        !customerAnalysis[customerName].last_order ||
        sale.createdAt > customerAnalysis[customerName].last_order
      ) {
        customerAnalysis[customerName].last_order = sale.createdAt;
      }
    });

    return Object.entries(customerAnalysis).map(([customer_name, stats]) => ({
      customer_name,
      total_orders: stats.total_orders,
      total_spent: stats.total_spent,
      last_order: stats.last_order,
    }));
  },

  async salesPerformance(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const sales = await saleRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { user: true },
    });

    const performanceAnalysis = {};
    sales.forEach((sale) => {
      const sellerName = sale.user?.firstName + " " + sale.user?.lastName;
      if (!performanceAnalysis[sellerName]) {
        performanceAnalysis[sellerName] = {
          total_sales: 0,
          total_revenue: 0,
          orders_count: 0,
        };
      }
      performanceAnalysis[sellerName].total_sales += 1;
      performanceAnalysis[sellerName].total_revenue += sale.totalPrice;
      performanceAnalysis[sellerName].orders_count += 1;
    });

    return Object.entries(performanceAnalysis).map(([seller_name, stats]) => ({
      seller_name,
      total_sales: stats.total_sales,
      total_revenue: stats.total_revenue,
      orders_count: stats.orders_count,
    }));
  },

  async categoryAnalysis() {
    const categories = await categoryRepository.getCategoryStats();
    return categories.map((category) => ({
      category_name: category.name,
      product_count: category.productCount,
      total_quantity: category.totalQuantity,
      total_value: category.totalValue,
    }));
  },

  async stockMovement(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // Get sales and purchases for the period
    const sales = await saleRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { productSales: { include: { product: true } } },
    });

    const purchases = await purchaseRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { productPurchases: { include: { product: true } } },
    });

    const movementAnalysis = {};

    // Process sales (outgoing)
    sales.forEach((sale) => {
      sale.productSales.forEach((ps) => {
        const productName = ps.product?.name;
        if (!movementAnalysis[productName]) {
          movementAnalysis[productName] = {
            sold: 0,
            purchased: 0,
            net_movement: 0,
          };
        }
        movementAnalysis[productName].sold += ps.sale_quantity;
        movementAnalysis[productName].net_movement -= ps.sale_quantity;
      });
    });

    // Process purchases (incoming)
    purchases.forEach((purchase) => {
      purchase.productPurchases.forEach((pp) => {
        const productName = pp.product?.name;
        if (!movementAnalysis[productName]) {
          movementAnalysis[productName] = {
            sold: 0,
            purchased: 0,
            net_movement: 0,
          };
        }
        movementAnalysis[productName].purchased += pp.purchase_quantity;
        movementAnalysis[productName].net_movement += pp.purchase_quantity;
      });
    });

    return Object.entries(movementAnalysis).map(([product_name, stats]) => ({
      product_name,
      sold: stats.sold,
      purchased: stats.purchased,
      net_movement: stats.net_movement,
    }));
  },

  async purchaseTrends(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const purchases = await purchaseRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { supplier: true },
    });

    const trendAnalysis = {};
    purchases.forEach((purchase) => {
      const month = purchase.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!trendAnalysis[month]) {
        trendAnalysis[month] = {
          total_orders: 0,
          total_cost: 0,
          suppliers_count: new Set(),
        };
      }
      trendAnalysis[month].total_orders += 1;
      trendAnalysis[month].total_cost += purchase.totalCost;
      trendAnalysis[month].suppliers_count.add(
        purchase.supplier?.name || "Unknown"
      );
    });

    return Object.entries(trendAnalysis).map(([month, stats]) => ({
      month,
      total_orders: stats.total_orders,
      total_cost: stats.total_cost,
      suppliers_count: stats.suppliers_count.size,
    }));
  },

  async userActivity(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const users = await userRepository.findMany({
      where: {
        status: "Active",
        createdAt: { gte: start, lte: end },
      },
      include: { role: true },
    });

    return users.map((user) => ({
      user_name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role?.role_type,
      status: user.status,
      created_at: user.createdAt,
    }));
  },

  async roleDistribution() {
    const users = await userRepository.findMany({
      where: { status: "Active" },
      include: { role: true },
    });

    const roleAnalysis = {};
    users.forEach((user) => {
      const roleType = user.role?.role_type || "Unknown";
      if (!roleAnalysis[roleType]) {
        roleAnalysis[roleType] = 0;
      }
      roleAnalysis[roleType] += 1;
    });

    return Object.entries(roleAnalysis).map(([role_type, count]) => ({
      role_type,
      user_count: count,
    }));
  },

  async notifications() {
    // This would require a notification repository
    // For now, return empty array as placeholder
    return [];
  },

  async supplierAnalysis(query) {
    const { startDate, endDate, status } = query;
    
    // Build where clause
    const whereClause = { isDeleted: false };
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (status) {
      whereClause.status = status;
    }
    
    const purchases = await purchaseRepository.findMany({
      where: whereClause,
      include: {
        supplier: true,
        productPurchases: {
          include: {
            product: true
          }
        }
      }
    });
    
    // Aggregate supplier data
    const supplierStats = {};
    purchases.forEach(purchase => {
      const supplierName = purchase.supplier?.name || "Unknown";
      if (!supplierStats[supplierName]) {
        supplierStats[supplierName] = {
          supplier_name: supplierName,
          total_orders: 0,
          total_spent: 0,
          total_products: 0,
          average_order_value: 0,
          last_order_date: null,
          supplier_contact: purchase.supplier?.email || "N/A"
        };
      }
      
      supplierStats[supplierName].total_orders += 1;
      supplierStats[supplierName].total_spent += purchase.totalCost;
      supplierStats[supplierName].total_products += purchase.productPurchases?.length || 0;
      supplierStats[supplierName].last_order_date = purchase.createdAt;
    });
    
    // Calculate average order values
    Object.values(supplierStats).forEach(supplier => {
      supplier.average_order_value = supplier.total_orders > 0 
        ? supplier.total_spent / supplier.total_orders 
        : 0;
    });
    
    return Object.values(supplierStats);
  },

  // Cost Analysis Report
  async costAnalysis(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    try {
      // Get purchases with product details
      const purchases = await purchaseRepository.findMany({
        where: {
          isDeleted: false,
          createdAt: { gte: start, lte: end },
        },
        include: {
          productPurchases: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      console.log("Cost Analysis - Found purchases:", purchases.length);
      console.log("Cost Analysis - Date range:", { start, end });
      if (purchases.length > 0) {
        console.log("Cost Analysis - Sample purchase:", purchases[0]);
        console.log("Cost Analysis - Sample productPurchases:", purchases[0].productPurchases);
      }

      // Aggregate cost data by product
      const costAnalysis = {};
      
      purchases.forEach(purchase => {
        purchase.productPurchases.forEach(pp => {
          const productName = pp.product?.name || "Unknown Product";
          const category = pp.product?.category?.name || "Uncategorized";
          const unitCost = pp.unit_cost || pp.purchase_price || 0;
          const quantity = pp.purchase_quantity || pp.quantity || 0;
          const totalCost = unitCost * quantity;
          
          console.log("Processing product purchase:", {
            productName,
            category,
            unitCost,
            quantity,
            totalCost,
            pp
          });
          
          if (!costAnalysis[productName]) {
            costAnalysis[productName] = {
              product_name: productName,
              category: category,
              total_purchased: 0,
              total_cost: 0,
              avg_cost: 0,
              purchase_count: 0,
              cost_history: []
            };
          }
          
          costAnalysis[productName].total_purchased += quantity;
          costAnalysis[productName].total_cost += totalCost;
          costAnalysis[productName].purchase_count += 1;
          costAnalysis[productName].cost_history.push({
            date: purchase.createdAt,
            unit_cost: unitCost,
            quantity: quantity,
            total_cost: totalCost
          });
        });
      });

      // Calculate average costs and trends
      const result = Object.values(costAnalysis).map(item => {
        item.avg_cost = item.total_cost / item.total_purchased;
        
        // Calculate trend based on cost history
        if (item.cost_history.length >= 2) {
          const sortedHistory = item.cost_history.sort((a, b) => new Date(a.date) - new Date(b.date));
          const firstHalf = sortedHistory.slice(0, Math.floor(sortedHistory.length / 2));
          const secondHalf = sortedHistory.slice(Math.floor(sortedHistory.length / 2));
          
          const firstHalfAvg = firstHalf.reduce((sum, h) => sum + h.unit_cost, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum, h) => sum + h.unit_cost, 0) / secondHalf.length;
          
          const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
          
          if (trendPercentage > 5) {
            item.trend = "Increasing";
          } else if (trendPercentage < -5) {
            item.trend = "Decreasing";
          } else {
            item.trend = "Stable";
          }
        } else {
          item.trend = "Stable";
        }
        
        return {
          product_name: item.product_name,
          category: item.category,
          total_purchased: item.total_purchased,
          total_cost: Math.round(item.total_cost * 100) / 100,
          avg_cost: Math.round(item.avg_cost * 100) / 100,
          trend: item.trend,
          purchase_count: item.purchase_count
        };
      });

      // Sort by total cost descending
      const finalResult = result.sort((a, b) => b.total_cost - a.total_cost);
      console.log("Cost Analysis - Final result:", finalResult.length, "items");
      console.log("Cost Analysis - Sample result:", finalResult[0]);
      return finalResult;
    } catch (error) {
      console.error("Error in costAnalysis report:", error);
      return [];
    }
  },
};

module.exports = reportService;
