const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../config/jwt");

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Use roleId from user or user.role.id if needed
    const token = generateToken({
      id: user.id,
      roleId: user.roleId || user.role.id,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role.role_type },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register a user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, roleId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        roleId,
      },
      include: { role: true },
    });

    // Generate token for new user
    const token = generateToken({
      id: user.id,
      roleId: user.roleId || user.role.id,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role.role_type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
};

exports.getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User soft-deleted" });
};
