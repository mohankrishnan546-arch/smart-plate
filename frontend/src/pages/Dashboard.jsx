import { motion } from 'framer-motion'
import {
  Flame, Drumstick, Wheat, Droplets, TrendingUp, Activity, Zap, Target, ArrowUpRight, Calendar, Sparkles
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState, useEffect } from 'react'
import { getDailySummary, getMealHistory } from '../api'

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
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  const targetCalories = 2000
  const targetProtein = 50
  const targetCarbs = 300
  const targetFat = 65

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sumData, histData] = await Promise.all([
          getDailySummary(),
          getMealHistory(7)
        ])
        setSummary(sumData)
        setHistory(histData)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const todayCalories = summary?.total_calories || 0
  const todayProtein = summary?.total_protein || 0
  const todayCarbs = summary?.total_carbs || 0
  const todayFat = summary?.total_fat || 0

  const macroData = [
    { name: 'Protein', value: todayProtein * 4 },
    { name: 'Carbs', value: todayCarbs * 4 },
    { name: 'Fat', value: todayFat * 9 },
  ].filter(d => d.value > 0)

  // Fallback for pie chart if no data
  const pieData = macroData.length > 0 ? macroData : [{ name: 'Empty', value: 1 }]

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-none">
            Welcome back, <span className="gradient-text">Vamshi</span>
          </h1>
          <p className="text-dark-400 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Your health intelligence for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="glass-sm px-4 py-2 flex items-center gap-2 border-primary-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-primary-500">System Online</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={fadeUp} className="stat-card group relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
             <Flame className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
               <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-orange-400/10 text-orange-400 uppercase tracking-wider">
              {Math.round((todayCalories / targetCalories) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayCalories.toLocaleString()}</p>
          <div className="flex justify-between items-end">
             <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Kcal consumed</p>
             <p className="text-[10px] text-dark-400 font-medium italic">Target: {targetCalories}k</p>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayCalories / targetCalories) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="stat-card group relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-5">
             <Drumstick className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
               <Drumstick className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-primary-500/10 text-primary-500 uppercase">
               {Math.round((todayProtein / targetProtein) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayProtein.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
             <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Protein intake</p>
             <p className="text-[10px] text-dark-400 font-medium italic">Limit: {targetProtein}g</p>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full mt-4 overflow-hidden">
             <motion.div
               className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((todayProtein / targetProtein) * 100, 100)}%` }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
             />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="stat-card group relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-5">
             <Wheat className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-secondary-400/10 text-secondary-400">
               <Wheat className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-secondary-400/10 text-secondary-400 uppercase">
              {Math.round((todayCarbs / targetCarbs) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayCarbs.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
             <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Carbohydrates</p>
             <p className="text-[10px] text-dark-400 font-medium italic">Max: {targetCarbs}g</p>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full mt-4 overflow-hidden">
             <motion.div
               className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-secondary-400"
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((todayCarbs / targetCarbs) * 100, 100)}%` }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
             />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="stat-card group relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] opacity-5">
             <Droplets className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
               <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 uppercase">
               {Math.round((todayFat / targetFat) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{todayFat.toFixed(1)}g</p>
          <div className="flex justify-between items-end">
             <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Total Fats</p>
             <p className="text-[10px] text-dark-400 font-medium italic">Limit: {targetFat}g</p>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full mt-4 overflow-hidden">
             <motion.div
               className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((todayFat / targetFat) * 100, 100)}%` }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
             />
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 lg:col-span-2 shadow-2xl overflow-hidden relative"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Daily Calorie Velocity</h3>
              <p className="text-xs text-dark-500 font-bold uppercase tracking-widest mt-1">Metabolic History (7 Days)</p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary-500 opacity-50" />
          </div>
          
          <div className="h-[250px] w-full mt-4">
            {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...history].reverse()}>
                  <defs>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="logged_at" 
                    hide
                  />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', fontSize: '10px', color: '#fff', fontWeight: 'bold'
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#00f2fe" 
                    strokeWidth={4}
                    fill="url(#calGrad)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                    <p className="text-dark-600 text-sm font-bold italic">Gathering data points...</p>
                </div>
            )}
          </div>
        </motion.div>

        {/* Macro Split */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-black text-white mb-1">Macro Density</h3>
            <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest mb-6">Today's Distribution</p>
          </div>
          
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie 
                    data={pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={85}
                    paddingAngle={8} 
                    dataKey="value" 
                    strokeWidth={0}
                >
                    {pieData.map((entry, i) => (
                    <Cell key={i} fill={macroColors[i % macroColors.length]} />
                    ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{macroData.length > 0 ? 'Optimal' : '--'}</span>
                <span className="text-[8px] text-dark-500 font-black uppercase tracking-widest">Status</span>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {macroData.length > 0 ? macroData.map((m, i) => (
              <div key={m.name} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: macroColors[i] }} />
                    <span className="text-xs font-bold text-dark-300">{m.name}</span>
                </div>
                <span className="text-xs font-black text-white">
                    {Math.round((m.value / (macroData.reduce((a, b) => a + b.value, 0))) * 100)}%
                </span>
              </div>
            )) : (
                <p className="text-[10px] text-dark-600 italic text-center">No macronutrients logged today.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Meals + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white">Biological Log</h3>
            <button 
                onClick={() => window.location.href = '/meals'}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-400 transition"
            >
                Detailed History <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {history.slice(0, 4).length > 0 ? history.slice(0, 4).map((meal, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl
                                      bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-900 flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform">
                    {meal.food_name.includes('Chicken') ? '🍗' : meal.food_name.includes('Rice') ? '🍚' : '🍲'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white capitalize">{meal.food_name}</p>
                    <p className="text-[10px] text-dark-500 font-bold uppercase tracking-tight mt-1">
                        {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {meal.meal_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-orange-400">{meal.calories.toFixed(0)}</p>
                    <p className="text-[8px] text-dark-600 font-black uppercase tracking-widest">Kcal</p>
                </div>
              </div>
            )) : (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                    <Activity className="w-10 h-10 text-dark-800 mb-4" />
                    <p className="text-dark-500 text-sm italic font-medium">Log your first meal to start tracking</p>
                </div>
            )}
          </div>
        </motion.div>

        {/* AI Health Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2.5 rounded-xl bg-primary-500/20">
               <Zap className="w-5 h-5 text-primary-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white">AI Health Intelligence</h3>
          </div>
          
          <div className="space-y-4 relative z-10">
            {summary?.alerts?.length > 0 ? summary.alerts.map((alert, i) => (
              <div key={i} className={`p-4 rounded-2xl border-2 flex gap-4 transition-all hover:scale-[1.02]
                ${alert.includes('⚠️') || alert.includes('❗') || alert.includes('🧂')
                    ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/5' 
                    : 'bg-primary-500/5 border-primary-500/20 text-primary-400'}`}>
                <div className="mt-1">
                   {alert.includes('✅') ? <Target className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <p className="text-sm font-bold leading-relaxed">{alert}</p>
              </div>
            )) : (
              <div className="border-2 border-dashed border-white/5 rounded-3xl p-10 text-center">
                 <Sparkles className="w-10 h-10 text-dark-800 mx-auto mb-4" />
                 <p className="text-dark-500 text-sm font-bold italic leading-relaxed">
                   Synchronizing biometric data... <br/>
                   Scan a meal to get AI-driven health optimizations.
                 </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
