import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Leaf, Flame, Info, Loader2 } from 'lucide-react'
import { searchNutrition } from '../api'

export default function NutritionSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchNutrition(query)
        setResults(data)
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Nutrition Database</h1>
        <p className="text-dark-400 mt-1">Search USDA & ICMR food data — per 100g serving</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input 
          className="input-glass w-full pl-12 text-lg" 
          placeholder="Search foods (e.g. biryani, pizza, dal)..."
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {results.map((item, i) => (
            <motion.button 
              key={item.id || item.name} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(item)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left
                ${selected?.name === item.name ? 'bg-primary-500/10 border border-primary-500/30' : 'glass hover:border-primary-500/20'}`}
            >
              <div className="flex items-center gap-3">
                <Leaf className="w-4 h-4 text-green-400" />
                <div>
                  <p className="font-medium capitalize">{item.name.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-dark-500 uppercase">{item.source || 'Database'} Source</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-orange-400">{item.calories} kcal</span>
                <span className="text-primary-500">{item.protein_g}g P</span>
              </div>
            </motion.button>
          ))}
          
          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="glass p-8 text-center">
              <p className="text-dark-400">No foods found matching "{query}"</p>
            </div>
          )}
          
          {query.length < 2 && (
            <div className="glass p-12 text-center">
              <Search className="w-10 h-10 text-dark-700 mx-auto mb-3" />
              <p className="text-dark-500 italic">Type at least 2 characters to search...</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div 
              key={selected.name} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} 
              className="glass p-6 h-fit sticky top-6"
            >
              <h3 className="text-xl font-bold capitalize mb-1">{selected.name.replace(/_/g, ' ')}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 uppercase">
                {selected.source || 'USDA'}
              </span>
              <div className="mt-6 space-y-3">
                {[
                  ['Calories', `${selected.calories} kcal`, 'text-orange-400', selected.calories / 4],
                  ['Protein', `${selected.protein_g}g`, 'text-primary-500', selected.protein_g * 4],
                  ['Carbs', `${selected.carbs_g}g`, 'text-secondary-400', selected.carbs_g * 1.3],
                  ['Fat', `${selected.fat_g}g`, 'text-amber-400', selected.fat_g * 5],
                  ['Fiber', `${selected.fiber_g || 0}g`, 'text-green-400', (selected.fiber_g || 0) * 10],
                ].map(([label, value, color, pct]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-dark-400">{label}</span>
                      <span className={`font-semibold ${color}`}>{value}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          label === 'Calories' ? 'from-orange-400 to-red-400' :
                          label === 'Protein' ? 'from-primary-500 to-primary-400' :
                          label === 'Carbs' ? 'from-secondary-400 to-secondary-300' :
                          label === 'Fat' ? 'from-amber-400 to-orange-400' :
                          'from-green-400 to-emerald-400'
                        }`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">
                    {selected.serving_size ? `Serving size: ${selected.serving_size}` : 'Values per 100g serving'}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass p-8 text-center h-fit">
              <Flame className="w-10 h-10 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">Select a food to see details</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
