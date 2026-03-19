import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Activity, Shield, ArrowRight, Loader2, Heart, Sparkles, 
  Mail, Lock, UserPlus, CheckCircle2
} from 'lucide-react'
import { login, register } from '../api'
import { useLanguage } from '../App'

const floatingFoods = ['🍎', '🥑', '🥦', '🥕', '🥗', '🍗', '🥛', '🍇', '🍋', '🥬']

export default function Login() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('signin') // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (tab === 'signin') {
        const data = await login({
          username: formData.username,
          password: formData.password
        })
        localStorage.setItem('token', data.access_token)
        window.location.href = '/'
      } else {
        // SIGNUP
        const data = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        })
        localStorage.setItem('token', data.access_token)
        window.location.href = '/'
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Galaxy Nebula Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-secondary-400/5 blur-[100px] rounded-full" />
      </div>

      {/* Stars & Monsoon Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                    x: Math.random() * 2000, 
                    y: Math.random() * 1000,
                    opacity: Math.random()
                }}
                animate={{ 
                    y: [null, 1200],
                    opacity: [null, 0.4, 0]
                }}
                transition={{ 
                    duration: 3 + Math.random() * 5, 
                    repeat: Infinity, 
                    delay: Math.random() * 5,
                    ease: "linear"
                }}
                className={`absolute ${i % 3 === 0 ? 'w-[1px] h-12 bg-gradient-to-b from-primary-500/50 to-transparent' : 'w-1 h-1 bg-white rounded-full'}`}
              />
          ))}
          
          {[...Array(30)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ 
                    x: Math.random() * 2000, 
                    y: Math.random() * 1000,
                }}
                animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 1, 0.2]
                }}
                transition={{ 
                    duration: 2 + Math.random() * 3, 
                    repeat: Infinity,
                    delay: Math.random() * 2
                }}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
              />
          ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass p-12 w-full max-w-lg relative z-10 border-white/5 backdrop-blur-[60px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-12 relative z-10">
          <motion.div 
            animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
            }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
            className="w-24 h-24 rounded-full mx-auto mb-8 bg-black/40 flex items-center justify-center border-2 border-primary-500/40 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden"
          >
                <img src="/app_logo.jpg" alt="Smart AI" className="w-full h-full object-cover scale-[1.55]" />
          </motion.div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">Smart <span className="text-primary-500">Plate</span></h1>
          <p className="text-[8px] text-dark-500 font-bold uppercase tracking-[0.4em] opacity-60">Food Intelligence Core</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-dark-900/50 p-1.5 rounded-2xl mb-8 border border-white/5 shadow-inner">
            {['signin', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                           ${tab === t ? 'bg-primary-500 text-dark-950 shadow-xl' : 'text-dark-400 hover:text-white'}`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {tab === 'signup' && (
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                      <input name="full_name" className="input-glass w-full pl-12 py-4 bg-white/5 text-sm" placeholder="John Doe" value={formData.full_name} onChange={handleChange} required />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">{tab === 'signin' ? 'Username or Email' : 'Username'}</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                   <input name="username" className="input-glass w-full pl-12 py-4 bg-white/5 text-sm" placeholder="john_doe" value={formData.username} onChange={handleChange} required />
                </div>
              </div>

              {tab === 'signup' && (
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                      <input name="email" type="email" className="input-glass w-full pl-12 py-4 bg-white/5 text-sm" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                   <input name="password" type="password" className="input-glass w-full pl-12 py-4 bg-white/5 text-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-[10px] text-red-400 font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
          {success && <p className="text-[10px] text-green-400 font-bold bg-green-500/10 p-4 rounded-xl border border-green-500/20">{success}</p>}

          <button type="submit" disabled={loading} className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 group transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>{tab === 'signin' ? 'Unlock Dashboard' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 opacity-50">
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-dark-500 italic">
               <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-primary-500" /> AES-256 Auth</div>
               <div className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-secondary-400" /> v1.2.0-stable</div>
            </div>
        </div>
      </motion.div>
    </div>
  )
}
