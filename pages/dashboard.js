import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, CalendarDays, Star, Loader2, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-400 to-brand-600 text-brand-600 dark:text-brand-400 shadow-brand-500/20',
    orange: 'from-orange-400 to-orange-600 text-orange-600 dark:text-orange-400 shadow-orange-500/20',
    purple: 'from-purple-400 to-purple-600 text-purple-600 dark:text-purple-400 shadow-purple-500/20',
    green:  'from-green-400 to-green-600 text-green-600 dark:text-green-400 shadow-green-500/20',
  }
  const cls = colors[color] || colors.brand
  const [gradFrom, gradTo, text, shadow] = cls.split(' ')

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="card bg-white/60 dark:bg-surface-900/60 backdrop-blur-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group border border-white/40 dark:border-surface-700/50"
    >
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradFrom} ${gradTo} p-[1.5px] shadow-lg ${shadow} flex-shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300`}>
          <div className="w-full h-full bg-white/90 dark:bg-surface-900/90 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
             <Icon className={text} size={26} strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">{value}</div>
          <div className="text-sm font-bold text-surface-500 dark:text-surface-400 mt-0.5">{label}</div>
          {sub && <div className="text-xs font-medium text-surface-400 dark:text-surface-500 mt-1">{sub}</div>}
        </div>
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
        <div className="flex flex-col items-center justify-center h-[60vh] text-surface-400">
          <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
          <p className="font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-teal-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-base font-medium mt-1.5">Here's how your habits are looking today.</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
          <StatCard icon={Flame} label="Current Streak" value={`${stats?.user?.streak ?? 0}d`} sub="Keep it up!" color="orange" />
          <StatCard icon={CheckCircle2} label="Today's Progress" value={`${stats?.todayPct ?? 0}%`} sub={`${stats?.todayCompleted ?? 0} / ${stats?.totalHabits ?? 0} habits`} color="green" />
          <StatCard icon={CalendarDays} label="Days Tracked" value={stats?.daysTracked ?? 0} sub="This month" color="brand" />
          <StatCard icon={Star} label="Monthly Average" value={`${stats?.avgPct ?? 0}%`} sub="Completion rate" color="purple" />
        </motion.div>

        {/* Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="card bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border border-white/40 dark:border-surface-700/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-brand-500" size={24} /> Daily Completion Rate
              </h2>
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-1">Performance over the last 30 days</p>
            </div>
          </div>
          {stats?.chartData ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-surface-200 dark:text-surface-800" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} interval="preserveStartEnd" className="text-surface-400 dark:text-surface-500 font-medium" axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} className="text-surface-400 dark:text-surface-500 font-medium" dx={-10} />
                  <Tooltip 
                    formatter={v => [`${v}%`, 'Completed']}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)', color: '#fff', fontSize: 13, fontWeight: 600 }}
                    itemStyle={{ color: '#5eead4' }}
                    cursor={{ stroke: '#5eead4', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="pct" stroke="#14b8a6" strokeWidth={3} fill="url(#pctGrad)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2, className: "shadow-lg shadow-brand-500/50" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-surface-400 bg-surface-50/50 dark:bg-surface-800/20 rounded-xl border border-dashed border-surface-200 dark:border-surface-700">
              <TrendingUp size={32} className="mb-3 opacity-20" />
              <p className="font-medium">Start tracking habits to see your progress chart</p>
            </div>
          )}
        </motion.div>

        {/* Habit stats table */}
        {stats?.habitStats?.length > 0 && (
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="card bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border border-white/40 dark:border-surface-700/50">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Habit Performance</h2>
            <div className="space-y-4">
              {stats.habitStats.map(h => (
                <div key={h.id} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors duration-200">
                  <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white dark:bg-surface-800 shadow-sm rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-surface-700 dark:text-surface-200 truncate">{h.name}</span>
                      <span className="text-sm font-black text-surface-900 dark:text-white ml-2 flex-shrink-0">{h.rate}%</span>
                    </div>
                    <div className="h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${h.rate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ backgroundColor: h.color || '#14b8a6' }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-surface-400 flex-shrink-0 w-20 text-right bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{h.completedDays}/30 days</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  )
}
