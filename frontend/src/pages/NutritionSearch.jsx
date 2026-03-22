import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Leaf, Flame, Info, Loader2, Plus, X as CloseIcon } from 'lucide-react'
import { searchNutrition, addCustomFood } from '../api'
import { useLanguage } from '../App'

export default function NutritionSearch() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    // Clear selection immediately when typing starts
    setSelected(null)

    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchNutrition(query);
        setResults(data);
        // On mobile, scroll up to show results clearly
        if (window.innerWidth < 1024) {
           window.scrollTo({ top: 150, behavior: 'smooth' })
        }
      } catch (err) {
        console.error("Search API Error:", err);
        setResults([])
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  const clearAndFocus = () => {
    setQuery('')
    setResults([])
    setSelected(null)
    inputRef.current?.focus()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-4">
           {t.nutritionDatabase} 🔍
        </h1>
        <div className="flex items-center justify-between">
           <p className="text-dark-400 font-bold italic tracking-wide">{t.searchDatabase} — {t.per100g}</p>
        </div>
      </div>

      {/* Search Bar - Sticky on Top */}
      <div className="sticky top-0 z-40 pt-4 pb-10 bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 mb-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary-500/5 blur-3xl rounded-[3rem] opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
          <input 
            autoFocus
            ref={inputRef}
            onFocus={() => setSelected(null)}
            className="w-full bg-dark-950/60 border-2 border-white/5 rounded-[2.5rem] pl-16 pr-36 py-6 text-xl font-black text-white outline-none focus:border-primary-500/50 shadow-inner group-hover:bg-dark-900 transition-all placeholder:text-dark-700" 
            placeholder={t.searchHint}
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
            {query && (
              <button 
                onClick={clearAndFocus}
                className="p-2 rounded-xl bg-white/5 text-dark-500 hover:text-white transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            )}
            {loading && (
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          {results.map((item, i) => (
            <motion.button 
              key={item.id || item.name} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(item)}
              className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] transition-all duration-500 transform active:scale-95 text-left border
                ${selected?.name === item.name 
                  ? 'bg-primary-500/10 border-primary-500/30 shadow-2xl shadow-primary-500/10' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${selected?.name === item.name ? 'bg-primary-500 text-dark-950' : 'bg-dark-900 text-dark-400'}`}>
                    <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-white capitalize tracking-tight leading-none mb-1.5">{item.name.replace(/_/g, ' ')}</p>
                  <p className="text-[9px] text-dark-600 font-bold uppercase tracking-widest">{item.source || 'Standard'} Database</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-lg font-black text-orange-400 leading-none mb-1">{(item.calories || 0).toFixed(0)}</p>
                    <p className="text-[10px] text-dark-600 font-black uppercase tracking-widest">Kcal</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-primary-400 leading-none mb-1">{(item.protein_g || 0).toFixed(1)}g</p>
                    <p className="text-[10px] text-dark-600 font-black uppercase tracking-widest">{t.protein}</p>
                </div>
              </div>
            </motion.button>
          ))}
          
          {query.length >= 1 && results.length === 0 && !loading && (
            <div className="glass p-20 text-center border-dashed border-dark-800 bg-dark-950/40 opacity-80">
                <div className="w-24 h-24 rounded-[3rem] bg-dark-900 border border-white/5 flex items-center justify-center mx-auto mb-10">
                    <Search className="w-10 h-10 text-dark-700" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{t.noResults}</h3>
                <p className="text-dark-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">"{query}"</p>
            </div>
          )}
          
          {query.length < 1 && (
            <div className="glass p-24 text-center border-dashed border-dark-800 bg-dark-950/40 opacity-80">
                <div className="w-24 h-24 rounded-[3rem] bg-dark-900 border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-inner group">
                    <Search className="w-10 h-10 text-dark-700 group-hover:text-primary-500/50 transition-colors duration-700" />
                </div>
                <p className="text-dark-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Type to search...</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div 
              key={selected.name} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} 
              className="glass p-10 h-fit sticky top-6 overflow-hidden relative shadow-3xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <Flame className="w-48 h-48 text-orange-500" />
              </div>

              <div className="relative z-10 mb-10 flex items-start justify-between">
                <div>
                   <h3 className="text-3xl font-black text-white capitalize tracking-tighter mb-4">{selected.name.replace(/_/g, ' ')}</h3>
                   <span className="text-[9px] px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 font-black uppercase tracking-widest border border-primary-500/20">
                    {selected.source || 'USDA'} {t.optimal} Match
                   </span>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="p-3 rounded-2xl bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 relative z-10 mb-10">
                {[
                  [t.calories, `${(selected.calories || 0).toFixed(0)} kcal`, 'text-orange-400', Math.min(((selected.calories || 0) / 400) * 100, 100)],
                  [t.protein, `${(selected.protein_g || 0).toFixed(1)}g`, 'text-primary-500', Math.min(((selected.protein_g || 0) / 20) * 100, 100)],
                  [t.carbs, `${(selected.carbs_g || 0).toFixed(1)}g`, 'text-secondary-400', Math.min(((selected.carbs_g || 0) / 50) * 100, 100)],
                  [t.fat, `${(selected.fat_g || 0).toFixed(1)}g`, 'text-amber-400', Math.min(((selected.fat_g || 0) / 15) * 100, 100)],
                ].map(([label, value, color, pct]) => (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{label}</span>
                      <span className={`text-xl font-black italic ${color}`}>{value}</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pct}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          label === t.calories ? 'from-orange-500 to-red-500' :
                          label === t.protein ? 'from-primary-500 to-primary-400' :
                          label === t.carbs ? 'from-secondary-500 to-secondary-400' :
                          'from-amber-500 to-orange-500'
                        }`} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 p-6 rounded-[2rem] bg-indigo-500/5 border-2 border-indigo-500/10 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                     <Info className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-indigo-200/60 font-black uppercase tracking-widest leading-loose italic">
                    {selected.serving_size ? `Serving size: ${selected.serving_size}` : t.servingHint}
                  </span>
                </div>
              </div>

               <button 
                  onClick={clearAndFocus}
                  className="w-full mt-6 py-4 rounded-2xl bg-primary-500 text-dark-950 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary-500/20"
                >
                  <Search className="w-4 h-4" />
                  {t.searchMore || 'Search for More Food'}
                </button>
            </motion.div>
          ) : (
            <div className="glass p-12 text-center h-fit border-dashed bg-dark-950/20">
              <div className="w-20 h-20 rounded-[2.5rem] bg-dark-900 flex items-center justify-center mx-auto mb-10 shadow-inner">
                 <Flame className="w-8 h-8 text-dark-800" />
              </div>
              <p className="text-[10px] text-dark-600 font-black uppercase tracking-[0.2em] italic">{t.selectFood}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
