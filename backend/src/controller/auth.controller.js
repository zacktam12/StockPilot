import { sendAdminNotification } from "../utils/mail.js";

export async function contactAdmin(req, res) {
  const {
    fullName = "",
    department = "",
    phoneNumber = "",
    lastKnownEmail = "",
    reason = "",
    additionalInfo = "",
  } = req.body;

  const subject = `Account Recovery Request from ${fullName || "Unknown User"}`;
  const text = `A user has submitted an account recovery request:

Full Name: ${fullName}
Department: ${department}
Phone Number: ${phoneNumber}
Last Known Email: ${lastKnownEmail}
Reason: ${reason}
Additional Info: ${additionalInfo}
`;

  const result = await sendAdminNotification(subject, text);
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, message: result.error });
  }
}
