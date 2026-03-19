import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Calendar, ChevronRight, Clock, Flame, 
  Droplets, Wheat, Drumstick, Filter, Trash2, Loader2,
  PieChart as PieIcon, Activity, TrendingUp
} from 'lucide-react'
import { getMealHistory, deleteMeal, getDailySummary } from '../api'
import { useLanguage } from '../App'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function MealLog() {
  const { t } = useLanguage()
  const [meals, setMeals] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchMeals = async () => {
    try {
      const [history, daily] = await Promise.all([
        getMealHistory(30),
        getDailySummary()
      ])
      setMeals(history)
      setSummary(daily)
    } catch (err) {
      console.error("Meal fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete || 'Scale back this entry?')) return
    try {
      await deleteMeal(id)
      fetchMeals()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const filteredMeals = meals.filter(m => 
    filter === 'all' ? true : m.meal_type === filter
  )

  const mealTypes = [
    { id: 'all', label: t.all, icon: Filter },
    { id: 'breakfast', label: t.breakfast, icon: Clock },
    { id: 'lunch', label: t.lunch, icon: Flame },
    { id: 'dinner', label: t.dinner, icon: Activity },
    { id: 'snack', label: t.snack, icon: TrendingUp },
  ]

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
           <div className="flex items-center gap-3 mb-4">
                <div className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center gap-2">
                    <PieIcon className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[9px] uppercase font-black tracking-[0.2em]">{t.biologicalLog}</span>
                </div>
            </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-4">
             {t.mealLog} 🍱
          </h1>
          <p className="text-dark-400 font-bold italic tracking-wide max-w-xl">{t.trackEating}</p>
        </div>
        <button onClick={() => window.location.href = '/scan'} 
                className="btn-primary flex items-center gap-3 px-10 py-5 rounded-[2rem] shadow-3xl shadow-primary-500/20 active:scale-95 transition-transform group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-black uppercase tracking-widest text-xs">{t.addMeal}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-8">
           <div className="glass p-8 overflow-hidden relative group">
              <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                <Filter className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-black text-white mb-8 tracking-tighter uppercase relative z-10">{t.mealType}</h3>
              <div className="space-y-3 relative z-10">
                {mealTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFilter(type.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 transform active:scale-95
                      ${filter === type.id 
                        ? 'bg-primary-500 text-dark-950 shadow-2xl shadow-primary-500/20 rotate-0' 
                        : 'bg-white/[0.02] border border-white/5 text-dark-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <type.icon className="w-4 h-4" />
                      <span className="font-black uppercase tracking-widest text-[10px]">{type.label}</span>
                    </div>
                    {filter === type.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
           </div>

           {/* Quick Stats Summary */}
           <div className="glass p-8 bg-primary-500/[0.02] relative overflow-hidden border-primary-500/10">
                <h3 className="text-xl font-black text-white mb-8 tracking-tighter uppercase">{t.dailySummary}</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">{t.caloriesToday}</span>
                            <span className="text-lg font-black text-white italic">{summary?.total_calories || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((summary?.total_calories || 0) / 2000) * 100, 100)}%` }} className="h-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">{t.proteinTarget}</span>
                            <span className="text-lg font-black text-white italic">{summary?.total_protein || 0}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((summary?.total_protein || 0) / 60) * 100, 100)}%` }} className="h-full bg-secondary-400 shadow-[0_0_10px_rgba(72,172,254,0.5)]" />
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* Main Log */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 glass border-dashed">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-6" />
              <p className="text-dark-500 font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">{t.gatheringPoints}</p>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="glass p-24 text-center border-dashed border-dark-800 bg-dark-950/40 opacity-80">
                <div className="w-24 h-24 rounded-[3rem] bg-dark-900 border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-inner">
                    <Calendar className="w-10 h-10 text-dark-700" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{t.noMeals}</h3>
                <p className="text-dark-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">{t.trackEating}</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-8 pl-4 pr-10">
                <p className="text-[9px] text-dark-600 font-black uppercase tracking-[0.3em]">
                   {filteredMeals.length} {t.itemsRecorded}
                </p>
              </div>
              
              {filteredMeals.map((meal) => (
                <motion.div
                  key={meal.id}
                  variants={item}
                  className="glass group p-6 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.04] hover:border-primary-500/20 transition-all duration-500 rounded-[2.5rem] relative overflow-hidden"
                >
                  <div className="absolute top-[-10%] right-[-5%] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                     <Flame className="w-40 h-40 text-orange-500" />
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-dark-900 flex items-center justify-center text-4xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                      {meal.food_name.toLowerCase().includes('chicken') ? '🍗' : '🍲'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-dark-400 text-[8px] font-black uppercase tracking-widest border border-white/5">
                            {t[meal.meal_type] || meal.meal_type}
                        </span>
                        <span className="text-[9px] text-dark-600 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                           <Clock className="w-3 h-3" /> {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white capitalize tracking-tighter group-hover:text-primary-400 transition-colors italic">
                        {meal.food_name.replace(/_/g, ' ')}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 mt-6 md:mt-0 relative z-10 w-full md:w-auto justify-between md:justify-end px-4 md:px-0">
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-xl font-black text-orange-400 leading-none mb-1">{(meal.calories || 0).toFixed(0)}</p>
                            <p className="text-[8px] text-dark-600 font-black uppercase tracking-widest">Kcal</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-primary-400 leading-none mb-1">{(meal.protein_g || 0).toFixed(1)}g</p>
                            <p className="text-[8px] text-dark-600 font-black uppercase tracking-widest">{t.protein}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(meal.id)}
                      className="p-4 rounded-2xl bg-red-500/5 text-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
