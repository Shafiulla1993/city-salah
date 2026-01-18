  // src/lib/mail/templates/verifyEmail.js

  export function verifyEmailTemplate({ name, link }) {
    return `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Assalamu Alaikum ${name},</h2>
        <p>Please verify your email for CitySalah.</p>
        <p>
          <a href="${link}" style="background:#0f766e;color:white;padding:10px 16px;border-radius:6px;text-decoration:none">
            Verify Email
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, you can ignore this email.</p>
        <br/>
        <p>— CitySalah Team</p>
      </div>
    `;
  }
