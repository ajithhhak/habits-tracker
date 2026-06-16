import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    if (!process.env.MONGODB_URI) return res.status(500).json({ error: 'Database not configured. Add MONGODB_URI in Vercel environment variables.' })

    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { return res.status(400).json({ error: 'Invalid request body' }) }
    }
    if (!body) return res.status(400).json({ error: 'Request body is empty' })

    const { email, password } = body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    if (!password) return res.status(400).json({ error: 'Password is required' })

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(401).json({ error: 'No account found with this email address' })
    if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email first', userId: user._id.toString() })

    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Incorrect password' })

    user.lastLogin = new Date()
    await user.save()

    const token = signToken({ id: user._id, email: user.email, name: user.name })
    setAuthCookie(res, token)

    return res.status(200).json({ user: user.toSafeObject() })

  } catch (err) {
    console.error('LOGIN ERROR:', err)
    if (err.name === 'MongoServerSelectionError') {
      return res.status(500).json({ error: 'Cannot connect to database. Check MONGODB_URI and MongoDB Atlas Network Access whitelist.' })
    }
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
