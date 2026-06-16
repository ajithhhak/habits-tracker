import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'

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
    if (!form.password) { setError('Please enter your password'); return }

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-sm mb-6">
            <span className="text-white text-3xl font-black">✦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to Habit Tracker</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Welcome back, please enter your details.</p>
        </div>

        {health && (!health.env?.hasMongo || !health.env?.hasJwt) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl text-sm font-mono border bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 backdrop-blur-sm">
            <div className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} /> Missing environment variables:</div>
            {!health.env?.hasMongo && <div>❌ MONGODB_URI not set</div>}
            {!health.env?.hasJwt && <div>❌ JWT_SECRET not set</div>}
          </motion.div>
        )}

        <div className="card">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-11" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-11" type="password" placeholder="••••••••" required {...field('password')} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 h-12">
              {loading
                ? <><Loader2 className="animate-spin" size={20} /> Signing in…</>
                : <>Sign In</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          🔒 Your data is securely encrypted
        </p>
      </motion.div>
    </div>
  )
}
