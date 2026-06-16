import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTPEmail(to, otp, name = '') {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f0fdf9;font-family:Inter,sans-serif">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">HabitFlow ✦</h1>
          <p style="color:#ccfbef;margin:8px 0 0;font-size:14px">Your daily habit companion</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#134e4a;margin:0 0 8px;font-size:20px">Hi ${name || 'there'} 👋</h2>
          <p style="color:#6b7280;margin:0 0 24px;line-height:1.6">
            Use the verification code below to complete your registration. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f0fdf9;border:2px dashed #14b8a6;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
            <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#0d9488;font-family:monospace">${otp}</div>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center">
          <p style="color:#d1d5db;font-size:11px;margin:0">© 2025 HabitFlow. Built with ♥</p>
        </div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} — Your HabitFlow verification code`,
    html,
  })
}

export async function sendWelcomeEmail(to, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f0fdf9;font-family:Inter,sans-serif">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;text-align:center">
          <div style="font-size:48px">🎉</div>
          <h1 style="color:#fff;margin:8px 0 0;font-size:22px">Welcome to HabitFlow!</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#134e4a;margin:0 0 12px">You're all set, ${name}!</h2>
          <p style="color:#6b7280;line-height:1.6;margin:0 0 20px">
            Start tracking your daily habits, monitor your progress, and build streaks that last. Your journey to better habits starts today.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display:inline-block;background:#0d9488;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
            Open My Dashboard →
          </a>
        </div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to HabitFlow, ${name}! 🌱`,
    html,
  })
}
