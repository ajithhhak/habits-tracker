import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { generateOTP, sendOTPEmail } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await connectDB()

  const { name, email, phone, password } = req.body
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'All fields are required' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const otp = generateOTP()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  const user = await User.create({ name, email, phone, password, otp, otpExpiry })

  try {
    await sendOTPEmail(email, otp, name)
  } catch (err) {
    console.error('Email error:', err)
    // Don't block registration if email fails in dev
  }

  res.status(201).json({ message: 'OTP sent to your email', userId: user._id })
}
