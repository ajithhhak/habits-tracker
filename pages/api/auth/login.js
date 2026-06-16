import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    await connectDB()
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(401).json({ error: 'No account found with that email' })
    if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email first', userId: user._id })

    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Incorrect password' })

    user.lastLogin = new Date()
    await user.save()

    const token = signToken({ id: user._id, email: user.email, name: user.name })
    setAuthCookie(res, token)
    return res.status(200).json({ user: user.toSafeObject() })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
