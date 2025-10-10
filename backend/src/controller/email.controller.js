const emailService = require('../services/email.service');

class EmailController {
  async sendReport(req, res) {
    try {
      const { recipients, reportData, reportTitle, format } = req.body;

      // Validate required fields
      if (!recipients) {
        return res.status(400).json({
          success: false,
          message: 'Recipients are required'
        });
      }

      if (!reportTitle) {
        return res.status(400).json({
          success: false,
          message: 'Report title is required'
        });
      }

      // Send email
      const result = await emailService.sendReportEmail(
        recipients,
        reportData || [],
        reportTitle,
        format || 'pdf'
      );

      res.json({
        success: true,
        message: 'Report sent successfully',
        data: result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }
  }

  async testConnection(req, res) {
    try {
      const result = await emailService.testEmailConnection();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Email service is working correctly'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Email service is not configured properly',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to test email service',
        error: error.message
      });
    }
  }
}

module.exports = new EmailController();
