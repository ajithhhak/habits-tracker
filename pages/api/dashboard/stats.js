import { connectDB } from '../../../lib/db'
import HabitLog from '../../../models/HabitLog'
import Habit from '../../../models/Habit'
import User from '../../../models/User'
import { requireAuth } from '../../../lib/auth'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  await connectDB()
  const userId = req.user.id

  const user = await User.findById(userId)
  const habits = await Habit.find({ userId, isActive: true })
  const today = format(new Date(), 'yyyy-MM-dd')

  // Last 30 days logs
  const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'))
  const logs30 = await HabitLog.find({ userId, date: { $in: last30 } })
  const logMap = Object.fromEntries(logs30.map(l => [l.date, l]))

  // Chart data: last 30 days
  const chartData = last30.map(date => ({
    date,
    label: format(new Date(date + 'T00:00:00'), 'MMM d'),
    pct: logMap[date]?.pct || 0,
    completed: logMap[date]?.completedCount || 0,
  }))

  // This month
  const monthKey = format(new Date(), 'yyyy-MM')
  const monthLogs = await HabitLog.find({ userId, date: { $regex: `^${monthKey}` } })
  const daysTracked = monthLogs.filter(l => l.completedCount > 0).length
  const avgPct = monthLogs.length
    ? Math.round(monthLogs.reduce((s, l) => s + l.pct, 0) / monthLogs.length)
    : 0

  // Per-habit completion rate (last 30 days)
  const habitStats = habits.map(h => {
    const completedDays = logs30.filter(l => l.ticks?.get(h._id.toString())).length
    return {
      id: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      completedDays,
      rate: Math.round(completedDays / 30 * 100),
    }
  }).sort((a, b) => b.rate - a.rate)

  // Today's log
  const todayLog = await HabitLog.findOne({ userId, date: today })

  res.status(200).json({
    user: { name: user.name, streak: user.streak, longestStreak: user.longestStreak, joinedAt: user.joinedAt },
    todayPct: todayLog?.pct || 0,
    todayCompleted: todayLog?.completedCount || 0,
    totalHabits: habits.length,
    chartData,
    daysTracked,
    avgPct,
    habitStats,
  })
})
