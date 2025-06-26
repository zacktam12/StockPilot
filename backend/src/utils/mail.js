import nodemailer from "nodemailer";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_EMAIL_PASS;

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

export async function sendAdminNotification(subject, text) {
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

export async function sendMail({ to, subject, html }) {
  const mailOptions = {
    from: adminEmail,
    to,
    subject,
    html,
  };
  return smtpTransporter.sendMail(mailOptions);
}
