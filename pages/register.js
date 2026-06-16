import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [health, setHealth] = useState(null)

  // Check API health on load
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
        setError('Server returned an invalid response. Check Vercel logs.')
        return
      }

      if (!r.ok) {
        setError(data?.error || `Error ${r.status} — check Vercel logs`)
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-black">✦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">HabitFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Start your habit journey today</p>
        </div>

        {/* Health check panel */}
        {health && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-mono border ${health.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="font-bold mb-1">{health.ok ? '✅ API Connected' : '❌ API Error'}</div>
            {health.env && (
              <div className="space-y-0.5">
                <div>{health.env.hasMongo ? '✅' : '❌'} MONGODB_URI {health.env.hasMongo ? 'set' : 'MISSING — add in Vercel'}</div>
                <div>{health.env.hasJwt ? '✅' : '❌'} JWT_SECRET {health.env.hasJwt ? 'set' : 'MISSING — add in Vercel'}</div>
                <div>{health.env.hasEmail ? '✅' : '❌'} EMAIL_USER {health.env.hasEmail ? 'set' : 'not set (OTP emails wont send)'}</div>
              </div>
            )}
          </div>
        )}

        <div className="card shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <label className="cursor-pointer group relative">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-brand-300 flex items-center justify-center bg-brand-50 overflow-hidden group-hover:border-brand-500 transition-all">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="text-center"><div className="text-2xl">📷</div><div className="text-xs text-brand-500 font-semibold mt-1">Photo</div></div>
                }
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name *</label>
              <input className="input" type="text" placeholder="Priya Sharma" required {...field('name')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Email address *</label>
              <input className="input" type="email" placeholder="you@example.com" required {...field('email')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number *</label>
              <input className="input" type="tel" placeholder="+91 98765 43210" required {...field('phone')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Password *</label>
              <input className="input" type="password" placeholder="Min 6 characters" required {...field('password')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Confirm Password *</label>
              <input className="input" type="password" placeholder="Repeat password" required {...field('confirm')} />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
                : 'Create Account & Get OTP →'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">🔒 Your data is encrypted and private</p>
      </div>
    </div>
  )
}
