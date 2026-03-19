import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Navigation, Phone, 
  MapPin, Shield, Star, Activity, AlertTriangle, Loader2, Sparkles, HeartPulse,
  ChevronRight, CheckCircle2
} from 'lucide-react'
import { getMedicalRecommendations, bookProvider } from '../api'
import { useLanguage } from '../App'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function CareNetwork() {
  const { t } = useLanguage()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [bookingStatus, setBookingStatus] = useState(null) // { id, message }

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await getMedicalRecommendations()
        setRecommendations(data)
      } catch (err) {
        console.error("Care network error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [])

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === filter)

  const handleBook = async (providerId) => {
    try {
      const res = await bookProvider(providerId)
      setBookingStatus({ id: providerId, message: res.message || 'Booked Successfully' })
      setTimeout(() => setBookingStatus(null), 5000)
    } catch (err) {
      console.error("Booking failed:", err)
      alert("Booking failed. Please check your connection.")
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center gap-2 shadow-2xl shadow-primary-500/5">
                <HeartPulse className="w-4 h-4 animate-pulse" />
                <span className="text-[9px] uppercase font-black tracking-[0.2em]">{t.medicalIntelligence || 'Medical Intelligence Portal'}</span>
            </div>
          </div>
          <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
            {t.medicalGuardianHub || 'Medical Guardian Hub'} 🛡️
          </h1>
          <p className="text-dark-400 text-lg font-bold italic border-l-4 border-primary-500/20 pl-8 leading-relaxed">
             {t.careNetworkInfo || 'Autonomous medical provider matching system. Our AI synchronizes your unique physiological data with hospital infrastructure.'}
          </p>
        </div>
        
        <div className="flex gap-3 bg-dark-950/40 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          {[
            { id: 'all', label: t.all || 'All' },
            { id: 'hospital', label: t.hospitalUnits || 'Hospital Units' },
            { id: 'doctor', label: t.doctorUnits || 'Doctor Units' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-8 py-4 rounded-[2rem] text-[10px] uppercase font-black tracking-widest transition-all duration-500
                ${filter === f.id 
                  ? 'bg-primary-500 text-dark-950 shadow-2xl shadow-primary-500/20' 
                  : 'text-dark-500 hover:text-white hover:bg-white/5'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 glass border-dashed bg-dark-950/20">
          <div className="relative">
             <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
             <div className="absolute inset-0 bg-primary-500/20 blur-2xl animate-pulse" />
          </div>
          <p className="mt-8 text-dark-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">
             {t.establishingLink || 'Establishing Secure Clinical Link...'}
          </p>
        </div>
      ) : filteredRecs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-24 text-center border-dashed border-dark-800 bg-dark-950/40 opacity-80 backdrop-blur-xl">
             <div className="w-28 h-28 rounded-[3.5rem] bg-dark-900 border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-inner group">
                <AlertTriangle className="w-12 h-12 text-dark-700 group-hover:text-amber-500/50 transition-colors duration-700" />
             </div>
             <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{t.biologicalSignalMissing || 'Biological Signal Missing'}</h3>
             <p className="text-dark-500 font-bold uppercase tracking-[0.2em] text-[10px] italic max-w-xs mx-auto">{t.updateHealthProfile || 'Update health profile for medical matching'}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          {filteredRecs.map((rec, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass p-10 flex flex-col hover:bg-white/[0.03] hover:border-primary-500/20 transition-all duration-700 rounded-[3.5rem] group relative overflow-hidden"
            >
              <div className="absolute top-[-10%] right-[-5%] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                 <Shield className="w-64 h-64 text-primary-500" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-dark-900 flex items-center justify-center border-2 border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                    {rec.type === 'hospital' ? <Shield className="w-10 h-10 text-primary-500" /> : <Activity className="w-10 h-10 text-secondary-400" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-primary-400 transition-colors">{rec.name}</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase tracking-widest border border-primary-500/20 italic self-start">
                                {rec.specialty}
                            </span>
                            <div className="flex items-center gap-2 text-dark-500 pl-1">
                                <Phone className="w-3 h-3" />
                                <span className="text-[10px] font-black tracking-[0.2em] italic uppercase">
                                    {rec.contact}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-500">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             <span className="text-[10px] font-black italic">{rec.rating}</span>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[140px]">
                   <a 
                     href={`tel:${rec.contact}`}
                     className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 group/call"
                   >
                      <Phone className="w-4 h-4 text-primary-500 group-hover/call:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.call || 'Call'}</span>
                   </a>
                   <button 
                     onClick={() => handleBook(rec.id)}
                     className="flex items-center justify-center gap-3 px-8 py-5 bg-primary-500 text-dark-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-3xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all overflow-hidden relative"
                   >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative z-10">
                            {bookingStatus?.id === rec.id ? '✓ Booked' : (t.book || 'Book Appointment')}
                        </span>
                        <ChevronRight className="w-4 h-4 relative z-10" />
                   </button>
                </div>
              </div>

              {bookingStatus?.id === rec.id && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                >
                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                   <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">{bookingStatus.message}! 🎉</span>
                </motion.div>
              )}

              <div className="flex-1 space-y-6 mb-10 relative z-10">
                  <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group/box hover:bg-white/[0.04] transition-colors">
                      <div className="flex gap-4">
                          <div className="mt-1">
                              <Sparkles className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                              <p className="text-[8px] uppercase font-black text-dark-600 tracking-[0.3em] mb-2">{t.reason || 'Intelligence Reason'}</p>
                              <p className="text-sm text-dark-200 leading-relaxed font-bold italic">
                                  {rec.reason}
                              </p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-dark-500 pl-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{rec.location}</span>
                  </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
                     <span className="text-[8px] font-black text-dark-500 uppercase tracking-widest">{t.optimal || 'Optimal Match'}</span>
                 </div>
                 <p className="text-[8px] font-black text-dark-600 uppercase tracking-widest">{t.clinicalProtocol || 'Clinical HMIS Core'}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 p-10 glass border-dark-800 bg-white/[0.01] rounded-[3rem]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                  <div className="p-4 rounded-3xl bg-secondary-400/10 text-secondary-400 border border-secondary-400/20">
                      <Activity className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] text-dark-400 font-bold max-w-md italic leading-relaxed">
                     <span className="text-secondary-400 font-black uppercase tracking-widest block mb-1">{t.clinicalProtocol || 'Clinical Protocol Disclaimer'}</span>
                     {t.disclaimerNote || 'The Smart Plate HMIS Engine correlates data points for informational matching only.'}
                  </p>
              </div>
              <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex items-center gap-5 max-w-xs">
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                  <p className="text-[9px] text-red-400 font-bold leading-relaxed italic">{t.emergencyNote || 'Emergency medical conditions require immediate traversal to a certified traumatic care facility.'}</p>
              </div>
          </div>
      </motion.div>
    </div>
  )
}
