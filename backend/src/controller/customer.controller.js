const customerService = require("../services/customer.service");

// Enhanced error handling function
const handleCustomerError = (error, res) => {
  console.error('Customer Controller Error:', error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Customer with this information already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details || [error.message]
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

class CustomerController {
  async create(req, res, next) {
    try {
      const result = await customerService.createCustomer(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: result
      });
    } catch (error) {
      handleCustomerError(error, res);
    }
  }

  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortField = "createdAt",
        sortOrder = "desc",
        status = "",
        customerType = "",
        hasEmail = "",
        hasPhone = "",
        hasAddress = ""
      } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

      const result = await customerService.getCustomers({
        page: pageNum,
        limit: limitNum,
        search,
        sortField,
        sortOrder,
        status,
        customerType,
        hasEmail: hasEmail === 'true',
        hasPhone: hasPhone === 'true',
        hasAddress: hasAddress === 'true'
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(result.pagination.total / limitNum),
          totalItems: result.pagination.total,
          itemsPerPage: limitNum,
          hasNext: pageNum < Math.ceil(result.pagination.total / limitNum),
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      handleCustomerError(error, res);
    }
  }

  async getById(req, res, next) {
    try {
      console.log('CustomerController.getById - ID:', req.params.id);
      const result = await customerService.getCustomerById(req.params.id);
      console.log('CustomerController.getById - Result:', result);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Customer not found"
        });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('CustomerController.getById - Error:', error);
      handleCustomerError(error, res);
    }
  }

  async update(req, res, next) {
    try {
      const result = await customerService.updateCustomer(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Customer not found"
        });
      }
      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: result
      });
    } catch (error) {
      handleCustomerError(error, res);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await customerService.deleteCustomer(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Customer not found"
        });
      }
      res.json({
        success: true,
        message: "Customer deleted successfully"
      });
    } catch (error) {
      handleCustomerError(error, res);
    }
  }

  async bulkImportCustomers(req, res, next) {
    try {
      const { customers } = req.body;

      if (!customers || !Array.isArray(customers)) {
        return res.status(400).json({
          success: false,
          error: "Customers array is required",
        });
      }

      const result = await customerService.bulkImportCustomers(customers);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteCustomers(req, res, next) {
    try {
      const { customerIds } = req.body;

      if (!customerIds || !Array.isArray(customerIds)) {
        return res.status(400).json({
          success: false,
          error: "Customer IDs array is required",
        });
      }

      const result = await customerService.bulkDeleteCustomers(customerIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
