const nodemailer = require("nodemailer");

// IMPORTANT: Use a Gmail App Password, not your regular Gmail password.
// See: https://support.google.com/accounts/answer/185833
const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_EMAIL_PASS;

// Transporter for user emails (password resets, etc.)
let smtpTransporter = null;
let adminTransporter = null;

// Only create transporters if credentials are available
if (adminEmail && adminPass) {
  smtpTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: adminPass,
    },
  });

  // Transporter for admin notifications (could be configured differently if needed)
  adminTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: adminPass,
    },
  });
}

async function sendAdminNotification(subject, text) {
  // Check if email is configured
  if (!adminEmail || !adminPass) {
    return { success: false, error: "Email service not configured" };
  }

  const mailOptions = {
    from: adminEmail,
    to: adminEmail,
    subject,
    text,
  };
  try {
    await adminTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendMail({ to, subject, html }) {
  // Check if email is configured
  if (!adminEmail || !adminPass) {
    throw new Error("Email service not configured. Please contact administrator.");
  }

  const mailOptions = {
    from: adminEmail,
    to,
    subject,
    html,
  };
  return smtpTransporter.sendMail(mailOptions);
}

module.exports = {
  sendAdminNotification,
  sendMail,
};
