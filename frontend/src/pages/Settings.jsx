import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Globe, Shield, Save, LogOut, Loader2, Sparkles, CheckCircle } from 'lucide-react'
import { getUserProfile, updateAccountProfile } from '../api'
import { useLanguage } from '../App'

export default function Settings() {
  const { t, lang, setLang } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile()
        setProfile(data)
      } catch (err) {
        console.error("Profile fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    setSaving(true)
    setMessage('')
    try {
      await updateAccountProfile({
        full_name: profile.full_name,
        email: profile.email
      })
      setMessage(t.success || 'Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error("Update error:", err)
      setMessage(t.error || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
       <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
       <p className="mt-4 text-dark-400 font-bold uppercase tracking-widest text-xs">Synchronizing Security Context...</p>
     </div>
  )

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'ta', label: 'தமிழ்' },
    { id: 'hi', label: 'हिन्दी' }
  ]

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-5 mb-12">
        <div className="p-4 rounded-[2rem] bg-primary-500/10 text-primary-500 shadow-2xl shadow-primary-500/10 border border-primary-500/20">
            <Globe className="w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">{t.settings}</h1>
      </div>

      <div className="space-y-10">
        {/* Language Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <Globe className="w-32 h-32 text-primary-500" />
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-black text-white text-2xl uppercase tracking-tighter">{t.appLanguage}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {languages.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex items-center justify-between p-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all duration-500 active:scale-95 border-2
                           ${lang === l.id 
                            ? 'bg-primary-500 text-dark-950 border-primary-500 shadow-3xl shadow-primary-500/30' 
                            : 'bg-white/[0.02] text-dark-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white hover:scale-105'}`}
              >
                {l.label}
                {lang === l.id && <CheckCircle className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
            <User className="w-32 h-32 text-secondary-500" />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-3xl bg-secondary-400/10 text-secondary-400 shadow-2xl shadow-secondary-400/5">
                    <User className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="font-black text-white text-2xl uppercase tracking-tighter leading-none">{t.accInfo}</h3>
                   <p className="text-[10px] text-dark-500 font-bold uppercase tracking-[0.3em] mt-2">{t.manage}</p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-600 uppercase tracking-[0.2em] ml-2">{t.fullName}</label>
                <input 
                  className="w-full bg-dark-950/60 border border-white/5 rounded-[1.8rem] p-6 text-sm font-black uppercase tracking-widest text-white outline-none focus:border-primary-500/50 shadow-inner hover:bg-dark-900 transition-colors" 
                  value={profile?.full_name || ''} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  placeholder={t.yourName}
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-600 uppercase tracking-[0.2em] ml-2">{t.email}</label>
                <input 
                  className="w-full bg-dark-950/40 border border-white/5 rounded-[1.8rem] p-6 text-sm font-black uppercase tracking-widest text-white italic opacity-50 outline-none" 
                  value={profile?.email || (t.guestUser || 'Guest User')} 
                  readOnly
                />
            </div>
          </div>

          {message && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                         className="mb-8 p-6 rounded-[2.5rem] bg-green-500/5 border border-green-500/10 text-green-400 font-black text-center uppercase tracking-widest text-[10px] italic shadow-2xl shadow-green-500/5">
               {message}
             </motion.div>
          )}

          <button 
            onClick={handleUpdate} 
            disabled={saving}
            className="w-full btn-primary py-6 flex items-center justify-center gap-4 shadow-3xl shadow-primary-500/30 active:scale-95 transition-transform"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span className="font-black uppercase tracking-[0.2em] text-[11px]">{t.saveDetails}</span>
          </button>
        </motion.div>

        {/* System & Session */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 glass p-10 flex items-center justify-between border-dark-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                    <Shield className="w-24 h-24 text-secondary-400" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 rounded-3xl bg-secondary-400/5 text-secondary-400 border border-secondary-400/10">
                        <Shield className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase tracking-tighter italic">Clinical Authorization</p>
                        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-[0.2em] mt-2">HMIS Engine v1.2.4</p>
                    </div>
                </div>
             </div>
             
             <button 
               onClick={handleLogout}
               className="glass p-10 flex items-center justify-center gap-4 border-red-500/10 hover:bg-red-500/5 transition-all group shrink-0 active:scale-95"
             >
                <LogOut className="w-6 h-6 text-red-500 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                <span className="font-black text-red-500 uppercase tracking-[0.2em] text-[11px] italic">{t.logout}</span>
             </button>
        </motion.div>
      </div>

      <div className="mt-16 text-center opacity-20">
         <p className="text-dark-600 font-bold uppercase tracking-[0.5em] text-[8px] flex items-center justify-center gap-4 italic leading-loose">
            Precision Biomedical Engine v1.0.0.Alpha <br/>
            Authorization: Clinical HMIS-28492
         </p>
      </div>
    </div>
  )
}
