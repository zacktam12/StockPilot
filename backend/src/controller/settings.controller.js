const settingsService = require("../services/settings.service");

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
