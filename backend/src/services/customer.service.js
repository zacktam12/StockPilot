const customerRepository = require("../repositories/customer.repository");

class CustomerService {
  async createCustomer(data) {
    return customerRepository.create(data);
  }

  async getCustomers(
    page = 1,
    limit = 10,
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
}

module.exports = new CustomerService();
