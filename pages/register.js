import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, ImagePlus, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'
import CursorBackground from '../components/CursorBackground'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth({ ok: false, error: 'API unreachable' }))
  }, [])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())   { setError('Please enter your name'); return }
    if (!form.email.trim())  { setError('Please enter your email'); return }
    if (!form.phone.trim())  { setError('Please enter your phone number'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      })

      let data
      try {
        data = await r.json()
      } catch (jsonErr) {
        setError('Server returned an invalid response. Check logs.')
        return
      }

      if (!r.ok) {
        setError(data?.error || `Error ${r.status}`)
        return
      }

      toast.success('Account created! Redirecting to OTP…')
      router.push(`/verify-otp?userId=${data.userId}`)

    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(p => ({ ...p, [key]: e.target.value })); setError('') }
  })

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 py-12 relative overflow-hidden transition-colors duration-300">
      
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
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-500 to-brand-500 rounded-[2rem] shadow-[0_0_30px_rgba(191,0,255,0.4)] mb-6"
          >
            <span className="text-surface-950 text-4xl font-black">✦</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">Join HabitFlow</h1>
          <p className="text-accent-300 mt-3 font-bold uppercase tracking-widest text-sm">Start your habit journey today</p>
        </div>

        {health && !health.ok && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl text-xs font-mono border bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 backdrop-blur-sm">
            <div className="font-bold flex items-center gap-2">❌ API Error: {health.error}</div>
          </motion.div>
        )}

        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(191,0,255,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl font-black text-white mb-8 text-center tracking-tight relative z-10">Create your account</h2>

          <div className="flex justify-center mb-8 relative z-10">
            <label className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full border-[3px] border-dashed border-white/20 flex items-center justify-center bg-surface-950/50 overflow-hidden group-hover:border-accent-500 transition-all duration-300 shadow-inner">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="text-center text-surface-500 group-hover:text-accent-400 transition-colors"><ImagePlus size={28} className="mx-auto" /><div className="text-xs font-bold mt-1 uppercase">Photo</div></div>
                }
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(191,0,255,0.8)] border-2 border-surface-900 group-hover:scale-110 transition-transform">
                <span className="text-surface-950 text-xl font-black leading-none mb-0.5">+</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold flex items-start gap-3 relative z-10">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="text" placeholder="Priya Sharma" required {...field('name')} />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="tel" placeholder="+91 98765 43210" required {...field('phone')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                  <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="password" placeholder="Min 6" required {...field('password')} />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-surface-300 mb-2 block uppercase tracking-widest">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                  <input className="input pl-12 bg-surface-950/50 border-white/10 text-white placeholder-surface-500 text-base" type="password" placeholder="Repeat" required {...field('confirm')} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 mt-8 h-14 text-xl tracking-wide shadow-[0_0_20px_rgba(191,0,255,0.4)] hover:shadow-[0_0_30px_rgba(191,0,255,0.6)] !from-accent-500 !to-accent-400">
              {loading
                ? <><Loader2 className="animate-spin" size={24} /> Creating account…</>
                : <>Create Account <ArrowRight size={24} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-8 font-bold tracking-wide relative z-10">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-400 font-black hover:text-accent-300 drop-shadow-[0_0_5px_rgba(191,0,255,0.5)] transition-all">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-surface-500 mt-8 font-bold uppercase tracking-widest">🔒 Your data is securely encrypted</p>
      </motion.div>
    </div>
  )
}
