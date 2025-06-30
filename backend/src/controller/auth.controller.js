const { sendAdminNotification } = require("../utils/mail.js");

export async function contactAdmin(req, res) {
  const {
    fullName = "",
    department = "",
    phoneNumber = "",
    lastKnownEmail = "",
    reason = "",
    additionalInfo = "",
  } = req.body;

  // Basic validation (optional but recommended)
  if (!fullName || !phoneNumber || !reason) {
    return res.status(400).json({
      success: false,
      message: "Full name, phone number, and reason are required.",
    });
  }

  const subject = `Account Recovery Request from ${fullName || "Unknown User"}`;
  const text = `A user has submitted an account recovery request:

Full Name: ${fullName}
Department: ${department}
Phone Number: ${phoneNumber}
Last Known Email: ${lastKnownEmail}
Reason: ${reason}
Additional Info: ${additionalInfo}
`;

  const html = `
    <h3>Account Recovery Request</h3>
    <ul>
      <li><strong>Full Name:</strong> ${fullName}</li>
      <li><strong>Department:</strong> ${department}</li>
      <li><strong>Phone Number:</strong> ${phoneNumber}</li>
      <li><strong>Last Known Email:</strong> ${lastKnownEmail}</li>
      <li><strong>Reason:</strong> ${reason}</li>
      <li><strong>Additional Info:</strong> ${additionalInfo}</li>
    </ul>
  `;

  const result = await sendAdminNotification(subject, text, html);
  if (result.success) {
    res.json({
      success: true,
      message: "Your request has been sent to the admin.",
    });
  } else {
    res.status(500).json({ success: false, message: result.error });
  }
}
