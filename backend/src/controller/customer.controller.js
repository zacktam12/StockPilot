const customerService = require("../services/customer.service");
const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validators/customer.validator");

class CustomerController {
  async create(req, res, next) {
    try {
      const { error } = createCustomerSchema.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (err) {
      next(err);
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
      } = req.query;
      const result = await customerService.getCustomers(
        Number(page),
        Number(limit),
        search,
        sortField,
        sortOrder
      );
      // Flatten pagination for frontend compatibility
      res.json({
        data: result.data,
        ...result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { error } = updateCustomerSchema.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });
      const customer = await customerService.updateCustomer(
        req.params.id,
        req.body
      );
      res.json(customer);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
