import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const router = useRouter()
  const { userId } = router.query
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  async function handleVerify(e) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: code }),
      })
      const data = await r.json()
      if (!r.ok) { toast.error(data.error); return }
      toast.success('Email verified! Welcome to HabitSync 🎉')
      router.push('/dashboard')
    } finally { setLoading(false) }
  }

  async function resend() {
    if (countdown > 0) return
    setResending(true)
    try {
      const r = await fetch('/api/auth/resend-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await r.json()
      if (!r.ok) toast.error(data.error)
      else { toast.success('New OTP sent!'); setCountdown(60) }
    } finally { setResending(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card shadow-xl text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verify your email</h2>
          <p className="text-gray-500 text-sm mb-8">
            We sent a 6-digit code to your email address.<br/>Enter it below to confirm your account.
          </p>

          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200
                             rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 
                             focus:ring-brand-200 transition-all bg-gray-50"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>
          </form>

          <div className="mt-6">
            {countdown > 0
              ? <p className="text-gray-400 text-sm">Resend OTP in <span className="font-bold text-brand-600">{countdown}s</span></p>
              : <button onClick={resend} disabled={resending}
                  className="text-brand-600 font-semibold text-sm hover:underline">
                  {resending ? 'Sending…' : "Didn't receive it? Resend OTP"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
