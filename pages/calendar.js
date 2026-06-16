import { useEffect, useState } from 'react'
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'

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
    if (pct >= 80) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d' }
    if (pct >= 50) return { bg: '#fef9c3', border: '#ca8a04', text: '#92400e' }
    if (pct > 0)   return { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' }
    return { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8' }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>

  const blanks = Array.from({ length: firstDow })
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <Layout user={user}>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h1>
            <p className="text-sm text-gray-400">Monthly habit overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-secondary px-4 py-2 text-sm">← Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-4 py-2 text-sm">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-secondary px-4 py-2 text-sm">Next →</button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-medium">
          {[['#dcfce7','#16a34a','80%+ done'],['#fef9c3','#ca8a04','50–79%'],['#fee2e2','#dc2626','1–49%'],['#f8fafc','#e2e8f0','No data']].map(([bg,border,label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border-2" style={{ background: bg, borderColor: border }} />
              <span className="text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="card p-4">
          {/* DOW headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
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
                <div key={d} onClick={() => setSelected(isSelected ? null : dateKey)}
                     className={`rounded-xl border-2 p-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md
                                 ${isToday ? 'ring-2 ring-brand-500 ring-offset-1' : ''}
                                 ${isSelected ? 'shadow-lg scale-105' : ''}`}
                     style={{ background: bg, borderColor: isSelected ? '#0d9488' : border }}>
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isToday ? 'text-brand-600' : ''}`} style={{ color: isToday ? '#0d9488' : text }}>
                      {d}
                    </span>
                    <span className="text-base leading-none">{mood}</span>
                  </div>
                  {pct > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: border }} />
                      </div>
                      <div className="text-xs font-bold mt-1" style={{ color: text }}>{pct}%</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selected && logs[selected] && (
          <div className="card animate-slide-up">
            <h3 className="font-bold text-gray-900 mb-3">
              {format(new Date(selected + 'T00:00'), 'EEEE, MMMM d')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-green-700">{logs[selected].completedCount}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-red-700">{(logs[selected].totalCount || 0) - (logs[selected].completedCount || 0)}</div>
                <div className="text-xs text-red-600 font-medium">Missed</div>
              </div>
              <div className="bg-brand-50 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-brand-700">{logs[selected].pct}%</div>
                <div className="text-xs text-brand-600 font-medium">Done</div>
              </div>
            </div>
            {logs[selected].mood && (
              <div className="mt-3 text-center text-3xl">{logs[selected].mood}</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
