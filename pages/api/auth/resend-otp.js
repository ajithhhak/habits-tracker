import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { generateOTP, sendOTPEmail } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await connectDB()
  const { userId } = req.body
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.isVerified) return res.status(400).json({ error: 'Already verified' })

  const otp = generateOTP()
  user.otp = otp
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
  await sendOTPEmail(user.email, otp, user.name)
  res.status(200).json({ message: 'OTP resent' })
}
