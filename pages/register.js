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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4 py-12 relative overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Cursor Background */}
      <CursorBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >

        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl shadow-xl shadow-brand-500/30 mb-4"
          >
            <span className="text-white text-3xl font-black">✦</span>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">Join HabitFlow</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 font-medium">Start your habit journey today</p>
        </div>

        {health && !health.ok && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl text-xs font-mono border bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 backdrop-blur-sm">
            <div className="font-bold flex items-center gap-2">❌ API Error: {health.error}</div>
          </motion.div>
        )}

        <div className="card glass relative">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6 text-center">Create your account</h2>

          <div className="flex justify-center mb-8">
            <label className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-surface-300 dark:border-surface-700 flex items-center justify-center bg-surface-50/50 dark:bg-surface-800/50 overflow-hidden group-hover:border-brand-500 dark:group-hover:border-brand-400 transition-all duration-300">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="text-center text-surface-400 group-hover:text-brand-500 transition-colors"><ImagePlus size={28} className="mx-auto" /><div className="text-xs font-semibold mt-1">Photo</div></div>
                }
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-900 group-hover:scale-110 transition-transform">
                <span className="text-white text-lg font-bold leading-none mb-0.5">+</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input className="input pl-11" type="text" placeholder="Priya Sharma" required {...field('name')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input className="input pl-11" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input className="input pl-11" type="tel" placeholder="+91 98765 43210" required {...field('phone')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                  <input className="input pl-11" type="password" placeholder="Min 6 chars" required {...field('password')} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 block">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                  <input className="input pl-11" type="password" placeholder="Repeat" required {...field('confirm')} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 h-12 text-base">
              {loading
                ? <><Loader2 className="animate-spin" size={20} /> Creating account…</>
                : <>Create Account <ArrowRight size={20} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-surface-400 dark:text-surface-500 mt-8 font-medium">🔒 Your data is securely encrypted</p>
      </motion.div>
    </div>
  )
}
