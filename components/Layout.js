import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, User, LogOut, Menu, X, Flame, Sparkles, Info } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tracker', icon: CheckSquare, label: 'Habit Tracker' },
  { href: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/about', icon: Info, label: 'About Me' },
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
    <div className="flex h-screen overflow-hidden font-sans text-slate-800 transition-colors duration-300" style={{ background: '#f8f7ff' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72
                         transform transition-transform duration-300 ease-out
                         md:relative md:translate-x-0
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 40%, #5b21b6 100%)' }}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl
                            flex items-center justify-center shadow-lg border border-white/20">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white">HabitSync</div>
            </div>
          </div>
          <button className="md:hidden text-white/60 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User mini-profile */}
        {user && (
          <div className="p-4 mx-4 mt-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden flex-shrink-0 bg-white/20">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                }
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate text-white">{user.name}</div>
                <div className="text-xs text-white/60 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="p-4 space-y-1 mt-2 flex-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = router.pathname === href
            return (
              <Link key={href} href={href} className="block relative group">
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                              ${active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
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
                       text-white/60 hover:text-white hover:bg-white/10 w-full transition-all duration-200">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 h-[72px] flex items-center justify-between flex-shrink-0 z-30 sticky top-0">
          <button className="md:hidden p-2 -ml-2 rounded-xl hover:bg-violet-50 text-violet-600 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="text-sm font-semibold text-slate-500 hidden md:block uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {user?.streak > 0 && (
              <div className="flex items-center gap-1.5 text-orange-600
                              px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm"
                style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', borderColor: '#fdba74' }}>
                <Flame size={16} className="text-orange-500" />
                <span>{user.streak} day streak</span>
              </div>
            )}
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow ring-2 ring-violet-200">
              <div className="w-full h-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #c4b5fd, #a78bfa)', color: 'white' }}>
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
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
