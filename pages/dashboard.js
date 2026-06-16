import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, CalendarDays, Star, Loader2, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    green:  'text-emerald-600 bg-emerald-50 border-emerald-100',
  }
  const colorClass = colors[color] || colors.indigo

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      className="card flex items-center gap-4 transition-all hover:border-slate-300"
    >
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
         <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  )
}

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => setStats(d))
  }, [user])

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
          <p className="font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <br className="md:hidden" />
            <span className="text-indigo-600">
              {user?.name?.split(' ')[0]}
            </span> 👋
          </h1>
          <p className="text-slate-500 text-lg font-medium mt-2 max-w-xl">
            Welcome back. Here is your habit performance overview.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Flame} label="Current Streak" value={`${stats?.user?.streak ?? 0}d`} sub="Keep it up!" color="orange" />
          <StatCard icon={CheckCircle2} label="Today's Progress" value={`${stats?.todayPct ?? 0}%`} sub={`${stats?.todayCompleted ?? 0} / ${stats?.totalHabits ?? 0} habits`} color="green" />
          <StatCard icon={CalendarDays} label="Days Tracked" value={stats?.daysTracked ?? 0} sub="This month" color="indigo" />
          <StatCard icon={Star} label="Monthly Average" value={`${stats?.avgPct ?? 0}%`} sub="Completion rate" color="purple" />
        </motion.div>

        {/* Smart Insights */}
        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Star size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Smart Insights</h3>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-3xl">
              {stats?.todayPct === 100 
                ? "Incredible work! You've crushed all your habits today. Keep this momentum going!"
                : stats?.user?.streak >= 3
                ? `Your streak is on fire at ${stats.user.streak} days! Consistency is your superpower right now.`
                : stats?.avgPct < 40 && stats?.totalHabits > 0
                ? "Building habits takes time. If you're struggling, try scaling back your goals slightly to build momentum."
                : stats?.daysTracked > 0
                ? "You're making steady progress. Keep showing up—every single checkmark counts!"
                : "Start logging your habits today to unlock personalized insights and trends here."}
            </p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={24} /> Daily Completion Rate
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Performance over the last 30 days</p>
          </div>
          {stats?.chartData ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} dx={-10} />
                  <Tooltip 
                    formatter={v => [`${v}%`, 'Completed']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#0f172a', fontSize: 13, fontWeight: 600 }}
                    itemStyle={{ color: '#4f46e5' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="pct" stroke="#4f46e5" strokeWidth={2} fill="url(#pctGrad)" dot={{ r: 0 }} activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <TrendingUp size={32} className="mb-3 opacity-30" />
              <p className="font-medium text-sm">Start tracking habits to see your progress chart</p>
            </div>
          )}
        </motion.div>

        {/* Habit stats table */}
        {stats?.habitStats?.length > 0 && (
          <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Habit Performance</h2>
            <div className="space-y-3">
              {stats.habitStats.map(h => (
                <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <span className="text-2xl w-12 h-12 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-xl flex-shrink-0">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-900 truncate">{h.name}</span>
                      <span className="text-sm font-bold text-indigo-600 ml-2">{h.rate}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${h.rate}%` }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-20 text-right">{h.completedDays} / 30 d</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  )
}
