const customerRepository = require("../repositories/customer.repository");
const cacheService = require("./cache.service");

class CustomerService {
  async createCustomer(data) {
    try {
      const result = await customerRepository.create(data);
      
      // Invalidate cache
      await cacheService.deletePattern('customers:*');
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCustomers(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
      status = "",
      customerType = "",
      hasEmail = false,
      hasPhone = false,
      hasAddress = false
    } = params;

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'customers',
      page.toString(),
      limit.toString(),
      search || '',
      status || '',
      customerType || '',
      sortField,
      sortOrder,
      hasEmail ? 'true' : 'false',
      hasPhone ? 'true' : 'false',
      hasAddress ? 'true' : 'false'
    );

    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const result = await customerRepository.findCustomers(
      page,
      limit,
      search,
      sortField,
      sortOrder,
      status,
      customerType,
      hasEmail,
      hasPhone,
      hasAddress
    );

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async getCustomerById(id) {
    try {
      const result = await customerRepository.findById(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(id, data) {
    const result = await customerRepository.update({ id }, data);
    
    // Invalidate cache
    await cacheService.deletePattern('customers:*');
    
    return result;
  }

  async deleteCustomer(id) {
    const result = await customerRepository.delete({ id });
    
    // Invalidate cache
    await cacheService.deletePattern('customers:*');
    
    return result;
  }

  async bulkImportCustomers(customers) {
    try {
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

      const finalResult = {
        success: true,
        data: results,
        importedCount: results.length,
        errorCount: errors.length,
        errors: errors,
      };

      return finalResult;
    } catch (error) {
      throw new Error(`Failed to bulk import customers: ${error.message}`);
    }
  }

  async bulkDeleteCustomers(customerIds) {
    try {
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
