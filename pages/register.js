import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      })
      const data = await r.json()
      if (!r.ok) { toast.error(data.error); return }
      toast.success('OTP sent to your email!')
      router.push(`/verify-otp?userId=${data.userId}`)
    } finally { setLoading(false) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value }) )})

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">HabitFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Start your habit journey today</p>
        </div>

        <div className="card shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

          {/* Avatar upload */}
          <div className="flex justify-center mb-6">
            <label className="cursor-pointer group relative">
              <div className={`w-20 h-20 rounded-full border-4 border-dashed border-brand-300 
                              flex items-center justify-center bg-brand-50 overflow-hidden
                              group-hover:border-brand-500 transition-all`}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="text-center"><div className="text-2xl">📷</div><div className="text-xs text-brand-500 font-semibold mt-1">Photo</div></div>
                }
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">+</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
              <input className="input" type="text" placeholder="Priya Sharma" required {...f('name')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" required {...f('email')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number</label>
              <input className="input" type="tel" placeholder="+91 98765 43210" required {...f('phone')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" required {...f('password')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password" required {...f('confirm')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
              {loading ? 'Creating account…' : 'Create Account & Get OTP →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
