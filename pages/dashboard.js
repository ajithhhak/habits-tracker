import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

function StatCard({ icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-500  to-brand-700  bg-brand-50  text-brand-700',
    orange: 'from-orange-400 to-orange-600 bg-orange-50 text-orange-700',
    purple: 'from-purple-400 to-purple-600 bg-purple-50 text-purple-700',
    green:  'from-green-400  to-green-600  bg-green-50  text-green-700',
  }
  const [grad, bg, txt] = colors[color].split(' ')

  return (
    <div className="card flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} ${grad.split(' ')[1]} flex items-center justify-center shadow-sm flex-shrink-0`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        <div className="text-sm font-semibold text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => setStats(d))
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>

  return (
    <Layout user={user}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's how your habits are looking today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🔥" label="Current Streak" value={`${stats?.user?.streak ?? 0}d`} sub="Keep it up!" color="orange" />
          <StatCard icon="✅" label="Today's Progress" value={`${stats?.todayPct ?? 0}%`} sub={`${stats?.todayCompleted ?? 0} / ${stats?.totalHabits ?? 0} habits`} color="green" />
          <StatCard icon="📅" label="Days Tracked" value={stats?.daysTracked ?? 0} sub="This month" color="brand" />
          <StatCard icon="⭐" label="Monthly Average" value={`${stats?.avgPct ?? 0}%`} sub="Completion rate" color="purple" />
        </div>

        {/* Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daily Completion Rate</h2>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
          </div>
          {stats?.chartData ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                       tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Completed']}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="pct" stroke="#0d9488" strokeWidth={2.5}
                      fill="url(#pctGrad)" dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
              Start tracking habits to see your chart
            </div>
          )}
        </div>

        {/* Habit stats table */}
        {stats?.habitStats?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Habit Performance (Last 30 Days)</h2>
            <div className="space-y-3">
              {stats.habitStats.map(h => (
                <div key={h.id} className="flex items-center gap-4">
                  <span className="text-xl w-7 flex-shrink-0">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate">{h.name}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2 flex-shrink-0">{h.rate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                           style={{ width: `${h.rate}%`, backgroundColor: h.color }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 w-16 text-right">{h.completedDays}/30 days</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
