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
const getUserByEmail = async (email) => {
  try {
    return await userRepository.findByEmail(email);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};
// Get all users with pagination and optional search
const getAllUsers = async (page = 1, limit = 10, search = "") => {
  return await userRepository.findActiveUsers(page, limit, search);
};

// Get user by ID
const getUserById = (id) => {
  return userRepository.findUnique({ id: String(id), status: "Active" });
};

// Update user
const updateUser = async (id, data) => {
  const existingUser = await userRepository.findUnique({
    id: String(id),
    status: "Active",
  });

  if (!existingUser) {
    throw new Error(`User with ID ${id} does not exist.`);
  }

  return userRepository.updateUser(String(id), data);
};

// Soft delete user: set status to Deactivated
const deleteUser = (id) => userRepository.softDeleteUser(String(id));

const updateFailedLoginAttempts = async (userId, attemptNumber) => {
  return userRepository.update(
    { id: userId },
    { failedLoginAttempts: attemptNumber }
  );
};

const lockUser = async (userId, lockDuration) => {
  const lockUntil = new Date(Date.now() + lockDuration * 1000);
  return userRepository.update(
    { id: userId },
    {
      lockUntil: lockUntil,
      status: "Locked",
    }
  );
};

const unlockUser = async (userId) => {
  return userRepository.update(
    { id: userId },
    {
      lockUntil: null,
      failedLoginAttempts: 0,
      status: "Active",
    }
  );
};

const isUserLocked = async (userId) => {
  const user = await userRepository.findUnique({ id: userId });
  if (!user) return false;

  if (user.status === "Locked" && user.lockUntil) {
    const now = new Date();
    return now < user.lockUntil;
  }

  return false;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
  updateFailedLoginAttempts,
  lockUser,
  unlockUser,
  isUserLocked,
};

// src/services/user.service.js
