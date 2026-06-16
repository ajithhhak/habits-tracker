import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, User, LogOut, Menu, X, Flame } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tracker',   icon: CheckSquare, label: 'Habit Tracker' },
  { href: '/calendar',  icon: CalendarIcon, label: 'Calendar' },
  { href: '/profile',   icon: User, label: 'Profile' },
]

export default function Layout({ children, user, onUserUpdate }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden font-sans text-surface-900 dark:text-surface-50 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-r border-surface-200 dark:border-surface-800 shadow-2xl
                         transform transition-transform duration-300 ease-out
                         md:relative md:translate-x-0
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-surface-100 dark:border-surface-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl
                            flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-black text-xl">✦</span>
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight">HabitFlow</div>
              <div className="text-xs text-surface-500 dark:text-surface-400 font-medium">Daily tracker</div>
            </div>
          </div>
          <button className="md:hidden text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User mini-profile */}
        {user && (
          <div className="p-4 mx-4 mt-6 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-200 to-brand-400 p-[2px] overflow-hidden flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-surface-900">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-lg">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="p-4 space-y-2 mt-2 flex-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = router.pathname === href
            return (
              <Link key={href} href={href} className="block relative group">
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                              ${active
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                  <Icon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-2'} />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mb-4">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-all duration-200">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-40 md:hidden"
             onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-surface-50 dark:bg-surface-950">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-400/20 dark:bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4 z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/4 -translate-x-1/4 z-0" />

        {/* Top bar */}
        <header className="bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 px-4 md:px-8 h-16 flex items-center justify-between flex-shrink-0 z-30 sticky top-0">
          <button className="md:hidden p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors"
                  onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="text-sm font-medium text-surface-500 dark:text-surface-400 hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {user?.streak > 0 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 text-orange-600 dark:text-orange-400
                              px-3 py-1.5 rounded-full text-sm font-bold border border-orange-200 dark:border-orange-500/30 shadow-sm">
                <Flame size={16} className="text-orange-500" />
                <span>{user.streak} day streak</span>
              </div>
            )}
            <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-200 to-brand-400 p-[2px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-surface-900">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
            </Link>
          </div>
        </header>

        {/* Page content with page transition */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-6xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
