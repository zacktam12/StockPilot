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
      : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().setHours(23, 59, 59, 999));

    try {
      const { sales } = await saleRepository.getSalesReport(start, end);
      return sales.map((sale) => ({
        id: sale.id,
        created_at: sale.createdAt,
        customer_name: sale.customer?.name || "Unknown",
        total_amount: sale.totalPrice,
        status: sale.status || "completed",
      }));
    } catch (error) {
      console.error("Error in dailySales report:", error);
      return [];
    }
  },

  async inventory() {
    const products = await productRepository.findMany({
      where: { isDeleted: false },
      include: { category: true },
    });
    return products.map((product) => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price,
    }));
  },

  async purchaseOrders(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().setHours(23, 59, 59, 999));

    const purchases = await purchaseRepository.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: start, lte: end },
      },
      include: { supplier: true },
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      created_at: purchase.createdAt,
      supplier_name: purchase.supplier?.name || "Unknown",
      total_amount: purchase.totalCost,
      status: purchase.status,
    }));
  },

  async monthlyRevenue() {
    const sales = await saleRepository.findMany({
      where: { isDeleted: false },
    });
    const revenueByMonth = {};
    sales.forEach((sale) => {
      const month = sale.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!revenueByMonth[month]) revenueByMonth[month] = 0;
      revenueByMonth[month] += sale.totalPrice;
    });
    return Object.entries(revenueByMonth).map(([month, total]) => ({
      month,
      total,
    }));
  },

  async topProducts(query) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    try {
      const topProducts = await saleRepository.getTopSellingProducts(
        start,
        end,
        10
      );
      return topProducts.map((item) => ({
        product_name: item.product?.name || "Unknown Product",
        total_sold: item.totalQuantitySold || 0,
        total_revenue: item.totalRevenue || 0,
      }));
    } catch (error) {
      console.error("Error in topProducts report:", error);
      return [];
    }
  },

  async lowStock() {
    const products = await productRepository.findMany({
      where: { isDeleted: false, quantity: { lt: 10 } },
      include: { category: true },
    });
    return products.map((product) => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
    }));
  },

  async inventoryValue() {
    const products = await productRepository.findMany({
      where: { isDeleted: false },
      include: { category: true },
    });
    return products.map((product) => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price,
      total_value: product.price * product.quantity,
    }));
  },

  async supplierAnalysis() {
    const purchases = await purchaseRepository.findMany({
      where: { isDeleted: false },
      include: { supplier: true },
    });
    const analysis = {};
    purchases.forEach((purchase) => {
      const supplier = purchase.supplier?.name || "Unknown";
      if (!analysis[supplier])
        analysis[supplier] = { total_orders: 0, total_spent: 0 };
      analysis[supplier].total_orders += 1;
      analysis[supplier].total_spent += purchase.totalCost;
    });
    return Object.entries(analysis).map(([supplier_name, stats]) => ({
      supplier_name,
      total_orders: stats.total_orders,
      total_spent: stats.total_spent,
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
};

module.exports = reportService;
