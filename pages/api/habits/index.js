import { connectDB } from '../../../lib/db'
import Habit from '../../../models/Habit'
import { requireAuth } from '../../../lib/auth'

export default requireAuth(async function handler(req, res) {
  await connectDB()
  const userId = req.user.id

  if (req.method === 'GET') {
    const habits = await Habit.find({ userId, isActive: true }).sort({ order: 1 })
    return res.status(200).json({ habits })
  }

  if (req.method === 'POST') {
    const { name, icon, color, category } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })
    const count = await Habit.countDocuments({ userId, isActive: true })
    const habit = await Habit.create({ userId, name, icon: icon || '✨', color: color || '#14b8a6', category: category || 'custom', order: count })
    return res.status(201).json({ habit })
  }

  if (req.method === 'PUT') {
    const { id, name, icon, color, category, order } = req.body
    const habit = await Habit.findOneAndUpdate({ _id: id, userId }, { name, icon, color, category, order }, { new: true })
    return res.status(200).json({ habit })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await Habit.findOneAndUpdate({ _id: id, userId }, { isActive: false })
    return res.status(200).json({ message: 'Deleted' })
  }

  res.status(405).end()
})
