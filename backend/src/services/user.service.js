const userRepository = require("../repositories/user.repository");
const cacheService = require("./cache.service");

// Function to calculate user summary statistics
const calculateUserSummary = async (where) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, roleCounts] = await Promise.all([
      userRepository.count({ where }),
      userRepository.count({ where: { ...where, status: 'Active' } }),
      userRepository.count({ where: { ...where, status: 'Inactive' } }),
      userRepository.groupByStatus(where)
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleCounts
    };
  } catch (error) {
    console.error('Error calculating user summary:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      roleCounts: {}
    };
  }
};

// Generate employee ID function
const generateEmployeeId = () => {
  const prefix = "EMP";
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${randomPart}`;
};

// Create a new user
const createUser = async (data) => {
  // Check if email already exists
  const existingUser = await userRepository.findByEmail(data.email);

  if (existingUser) {
    throw new Error(`User with email ${data.email} already exists.`);
  }

  // Generate employee ID if not provided
  const userData = {
    ...data,
    employeeId: data.employeeId || generateEmployeeId(),
  };

  const user = await userRepository.createUser(userData);

  // Fetch the user with role included
  const userWithRole = await userRepository.findUnique(
    { id: user.id },
    { role: true }
  );

  // Invalidate cache
  await cacheService.deletePattern('users:*');

  // Transform the response
  return {
    success: true,
    message: "User created successfully",
    data: {
      id: userWithRole.id,
      firstName: userWithRole.firstName,
      lastName: userWithRole.lastName,
      email: userWithRole.email,
      phone: userWithRole.phone,
      employeeId: userWithRole.employeeId,
      status: userWithRole.status,
      roleId: userWithRole.roleId,
      department: userWithRole.department,
      position: userWithRole.position,
      hireDate: userWithRole.hireDate,
      lastLoginAt: userWithRole.lastLoginAt,
      role: userWithRole.role
        ? {
            id: userWithRole.role.id,
            role_type: userWithRole.role.role_type,
          }
        : null,
      createdAt: userWithRole.createdAt,
      updatedAt: userWithRole.updatedAt,
    },
  };
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
const getAllUsers = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    roleId = "",
    department = "",
    sortField = "createdAt",
    sortOrder = "desc"
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'users',
    page.toString(),
    limit.toString(),
    search || '',
    status || '',
    roleId || '',
    department || '',
    sortField,
    sortOrder
  );

  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const result = await userRepository.findActiveUsers(
    pageNum,
    limitNum,
    search,
    status,
    roleId,
    department,
    sortField,
    sortOrder
  );

  // Transform the data to match frontend expectations
  const transformedData = result.data.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    employeeId: user.employeeId,
    status: user.status,
    roleId: user.roleId,
    department: user.department,
    position: user.position,
    hireDate: user.hireDate,
    lastLoginAt: user.lastLoginAt,
    role: user.role
      ? {
          id: user.role.id,
          role_type: user.role.role_type,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  // Calculate summary statistics
  const where = { status: "Active" };
  if (search) where.OR = [
    { firstName: { contains: search } },
    { lastName: { contains: search } },
    { email: { contains: search } },
    { employeeId: { contains: search } }
  ];
  if (status && status !== "all") where.status = status;
  if (roleId) where.roleId = roleId;
  if (department) where.department = department;

  const summary = await calculateUserSummary(where);

  const finalResult = {
    users: transformedData,
    total: result.pagination.total,
    summary
  };

  // Cache the result for 5 minutes
  await cacheService.set(cacheKey, finalResult, 300);

  return finalResult;
};

// Get user by ID
const getUserById = (id) => {
  return userRepository.findUnique({ id: String(id), status: "Active" });
};

// Update user
const updateUser = async (id, data) => {
  const existingUser = await userRepository.findUnique({
    id: String(id),
  });

  if (!existingUser) {
    throw new Error(`User with ID ${id} does not exist.`);
  }

  // Hash password if provided
  const updateData = { ...data };
  if (updateData.password) {
    const bcrypt = require("bcrypt");
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const user = await userRepository.updateUser(String(id), updateData);

  // Fetch the updated user with role included
  const userWithRole = await userRepository.findUnique(
    { id: String(id) },
    { role: true }
  );

  // Invalidate cache
  await cacheService.deletePattern('users:*');

  // Transform the response
  return {
    success: true,
    message: "User updated successfully",
    data: {
      id: userWithRole.id,
      firstName: userWithRole.firstName,
      lastName: userWithRole.lastName,
      email: userWithRole.email,
      phone: userWithRole.phone,
      employeeId: userWithRole.employeeId,
      status: userWithRole.status,
      roleId: userWithRole.roleId,
      department: userWithRole.department,
      position: userWithRole.position,
      hireDate: userWithRole.hireDate,
      lastLoginAt: userWithRole.lastLoginAt,
      role: userWithRole.role
        ? {
            id: userWithRole.role.id,
            role_type: userWithRole.role.role_type,
          }
        : null,
      createdAt: userWithRole.createdAt,
      updatedAt: userWithRole.updatedAt,
    },
  };
};

// Soft delete user: set status to Deactivated
const deleteUser = async (id) => {
  const result = await userRepository.softDeleteUser(String(id));
  
  // Invalidate cache
  await cacheService.deletePattern('users:*');
  
  return result;
};

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

// Import users from CSV data
const importUsers = async (usersData) => {
  const bcrypt = require("bcrypt");
  const results = {
    success: [],
    errors: [],
    total: usersData.length,
  };

  for (let i = 0; i < usersData.length; i++) {
    const userData = usersData[i];
    try {
      // Validate required fields
      if (
        !userData["First Name"] ||
        !userData["Last Name"] ||
        !userData["Email"]
      ) {
        results.errors.push({
          row: i + 1,
          error: "Missing required fields: First Name, Last Name, or Email",
          data: userData,
        });
        continue;
      }

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(userData["Email"]);
      if (existingUser) {
        results.errors.push({
          row: i + 1,
          error: `User with email ${userData["Email"]} already exists`,
          data: userData,
        });
        continue;
      }

      // Generate employee ID using the function defined at the top

      // Map CSV data to user model
      const userToCreate = {
        firstName: userData["First Name"].trim(),
        lastName: userData["Last Name"].trim(),
        email: userData["Email"].trim().toLowerCase(),
        phone: userData["Phone"] ? userData["Phone"].trim() : null,
        employeeId: generateEmployeeId(),
        status: userData["Status"] || "Active",
        // Generate a random password for imported users
        password: await bcrypt.hash(
          Math.random().toString(36).slice(2) +
            Math.random().toString(36).slice(2),
          10
        ),
        roleId: userData["Role"]
          ? await getRoleIdByName(userData["Role"])
          : null,
      };

      // Create user
      const createdUser = await userRepository.createUser(userToCreate);

      // Fetch user with role
      const userWithRole = await userRepository.findUnique(
        { id: createdUser.id },
        { role: true }
      );

      results.success.push({
        row: i + 1,
        user: {
          id: userWithRole.id,
          firstName: userWithRole.firstName,
          lastName: userWithRole.lastName,
          email: userWithRole.email,
          phone: userWithRole.phone,
          employeeId: userWithRole.employeeId,
          status: userWithRole.status,
          role: userWithRole.role
            ? {
                id: userWithRole.role.id,
                role_type: userWithRole.role.role_type,
              }
            : null,
        },
      });
    } catch (error) {
      results.errors.push({
        row: i + 1,
        error: error.message,
        data: userData,
      });
    }
  }

  return {
    success: true,
    message: `Import completed. ${results.success.length} users imported successfully, ${results.errors.length} errors.`,
    data: results.success.map((item) => item.user),
    summary: {
      total: results.total,
      successful: results.success.length,
      errors: results.errors.length,
      errorDetails: results.errors,
    },
  };
};

// Helper function to get role ID by name
const getRoleIdByName = async (roleName) => {
  try {
    const role = await userRepository.findRoleByName(roleName);
    return role ? role.id : null;
  } catch (error) {
    console.error("Error finding role:", error);
    return null;
  }
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
  importUsers,
};

// src/services/user.service.js
