import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { generateOTP, sendOTPEmail } from '../../../lib/email'

export default async function handler(req, res) {
  // Allow CORS preflight
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Check env
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'Database not configured. Add MONGODB_URI in Vercel environment variables.' })
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET not configured in Vercel environment variables.' })
    }

    // 2. Parse body — handle both cases
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { return res.status(400).json({ error: 'Invalid request body' }) }
    }
    if (!body) return res.status(400).json({ error: 'Request body is empty' })

    const { name, email, phone, password } = body

    // 3. Validate
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' })
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone number is required' })
    if (!password) return res.status(400).json({ error: 'Password is required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    // 4. Connect DB
    await connectDB()

    // 5. Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered. Please sign in instead.' })
    }

    // 6. Create OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // 7. Save user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      otp,
      otpExpiry,
    })

    // 8. Send email (non-blocking)
    try {
      await sendOTPEmail(user.email, otp, user.name)
    } catch (emailErr) {
      console.error('Email failed (non-fatal):', emailErr.message)
    }

    return res.status(201).json({
      message: 'Account created successfully! Check your email for the OTP.',
      userId: user._id.toString(),
    })

  } catch (err) {
    console.error('REGISTER ERROR:', err)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered. Please sign in.' })
    }
    if (err.message?.includes('MONGODB_URI')) {
      return res.status(500).json({ error: err.message })
    }
    if (err.name === 'MongoServerSelectionError') {
      return res.status(500).json({ error: 'Cannot connect to database. Check your MONGODB_URI and make sure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.' })
    }
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
