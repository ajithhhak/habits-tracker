import { useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Camera, Flame, Star, CalendarDays, CheckCircle2, AlertTriangle, Loader2, Save, Mail, Phone, MapPin } from 'lucide-react'

export default function Profile() {
  const { user, setUser, loading } = useAuth()
  const [form, setForm] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile') // 'profile' | 'password'
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const fileRef = useRef()

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

  if (loading || !user || !form) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-surface-400">
          <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
          <p className="font-medium animate-pulse">Loading profile...</p>
        </div>
      </Layout>
    )
  }

  const displayAvatar = avatarPreview || user.avatar
  const initials = user.name?.[0]?.toUpperCase() || '?'

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  return (
    <Layout user={user}>
      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
        <motion.div variants={{ hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } }}>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white flex items-center gap-3">
            <User className="text-brand-500" size={32} />
            My Profile
          </h1>
          <p className="text-surface-500 dark:text-surface-400 font-medium mt-1">Manage your account settings and preferences</p>
        </motion.div>

        {/* Stats summary */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Current Streak', val: `${user.streak ?? 0}d` },
            { icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Best Streak',    val: `${user.longestStreak ?? 0}d` },
            { icon: CalendarDays, color: 'text-brand-500', bg: 'bg-brand-500/10 border-brand-500/20', label: 'Member Since',   val: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '—' },
          ].map(s => (
            <div key={s.label} className={`card ${s.bg} border backdrop-blur-md text-center py-5 transition-transform hover:-translate-y-1 hover:shadow-lg`}>
              <s.icon className={`mx-auto mb-2 ${s.color}`} size={28} />
              <div className="font-black text-2xl text-surface-900 dark:text-white">{s.val}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex gap-2 bg-surface-200/50 dark:bg-surface-800/50 p-1.5 rounded-2xl backdrop-blur-md w-full md:w-fit">
          {[
            { id: 'profile', icon: User, label: 'Profile Settings' },
            { id: 'password', icon: Lock, label: 'Security' }
          ].map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                      className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors w-full md:w-auto
                                  ${active ? 'text-brand-700 dark:text-brand-300' : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'}`}>
                {active && (
                  <motion.div layoutId="profileTab" className="absolute inset-0 bg-white dark:bg-surface-700 rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2"><t.icon size={16} /> {t.label}</span>
              </button>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="card glass">
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="flex flex-col items-center w-full md:w-1/3 border-b md:border-b-0 md:border-r border-surface-200 dark:border-surface-700/50 pb-8 md:pb-0 md:pr-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-300 to-brand-500 p-1 shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-surface-900 border-2 border-white dark:border-surface-800">
                        {displayAvatar
                          ? <img src={displayAvatar} alt={user.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-brand-600 dark:text-brand-400 text-4xl font-extrabold">{initials}</div>
                        }
                      </div>
                    </div>
                    <button onClick={() => fileRef.current?.click()}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center border-4 border-white dark:border-surface-900
                                       shadow-lg hover:bg-brand-500 hover:scale-110 transition-all text-white group-hover:animate-pulse">
                      <Camera size={18} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-extrabold text-lg text-surface-900 dark:text-white tracking-tight">{user.name}</div>
                    <div className="text-sm font-medium text-surface-500 dark:text-surface-400">{user.email}</div>
                    <div className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1 rounded-full border
                                     ${user.isVerified ? 'bg-green-50/50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' : 'bg-yellow-50/50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-400'}`}>
                      {user.isVerified ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                      {user.isVerified ? 'Verified Account' : 'Unverified'}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="w-full md:w-2/3">
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <label className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                        <input className="input pl-11" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                        <input className="input pl-11 bg-surface-100 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 cursor-not-allowed border-dashed" type="email" value={user.email} disabled />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                        <input className="input pl-11" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 block">Timezone</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                        <select className="input pl-11 appearance-none" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                          <option value="Asia/Kolkata">India (IST) — UTC+5:30</option>
                          <option value="America/New_York">New York — UTC-5</option>
                          <option value="America/Los_Angeles">Los Angeles — UTC-8</option>
                          <option value="Europe/London">London — UTC+0</option>
                          <option value="Europe/Paris">Paris — UTC+1</option>
                          <option value="Asia/Dubai">Dubai — UTC+4</option>
                          <option value="Asia/Singapore">Singapore — UTC+8</option>
                        </select>
                      </div>
                    </div>
                    
                    {avatarFile && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-brand-700 dark:text-brand-300 font-bold bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800/50 px-4 py-3 rounded-xl flex items-center gap-2">
                        <Camera size={14} /> New photo selected: {avatarFile.name}
                      </motion.div>
                    )}
                    
                    <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 h-12 text-base shadow-brand-500/30">
                      {saving ? <><Loader2 className="animate-spin" size={18}/> Saving…</> : <><Save size={18}/> Save Changes</>}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'password' && (
            <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="card glass">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 mb-3">
                    <Lock className="text-surface-600 dark:text-surface-300" size={24} />
                  </div>
                  <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">Change Password</h2>
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    ['current', 'Current Password', pwForm.current],
                    ['next',    'New Password',     pwForm.next],
                    ['confirm', 'Confirm New Password', pwForm.confirm],
                  ].map(([key, label, val]) => (
                    <div key={key}>
                      <label className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 block">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                        <input className="input pl-11" type="password" value={val} placeholder="••••••••" required onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 mt-6 h-12 text-base shadow-brand-500/30">
                    {saving ? <><Loader2 className="animate-spin" size={18}/> Updating…</> : <><Save size={18}/> Update Password</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  )
}
