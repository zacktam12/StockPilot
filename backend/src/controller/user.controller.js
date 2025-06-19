const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");

// 🔐 Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, roleId: user.roleId });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🧾 Register
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, roleId } = req.body;

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId,
    });

    const token = generateToken({ id: user.id, roleId: user.roleId });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Create
exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 📋 Get all (with pagination)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const users = await userService.getAllUsers(
      Number(page),
      Number(limit),
      search
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// 📍 Get by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🔁 Update
exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Soft delete
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: "User soft-deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
