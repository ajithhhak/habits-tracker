import { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, CalendarDays, Star, Loader2, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-500 to-accent-500 text-brand-300 shadow-[0_0_20px_rgba(20,241,217,0.3)]',
    orange: 'from-[#ff7a00] to-[#ff0040] text-[#ff7a00] shadow-[0_0_20px_rgba(255,122,0,0.3)]',
    purple: 'from-accent-500 to-[#6a00ff] text-accent-400 shadow-[0_0_20px_rgba(191,0,255,0.3)]',
    green:  'from-[#00ff87] to-[#60efff] text-[#00ff87] shadow-[0_0_20px_rgba(0,255,135,0.3)]',
  }
  const cls = colors[color] || colors.brand
  const [gradFrom, gradTo, text, shadow] = cls.split(' ')

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer transition-all duration-300"
    >
      <div className={`absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-br ${gradFrom} ${gradTo} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`} />
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${gradFrom} ${gradTo} p-[2px] shadow-lg ${shadow} flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
          <div className="w-full h-full bg-surface-950/80 rounded-[1.15rem] flex items-center justify-center backdrop-blur-md">
             <Icon className={text} size={28} strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <div className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-md">{value}</div>
          <div className="text-sm font-bold text-surface-400 mt-1 tracking-wide uppercase">{label}</div>
          {sub && <div className="text-xs font-semibold text-surface-500 mt-1.5">{sub}</div>}
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
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 animate-pulse-slow">
              {user?.name?.split(' ')[0]}
            </span> 👋
          </h1>
          <p className="text-surface-400 text-lg font-medium mt-3 max-w-xl">
            Welcome back to your personalized space. Here is your habit performance overview.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
          <StatCard icon={Flame} label="Current Streak" value={`${stats?.user?.streak ?? 0}d`} sub="Keep it up!" color="orange" />
          <StatCard icon={CheckCircle2} label="Today's Progress" value={`${stats?.todayPct ?? 0}%`} sub={`${stats?.todayCompleted ?? 0} / ${stats?.totalHabits ?? 0} habits`} color="green" />
          <StatCard icon={CalendarDays} label="Days Tracked" value={stats?.daysTracked ?? 0} sub="This month" color="brand" />
          <StatCard icon={Star} label="Monthly Average" value={`${stats?.avgPct ?? 0}%`} sub="Completion rate" color="purple" />
        </motion.div>

        {/* Smart Insights */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass rounded-[2rem] border-brand-500/20 shadow-[0_0_30px_rgba(20,241,217,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-accent-500/10 pointer-events-none" />
          <div className="flex items-start gap-5 p-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 border border-brand-500/30 shadow-[0_0_15px_rgba(20,241,217,0.3)]">
              <Star size={28} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Smart Insights</h3>
              <p className="text-base font-medium text-surface-300 leading-relaxed max-w-3xl">
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
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass rounded-[2rem] p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-wide">
                <TrendingUp className="text-brand-400 drop-shadow-[0_0_8px_rgba(20,241,217,0.8)]" size={28} /> Daily Completion Rate
              </h2>
              <p className="text-sm font-semibold text-surface-400 mt-1 uppercase tracking-wider">Performance over the last 30 days</p>
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
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass rounded-[2rem] p-6 relative overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-8 tracking-wide">Habit Performance</h2>
            <div className="space-y-5 relative z-10">
              {stats.habitStats.map(h => (
                <div key={h.id} className="flex items-center gap-5 group p-4 rounded-2xl bg-surface-900/50 hover:bg-surface-800/80 border border-white/5 transition-all duration-300">
                  <span className="text-3xl w-14 h-14 flex items-center justify-center bg-surface-950/80 border border-surface-700/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-bold text-white tracking-wide truncate">{h.name}</span>
                      <span className="text-base font-black text-brand-400 drop-shadow-[0_0_5px_rgba(20,241,217,0.8)] ml-2 flex-shrink-0">{h.rate}%</span>
                    </div>
                    <div className="h-3 bg-surface-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${h.rate}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ backgroundColor: h.color || '#14f1d9', boxShadow: `0 0 10px ${h.color || '#14f1d9'}` }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-surface-400 flex-shrink-0 w-24 text-right bg-surface-950/80 px-3 py-1.5 rounded-xl border border-white/5">{h.completedDays}/30 days</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  )
}
