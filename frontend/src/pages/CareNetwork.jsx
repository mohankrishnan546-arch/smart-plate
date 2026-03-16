import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Stethoscope, Hospital, Star, MapPin, ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { getMedicalRecommendations } from '../api'

export default function CareNetwork() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getMedicalRecommendations()
        setRecommendations(data)
      } catch (err) {
        console.error("Care network error:", err)
        setError("Could not load care recommendations.")
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Heart className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">HMIS AI Module</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="gradient-text">Care Network</span> Recommendations 🏥
        </h1>
        <p className="text-dark-400 mt-2 text-lg">AI-driven doctor and hospital matching based on your health profile</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-dark-400 animate-pulse">Analysing conditions & matching providers...</p>
        </div>
      ) : error ? (
        <div className="glass p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-dark-200">{error}</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Stethoscope className="w-10 h-10 text-dark-500" />
            </div>
            <h3 className="font-bold text-xl mb-3">No Health Conditions Found</h3>
            <p className="text-dark-400 mb-8">
                Your medical history is currently clear. To get personalized care recommendations, 
                update your health profile with your medical conditions.
            </p>
            <a href="/health" className="btn-primary">Update Health Profile</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 group hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                                  ${rec.type === 'hospital' ? 'bg-primary-500/10 text-primary-500' : 'bg-secondary-400/10 text-secondary-400'}`}>
                    {rec.type === 'hospital' ? <Hospital className="w-7 h-7" /> : <Stethoscope className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                                        ${rec.urgency === 'High' ? 'bg-red-500/10 text-red-500' : 
                                          rec.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                                          'bg-green-500/10 text-green-500'}`}>
                            {rec.urgency} Priority
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="text-xs font-bold">{rec.rating}</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary-400 transition-colors">{rec.name}</h3>
                    <p className="text-sm font-medium text-dark-300">{rec.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Sparkles className="w-12 h-12 text-blue-400" />
                </div>
                <div className="flex gap-3">
                    <div className="mt-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-dark-500 tracking-widest mb-1">AI Recommendation Reason</p>
                        <p className="text-sm text-dark-200 leading-relaxed font-medium">
                            {rec.reason}
                        </p>
                    </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">{rec.location}</span>
                </div>
                <button className="text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-2">
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-12 p-6 glass-sm border-amber-500/20 bg-amber-500/5 flex gap-4 items-center">
        <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
        <div>
            <h4 className="font-bold text-amber-500 text-sm">Medical Disclaimer</h4>
            <p className="text-xs text-dark-300 leading-relaxed">
                The HMIS AI Module provides recommendations based on pattern matching and statistical analysis of health data. 
                These suggestions are not a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions you may have 
                regarding a medical condition.
            </p>
        </div>
      </div>
    </div>
  )
}

const ArrowRight = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
)
