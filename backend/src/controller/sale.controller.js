const saleService = require("../services/sale.service");
const NotificationService = require("../services/notification.service");
exports.createSale = async (req, res, next) => {
  try {
    console.log("DEBUG: req.user in createSale:", req.user); // Debug log
    const saleData = {
      ...req.body,
      userId: req.user.id,
    };
    const sale = await saleService.createSale(saleData);

    // Create notification for the sale
    try {
      const customer = sale.customer;
      await NotificationService.createSaleNotification(sale, customer);
    } catch (notificationError) {
      console.warn("Failed to create sale notification:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSales = async (req, res, next) => {
  try {
    const result = await saleService.getAllSales(req.query); // supports pagination/search if available
    res.json({
      success: true,
      data: result.data,
      total: result.meta.total,
      meta: result.meta, // Add meta for pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSale = async (req, res, next) => {
  try {
    console.log("Updating sale with ID:", req.params.id);
    console.log("Update data:", req.body);

    const sale = await saleService.updateSale(req.params.id, req.body);

    console.log("Sale updated successfully:", sale.id);

    res.json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Update sale error:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

exports.updateSaleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const sale = await saleService.updateSale(req.params.id, { status });
    res.json({
      success: true,
      message: "Sale status updated successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    await saleService.deleteSale(req.params.id);
    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("Delete sale error:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("already deleted")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

exports.bulkDeleteSales = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of sale IDs to delete",
      });
    }

    const results = await Promise.allSettled(
      ids.map((id) => saleService.deleteSale(id))
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    res.json({
      success: true,
      message: `Successfully deleted ${successful} sales${
        failed > 0 ? `, ${failed} failed` : ""
      }`,
      data: {
        successful,
        failed,
        total: ids.length,
      },
    });
  } catch (error) {
    console.error("Bulk delete sales error:", error);
    next(error);
  }
};
