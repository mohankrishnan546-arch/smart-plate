import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, Plus, Trash2, Clock, Flame, Loader2 } from 'lucide-react'
import { getTodayMeals, logMeal, deleteMeal, getDailySummary } from '../api'

const mealTypes = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
]

export default function MealLog() {
  const [meals, setMeals] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newMeal, setNewMeal] = useState({ name: '', type: 'lunch', calories: '', protein: '', carbs: '', fat: '' })

  const fetchMeals = async () => {
    setLoading(true)
    try {
      const data = await getTodayMeals()
      setMeals(data)
      const summaryData = await getDailySummary()
      setSummary(summaryData)
    } catch (err) {
      console.error("Fetch meals error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  const filtered = activeFilter === 'all' ? meals : meals.filter(m => m.meal_type === activeFilter)
  const totalCal = summary?.total_calories || 0
  const totalPro = summary?.total_protein || 0

  const handleAdd = async () => {
    if (!newMeal.name) return
    try {
      await logMeal({
        food_name: newMeal.name,
        meal_type: newMeal.type,
        calories: Number(newMeal.calories) || 0,
        protein_g: Number(newMeal.protein) || 0,
        carbs_g: Number(newMeal.carbs) || 0,
        fat_g: Number(newMeal.fat) || 0,
      })
      fetchMeals()
      setNewMeal({ name: '', type: 'lunch', calories: '', protein: '', carbs: '', fat: '' })
      setShowAdd(false)
    } catch (err) {
      console.error("Add meal error:", err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMeal(id)
      fetchMeals()
    } catch (err) {
      console.error("Delete meal error:", err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Meal Log</h1>
          <p className="text-dark-400 mt-1">Track everything you eat throughout the day</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Meal
        </button>
      </div>

      {/* Summary Bar */}
      <div className="glass p-5 mb-6 flex flex-wrap items-center gap-8 shadow-xl shadow-primary-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-400/10">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{totalCal.toFixed(0)}</p>
            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Calories Today</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500/10">
            <UtensilsCrossed className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{totalPro.toFixed(1)}g</p>
            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Protein Target</p>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
            <span className="text-xs text-dark-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              {meals.length} items recorded
            </span>
        </div>
      </div>

      {/* Add Meal Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="glass p-6 mb-6 overflow-hidden"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-500" /> Log a New Meal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Food Name</label>
                <input className="input-glass" placeholder="e.g. Oats with Banana" value={newMeal.name}
                      onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Meal Type</label>
                <select className="input-glass" value={newMeal.type}
                        onChange={e => setNewMeal({ ...newMeal, type: e.target.value })}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Calories (kcal)</label>
                <input className="input-glass" placeholder="0" type="number" value={newMeal.calories}
                      onChange={e => setNewMeal({ ...newMeal, calories: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Protein (g)</label>
                <input className="input-glass" placeholder="0" type="number" value={newMeal.protein}
                      onChange={e => setNewMeal({ ...newMeal, protein: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Carbs (g)</label>
                <input className="input-glass" placeholder="0" type="number" value={newMeal.carbs}
                      onChange={e => setNewMeal({ ...newMeal, carbs: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-dark-500 ml-1">Fat (g)</label>
                <input className="input-glass" placeholder="0" type="number" value={newMeal.fat}
                      onChange={e => setNewMeal({ ...newMeal, fat: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">Save Meal Log</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {mealTypes.map(t => (
          <button key={t.id}
            onClick={() => setActiveFilter(t.id)}
            className={`glass-pill text-sm whitespace-nowrap transition-all flex items-center gap-2
              ${activeFilter === t.id ? 'bg-primary-500/20 text-primary-500 border-primary-500/30' : 'hover:border-primary-500/20'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Meal List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm font-medium">Fetching your meal history...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-4 sm:p-5 flex items-center justify-between group hover:border-primary-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {mealTypes.find(t => t.id === meal.meal_type)?.icon || '🍲'}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{meal.food_name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-dark-500" />
                      <span className="text-[10px] text-dark-400 font-bold">
                        {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-400 uppercase font-bold tracking-wider">
                      {meal.meal_type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-[10px] text-dark-500 font-bold uppercase mb-0.5">Calories</p>
                    <p className="text-orange-400 font-bold">{meal.calories.toFixed(0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-dark-500 font-bold uppercase mb-0.5">Protein</p>
                    <p className="text-primary-500 font-bold">{meal.protein_g.toFixed(1)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-dark-500 font-bold uppercase mb-0.5">Carbs</p>
                    <p className="text-secondary-400 font-bold">{meal.carbs_g.toFixed(1)}g</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(meal.id)}
                  className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass p-16 text-center shadow-inner">
            <UtensilsCrossed className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No meals found</h3>
            <p className="text-dark-400 max-w-[280px] mx-auto text-sm italic">
              {activeFilter === 'all' 
                ? "You haven't logged any meals yet today. Start by scanning or adding one manually!"
                : `No ${activeFilter} meals recorded yet today.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
