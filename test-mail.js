import "dotenv/config";  
import { transporter } from "./src/lib/mail/mailer.js";

await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.SMTP_USER,
  subject: "Test Mail",
  text: "SMTP working",
});

console.log("Mail sent");
