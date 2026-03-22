import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Activity, Target, Shield, Save, 
  Loader2, CheckCircle, AlertCircle, Heart
} from 'lucide-react'
import { getUserProfile, updateHealthProfile } from '../api'
import { useLanguage } from '../App'

export default function HealthProfile() {
  const { t } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
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
    setUpdating(true)
    setMessage('')
    try {
      await updateHealthProfile(profile)
      setMessage(t.success || 'Health MATRIX synchronized successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error("Update error:", err)
      setMessage(t.error || 'Biological synchronization failed.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="mt-4 text-dark-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">{t.gatheringPoints}</p>
    </div>
  )

  const conditionOptions = [
    { id: 'General Health', label: t.generalHealth },
    { id: 'Diabetes', label: t.Diabetes },
    { id: 'Hypertension', label: t.Hypertension },
    { id: 'Heart Disease', label: t.HeartDisease },
    { id: 'Kidney Disease', label: t.kidneyDisease },
    { id: 'Anemia', label: t.anemia },
    { id: 'Celiac Disease', label: t.celiacDisease },
  ]

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-6 mb-16">
        <div className="p-5 rounded-[2.5rem] bg-primary-500/10 border border-primary-500/20 text-primary-500 shadow-2xl shadow-primary-500/10">
            <Shield className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase mb-4">
             Health <span className="gradient-text">MATRIX</span> 🔗
          </h1>
          <p className="text-dark-400 font-bold italic tracking-wide">{t.aiIntelligence} biological profile management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Biometrics */}
          <section className="glass p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Activity className="w-48 h-48 text-primary-500" />
            </div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.biometrics}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.gender}</p>
                <div className="flex gap-4">
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      onClick={() => setProfile({...profile, gender: g})}
                      className={`flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all
                        ${profile.gender === g 
                          ? 'bg-primary-500 text-dark-950 shadow-2xl shadow-primary-500/20' 
                          : 'bg-white/5 border border-white/5 text-dark-500 hover:text-white'}`}
                    >
                      {g === 'Male' ? t.Male : t.Female}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.ageYrs}</p>
                <input 
                  type="number"
                  className="w-full bg-dark-950/60 border border-white/5 rounded-3xl p-6 text-xl font-black text-white outline-none focus:border-primary-500/50" 
                  value={profile.age || ''} 
                  onChange={e => setProfile({...profile, age: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.weightKg}</p>
                <input 
                  type="number"
                  className="w-full bg-dark-950/60 border border-white/5 rounded-3xl p-6 text-xl font-black text-white outline-none focus:border-primary-500/50 shadow-inner group-hover:bg-dark-900 transition-colors" 
                  value={profile.weight_kg || ''} 
                  onChange={e => setProfile({...profile, weight_kg: e.target.value})} 
                />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.heightCm}</p>
                <input 
                  type="number"
                  className="w-full bg-dark-950/60 border border-white/5 rounded-3xl p-6 text-xl font-black text-white outline-none focus:border-primary-500/50 shadow-inner group-hover:bg-dark-900 transition-colors" 
                  value={profile.height_cm || ''} 
                  onChange={e => setProfile({...profile, height_cm: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.activityLevel}</p>
                <select 
                  className="w-full bg-dark-950/60 border border-white/5 rounded-3xl p-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary-500/50"
                  value={profile.activity_level}
                  onChange={e => setProfile({...profile, activity_level: e.target.value})}
                >
                   <option value="Sedentary">{t.sedentary}</option>
                   <option value="Active">{t.active}</option>
                </select>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-2">{t.goals}</p>
                <select 
                  className="w-full bg-dark-950/60 border border-white/5 rounded-3xl p-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary-500/50"
                  value={profile.goal}
                  onChange={e => setProfile({...profile, goal: e.target.value})}
                >
                   <option value="Lose Weight">{t.loseWeight}</option>
                   <option value="Maintain">{t.maintain}</option>
                   <option value="Gain Muscle">{t.gainMuscle}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Conditions */}
          <section className="glass p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Heart className="w-48 h-48 text-secondary-400" />
            </div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 rounded-2xl bg-secondary-400/10 text-secondary-400">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.healthConditions}</h3>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              {conditionOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setProfile({...profile, medical_history: opt.id})}
                  className={`px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 transform active:scale-95 border-2
                    ${profile.medical_history === opt.id 
                      ? 'bg-secondary-400 text-dark-950 border-secondary-400 shadow-3xl shadow-secondary-400/20' 
                      : 'bg-white/[0.02] border-white/5 text-dark-400 hover:bg-white/5'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
           <div className="glass p-10 bg-primary-500/5 border-primary-500/10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500">{t.syncProfile}</span>
              </div>
              <h4 className="text-white font-black text-lg mb-6 leading-tight uppercase tracking-tighter italic">Maintain biological integrity through periodic updates.</h4>
              
              {message && (
                <div className="mb-8 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black text-center uppercase tracking-widest italic animate-bounce">
                   {message}
                </div>
              )}

              <button 
                onClick={handleUpdate} 
                disabled={updating}
                className="w-full btn-primary py-6 rounded-3xl flex items-center justify-center gap-4 shadow-3xl shadow-primary-500/30 active:scale-95 transition-transform"
              >
                {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                <span className="font-black uppercase tracking-widest text-xs">{t.saveDetails}</span>
              </button>
           </div>

           <div className="glass p-8 border-dashed bg-dark-950/40">
                <div className="flex items-center gap-4 text-dark-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed italic uppercase tracking-wider">{t.disclaimerNote}</p>
                </div>
           </div>
        </div>
      </div>
    </div>
  )
}
