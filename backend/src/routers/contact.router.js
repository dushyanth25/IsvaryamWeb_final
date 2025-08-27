import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-contact-email", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or configure SMTP with host/port
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password (not normal password)
      },
    });

    // ✅ Mail content with all details
    const mailOptions = {
      from: `"${name}" <${email}>`, // includes sender’s email ID
      to: process.env.CONTACT_RECEIVER || "support@isvaryam.com",
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "✅ Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "❌ Failed to send message" });
  }
});

export default router;
