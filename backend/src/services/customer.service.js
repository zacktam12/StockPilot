const customerRepository = require("../repositories/customer.repository");

class CustomerService {
  async createCustomer(data) {
    return customerRepository.create(data);
  }

  async getCustomers(
    page = 1,
    limit = 5,
    search = "",
    sortField = "createdAt",
    sortOrder = "desc"
  ) {
    return customerRepository.findCustomers(
      page,
      limit,
      search,
      sortField,
      sortOrder
    );
  }

  async getCustomerById(id) {
    return customerRepository.findById(id);
  }

  async updateCustomer(id, data) {
    return customerRepository.update({ id }, data);
  }

  async deleteCustomer(id) {
    return customerRepository.delete({ id });
  }

  async bulkImportCustomers(customers) {
    try {
      console.log("Bulk importing customers:", customers.length);

      const results = [];
      const errors = [];

      for (let i = 0; i < customers.length; i++) {
        try {
          const customer = customers[i];

          // Map CSV fields to customer data format
          const mappedCustomer = {
            name: customer.name || customer.Name || "",
            email: customer.email || customer.Email || "",
            phone: customer.phone || customer.Phone || "",
            address: customer.address || customer.Address || "",
          };

          // Validate required fields
          if (!mappedCustomer.name || mappedCustomer.name.trim() === "") {
            throw new Error("Name is required");
          }

          if (!mappedCustomer.email || mappedCustomer.email.trim() === "") {
            throw new Error("Email is required");
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(mappedCustomer.email)) {
            throw new Error("Invalid email format");
          }

          const result = await this.createCustomer(mappedCustomer);
          results.push(result);
        } catch (error) {
          errors.push({
            index: i,
            customer: customers[i],
            error: error.message,
          });
        }
      }

      return {
        success: true,
        data: results,
        importedCount: results.length,
        errorCount: errors.length,
        errors: errors,
      };
    } catch (error) {
      throw new Error(`Failed to bulk import customers: ${error.message}`);
    }
  }

  async bulkDeleteCustomers(customerIds) {
    try {
      console.log("Bulk deleting customers:", customerIds.length);

      const results = [];
      const errors = [];

      for (let i = 0; i < customerIds.length; i++) {
        try {
          const result = await customerRepository.delete({
            id: customerIds[i],
          });
          results.push(result);
        } catch (error) {
          errors.push({
            index: i,
            customerId: customerIds[i],
            error: error.message,
          });
        }
      }

      return {
        success: true,
        data: results,
        deletedCount: results.length,
        errorCount: errors.length,
        errors: errors,
      };
    } catch (error) {
      throw new Error(`Failed to bulk delete customers: ${error.message}`);
    }
  }
}

module.exports = new CustomerService();
