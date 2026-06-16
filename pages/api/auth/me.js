import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { getAuthUser } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    const authUser = getAuthUser(req, res)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })
    await connectDB()
    const user = await User.findById(authUser.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ user: user.toSafeObject() })
  } catch (err) {
    console.error('Me error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
