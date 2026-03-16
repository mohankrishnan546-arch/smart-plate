import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Activity, Calendar, Shield, ArrowRight, Loader2, Heart, Sparkles, UserCheck } from 'lucide-react'
import { loginGuest } from '../api'

export default function Onboarding() {
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Male',
    age: '',
    medical_history: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.full_name || !formData.age) {
        return setError("Please fill in at least your name and age.")
    }
    setLoading(true)
    setError('')
    try {
      const data = await loginGuest({
        full_name: formData.full_name,
        gender: formData.gender,
        age: parseInt(formData.age),
        medical_history: formData.medical_history
      })
      localStorage.setItem('token', data.access_token)
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      setError('Connection failed. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-950 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-400/10 rounded-full blur-[120px] -ml-80 -mb-80 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 w-full max-w-xl relative z-10 shadow-2xl border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-400 to-primary-500 opacity-50" />
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 p-[1px] shadow-2xl group transition-transform hover:scale-105">
            <div className="w-full h-full bg-dark-900 rounded-[23px] flex items-center justify-center overflow-hidden">
                <Heart className="w-10 h-10 text-primary-500 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Nutri<span className="text-primary-500">Vision</span> AI
          </h1>
          <p className="text-dark-400 mt-2 font-medium uppercase tracking-[3px] text-[10px]">Medical Intelligence Portal</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-500/20">
                Onboarding System
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <User className="w-3 h-3 text-primary-500" />
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Full Name / ID</label>
              </div>
              <input 
                name="full_name" 
                className="input-glass w-full text-sm font-bold" 
                placeholder="Ex: Vamshi Krishna" 
                value={formData.full_name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <Calendar className="w-3 h-3 text-primary-500" />
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Your Age</label>
              </div>
              <input 
                name="age" 
                type="number"
                className="input-glass w-full text-sm font-bold" 
                placeholder="Ex: 24" 
                value={formData.age} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <UserCheck className="w-3 h-3 text-primary-500" />
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Select Gender</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                             ${formData.gender === g ? 'bg-primary-500 text-dark-900 shadow-xl shadow-primary-500/20' : 'bg-white/5 text-dark-400 border border-white/5 hover:bg-white/10'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Activity className="w-3 h-3 text-primary-500" />
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Medical History / Conditions</label>
            </div>
            <textarea 
              name="medical_history" 
              className="input-glass w-full text-sm min-h-[100px] py-4 leading-relaxed" 
              placeholder="Ex: Hypertension, Diabetes, or None..." 
              value={formData.medical_history} 
              onChange={handleChange} 
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
              >
                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-sm font-black uppercase tracking-[3px]">Initialize Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secured</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Real-time AI</span>
           </div>
           <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Premium</span>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
