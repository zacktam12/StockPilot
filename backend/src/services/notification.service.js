const { PrismaClient } = require("@prisma/client");
const { createNotification } = require("../controller/notification.controller");
const prisma = new PrismaClient();

class NotificationService {
  // Create notification for low stock products
  static async createLowStockNotification(product) {
    try {
      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: {
          isAdmin: true,
          status: "Active",
        },
      });

      const message = `Product "${product.name}" is running low on stock. Current quantity: ${product.quantity}`;

      for (const user of adminUsers) {
        await createNotification(
          user.id,
          "LOW_STOCK",
          "Low Stock Alert",
          message,
          {
            productId: product.id,
            productName: product.name,
            currentQuantity: product.quantity,
            minStock: product.minStock,
          }
        );
      }
    } catch (error) {
      console.error("Error creating low stock notification:", error);
    }
  }

  // Create notification for new sales
  static async createSaleNotification(sale, customer) {
    try {
      const message = `New sale completed for $${sale.totalPrice.toFixed(2)}${
        customer ? ` to ${customer.name}` : ""
      }`;

      await createNotification(sale.userId, "SALE", "Sale Completed", message, {
        saleId: sale.id,
        orderNumber: sale.orderNumber,
        totalPrice: sale.totalPrice,
        customerName: customer?.name,
      });
    } catch (error) {
      console.error("Error creating sale notification:", error);
    }
  }

  // Create notification for new purchases
  static async createPurchaseNotification(purchase, supplier) {
    try {
      const message = `New purchase order created for $${purchase.totalCost.toFixed(
        2
      )} from ${supplier.name}`;

      await createNotification(
        purchase.userId,
        "PURCHASE",
        "Purchase Order Created",
        message,
        {
          purchaseId: purchase.id,
          poNumber: purchase.poNumber,
          totalCost: purchase.totalCost,
          supplierName: supplier.name,
        }
      );
    } catch (error) {
      console.error("Error creating purchase notification:", error);
    }
  }

  // Create notification for new customers
  static async createCustomerNotification(customer, createdBy) {
    try {
      const message = `New customer "${customer.name}" has been added to the system`;

      await createNotification(
        createdBy,
        "CUSTOMER",
        "New Customer Added",
        message,
        {
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
        }
      );
    } catch (error) {
      console.error("Error creating customer notification:", error);
    }
  }

  // Create notification for new suppliers
  static async createSupplierNotification(supplier, createdBy) {
    try {
      const message = `New supplier "${supplier.name}" has been added to the system`;

      await createNotification(
        createdBy,
        "SUPPLIER",
        "New Supplier Added",
        message,
        {
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierEmail: supplier.email,
        }
      );
    } catch (error) {
      console.error("Error creating supplier notification:", error);
    }
  }

  // Create notification for new users
  static async createUserNotification(user, createdBy) {
    try {
      const message = `New user "${user.firstName} ${user.lastName}" has been added to the system`;

      await createNotification(createdBy, "USER", "New User Added", message, {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
      });
    } catch (error) {
      console.error("Error creating user notification:", error);
    }
  }

  // Create notification for new categories
  static async createCategoryNotification(category, createdBy) {
    try {
      const message = `New category "${category.name}" has been added to the system`;

      await createNotification(
        createdBy,
        "CATEGORY",
        "New Category Added",
        message,
        {
          categoryId: category.id,
          categoryName: category.name,
        }
      );
    } catch (error) {
      console.error("Error creating category notification:", error);
    }
  }

  // Create system notification
  static async createSystemNotification(userId, title, message, data = null) {
    try {
      await createNotification(userId, "SYSTEM", title, message, data);
    } catch (error) {
      console.error("Error creating system notification:", error);
    }
  }

  // Create notification for all admin users
  static async createAdminNotification(title, message, data = null) {
    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          isAdmin: true,
          status: "Active",
        },
      });

      for (const user of adminUsers) {
        await createNotification(user.id, "SYSTEM", title, message, data);
      }
    } catch (error) {
      console.error("Error creating admin notification:", error);
    }
  }
}

module.exports = NotificationService;
