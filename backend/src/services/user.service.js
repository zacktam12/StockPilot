const userRepository = require("../repositories/user.repository");

// Create a new user
const createUser = async (data) => {
  // Check if email already exists
  const existingUser = await userRepository.findByEmail(data.email);

  if (existingUser) {
    throw new Error(`User with email ${data.email} already exists.`);
  }

  return userRepository.createUser(data);
};

// Get all users with pagination and optional search
const getAllUsers = async (page = 1, limit = 10, search = "") => {
  return await userRepository.findActiveUsers(page, limit, search);
};

// Get user by ID
const getUserById = (id) => {
  return userRepository.findUnique({ id: parseInt(id) });
};

// Update user
const updateUser = async (id, data) => {
  const existingUser = await userRepository.findUnique({ id: parseInt(id) });

  if (!existingUser) {
    throw new Error(`User with ID ${id} does not exist.`);
  }

  return userRepository.updateUser(parseInt(id), data);
};

// Soft delete user
const deleteUser = (id) =>
  userRepository.updateUser(parseInt(id), { isDeleted: true });

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
