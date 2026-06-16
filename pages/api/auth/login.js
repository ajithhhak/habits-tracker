import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await connectDB()

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email first', userId: user._id })

  const ok = await user.comparePassword(password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  user.lastLogin = new Date()
  await user.save()

  const token = signToken({ id: user._id, email: user.email, name: user.name })
  setAuthCookie(res, token)

  res.status(200).json({ user: user.toSafeObject() })
}
