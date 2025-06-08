const settingsService = require("../services/settings.service");

exports.getSettings = async (req, res) => {
  const settings = await settingsService.getSettings();
  res.json(settings);
};

exports.updateSettings = async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json(settings);
};
