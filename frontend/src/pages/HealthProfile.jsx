import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, AlertTriangle, CheckCircle, Activity, User, Save, Loader2 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { getUserProfile, updateHealthProfile } from '../api'

const conditionOptions = [
  { id: 'Diabetes', label: 'Diabetes', icon: '🩸' },
  { id: 'Hypertension', label: 'Hypertension', icon: '❤️‍🩹' },
  { id: 'Heart Disease', label: 'Heart Disease', icon: '🫀' },
  { id: 'Kidney Disease', label: 'Kidney Disease', icon: '🫘' },
  { id: 'Obesity', label: 'Obesity', icon: '⚖️' },
  { id: 'Celiac Disease', label: 'Celiac Disease', icon: '🌾' },
  { id: 'Anemia', label: 'Anemia', icon: '🩸' },
  { id: 'General Health', label: 'General Health', icon: '🥗' },
]

const riskData = [
  { nutrient: 'Calories', value: 65 },
  { nutrient: 'Sodium', value: 82 },
  { nutrient: 'Sugar', value: 45 },
  { nutrient: 'Fat', value: 55 },
  { nutrient: 'Cholesterol', value: 30 },
  { nutrient: 'Fiber', value: 70 },
]

export default function HealthProfile() {
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

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await updateHealthProfile({
        age: profile.age,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        health_conditions: profile.health_conditions
      })
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error("Profile update error:", err)
      setMessage('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const toggleCondition = (id) => {
    const current = profile.health_conditions || []
    const updated = current.includes(id) 
      ? current.filter(c => c !== id) 
      : [...current, id]
    setProfile({ ...profile, health_conditions: updated })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="mt-4 text-dark-400 font-bold uppercase tracking-widest text-xs">Accessing Medical Records...</p>
    </div>
  )

  const bmi = (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
  const riskScore = 35 // Placeholder logic

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white leading-none">Health <span className="gradient-text">DNA</span></h1>
          <p className="text-dark-400 mt-2 font-medium">Manage clinical conditions and biometric markers</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-8 shadow-xl shadow-primary-500/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Sync Profile'}</span>
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-center">
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile & Risk */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-secondary-400/20 flex items-center justify-center border border-primary-500/20 group-hover:rotate-6 transition-transform">
                <User className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <h3 className="font-black text-white text-xl uppercase tracking-tighter">Biometrics</h3>
                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Core Health Markers</p>
              </div>
            </div>
            {[
              ['Age', profile.age, v => setProfile({...profile, age: +v})],
              ['Weight (kg)', profile.weight_kg, v => setProfile({...profile, weight_kg: +v})],
              ['Height (cm)', profile.height_cm, v => setProfile({...profile, height_cm: +v})]
            ].map(([label, val, fn]) => (
              <div key={label} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-3 hover:bg-white/[0.06] transition-colors">
                <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{label}</span>
                <input type="number" value={val} onChange={e => fn(e.target.value)}
                       className="w-20 text-right bg-transparent text-white font-black text-lg outline-none" />
              </div>
            ))}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 mt-6">
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Calculated BMI</span>
              <span className="text-2xl font-black text-primary-400">{bmi}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="glass p-8 text-center relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] opacity-5">
                <Shield className="w-32 h-32" />
            </div>
            <h3 className="font-black text-white text-xl uppercase tracking-tighter mb-6 flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" /> Vulnerability Score
            </h3>
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="12"
                        strokeDasharray={`${riskScore*3.14} ${314-riskScore*3.14}`} strokeLinecap="round" 
                        style={{ transition: 'stroke-dasharray 2s ease-in-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{riskScore}</span>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Safety INDEX</span>
              </div>
            </div>
            <p className="text-green-400 font-black uppercase tracking-widest text-xs py-2 px-6 bg-green-500/10 rounded-full inline-block">Low Risk Profile</p>
          </motion.div>
        </div>

        {/* Conditions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <Heart className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-black text-white text-xl uppercase tracking-tighter leading-none">Clinical Conditions</h3>
                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-1">Check all that apply</p>
            </div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[500px] scrollbar-hide">
            {conditionOptions.map(cond => {
              const isActive = (profile.health_conditions || []).includes(cond.id)
              return (
                <button key={cond.id} onClick={() => toggleCondition(cond.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-300
                    ${isActive ? 'bg-primary-500/10 border-2 border-primary-500/30 shadow-xl shadow-primary-500/5' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.06]'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{cond.icon}</span>
                    <span className={`font-bold transition-colors ${isActive ? 'text-primary-400' : 'text-dark-300'}`}>{cond.label}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
                    ${isActive ? 'bg-primary-500 text-dark-900 border-transparent' : 'border-2 border-dark-600'}`}>
                    {isActive && <CheckCircle className="w-4 h-4" />}
                  </div>
                </button>
              )
            })}
          </div>
          {profile.health_conditions?.length > 0 && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="mt-6 p-5 rounded-3xl bg-amber-500/5 border-2 border-amber-500/20 border-dashed">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-500">Clinical Impact Detected</span>
              </div>
              <p className="text-xs text-dark-400 font-medium leading-relaxed italic">
                 AI analysis is active for: {profile.health_conditions.join(', ')}. 
                 Food scans will apply medical-specific safety constraints.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-black text-white text-xl uppercase tracking-tighter leading-none">Nutrition Map</h3>
                    <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-1">Biometric Breakdown</p>
                </div>
            </div>
            
            <div className="relative h-[320px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                        <PolarAngleAxis dataKey="nutrient" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                        <Radar name="Intake" dataKey="value" stroke="#00f2fe" fill="#00f2fe" fillOpacity={0.2} strokeWidth={3} />
                    </RadarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                    <Activity className="w-40 h-40 text-primary-500" />
                </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark-500 mb-3">Health Status Summary</p>
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
                     <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-dark-200">System is optimized for current metabolic load.</p>
              </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
