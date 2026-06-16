import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, ImagePlus, ArrowRight, AlertTriangle, Loader2, Sparkles } from 'lucide-react'

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

    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.email.trim()) { setError('Please enter your email'); return }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return }
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
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 30%, #fdf2f8 60%, #fff1f2 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #f0abfc, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Start your habit journey today</p>
        </div>

        {health && !health.ok && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl text-xs font-mono border bg-red-50 border-red-200 text-red-800">
            <div className="font-bold flex items-center gap-2">❌ API Error: {health.error}</div>
          </motion.div>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6">
          <div className="flex justify-center mb-8">
            <label className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 p-0.5"
                   style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef, #f97316)' }}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="text-center text-violet-400 group-hover:text-violet-500 transition-colors"><ImagePlus size={28} className="mx-auto" /></div>
                  }
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
                <span className="text-white text-lg font-bold leading-none mb-0.5">+</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                <input className="input pl-11" type="text" placeholder="Priya Sharma" required {...field('name')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                <input className="input pl-11" type="email" placeholder="you@example.com" required {...field('email')} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                <input className="input pl-11" type="tel" placeholder="+91 98765 43210" required {...field('phone')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                  <input className="input pl-11" type="password" placeholder="Min 6" required {...field('password')} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                  <input className="input pl-11" type="password" placeholder="Repeat" required {...field('confirm')} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 h-12">
              {loading
                ? <><Loader2 className="animate-spin" size={20} /> Creating…</>
                : <>Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#7c3aed' }}>Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8 font-medium">🔒 Your data is securely encrypted</p>
      </motion.div>
    </div>
  )
}
