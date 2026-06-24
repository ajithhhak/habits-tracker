import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import Habit from '../../../models/Habit'
import { signToken, setAuthCookie } from '../../../lib/auth'
import { sendWelcomeEmail } from '../../../lib/email'

const DEFAULT_HABITS = [
  { name: 'Read for 10 minutes',              icon: '📚', color: '#6366f1', category: 'mind' },
  { name: 'Write or journal for 5 minutes',   icon: '✍️',  color: '#8b5cf6', category: 'mind' },
  { name: "Plan tomorrow's tasks",            icon: '📋', color: '#0ea5e9', category: 'mind' },
  { name: 'Walk 5,000+ steps',                icon: '🚶', color: '#10b981', category: 'fitness' },
  { name: 'Drink 2L of water',                icon: '💧', color: '#06b6d4', category: 'health' },
  { name: 'Eat at least one healthy meal',    icon: '🥗', color: '#84cc16', category: 'health' },
  { name: 'Sleep at least 7 hours',           icon: '😴', color: '#a855f7', category: 'health' },
  { name: 'Meditate for 5 minutes',           icon: '🧘', color: '#f59e0b', category: 'mind' },
  { name: 'Write 3 things I am grateful for', icon: '🙏', color: '#ec4899', category: 'mind' },
  { name: 'Do something creative',            icon: '🎨', color: '#f97316', category: 'custom' },
  { name: 'Declutter or clean for 5 min',    icon: '🧹', color: '#64748b', category: 'custom' },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await connectDB()

  const { userId, otp } = req.body
  if (!userId || !otp) return res.status(400).json({ error: 'Missing fields' })

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.isVerified) return res.status(400).json({ error: 'Already verified' })
  if (!user.otp || user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' })
  if (user.otpExpiry < new Date()) return res.status(400).json({ error: 'OTP expired. Please resend.' })

  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  user.lastLogin = new Date()
  await user.save()

  await Habit.insertMany(DEFAULT_HABITS.map((h, i) => ({ ...h, userId: user._id, order: i })))

  try { await sendWelcomeEmail(user.email, user.name) } catch {}

  const token = signToken({ id: user._id, email: user.email, name: user.name })
  setAuthCookie(res, token)

  res.status(200).json({ message: 'Verified!', user: user.toSafeObject(), token })
}
