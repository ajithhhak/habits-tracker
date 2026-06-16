import { IncomingForm } from 'formidable'
import fs from 'fs'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { getAuthUser } from '../../../lib/auth'
import { uploadToCloudinary } from '../../../lib/cloudinary'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  const user = getAuthUser(req, res)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  await connectDB()

  if (req.method === 'PUT') {
    const form = new IncomingForm({ maxFileSize: 5 * 1024 * 1024, keepExtensions: true })

    let fields, files
    try {
      [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, f, fi) => err ? reject(err) : resolve([f, fi]))
      })
    } catch (err) {
      return res.status(400).json({ error: 'Form parse error: ' + err.message })
    }

    const updates = {}
    if (fields.name?.[0])     updates.name = fields.name[0]
    if (fields.phone?.[0])    updates.phone = fields.phone[0]
    if (fields.timezone?.[0]) updates.timezone = fields.timezone[0]

    const avatarFile = files.avatar?.[0]
    if (avatarFile) {
      try {
        const buffer = fs.readFileSync(avatarFile.filepath)
        const result = await uploadToCloudinary(buffer)
        updates.avatar = result.secure_url
        updates.avatarPublicId = result.public_id
      } catch (err) {
        return res.status(500).json({ error: 'Image upload failed: ' + err.message })
      }
    }

    const updated = await User.findByIdAndUpdate(user.id, updates, { new: true })
    return res.status(200).json({ user: updated.toSafeObject() })
  }

  if (req.method === 'POST') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString())
    const { currentPassword, newPassword } = body

    const dbUser = await User.findById(user.id)
    const ok = await dbUser.comparePassword(currentPassword)
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' })
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be 6+ characters' })

    dbUser.password = newPassword
    await dbUser.save()
    return res.status(200).json({ message: 'Password changed' })
  }

  res.status(405).end()
}
