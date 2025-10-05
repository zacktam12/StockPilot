const express = require('express');
const emailController = require('../controller/email.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/email/send-report:
 *   post:
 *     summary: Send report via email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - reportTitle
 *             properties:
 *               recipients:
 *                 type: string
 *                 description: Comma-separated list of email addresses
 *                 example: "user1@example.com, user2@example.com"
 *               reportTitle:
 *                 type: string
 *                 description: Title of the report
 *                 example: "Daily Sales Report"
 *               reportData:
 *                 type: array
 *                 description: Report data to include in email
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv]
 *                 description: Report format
 *                 example: "pdf"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Report sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/send-report', authenticate, emailController.sendReport);

/**
 * @swagger
 * /api/email/test:
 *   get:
 *     summary: Test email service connection
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email service is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email service is working correctly"
 *       500:
 *         description: Email service not configured
 */
router.get('/test', authenticate, emailController.testConnection);

module.exports = router;
