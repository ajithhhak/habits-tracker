import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { requireAuth } from '../../../lib/auth'

export default requireAuth(async function handler(req, res) {
  await connectDB()
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.status(200).json({ user: user.toSafeObject() })
})
