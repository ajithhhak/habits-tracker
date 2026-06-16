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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Cursor Background */}
      <CursorBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-500 rounded-[2rem] shadow-[0_0_30px_rgba(20,241,217,0.4)] mb-8"
          >
            <span className="text-surface-950 text-5xl font-black">✦</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-xl">HabitFlow</h1>
          <p className="text-brand-400 mt-3 text-lg font-bold tracking-widest uppercase">Neon Aurora Edition</p>
        </div>

        {health && (!health.env?.hasMongo || !health.env?.hasJwt) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl text-sm font-mono border bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 backdrop-blur-sm">
            <div className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Missing environment variables:</div>
            {!health.env?.hasMongo && <div>❌ MONGODB_URI not set</div>}
            {!health.env?.hasJwt   && <div>❌ JWT_SECRET not set</div>}
          </motion.div>
        )}

        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(20,241,217,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight relative z-10">Sign in to your space</h2>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
                <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
                <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="password" placeholder="••••••••" required {...field('password')} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 mt-8 text-xl h-14 tracking-wide">
              {loading
                ? <><Loader2 className="animate-spin" size={24} /> Authenticating…</>
                : <>Enter Space <ArrowRight size={24} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-8 font-bold tracking-wide relative z-10">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-400 font-black hover:text-brand-300 drop-shadow-[0_0_5px_rgba(20,241,217,0.5)] transition-all">Create one free</Link>
          </p>
        </div>
        
        <p className="text-center text-xs text-surface-500 mt-8 font-bold uppercase tracking-widest">
          🔒 Your data is securely encrypted
        </p>
      </motion.div>
    </div>
  )
}
