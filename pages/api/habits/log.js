import { connectDB } from '../../../lib/db'
import HabitLog from '../../../models/HabitLog'
import Habit from '../../../models/Habit'
import User from '../../../models/User'
import { requireAuth } from '../../../lib/auth'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'

async function updateStreak(userId) {
  const logs = await HabitLog.find({ userId, pct: { $gte: 50 } }).sort({ date: -1 }).limit(60)
  if (!logs.length) return
  let streak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  const dates = new Set(logs.map(l => l.date))
  let cur = today
  while (dates.has(cur)) {
    streak++
    const d = new Date(cur)
    d.setDate(d.getDate() - 1)
    cur = format(d, 'yyyy-MM-dd')
  }
  const user = await User.findById(userId)
  user.streak = streak
  if (streak > user.longestStreak) user.longestStreak = streak
  await user.save()
}

export default requireAuth(async function handler(req, res) {
  await connectDB()
  const userId = req.user.id

  // GET /api/habits/log?date=YYYY-MM-DD&month=YYYY-MM
  if (req.method === 'GET') {
    const { date, month } = req.query
    if (date) {
      const log = await HabitLog.findOne({ userId, date })
      if (!log) return res.status(200).json({ log: null })
      const obj = log.toObject()
      obj.ticks = log.ticks ? Object.fromEntries(log.ticks.entries()) : {}
      return res.status(200).json({ log: obj })
    }
    if (month) {
      const logs = await HabitLog.find({ userId, date: { $regex: `^${month}` } })
      const plainLogs = logs.map(l => {
        const obj = l.toObject()
        obj.ticks = l.ticks ? Object.fromEntries(l.ticks.entries()) : {}
        return obj
      })
      return res.status(200).json({ logs: plainLogs })
    }
    return res.status(400).json({ error: 'Provide date or month' })
  }

  // POST — toggle a habit tick for a date
  if (req.method === 'POST') {
    const { date, habitId, value, mood, note } = req.body
    if (!date) return res.status(400).json({ error: 'date required' })

    const habits = await Habit.find({ userId, isActive: true })
    const total = habits.length

    let log = await HabitLog.findOne({ userId, date })
    if (!log) log = new HabitLog({ userId, date, ticks: {}, totalCount: total })

    if (habitId !== undefined) {
      log.ticks.set(habitId, value)
    }
    if (mood !== undefined) log.mood = mood
    if (note !== undefined) log.note = note

    const completed = [...log.ticks.values()].filter(Boolean).length
    log.completedCount = completed
    log.totalCount = total
    log.pct = total ? Math.round(completed / total * 100) : 0

    await log.save()
    await updateStreak(userId)

    const obj = log.toObject()
    obj.ticks = log.ticks ? Object.fromEntries(log.ticks.entries()) : {}
    return res.status(200).json({ log: obj })
  }

  res.status(405).end()
})
