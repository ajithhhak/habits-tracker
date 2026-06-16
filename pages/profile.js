import { useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser, loading } = useAuth()
  const [form, setForm] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile') // 'profile' | 'password'
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const fileRef = useRef()

  // Init form from user
  if (user && !form) {
    setForm({ name: user.name || '', phone: user.phone || '', timezone: user.timezone || 'Asia/Kolkata' })
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone)
      fd.append('timezone', form.timezone)
      if (avatarFile) fd.append('avatar', avatarFile)

      const r = await fetch('/api/profile/update', { method: 'PUT', body: fd })
      const data = await r.json()
      if (!r.ok) { toast.error(data.error); return }
      setUser(data.user)
      toast.success('Profile updated!')
      setAvatarFile(null)
    } finally { setSaving(false) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.next.length < 6) { toast.error('Password must be 6+ characters'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/profile/update?action=change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await r.json()
      if (!r.ok) toast.error(data.error)
      else { toast.success('Password changed!'); setPwForm({ current: '', next: '', confirm: '' }) }
    } finally { setSaving(false) }
  }

  if (loading || !user || !form) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>

  const displayAvatar = avatarPreview || user.avatar
  const initials = user.name?.[0]?.toUpperCase() || '?'

  return (
    <Layout user={user}>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account information</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '🔥', label: 'Current Streak', val: `${user.streak ?? 0}d` },
            { icon: '⭐', label: 'Best Streak',    val: `${user.longestStreak ?? 0}d` },
            { icon: '📅', label: 'Member Since',   val: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '—' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-extrabold text-xl text-gray-900">{s.val}</div>
              <div className="text-xs text-gray-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {[['profile','👤 Profile'],['password','🔒 Password']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                                ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-brand-100 overflow-hidden border-4 border-brand-200 shadow-md">
                  {displayAvatar
                    ? <img src={displayAvatar} alt={user.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-brand-700 text-3xl font-extrabold">{initials}</div>
                  }
                </div>
                <button onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center
                                   shadow-md hover:bg-brand-700 transition-colors">
                  <span className="text-white text-sm">📷</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-bold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
                <div className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full
                                 ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {user.isVerified ? '✓ Verified' : '⚠ Unverified'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
                <input className="input" type="text" value={form.name}
                       onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
                <input className="input bg-gray-50 cursor-not-allowed" type="email" value={user.email} disabled />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number</label>
                <input className="input" type="tel" value={form.phone}
                       onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Timezone</label>
                <select className="input" value={form.timezone}
                        onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                  <option value="Asia/Kolkata">India (IST) — UTC+5:30</option>
                  <option value="America/New_York">New York — UTC-5</option>
                  <option value="America/Los_Angeles">Los Angeles — UTC-8</option>
                  <option value="Europe/London">London — UTC+0</option>
                  <option value="Europe/Paris">Paris — UTC+1</option>
                  <option value="Asia/Dubai">Dubai — UTC+4</option>
                  <option value="Asia/Singapore">Singapore — UTC+8</option>
                </select>
              </div>
              {avatarFile && (
                <div className="text-xs text-brand-600 font-medium bg-brand-50 px-3 py-2 rounded-lg">
                  📷 New photo selected: {avatarFile.name}
                </div>
              )}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                ['current', 'Current Password', pwForm.current],
                ['next',    'New Password',     pwForm.next],
                ['confirm', 'Confirm New Password', pwForm.confirm],
              ].map(([key, label, val]) => (
                <div key={key}>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">{label}</label>
                  <input className="input" type="password" value={val} required
                         onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
