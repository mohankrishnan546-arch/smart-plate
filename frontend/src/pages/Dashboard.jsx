import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Drumstick, Wheat, Droplets, TrendingUp, Activity, Zap, Target, ArrowUpRight, Calendar, Sparkles, Loader2, UserCircle, Save
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getDailySummary, getMealHistory, getUserProfile, updateHealthProfile } from '../api'
import { useLanguage } from '../App'

const macroColors = ['#00f2fe', '#4facfe', '#f59e0b', '#10b981']

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Dashboard() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBioModal, setShowBioModal] = useState(false)

  const [saving, setSaving] = useState(false)
  const [bioForm, setBioForm] = useState({
    age: '', weight_kg: '', height_cm: '', goal: 'Maintain', health_conditions: []
  })
  const targetCalories = 2000
  const targetProtein = 50
  const targetCarbs = 300
  const targetFat = 65

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sumData, histData, profData] = await Promise.all([
          getDailySummary(lang),
          getMealHistory(7),
          getUserProfile()
        ])
        setSummary(sumData)
        setHistory(histData)
        setProfile(profData)
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lang])

  useEffect(() => {
    if (profile) {
      setBioForm({
        age: profile.age || '',
        weight_kg: profile.weight_kg || '',
        height_cm: profile.height_cm || '',
        goal: profile.goal || 'Maintain',
        health_conditions: profile.health_conditions || []
      })
    }
  }, [profile])

  const handleBioSave = async () => {
    setSaving(true)
    try {
      await updateHealthProfile({
        age: parseInt(bioForm.age) || 0,
        weight_kg: parseFloat(bioForm.weight_kg) || 0,
        height_cm: parseFloat(bioForm.height_cm) || 0,
        goal: bioForm.goal,
        health_conditions: bioForm.health_conditions
      })
      const updatedProfile = await getUserProfile()
      setProfile(updatedProfile)
      setShowBioModal(false)
    } catch (err) {
      console.error("Bio update error:", err)
    } finally {
      setSaving(false)
    }
  }

  const todayCalories = summary?.total_calories || 0
  const todayProtein = summary?.total_protein || 0
  const todayCarbs = summary?.total_carbs || 0
  const todayFat = summary?.total_fat || 0

  const macroData = [
    { name: t.protein, value: todayProtein * 4 },
    { name: t.carbs, value: todayCarbs * 4 },
    { name: t.fat, value: todayFat * 9 },
  ].filter(d => d.value > 0)

  const pieData = macroData.length > 0 ? macroData : [{ name: 'Empty', value: 1 }]

  const formattedDate = new Date().toLocaleDateString(
    lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  )

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
       <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
       <p className="mt-4 text-dark-500 font-bold uppercase tracking-[0.3em] text-[10px]">Accessing Bio-Metric Node...</p>
     </div>
  )

  return (

    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight flex flex-wrap gap-x-3">
            {t.welcomeMessage.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: t.welcomeMessage.split(' ').length * 0.1 }}
              className="gradient-text italic"
            >
              {profile?.full_name || t.champion}
            </motion.span>
          </h1>
          <p className="text-dark-400 mt-2 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            {t.dashboard} {t.forLabel} {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBioModal(true)}
            className="glass-sm px-6 py-2.5 flex items-center gap-3 border-primary-500/20 shadow-2xl shadow-primary-500/5 hover:border-primary-500/50 transition-all cursor-pointer group"
          >
            <UserCircle className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-primary-500">Update Profile</span>
          </button>
        </div>

      </div>



      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="stat-card group relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
            <Flame className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-5 h-5 group-hover:animate-pulse" />
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-400/10 text-orange-400 uppercase tracking-widest">
              {Math.round((todayCalories / targetCalories) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayCalories.toLocaleString()}</p>
          <div className="flex justify-between items-end">
            <p className="text-[9px] text-dark-500 font-black uppercase tracking-widest">{t.kcalConsumed}</p>
            <p className="text-[9px] text-dark-400 font-bold italic uppercase tracking-widest">{t.target}: {targetCalories / 1000}k</p>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full mt-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayCalories / targetCalories) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="stat-card group relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
            <Drumstick className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
              <Drumstick className="w-5 h-5 group-hover:animate-bounce" />
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-500 uppercase tracking-widest">
              {Math.round((todayProtein / targetProtein) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayProtein.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
            <p className="text-[9px] text-dark-500 font-black uppercase tracking-widest">{t.proteinIntake}</p>
            <p className="text-[9px] text-dark-400 font-bold italic uppercase tracking-widest">{t.limit}: {targetProtein}g</p>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full mt-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayProtein / targetProtein) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="stat-card group relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
            <Wheat className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-secondary-400/10 text-secondary-400">
              <Wheat className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-secondary-400/10 text-secondary-400 uppercase tracking-widest">
              {Math.round((todayCarbs / targetCarbs) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayCarbs.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
            <p className="text-[9px] text-dark-500 font-black uppercase tracking-widest">{t.carbohydrates}</p>
            <p className="text-[9px] text-dark-400 font-bold italic uppercase tracking-widest">{t.max}: {targetCarbs}g</p>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full mt-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-secondary-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayCarbs / targetCarbs) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="stat-card group relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
            <Droplets className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Droplets className="w-5 h-5 group-hover:animate-pulse" />
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 uppercase tracking-widest">
              {Math.round((todayFat / targetFat) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayFat.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
            <p className="text-[9px] text-dark-500 font-black uppercase tracking-widest">{t.totalFats}</p>
            <p className="text-[9px] text-dark-400 font-bold italic uppercase tracking-widest">{t.limit}: {targetFat}g</p>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full mt-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayFat / targetFat) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <TrendingUp className="w-64 h-64 text-primary-500" />
          </div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.dailyVelocity}</h3>
              <p className="text-[10px] text-dark-500 font-black uppercase tracking-[0.2em] mt-2">{t.metabolicHistory}</p>
            </div>
          </div>
          <div className="h-[280px] w-full relative z-10">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...history].reverse()}>
                  <defs>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="logged_at" hide />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px', fontSize: '10px', color: '#fff', fontWeight: '900',
                      textTransform: 'uppercase', letterSpacing: '0.1em', backdropBlur: '10px'
                    }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#00f2fe" strokeWidth={4} fill="url(#calGrad)"
                    animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center italic text-dark-600 font-black uppercase tracking-widest text-xs animate-pulse">{t.gatheringPoints}</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Target className="w-64 h-64 text-secondary-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{t.macroDensity}</h3>
            <p className="text-[10px] text-dark-500 font-black uppercase tracking-[0.2em] mb-10">{t.todaysDistribution}</p>
          </div>
          <div className="relative h-56 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={macroColors[i % macroColors.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white italic">{macroData.length > 0 ? t.optimal : '--'}</span>
              <span className="text-[9px] text-dark-500 font-black uppercase tracking-[0.3em] mt-1">{t.status}</span>
            </div>
          </div>
          <div className="space-y-4 mt-8 relative z-10">
            {macroData.length > 0 ? macroData.map((m, i) => (
              <div key={m.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ background: macroColors[i] }} />
                  <span className="text-[11px] font-black text-dark-300 uppercase tracking-widest">{m.name}</span>
                </div>
                <span className="text-xs font-black text-white">
                  {Math.round((m.value / (macroData.reduce((a, b) => a + b.value, 0))) * 100)}%
                </span>
              </div>
            )) : <p className="text-[10px] text-dark-600 font-black uppercase tracking-widest text-center italic">{t.noMeals}</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.biologicalLog}</h3>
            <button onClick={() => window.location.href = '/meals'} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 hover:text-white transition-colors">
              {t.detailedHistory} <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-5">
            {history.slice(0, 4).length > 0 ? history.slice(0, 4).map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="flex items-center justify-between p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:border-primary-500/20 shadow-2xl shadow-black/20 transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-dark-900 flex items-center justify-center text-3xl border border-white/5 shadow-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                    {meal.food_name.toLowerCase().includes('chicken') ? '🍗' : '🍲'}
                  </div>
                  <div>
                    <p className="text-lg font-black text-white capitalize tracking-tight leading-none mb-2">{meal.food_name}</p>
                    <p className="text-[9px] text-dark-500 font-black uppercase tracking-[0.2em]">
                      {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-orange-400 leading-none mb-1 group-hover:animate-pulse">{meal.calories.toFixed(0)}</p>
                  <p className="text-[9px] text-dark-600 font-black uppercase tracking-widest">Kcal</p>
                </div>
              </motion.div>
            )) : <div className="py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-dark-600 italic font-black uppercase tracking-widest text-xs opacity-50">{t.noMeals}</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 overflow-hidden relative bg-primary-500/[0.02]">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
            <Zap className="w-48 h-48 text-primary-500" />
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-500 shadow-2xl shadow-primary-500/10 border border-primary-500/20">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.aiIntelligence}</h3>
          </div>
          <div className="space-y-5 relative z-10">
            {summary?.alerts?.length > 0 ? summary.alerts.map((alert, i) => (
              <div key={i} className={`p-6 rounded-[2rem] border-2 flex gap-5 bg-primary-500/5 border-primary-500/10 text-primary-400 group hover:bg-primary-500/10 transition-all duration-300`}>
                <Activity className="w-5 h-5 mt-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm font-bold leading-relaxed italic">{alert}</p>
              </div>
            )) : (
              <div className="border-2 border-dashed border-white/5 rounded-[3rem] p-16 text-center text-dark-600 font-black uppercase tracking-[0.2em] text-xs italic opacity-50">
                {loading ? t.syncBiometric : (lang === 'ta' ? 'அனைத்து உயிரியல் குறிகாட்டிகளும் சாதாரணமாக உள்ளன' : lang === 'hi' ? 'सभी जैविक संकेतक सामान्य सीमा के भीतर हैं' : 'All biological markers are within optimal clinical range')}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Bio Profile Modal */}
      <AnimatePresence>
        {showBioModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowBioModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative rounded-[3rem] border-primary-500/30"
            >
              <div className="flex items-center gap-5 mb-10">
                 <div className="p-4 rounded-3xl bg-primary-500/10 text-primary-500">
                     <Activity className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Update Bio Profile</h2>
                    <p className="text-[10px] text-dark-500 font-bold uppercase tracking-[0.3em] mt-1">Calibration Engine v1.0.5</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    type="number"
                    className="w-full bg-dark-950/60 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-primary-500/50"
                    value={bioForm.age}
                    onChange={e => setBioForm({...bioForm, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full bg-dark-950/60 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-primary-500/50"
                    value={bioForm.weight_kg}
                    onChange={e => setBioForm({...bioForm, weight_kg: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Height (cm)</label>
                  <input 
                    type="number"
                    className="w-full bg-dark-950/60 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-primary-500/50"
                    value={bioForm.height_cm}
                    onChange={e => setBioForm({...bioForm, height_cm: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Optimization Goal</label>
                <select 
                  className="w-full bg-dark-950/60 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-primary-500/50 appearance-none uppercase tracking-widest"
                  value={bioForm.goal}
                  onChange={e => setBioForm({...bioForm, goal: e.target.value})}
                >
                  <option value="Maintain">Maintain Weight</option>
                  <option value="Lose Weight">Lose Weight (Fat Loss)</option>
                  <option value="Gain Weight">Gain Weight (Bulking)</option>
                  <option value="Gain Muscle">Gain Muscle (Athletic)</option>
                </select>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest ml-1">Biological Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {["Diabetes", "Hypertension", "Heart Disease", "Thyroid", "PCOS", "Gluten Allergy", "Dairy Allergy"].map(cond => {
                    const active = bioForm.health_conditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        onClick={() => {
                          const next = active ? bioForm.health_conditions.filter(c => c !== cond) : [...bioForm.health_conditions, cond];
                          setBioForm({...bioForm, health_conditions: next});
                        }}
                        className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                 ${active ? 'bg-primary-500/20 border-primary-500 text-primary-500' : 'bg-white/5 border-white/10 text-dark-400 hover:bg-white/10'}`}
                      >
                        {cond}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowBioModal(false)}
                  className="flex-1 py-5 rounded-2xl border border-white/10 text-dark-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBioSave}
                  disabled={saving}
                  className="flex-1 py-5 rounded-2xl bg-primary-500 text-dark-950 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

