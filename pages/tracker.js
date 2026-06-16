import { useEffect, useState } from 'react'
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

const WEEK_THEMES = [
  { bg: '#dbeafe', fg: '#1e40af', hdr: '#2563eb' },
  { bg: '#dcfce7', fg: '#166534', hdr: '#16a34a' },
  { bg: '#fed7aa', fg: '#9a3412', hdr: '#ea580c' },
  { bg: '#e9d5ff', fg: '#6b21a8', hdr: '#7c3aed' },
  { bg: '#fef08a', fg: '#713f12', hdr: '#ca8a04' },
]

const MOODS = ['😊','😄','😐','😞','😴','😤','🥰']
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Tracker() {
  const { user, loading } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({}) // { 'YYYY-MM-DD': { ticks: {}, mood, pct } }
  const [saving, setSaving] = useState({})
  const [newHabit, setNewHabit] = useState('')
  const [addingHabit, setAddingHabit] = useState(false)
  const [moodPicker, setMoodPicker] = useState(null) // day number

  const monthKey  = format(currentDate, 'yyyy-MM')
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDow  = getDay(startOfMonth(currentDate)) // 0=Sun

  // Week groups
  const weekGroups = []
  let wkStart = 1
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (firstDow + d - 1) % 7
    if (dow === 6 || d === daysInMonth) { weekGroups.push({ start: wkStart, end: d }); wkStart = d + 1 }
  }
  function getWeekIdx(day) {
    return weekGroups.findIndex(w => w.start <= day && day <= w.end)
  }

  // Computed summary
  const completedByDay   = Array.from({ length: daysInMonth }, (_, i) => {
    const dateKey = `${monthKey}-${String(i+1).padStart(2,'0')}`
    const log = logs[dateKey]
    if (!log) return 0
    return Object.values(log.ticks || {}).filter(Boolean).length
  })
  const pctByDay = completedByDay.map(c => habits.length ? Math.round(c / habits.length * 100) : 0)

  useEffect(() => {
    if (!user) return
    fetch('/api/habits').then(r => r.json()).then(d => setHabits(d.habits || []))
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch(`/api/habits/log?month=${monthKey}`).then(r => r.json()).then(d => {
      const map = {}
      ;(d.logs || []).forEach(l => { map[l.date] = { ticks: Object.fromEntries(l.ticks || []), mood: l.mood } })
      setLogs(map)
    })
  }, [user, monthKey])

  async function toggleTick(habitId, day) {
    const dateKey = `${monthKey}-${String(day).padStart(2,'0')}`
    const current = logs[dateKey]?.ticks?.[habitId] || false
    const newVal  = !current

    // Optimistic update
    setLogs(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        ticks: { ...(prev[dateKey]?.ticks || {}), [habitId]: newVal }
      }
    }))

    setSaving(s => ({ ...s, [`${habitId}-${day}`]: true }))
    try {
      await fetch('/api/habits/log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateKey, habitId, value: newVal }),
      })
    } catch { toast.error('Failed to save') }
    finally { setSaving(s => ({ ...s, [`${habitId}-${day}`]: false })) }
  }

  async function setMood(day, emoji) {
    const dateKey = `${monthKey}-${String(day).padStart(2,'0')}`
    setLogs(prev => ({ ...prev, [dateKey]: { ...prev[dateKey], mood: emoji } }))
    setMoodPicker(null)
    await fetch('/api/habits/log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateKey, mood: emoji }),
    })
  }

  async function addHabit() {
    if (!newHabit.trim()) return
    setAddingHabit(true)
    try {
      const r = await fetch('/api/habits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabit.trim() }),
      })
      const d = await r.json()
      setHabits(prev => [...prev, d.habit])
      setNewHabit('')
      toast.success('Habit added!')
    } finally { setAddingHabit(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Layout user={user}>
      <div className="space-y-4 animate-fade-in">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <p className="text-sm text-gray-400">Click any cell to tick / untick a habit</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-secondary px-4 py-2 text-sm">← Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-4 py-2 text-sm">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-secondary px-4 py-2 text-sm">Next →</button>
          </div>
        </div>

        {/* Main tracker table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
          <div style={{ minWidth: `${Math.max(900, 200 + daysInMonth * 34)}px` }}>

            {/* Summary strip */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2">
              <span className="text-sm font-bold tracking-wider uppercase">✦ Daily Goals</span>
            </div>

            {/* Completed / Not / % rows */}
            {[
              { label: 'Completed',     bg: '#e8f5e9', fg: '#2e7d32', val: d => completedByDay[d-1] },
              { label: 'Not Completed', bg: '#ffebee', fg: '#c62828', val: d => habits.length - completedByDay[d-1] },
              { label: '% Completed',   bg: '#fffde7', fg: '#e65100', val: d => pctByDay[d-1] + '%' },
            ].map(row => (
              <div key={row.label} className="flex border-b" style={{ borderColor: '#f0f0f0' }}>
                <div className="w-48 flex-shrink-0 flex items-center justify-end px-3 py-1 text-xs font-bold"
                     style={{ background: row.bg, color: row.fg }}>{row.label}</div>
                {days.map(d => (
                  <div key={d} className="flex-1 text-center py-1 text-xs font-bold border-r"
                       style={{ background: row.bg, color: row.fg, borderColor: 'rgba(0,0,0,0.06)', minWidth: 32 }}>
                    {row.val(d)}
                  </div>
                ))}
              </div>
            ))}

            {/* Week headers */}
            <div className="flex border-b border-gray-200">
              <div className="w-48 flex-shrink-0 bg-gray-800 text-white text-xs font-bold px-3 py-2 flex items-center">Goal</div>
              {weekGroups.map((wg, wi) => {
                const theme = WEEK_THEMES[wi % WEEK_THEMES.length]
                const span  = wg.end - wg.start + 1
                return (
                  <div key={wi} className="flex items-center justify-center py-2 text-xs font-extrabold tracking-wide border-r-2"
                       style={{ flex: span, background: theme.hdr, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                    Week {wi + 1}
                  </div>
                )
              })}
            </div>

            {/* Day name row */}
            <div className="flex border-b border-gray-200">
              <div className="w-48 flex-shrink-0 bg-gray-800" />
              {days.map(d => {
                const wi = getWeekIdx(d)
                const theme = WEEK_THEMES[wi % WEEK_THEMES.length]
                const dow = (firstDow + d - 1) % 7
                return (
                  <div key={d} className="flex-1 text-center py-1 text-xs font-bold border-r"
                       style={{ background: theme.bg, color: theme.fg, borderColor: 'rgba(0,0,0,0.08)', minWidth: 32 }}>
                    {DOW[dow]}
                  </div>
                )
              })}
            </div>

            {/* Day number row */}
            <div className="flex border-b-2 border-gray-200">
              <div className="w-48 flex-shrink-0 bg-gray-800" />
              {days.map(d => {
                const wi = getWeekIdx(d)
                const theme = WEEK_THEMES[wi % WEEK_THEMES.length]
                const isToday = format(new Date(), 'yyyy-MM-dd') === `${monthKey}-${String(d).padStart(2,'0')}`
                return (
                  <div key={d} className="flex-1 text-center py-1.5 text-xs font-black border-r"
                       style={{ background: theme.bg, color: theme.fg, borderColor: 'rgba(0,0,0,0.1)', minWidth: 32 }}>
                    <span className={isToday ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs' : ''}>
                      {d}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit, hi) => {
              const rowBg = hi % 2 === 0 ? '#fafbfc' : '#fff'
              return (
                <div key={habit._id} className="flex border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <div className="w-48 flex-shrink-0 flex items-center gap-2 px-3 py-2 border-r border-gray-200 text-xs font-medium text-gray-700"
                       style={{ background: rowBg }}>
                    <span>{habit.icon}</span>
                    <span className="truncate">{habit.name}</span>
                  </div>
                  {days.map(d => {
                    const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                    const checked = logs[dateKey]?.ticks?.[habit._id] || false
                    const isSaving = saving[`${habit._id}-${d}`]
                    const wi = getWeekIdx(d)
                    const theme = WEEK_THEMES[wi % WEEK_THEMES.length]
                    const cellBg = checked ? '#16a34a' : (hi % 2 === 0 ? theme.bg + '80' : '#fff')
                    return (
                      <div key={d} onClick={() => toggleTick(habit._id, d)}
                           className="flex-1 flex items-center justify-center border-r cursor-pointer hover:opacity-80 transition-all"
                           style={{ minWidth: 32, height: 36, background: cellBg, borderColor: 'rgba(0,0,0,0.07)' }}>
                        {isSaving
                          ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : checked
                          ? <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          : <div className="w-3.5 h-3.5 rounded-sm border-2"
                                 style={{ borderColor: theme.fg + '80' }} />
                        }
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Add habit row */}
            <div className="flex border-b border-gray-100">
              <div className="w-48 flex-shrink-0 flex items-center gap-2 px-3 py-2 border-r border-gray-200 bg-gray-50">
                <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && addHabit()}
                       placeholder="+ Add habit…"
                       className="text-xs text-gray-500 bg-transparent outline-none w-full placeholder-gray-400" />
                {newHabit && (
                  <button onClick={addHabit} disabled={addingHabit}
                          className="text-xs text-brand-600 font-bold flex-shrink-0">Add</button>
                )}
              </div>
              {days.map(d => <div key={d} className="flex-1 border-r bg-gray-50" style={{ minWidth: 32, height: 36, borderColor: 'rgba(0,0,0,0.05)' }} />)}
            </div>

            {/* Mood row */}
            <div className="bg-pink-50 border-t-2 border-pink-200">
              <div className="flex">
                <div className="w-48 flex-shrink-0 flex items-center px-3 py-3 border-r border-pink-200 text-xs font-bold text-pink-700">
                  😊 Daily Mood
                </div>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                  const mood = logs[dateKey]?.mood || ''
                  return (
                    <div key={d} className="flex-1 relative flex items-center justify-center border-r border-pink-200 cursor-pointer hover:bg-pink-100 transition-colors"
                         style={{ minWidth: 32, height: 44 }}
                         onClick={() => setMoodPicker(moodPicker === d ? null : d)}>
                      <span className="text-base leading-none">{mood || <span className="text-gray-300 text-xs">·</span>}</span>
                      {moodPicker === d && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50
                                        bg-white border border-gray-200 rounded-xl shadow-xl p-2 flex gap-1 whitespace-nowrap"
                             onClick={e => e.stopPropagation()}>
                          {MOODS.map(m => (
                            <button key={m} onClick={() => setMood(d, m)}
                                    className="text-xl hover:scale-125 transition-transform">{m}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Mood legend */}
        <div className="card py-3">
          <p className="text-xs text-gray-400 text-center">
            😊 Happy · 😄 Excited · 😐 Neutral · 😞 Sad · 😴 Tired · 😤 Stressed · 🥰 Grateful
          </p>
        </div>
      </div>
    </Layout>
  )
}
