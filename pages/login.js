import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      let data
      try { data = await r.json() } catch { setError('Server error — please try again'); return }

      if (!r.ok) {
        if (data.userId) {
          toast('Please verify your email first')
          router.push(`/verify-otp?userId=${data.userId}`)
          return
        }
        setError(data.error || 'Login failed')
        return
      }
      toast.success(`Welcome back, ${data.user.name}!`)
      router.push('/dashboard')
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError('') }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-black">✦</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">HabitFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Your daily habit companion</p>
        </div>

        <div className="card shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" required {...field('email')} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
              <input className="input" type="password" placeholder="••••••••" required {...field('password')} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full text-center mt-2 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
                : 'Sign In →'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">🔒 Your data is encrypted and private</p>
      </div>
    </div>
  )
}
