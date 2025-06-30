const nodemailer = require("nodemailer");

// IMPORTANT: Use a Gmail App Password, not your regular Gmail password.
// See: https://support.google.com/accounts/answer/185833
const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_EMAIL_PASS;

if (!adminEmail || !adminPass) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_EMAIL_PASS must be set in environment variables. ADMIN_EMAIL_PASS must be a Gmail App Password."
  );
}

// Transporter for user emails (password resets, etc.)
const smtpTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: adminEmail,
    pass: adminPass,
  },
});

// Transporter for admin notifications (could be configured differently if needed)
const adminTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: adminEmail,
    pass: adminPass,
  },
});

async function sendAdminNotification(subject, text) {
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
