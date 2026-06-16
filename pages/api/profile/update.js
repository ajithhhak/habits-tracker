import formidable from 'formidable'
import fs from 'fs'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { requireAuth, getAuthUser } from '../../../lib/auth'
import { uploadToCloudinary } from '../../../lib/cloudinary'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  const user = getAuthUser(req, res)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  await connectDB()

  if (req.method === 'PUT') {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)

    const updates = {}
    if (fields.name?.[0])     updates.name = fields.name[0]
    if (fields.phone?.[0])    updates.phone = fields.phone[0]
    if (fields.timezone?.[0]) updates.timezone = fields.timezone[0]

    // Handle avatar upload
    const avatarFile = files.avatar?.[0]
    if (avatarFile) {
      const buffer = fs.readFileSync(avatarFile.filepath)
      const result = await uploadToCloudinary(buffer)
      updates.avatar = result.secure_url
      updates.avatarPublicId = result.public_id
    }

    const updated = await User.findByIdAndUpdate(user.id, updates, { new: true })
    return res.status(200).json({ user: updated.toSafeObject() })
  }

  if (req.method === 'POST' && req.query.action === 'change-password') {
    const { currentPassword, newPassword } = req.body
    const dbUser = await User.findById(user.id)
    const ok = await dbUser.comparePassword(currentPassword)
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' })
    dbUser.password = newPassword
    await dbUser.save()
    return res.status(200).json({ message: 'Password changed' })
  }

  res.status(405).end()
}
