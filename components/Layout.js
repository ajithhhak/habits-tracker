import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, User, LogOut, Menu, X, Flame, Sparkles, Info, Smartphone } from 'lucide-react'

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl
                         transform transition-transform duration-300 ease-out
                         md:relative md:translate-x-0
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center p-1">
              <img src="/logo_main.png" alt="HabitSync" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-800">HabitSync</div>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User mini-profile */}
        {user && (
          <div className="p-4 mx-4 mt-6 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-violet-100">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-violet-700 font-bold text-lg">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                }
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
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
                    className="absolute inset-0 bg-violet-50 rounded-xl border border-violet-100"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                              ${active
                    ? 'text-violet-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                  <Icon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-2'} />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout and Download */}
        <div className="p-4 mb-4">
          <a href="https://github.com/ajithhhak/habits-tracker/releases/download/v1.0.0/HabitSync.apk" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
                       bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 w-full transition-all duration-200 mb-3 shadow-md justify-center">
            <Smartphone size={18} /> Download App
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold justify-center
                       text-slate-500 hover:text-red-600 hover:bg-red-50 w-full transition-all duration-200">
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
