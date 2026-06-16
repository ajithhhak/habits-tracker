import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { generateOTP, sendOTPEmail } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Check env vars are set
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not set')
      return res.status(500).json({ error: 'Server configuration error: database not configured' })
    }

    await connectDB()

    const { name, email, phone, password } = req.body

    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: 'All fields are required' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(409).json({ error: 'Email already registered. Please login.' })

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      otp,
      otpExpiry,
    })

    // Try sending email — log error but don't block registration
    try {
      await sendOTPEmail(email, otp, name)
      console.log('OTP email sent to', email)
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message)
      // Still return success — user can resend OTP
    }

    return res.status(201).json({
      message: 'Account created! Check your email for OTP.',
      userId: user._id.toString(),
      // In dev, return OTP so you can test without email
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    })

  } catch (err) {
    console.error('Register error:', err)
    // Mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered. Please login.' })
    }
    return res.status(500).json({ error: 'Something went wrong: ' + err.message })
  }
}
