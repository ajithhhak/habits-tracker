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
  const gridTemplate = `224px repeat(${daysInMonth}, minmax(40px, 1fr))`

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
    if (!log || !log.ticks) return 0
    // Only count ticks for habits that actually exist in the current `habits` list
    return habits.filter(h => log.ticks[h._id]).length
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
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
          <p className="font-medium animate-pulse">Loading tracker...</p>
        </div>
      </Layout>
    )
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Layout user={user}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} className="z-[100]" />}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Month nav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
              <CheckSquare className="text-violet-500" size={32} />
              <span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {format(currentDate, 'MMMM yyyy')}
              </span>
            </h1>
            <p className="text-slate-500 font-semibold mt-1 uppercase tracking-wider text-xs">Click any cell to tick / untick a habit</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-secondary px-3 py-1.5 flex items-center gap-1 text-sm"><ChevronLeft size={16}/> Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-4 py-1.5 text-sm">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-secondary px-3 py-1.5 flex items-center gap-1 text-sm">Next <ChevronRight size={16}/></button>
          </div>
        </div>

        {/* Main tracker table */}
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-auto custom-scrollbar relative z-10">
            <div style={{ minWidth: `${224 + daysInMonth * 40}px` }}>

            {/* Summary strip */}
            <div className="border-b border-violet-100" style={{ background: 'linear-gradient(90deg, #f5f3ff, #faf5ff)' }}>
              <div className="px-5 py-3 sticky left-0 w-max z-20">
                <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-2"><CheckSquare size={16} className="text-violet-500" /> Daily Goals</span>
              </div>
            </div>

            {/* Completed / Not / % rows */}
            {[
              { label: 'Completed',     bgClass: 'bg-emerald-50', fgClass: 'text-emerald-700', val: d => completedByDay[d-1] },
              { label: 'Not Completed', bgClass: 'bg-red-50', fgClass: 'text-red-700', val: d => habits.length - completedByDay[d-1] },
              { label: '% Completed',   bgClass: 'bg-indigo-50', fgClass: 'text-indigo-700 font-bold', val: d => pctByDay[d-1] + '%' },
            ].map(row => (
              <div key={row.label} className={`grid border-b border-slate-100 ${row.bgClass} ${row.fgClass}`} style={{ gridTemplateColumns: gridTemplate }}>
                <div className={`flex items-center justify-end px-4 py-2 text-xs font-bold uppercase tracking-wider sticky left-0 z-20 ${row.bgClass} border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                  {row.label}
                </div>
                {days.map(d => (
                  <div key={d} className="flex items-center justify-center py-2 text-sm font-semibold border-r border-slate-100/50">
                    {row.val(d)}
                  </div>
                ))}
              </div>
            ))}

            {/* Week headers */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="text-violet-500 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 flex items-center sticky left-0 z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ background: '#f5f3ff' }}>Goal</div>
              {weekGroups.map((wg, wi) => {
                const span  = wg.end - wg.start + 1
                return (
                  <div key={wi} className="flex items-center justify-center py-2 text-xs font-bold uppercase tracking-wider border-r border-slate-200 text-violet-600"
                       style={{ gridColumn: `span ${span}`, background: '#f5f3ff' }}>
                    Week {wi + 1}
                  </div>
                )
              })}
            </div>

            {/* Day name row */}
            <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="bg-white sticky left-0 z-20 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" />
              {days.map(d => {
                const dow = (firstDow + d - 1) % 7
                return (
                  <div key={d} className="flex items-center justify-center py-1.5 text-[10px] font-bold border-r border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-widest">
                    {DOW[dow]}
                  </div>
                )
              })}
            </div>

            {/* Day number row */}
            <div className="grid border-b border-slate-200 shadow-sm relative z-20" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="bg-white sticky left-0 z-30 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" />
              {days.map(d => {
                const isToday = format(new Date(), 'yyyy-MM-dd') === `${monthKey}-${String(d).padStart(2,'0')}`
                return (
                  <div key={d} className="flex items-center justify-center py-2 text-sm font-bold border-r border-slate-200 bg-white text-slate-900">
                    <span className={isToday ? 'inline-flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg' : ''}
                          style={isToday ? { background: 'linear-gradient(135deg, #7c3aed, #d946ef)' } : undefined}>
                      {d}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit, hi) => {
              const bgClass = hi % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              return (
                <div key={habit._id} className="grid border-b border-slate-200 hover:bg-slate-50 transition-colors group" style={{ gridTemplateColumns: gridTemplate }}>
                  <div className={`flex items-center gap-3 px-4 py-3 border-r border-slate-200 text-sm font-semibold text-slate-900 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${bgClass} group-hover:bg-slate-50`}>
                    <span className="text-xl">{habit.icon}</span>
                    <span className="truncate flex-1 pr-6">{habit.name}</span>
                    <button onClick={() => setEditingHabit(habit)} className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-slate-200 rounded-md absolute right-2 text-slate-500">
                      <Settings size={16} />
                    </button>
                  </div>
                  {days.map(d => {
                    const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                    const checked = logs[dateKey]?.ticks?.[habit._id] || false
                    const isSaving = saving[`${habit._id}-${d}`]
                    return (
                      <div key={d} onClick={() => toggleTick(habit._id, d)}
                           className={`flex items-center justify-center border-r border-slate-200 cursor-pointer transition-colors ${checked ? 'bg-violet-50' : bgClass}`}
                           style={{ height: 52 }}>
                        {isSaving
                          ? <Loader2 size={16} className="animate-spin text-violet-400" />
                          : checked
                          ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="w-5 h-5 rounded-md text-white flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                              <CheckSquare size={14} className="stroke-[3px]" />
                            </motion.div>
                          : <div className="w-5 h-5 rounded-md border border-slate-300 group-hover:border-violet-300 bg-white transition-colors" />
                        }
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Add habit row */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="flex items-center gap-2 px-4 py-3 border-r border-slate-200 bg-slate-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && addHabit()}
                       placeholder="+ Add a habit…"
                       className="text-sm text-slate-900 bg-transparent outline-none w-full placeholder-slate-400 font-semibold" />
                {newHabit && (
                  <button onClick={addHabit} disabled={addingHabit}
                          className="text-[10px] text-white font-bold flex-shrink-0 px-2 py-1 rounded-lg hover:opacity-90 transition-colors uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>Add</button>
                )}
              </div>
              {days.map(d => <div key={d} className="border-r border-slate-200 bg-slate-50" style={{ height: 48 }} />)}
            </div>

            {/* Mood row */}
            <div style={{ background: '#f5f3ff' }}>
              <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="flex items-center px-4 py-3 border-r border-slate-200 text-xs font-bold text-violet-600 uppercase tracking-widest sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ background: '#f5f3ff' }}>
                  <span className="mr-2 text-base">✨</span> Daily Mood
                </div>
                {days.map(d => {
                  const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
                  const mood = logs[dateKey]?.mood || ''
                  return (
                    <div key={d} className="relative flex items-center justify-center border-r border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors"
                         style={{ height: 48 }}
                         onClick={() => setMoodPicker(moodPicker === d ? null : d)} style={{ background: 'inherit' }}>
                      <span className="text-xl leading-none">{mood || <span className="text-slate-300 text-[10px]">·</span>}</span>
                      {moodPicker === d && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50
                                        bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 flex gap-1 whitespace-nowrap animate-fade-in"
                             onClick={e => e.stopPropagation()}>
                          {MOODS.map(m => (
                            <button key={m} onClick={() => setMood(d, m)}
                                    className="text-2xl hover:scale-125 transition-transform p-1">{m}</button>
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
        <div className="card py-3 px-5 inline-block !rounded-full" style={{ background: 'linear-gradient(135deg, #f5f3ff, #fdf2f8)' }}>
          <p className="text-xs font-semibold text-slate-500 tracking-wide">
            😊 Happy &nbsp;·&nbsp; 😄 Excited &nbsp;·&nbsp; 😐 Neutral &nbsp;·&nbsp; 😞 Sad &nbsp;·&nbsp; 😴 Tired &nbsp;·&nbsp; 😤 Stressed &nbsp;·&nbsp; 🥰 Grateful
          </p>
        </div>

        {/* Edit Modal */}
        {editingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-violet-100 w-full max-w-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-violet-50" style={{ background: 'linear-gradient(90deg, #f5f3ff, #faf5ff)' }}>
                <h3 className="font-bold text-lg text-slate-800">Edit Habit</h3>
                <button onClick={() => setEditingHabit(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Habit Name</label>
                  <input value={editingHabit.name} onChange={e => setEditingHabit({...editingHabit, name: e.target.value})} className="input py-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Icon</label>
                  <input value={editingHabit.icon} onChange={e => setEditingHabit({...editingHabit, icon: e.target.value})} className="input py-2 w-16 text-center text-xl" maxLength={2} />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50 items-center">
                <button onClick={() => deleteHabit(editingHabit._id)} className="text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
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
