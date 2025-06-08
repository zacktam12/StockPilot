const roleService = require("../services/role.service");

exports.createRole = async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(201).json(role);
};

exports.getAllRoles = async (req, res) => {
  const roles = await roleService.getAllRoles();
  res.json(roles);
};

exports.getRoleById = async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  if (!role) return res.status(404).json({ error: "Role not found" });
  res.json(role);
};

exports.updateRole = async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  res.json(role);
};

exports.deleteRole = async (req, res) => {
  await roleService.deleteRole(req.params.id);
  res.json({ message: "Role soft-deleted" });
};
