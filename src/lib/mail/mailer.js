// src/lib/mail/mailer.js

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER, // e.g. noreply@citysalah.com
    pass: process.env.SMTP_PASS, // mailbox password
  },
});

export async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"CitySalah" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
