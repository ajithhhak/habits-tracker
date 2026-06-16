import { useEffect, useState } from 'react'
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckSquare, Loader2, Settings, Trash2, X } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

// Removed static week themes, we will use Tailwind CSS directly

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
  const [editingHabit, setEditingHabit] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()

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
      ;(d.logs || []).forEach(l => { map[l.date] = { ticks: l.ticks || {}, mood: l.mood } })
      setLogs(map)
    }).catch(e => console.error("Failed to load logs", e))
  }, [user, monthKey])

  async function toggleTick(habitId, day) {
    const dateKey = `${monthKey}-${String(day).padStart(2,'0')}`
    const current = logs[dateKey]?.ticks?.[habitId] || false
    const newVal  = !current

    // Optimistic update
    const newTicks = { ...(logs[dateKey]?.ticks || {}), [habitId]: newVal }
    setLogs(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        ticks: newTicks
      }
    }))

    if (newVal === true) {
      const completedCount = Object.values(newTicks).filter(Boolean).length
      if (habits.length > 0 && completedCount === habits.length) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    }

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

  async function saveHabit(h) {
    try {
      const r = await fetch('/api/habits', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: h._id, name: h.name, icon: h.icon })
      })
      const d = await r.json()
      setHabits(prev => prev.map(p => p._id === h._id ? d.habit : p))
      setEditingHabit(null)
      toast.success('Habit updated!')
    } catch { toast.error('Failed to update habit') }
  }

  async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await fetch(`/api/habits?id=${id}`, { method: 'DELETE' })
      setHabits(prev => prev.filter(p => p._id !== id))
      setEditingHabit(null)
      toast.success('Habit deleted!')
    } catch { toast.error('Failed to delete habit') }
  }

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-surface-400">
          <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
          <p className="font-medium animate-pulse">Loading tracker...</p>
        </div>
      </Layout>
    )
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Layout user={user}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} className="z-[100]" />}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Month nav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tighter drop-shadow-md">
              <CheckSquare className="text-brand-400 drop-shadow-[0_0_10px_rgba(20,241,217,0.8)]" size={40} />
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <p className="text-surface-400 font-bold mt-2 uppercase tracking-widest text-sm">Click any cell to tick / untick a habit</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="glass px-4 py-2 flex items-center gap-2 rounded-xl text-surface-300 hover:text-white transition-all hover:bg-white/10 font-bold"><ChevronLeft size={18}/> Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-6 py-2">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="glass px-4 py-2 flex items-center gap-2 rounded-xl text-surface-300 hover:text-white transition-all hover:bg-white/10 font-bold">Next <ChevronRight size={18}/></button>
          </div>
        </div>

        {/* Main tracker table */}
        <div className="glass rounded-[2rem] border-brand-500/20 shadow-[0_0_30px_rgba(20,241,217,0.1)] relative overflow-hidden !p-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 pointer-events-none" />
          <div className="overflow-auto custom-scrollbar relative z-10">
            <div style={{ minWidth: `${Math.max(900, 200 + daysInMonth * 34)}px` }}>

            {/* Summary strip */}
            <div className="bg-surface-950/50 backdrop-blur-md text-white px-5 py-4 border-b border-white/10">
              <span className="text-sm font-black tracking-widest uppercase flex items-center gap-3"><CheckSquare size={18} className="text-brand-400 drop-shadow-[0_0_8px_rgba(20,241,217,0.8)]" /> Daily Goals</span>
            </div>

            {/* Completed / Not / % rows */}
            {[
              { label: 'Completed',     bgClass: 'bg-brand-500/10', fgClass: 'text-brand-300 drop-shadow-[0_0_2px_rgba(20,241,217,0.5)]', val: d => completedByDay[d-1] },
              { label: 'Not Completed', bgClass: 'bg-red-500/10', fgClass: 'text-red-400', val: d => habits.length - completedByDay[d-1] },
              { label: '% Completed',   bgClass: 'bg-accent-500/10', fgClass: 'text-accent-300 drop-shadow-[0_0_2px_rgba(191,0,255,0.5)]', val: d => pctByDay[d-1] + '%' },
            ].map(row => (
              <div key={row.label} className="flex border-b border-white/5">
                <div className={`w-56 flex-shrink-0 flex items-center justify-end px-4 py-2 text-xs font-black uppercase tracking-widest ${row.bgClass} ${row.fgClass}`}>
                  {row.label}
                </div>
                {days.map(d => (
                  <div key={d} className={`flex-1 text-center py-2 text-sm font-black border-r border-white/5 ${row.bgClass} ${row.fgClass}`}
                       style={{ minWidth: 40 }}>
                    {row.val(d)}
                  </div>
                ))}
              </div>
            ))}

            {/* Week headers */}
            <div className="flex border-b border-white/10">
              <div className="w-56 flex-shrink-0 bg-surface-950/80 text-surface-400 text-xs font-black tracking-widest uppercase px-4 py-3 flex items-center">Goal</div>
              {weekGroups.map((wg, wi) => {
                const span  = wg.end - wg.start + 1
                return (
                  <div key={wi} className="flex items-center justify-center py-3 text-xs font-black uppercase tracking-widest border-r border-white/10 bg-surface-900/50 text-brand-400"
                       style={{ flex: span }}>
                    Week {wi + 1}
                  </div>
                )
              })}
            </div>

            {/* Day name row */}
            <div className="flex border-b border-white/10">
              <div className="w-56 flex-shrink-0 bg-surface-900/30" />
              {days.map(d => {
                const dow = (firstDow + d - 1) % 7
                return (
                  <div key={d} className="flex-1 text-center py-2 text-xs font-bold border-r border-white/10 bg-surface-950/80 text-surface-400 uppercase tracking-widest"
                       style={{ minWidth: 40 }}>
                    {DOW[dow]}
                  </div>
                )
              })}
            </div>

            {/* Day number row */}
            <div className="flex border-b border-white/10">
              <div className="w-56 flex-shrink-0 bg-surface-900/30" />
              {days.map(d => {
                const isToday = format(new Date(), 'yyyy-MM-dd') === `${monthKey}-${String(d).padStart(2,'0')}`
                return (
                  <div key={d} className="flex-1 text-center py-2.5 text-base font-black border-r border-white/10 bg-surface-950/60 text-white"
                       style={{ minWidth: 40 }}>
                    <span className={isToday ? 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-surface-950 drop-shadow-[0_0_10px_rgba(20,241,217,0.8)]' : ''}>
                      {d}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit, hi) => {
              const bgClass = hi % 2 === 0 ? 'bg-surface-900/40' : 'bg-surface-950/60'
              return (
                <div key={habit._id} className="flex border-b border-white/5 hover:bg-surface-800/80 transition-colors group">
                  <div className={`w-56 flex-shrink-0 flex items-center gap-4 px-4 py-3 border-r border-white/5 text-base font-bold text-white relative ${bgClass}`}>
                    <span className="text-2xl drop-shadow-md">{habit.icon}</span>
                    <span className="truncate flex-1 pr-6 tracking-wide">{habit.name}</span>
                    <button onClick={() => setEditingHabit(habit)} className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-surface-700 rounded-xl absolute right-2 shadow-sm border border-transparent hover:border-surface-600 bg-surface-800 text-surface-300">
                      <Settings size={16} />
                    </button>
                  </div>
                  {days.map(d => {
                    const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                    const checked = logs[dateKey]?.ticks?.[habit._id] || false
                    const isSaving = saving[`${habit._id}-${d}`]
                    return (
                      <div key={d} onClick={() => toggleTick(habit._id, d)}
                           className={`flex-1 flex items-center justify-center border-r border-white/5 cursor-pointer transition-all duration-300 ${checked ? 'bg-brand-500/20' : bgClass}`}
                           style={{ minWidth: 40, height: 56 }}>
                        {isSaving
                          ? <Loader2 size={20} className="animate-spin text-brand-400" />
                          : checked
                          ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="w-7 h-7 rounded-[8px] bg-brand-400 text-surface-950 flex items-center justify-center shadow-[0_0_15px_rgba(20,241,217,0.8)]">
                              <CheckSquare size={18} className="stroke-[3px]" />
                            </motion.div>
                          : <div className="w-7 h-7 rounded-[8px] border-2 border-surface-700 group-hover:border-surface-500 transition-colors" />
                        }
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Add habit row */}
            <div className="flex border-b border-white/5">
              <div className="w-56 flex-shrink-0 flex items-center gap-2 px-4 py-4 border-r border-white/5 bg-surface-900/30">
                <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && addHabit()}
                       placeholder="+ Add a habit…"
                       className="text-base text-white bg-transparent outline-none w-full placeholder-surface-500 font-bold tracking-wide" />
                {newHabit && (
                  <button onClick={addHabit} disabled={addingHabit}
                          className="text-xs text-surface-950 font-black flex-shrink-0 px-3 py-1.5 bg-brand-400 rounded-lg hover:bg-brand-300 transition-colors shadow-[0_0_10px_rgba(20,241,217,0.5)] uppercase tracking-wider">Add</button>
                )}
              </div>
              {days.map(d => <div key={d} className="flex-1 border-r border-white/5 bg-surface-900/30" style={{ minWidth: 40, height: 60 }} />)}
            </div>

            {/* Mood row */}
            <div className="bg-gradient-to-r from-accent-500/10 to-brand-500/10">
              <div className="flex">
                <div className="w-56 flex-shrink-0 flex items-center px-4 py-4 border-r border-white/5 text-sm font-black text-accent-300 drop-shadow-[0_0_5px_rgba(191,0,255,0.5)] uppercase tracking-widest">
                  <span className="mr-3 text-lg">✨</span> Daily Mood
                </div>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                  const mood = logs[dateKey]?.mood || ''
                  return (
                    <div key={d} className="flex-1 relative flex items-center justify-center border-r border-white/5 cursor-pointer hover:bg-accent-500/20 transition-colors"
                         style={{ minWidth: 40, height: 64 }}
                         onClick={() => setMoodPicker(moodPicker === d ? null : d)}>
                      <span className="text-2xl leading-none">{mood || <span className="text-surface-600 text-xs">·</span>}</span>
                      {moodPicker === d && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50
                                        glass border-white/20 rounded-2xl shadow-[0_0_30px_rgba(191,0,255,0.3)] p-2 flex gap-1 whitespace-nowrap animate-fade-in"
                             onClick={e => e.stopPropagation()}>
                          {MOODS.map(m => (
                            <button key={m} onClick={() => setMood(d, m)}
                                    className="text-3xl hover:scale-125 transition-transform p-1">{m}</button>
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
        </div>

        {/* Mood legend */}
        <div className="glass rounded-2xl py-4 px-6 inline-block">
          <p className="text-sm font-bold text-surface-400 tracking-wide">
            😊 Happy &nbsp;·&nbsp; 😄 Excited &nbsp;·&nbsp; 😐 Neutral &nbsp;·&nbsp; 😞 Sad &nbsp;·&nbsp; 😴 Tired &nbsp;·&nbsp; 😤 Stressed &nbsp;·&nbsp; 🥰 Grateful
          </p>
        </div>

        {/* Edit Modal */}
        {editingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-surface-100 dark:border-surface-800">
                <h3 className="font-extrabold text-lg text-surface-900 dark:text-white">Edit Habit</h3>
                <button onClick={() => setEditingHabit(null)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"><X size={20}/></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-bold text-surface-700 dark:text-surface-300 block mb-1">Habit Name</label>
                  <input value={editingHabit.name} onChange={e => setEditingHabit({...editingHabit, name: e.target.value})} className="input py-2" />
                </div>
                <div>
                  <label className="text-sm font-bold text-surface-700 dark:text-surface-300 block mb-1">Icon</label>
                  <input value={editingHabit.icon} onChange={e => setEditingHabit({...editingHabit, icon: e.target.value})} className="input py-2 w-16 text-center text-xl" maxLength={2} />
                </div>
              </div>
              <div className="p-4 border-t border-surface-100 dark:border-surface-800 flex justify-between bg-surface-50 dark:bg-surface-950/50 items-center">
                <button onClick={() => deleteHabit(editingHabit._id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                  <Trash2 size={16}/> Delete
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setEditingHabit(null)} className="btn-secondary px-3 py-1.5 text-sm">Cancel</button>
                  <button onClick={() => saveHabit(editingHabit)} className="btn-primary px-4 py-1.5 text-sm">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  )
}
