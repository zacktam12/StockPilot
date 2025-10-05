const reportService = require("../services/report.service");

const reportsController = {
  async dailySales(req, res) {
    const data = await reportService.dailySales(req.query);
    res.json(data);
  },

  async inventory(req, res) {
    const data = await reportService.inventory(req.query);
    res.json(data);
  },

  async purchaseOrders(req, res) {
    const data = await reportService.purchaseOrders(req.query);
    res.json(data);
  },

  async monthlyRevenue(req, res) {
    const data = await reportService.monthlyRevenue(req.query);
    res.json(data);
  },

  async topProducts(req, res) {
    const data = await reportService.topProducts(req.query);
    res.json(data);
  },

  async lowStock(req, res) {
    const data = await reportService.lowStock(req.query);
    res.json(data);
  },

  async inventoryValue(req, res) {
    const data = await reportService.inventoryValue(req.query);
    res.json(data);
  },

  async supplierAnalysis(req, res) {
    const data = await reportService.supplierAnalysis(req.query);
    res.json(data);
  },

  // New report methods
  async customerSales(req, res) {
    const data = await reportService.customerSales(req.query);
    res.json(data);
  },

  async salesPerformance(req, res) {
    const data = await reportService.salesPerformance(req.query);
    res.json(data);
  },

  async categoryAnalysis(req, res) {
    const data = await reportService.categoryAnalysis();
    res.json(data);
  },

  async stockMovement(req, res) {
    const data = await reportService.stockMovement(req.query);
    res.json(data);
  },

  async purchaseTrends(req, res) {
    const data = await reportService.purchaseTrends(req.query);
    res.json(data);
  },

  async userActivity(req, res) {
    const data = await reportService.userActivity(req.query);
    res.json(data);
  },

  async roleDistribution(req, res) {
    const data = await reportService.roleDistribution();
    res.json(data);
  },

  async notifications(req, res) {
    const data = await reportService.notifications();
    res.json(data);
  },

  async costAnalysis(req, res) {
    const data = await reportService.costAnalysis(req.query);
    res.json(data);
  },

  // Test endpoint to verify API is working
  async test(req, res) {
    res.json({
      success: true,
      message: "Reports API is working",
      timestamp: new Date().toISOString()
    });
  },
};

module.exports = reportsController;
