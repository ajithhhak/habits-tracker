import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'
import CursorBackground from '../components/CursorBackground'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth({ ok: false }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.trim()) { setError('Please enter your email'); return }
    if (!form.password)     { setError('Please enter your password'); return }

    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      })

      let data
      try {
        data = await r.json()
      } catch {
        setError('Server returned invalid response. Check logs.')
        return
      }

      if (!r.ok) {
        if (data.userId) {
          toast('Please verify your email first')
          router.push(`/verify-otp?userId=${data.userId}`)
          return
        }
        setError(data?.error || `Error ${r.status}`)
        return
      }

      toast.success(`Welcome back, ${data.user.name}! 👋`)
      router.push('/dashboard')

    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError('') }
  })

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Cursor Background */}
      <CursorBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl shadow-xl shadow-brand-500/30 mb-6"
          >
            <span className="text-white text-4xl font-black">✦</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">HabitFlow</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 text-base font-medium">Your daily habit companion</p>
        </div>

        {health && (!health.env?.hasMongo || !health.env?.hasJwt) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl text-sm font-mono border bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 backdrop-blur-sm">
            <div className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Missing environment variables:</div>
            {!health.env?.hasMongo && <div>❌ MONGODB_URI not set</div>}
            {!health.env?.hasJwt   && <div>❌ JWT_SECRET not set</div>}
          </motion.div>
        )}

        <div className="card glass relative">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-8 text-center">Sign in to your account</h2>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                <input className="input pl-11" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                <input className="input pl-11" type="password" placeholder="••••••••" required {...field('password')} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-lg h-12">
              {loading
                ? <><Loader2 className="animate-spin" size={20} /> Signing in…</>
                : <>Sign In <ArrowRight size={20} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all">Create one free</Link>
          </p>
        </div>
        
        <p className="text-center text-xs text-surface-400 dark:text-surface-500 mt-8 font-medium">
          🔒 Your data is securely encrypted
        </p>
      </motion.div>
    </div>
  )
}
