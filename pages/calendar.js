import { useEffect, useState } from 'react'
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Target, Loader2 } from 'lucide-react'

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [logs, setLogs] = useState({})
  const [selected, setSelected] = useState(null)

  const monthKey = format(currentDate, 'yyyy-MM')
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDow = getDay(startOfMonth(currentDate))

  useEffect(() => {
    if (!user) return
    fetch(`/api/habits/log?month=${monthKey}`).then(r => r.json()).then(d => {
      const map = {}
      ;(d.logs || []).forEach(l => { map[l.date] = l })
      setLogs(map)
    })
  }, [user, monthKey])

  function getPctColor(pct) {
    if (pct >= 80) return { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500 dark:border-green-400', text: 'text-green-700 dark:text-green-400' }
    if (pct >= 50) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-700 dark:text-yellow-400' }
    if (pct > 0)   return { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-400', text: 'text-red-700 dark:text-red-400' }
    return { bg: 'bg-surface-50 dark:bg-surface-800/50', border: 'border-surface-200 dark:border-surface-700', text: 'text-surface-500 dark:text-surface-400' }
  }

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-surface-400">
          <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
          <p className="font-medium animate-pulse">Loading calendar...</p>
        </div>
      </Layout>
    )
  }

  const blanks = Array.from({ length: firstDow })
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.02 } }
  }

  return (
    <Layout user={user}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="text-brand-500" size={32} />
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <p className="text-surface-500 dark:text-surface-400 font-medium mt-1">Monthly habit overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-secondary px-3 py-2 flex items-center gap-1"><ChevronLeft size={18}/> Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-4 py-2 font-bold">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-secondary px-3 py-2 flex items-center gap-1">Next <ChevronRight size={18}/></button>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4 text-sm font-bold bg-white/50 dark:bg-surface-900/50 p-4 rounded-2xl backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 shadow-sm">
          {[['bg-green-100 dark:bg-green-900/30','border-green-500','80%+ done'],['bg-yellow-100 dark:bg-yellow-900/30','border-yellow-500','50–79%'],['bg-red-100 dark:bg-red-900/30','border-red-500','1–49%'],['bg-surface-50 dark:bg-surface-800/50','border-surface-200 dark:border-surface-700','No data']].map(([bg,border,label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 ${bg} ${border}`} />
              <span className="text-surface-600 dark:text-surface-300">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Calendar grid */}
        <div className="card glass p-6">
          {/* DOW headers */}
          <div className="grid grid-cols-7 gap-3 mb-4">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-sm font-extrabold text-surface-400 dark:text-surface-500 py-1 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-7 gap-3">
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(d => {
              const dateKey = `${monthKey}-${String(d).padStart(2,'0')}`
              const log = logs[dateKey]
              const pct = log?.pct || 0
              const mood = log?.mood || ''
              const { bg, border, text } = getPctColor(pct)
              const isToday = dateKey === todayStr
              const isSelected = selected === dateKey
              
              return (
                <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} 
                     key={d} onClick={() => setSelected(isSelected ? null : dateKey)}
                     className={`rounded-2xl border-2 p-3 min-h-[5rem] cursor-pointer transition-all duration-300 ${bg} ${border}
                                 ${isToday ? 'ring-4 ring-brand-500/30 ring-offset-2 dark:ring-offset-surface-900' : ''}
                                 ${isSelected ? 'shadow-xl scale-110 z-10' : 'hover:scale-105 hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-base font-black ${isToday ? 'text-brand-600 dark:text-brand-400' : text}`}>
                      {d}
                    </span>
                    <span className="text-xl leading-none filter drop-shadow-sm">{mood}</span>
                  </div>
                  {pct > 0 && (
                    <div className="mt-auto">
                      <div className="h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-1000 ${border.replace('border-','bg-')}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={`text-xs font-black mt-1.5 ${text}`}>{pct}%</div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Selected day detail */}
        <AnimatePresence>
          {selected && logs[selected] && (
            <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }} className="card glass mt-6 overflow-hidden">
              <h3 className="text-xl font-extrabold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                <CalendarIcon className="text-brand-500" />
                {format(new Date(selected + 'T00:00'), 'EEEE, MMMM d')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800/50 shadow-sm">
                  <CheckCircle2 className="mx-auto text-green-500 mb-2" size={28} />
                  <div className="text-3xl font-black text-green-700 dark:text-green-400">{logs[selected].completedCount}</div>
                  <div className="text-sm text-green-600 dark:text-green-500 font-bold uppercase tracking-wider mt-1">Completed</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800/50 shadow-sm">
                  <XCircle className="mx-auto text-red-500 mb-2" size={28} />
                  <div className="text-3xl font-black text-red-700 dark:text-red-400">{(logs[selected].totalCount || 0) - (logs[selected].completedCount || 0)}</div>
                  <div className="text-sm text-red-600 dark:text-red-500 font-bold uppercase tracking-wider mt-1">Missed</div>
                </div>
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 border border-brand-100 dark:border-brand-800/50 shadow-sm">
                  <Target className="mx-auto text-brand-500 mb-2" size={28} />
                  <div className="text-3xl font-black text-brand-700 dark:text-brand-400">{logs[selected].pct}%</div>
                  <div className="text-sm text-brand-600 dark:text-brand-500 font-bold uppercase tracking-wider mt-1">Done</div>
                </div>
              </div>
              {logs[selected].mood && (
                <div className="mt-6 text-center">
                  <p className="text-sm font-bold text-surface-500 uppercase tracking-widest mb-2">Recorded Mood</p>
                  <div className="text-5xl filter drop-shadow-md inline-block hover:scale-110 transition-transform cursor-default">{logs[selected].mood}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
