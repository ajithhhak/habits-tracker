import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/tracker',   icon: '✅', label: 'Habit Tracker' },
  { href: '/calendar',  icon: '📅', label: 'Calendar' },
  { href: '/profile',   icon: '👤', label: 'Profile' },
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl
                         transform transition-transform duration-300 ease-in-out
                         md:relative md:translate-x-0
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl
                            flex items-center justify-center shadow-sm">
              <span className="text-white font-black">✦</span>
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-lg leading-none">HabitFlow</div>
              <div className="text-xs text-gray-400 mt-0.5">Daily tracker</div>
            </div>
          </div>
        </div>

        {/* User mini-profile */}
        {user && (
          <div className="p-4 border-b border-gray-100 bg-brand-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-200 overflow-hidden flex-shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-brand-700 font-bold text-lg">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {NAV.map(({ href, icon, label }) => {
            const active = router.pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                            transition-all duration-150 group
                            ${active
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                <span className="text-lg">{icon}</span>
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                       text-red-500 hover:bg-red-50 w-full transition-all">
            <span className="text-lg">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 h-14 flex items-center justify-between flex-shrink-0">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600" />
          </button>
          <div className="text-sm text-gray-400 hidden md:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            {user?.streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600
                              px-3 py-1.5 rounded-full text-sm font-bold border border-orange-100">
                🔥 {user.streak} day streak
              </div>
            )}
            <Link href="/profile" className="w-8 h-8 rounded-full bg-brand-100 overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-brand-700 font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
              }
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
