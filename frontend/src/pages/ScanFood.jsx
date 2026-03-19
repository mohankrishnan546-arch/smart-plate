import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Camera, Upload, Loader2, Sparkles, AlertTriangle, CheckCircle, X, 
  Maximize, RefreshCw, ShieldCheck, Plus, Flame, Activity
} from 'lucide-react'
import { recognizeFood, logMeal } from '../api'
import { useLanguage } from '../App'

export default function ScanFood() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logging, setLogging] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  const fileRef = useRef()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    setResult(null)
    setError(null)
    setPreview(null)
    setImage(null)
    setIsCameraActive(true)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera access error:", err)
      setError(t.cameraError || "Could not access camera. Please check permissions.")
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" })
        setImage(file)
        setPreview(URL.createObjectURL(blob))
        stopCamera()
      }, 'image/jpeg', 0.95)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    stopCamera()
  }

  const handleScan = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await recognizeFood(image)
      setResult(data)
    } catch (err) {
      console.error("Scan error:", err)
      const errorMsg = err.response?.data?.detail || t.recognitionFailed || "Recognition failed. Please try again."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleLog = async () => {
    if (!result) return
    setLogging(true)
    try {
      const { nutrition, food_name } = result;
      await logMeal({
        food_name,
        meal_type: 'snack',
        quantity: 1.0,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
        vitamin_a_iu: nutrition.vitamin_a_iu || 0,
        vitamin_c_mg: nutrition.vitamin_c_mg || 0,
        calcium_mg: nutrition.calcium_mg || 0,
        iron_mg: nutrition.iron_mg || 0,
        potassium_mg: nutrition.potassium_mg || 0,
      });
      navigate('/meals')
    } catch (err) {
      console.error("Log error:", err)
      setError(t.error || "Failed to add meal to log.")
    } finally {
      setLogging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      stopCamera()
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-4">
          {t.foodIntelligence} 📸
        </h1>
        <p className="text-dark-400 mt-2 font-black uppercase tracking-[0.2em] text-[10px] italic">{t.scanFoodInfo}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Interaction Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 h-fit overflow-hidden relative"
        >
          <div className="flex gap-3 mb-8">
            <button 
              onClick={() => { stopCamera(); fileRef.current?.click(); }}
              className={`flex-1 py-4 px-6 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center justify-center gap-3
                ${!isCameraActive && !preview ? 'bg-primary-500 text-dark-950 shadow-2xl shadow-primary-500/10 border-transparent rotate-0' : 'bg-white/5 border border-white/5 text-dark-500 hover:text-white'}`}
            >
              <Upload className="w-4 h-4" /> {t.upload}
            </button>
            <button 
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`flex-1 py-4 px-6 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center justify-center gap-3
                ${isCameraActive ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 border border-white/5 text-dark-500 hover:text-white'}`}
            >
              <Camera className="w-4 h-4" /> {isCameraActive ? t.cancel : t.useCamera}
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`relative rounded-[3rem] overflow-hidden transition-all duration-500 min-h-[450px] flex flex-col items-center justify-center
                       bg-dark-950/60 border-2 border-dashed
                       ${preview || isCameraActive ? 'border-primary-500/50 shadow-3xl shadow-primary-500/20' : 'border-white/10'}`}
          >
            {isCameraActive ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                  <button 
                    onClick={captureImage}
                    className="w-24 h-24 rounded-full bg-white flex items-center justify-center group shadow-2xl active:scale-90 transition-transform"
                  >
                    <div className="w-20 h-20 rounded-full border-4 border-dark-900 group-hover:border-primary-500 transition-colors" />
                  </button>
                </div>
                <div className="absolute top-6 right-6">
                  <button onClick={stopCamera} className="p-4 rounded-full bg-black/50 text-white backdrop-blur-2xl hover:bg-black/70 transition-all border border-white/5">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : preview ? (
              <div className="relative group p-6 w-full h-full flex items-center justify-center">
                <img src={preview} alt="Food biological preview" className="max-h-[400px] rounded-[2rem] object-cover shadow-3xl border border-white/10 group-hover:scale-105 transition-transform duration-700" />
                <button 
                  onClick={() => { setPreview(null); setImage(null); }}
                  className="absolute top-10 right-10 p-4 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-3xl border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} className="cursor-pointer text-center p-12 flex flex-col items-center group">
                <div className="w-28 h-28 rounded-[3.5rem] bg-gradient-to-br from-primary-500/10 to-transparent
                                flex items-center justify-center mb-10 mx-auto animate-pulse border border-primary-500/10 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-14 h-14 text-primary-500" />
                </div>
                <h3 className="font-black text-3xl mb-4 text-white uppercase tracking-tighter italic">{t.captureOrUpload}</h3>
                <p className="text-[10px] text-dark-500 max-w-[280px] font-black uppercase tracking-[0.2em] leading-relaxed group-hover:text-primary-500/50 transition-colors">{t.pointCamera}</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*,.jfif" className="hidden" onChange={handleFile} />

          <button
            onClick={handleScan}
            disabled={!image || loading || isCameraActive}
            className={`w-full mt-8 btn-primary flex items-center justify-center gap-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary-500/30
                       ${(!image || loading || isCameraActive) && 'opacity-50 cursor-not-allowed grayscale'}`}
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> {t.analyzingMarkers}</>
            ) : (
              <><Sparkles className="w-6 h-6" /> {t.runScan}</>
            )}
          </button>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-5 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em]">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Column */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-10 overflow-hidden relative bg-dark-950/40"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-64 h-64 text-primary-500" />
                </div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]" />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-primary-500 font-black">{t.verificationResult}</span>
                    </div>
                    <h3 className="text-4xl font-black capitalize tracking-tighter text-white leading-none">
                      {result.food_name.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <div className={`px-6 py-5 rounded-[2.5rem] flex flex-col items-center justify-center border-2
                    ${result.confidence > 0.8
                      ? 'bg-green-500/5 border-green-500/20 text-green-400 shadow-2xl shadow-green-500/5'
                      : 'bg-amber-500/5 border-amber-500/20 text-amber-400'}`}>
                    <span className="text-3xl font-black leading-none">{(result.confidence * 100).toFixed(0)}%</span>
                    <span className="text-[9px] uppercase font-black opacity-80 mt-2 tracking-[0.2em]">Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-12 relative z-10">
                  {[
                    { label: t.calories, value: `${result.nutrition.calories.toFixed(0)}`, unit: 'kcal', color: 'text-orange-400', icon: Flame },
                    { label: t.protein, value: `${result.nutrition.protein_g.toFixed(1)}`, unit: 'g', color: 'text-primary-500', icon: CheckCircle },
                    { label: t.carbs, value: `${result.nutrition.carbs_g.toFixed(1)}`, unit: 'g', color: 'text-secondary-400', icon: Maximize },
                    { label: t.fat, value: `${result.nutrition.fat_g.toFixed(1)}`, unit: 'g', color: 'text-amber-400', icon: RefreshCw },
                  ].map((n) => (
                    <div key={n.label} className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group overflow-hidden relative">
                      <div className="absolute top-[-20%] right-[-10%] opacity-0 group-hover:opacity-10 transition-opacity">
                         <n.icon className={`w-16 h-16 ${n.color}`} />
                      </div>
                      <div className="flex items-center justify-between mb-3 relative z-10">
                         <p className="text-[10px] text-dark-600 font-black uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">{n.label}</p>
                         <n.icon className={`w-4 h-4 ${n.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <div className="flex items-baseline gap-1.5 relative z-10">
                        <p className={`text-3xl font-black ${n.color}`}>{n.value}</p>
                        <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest">{n.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personalized AI Verdict */}
                {result.personalized_verdict && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-8 rounded-[3rem] border-2 mb-12 shadow-3xl relative overflow-hidden group
                      ${result.personalized_verdict === 'Safe' ? 'bg-green-500/5 border-green-500/20' : 
                        result.personalized_verdict === 'Caution' ? 'bg-amber-500/5 border-amber-500/20' : 
                        'bg-red-500/5 border-red-500/20'}`}
                  >
                    <div className="flex items-center gap-6 mb-6">
                      <div className={`p-5 rounded-3xl transition-transform duration-500 group-hover:rotate-12
                        ${result.personalized_verdict === 'Safe' ? 'bg-green-500/10 text-green-500 shadow-2xl shadow-green-500/20 border border-green-500/20' : 
                          result.personalized_verdict === 'Caution' ? 'bg-amber-400/10 text-amber-500 shadow-2xl shadow-amber-500/20 border border-amber-500/20' : 
                          'bg-red-500/10 text-red-500 shadow-2xl shadow-red-500/20 border border-red-500/20'}`}>
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className={`font-black uppercase tracking-[0.3em] text-[11px]
                            ${result.personalized_verdict === 'Safe' ? 'text-green-500' : 
                            result.personalized_verdict === 'Caution' ? 'text-amber-500' : 
                            'text-red-500'}`}>
                            {t.safetyVerdict}
                        </h4>
                        <p className="text-2xl font-black text-white italic tracking-tighter">
                           {result.personalized_verdict}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-dark-400 leading-relaxed font-bold italic border-l-2 border-white/5 pl-6 ml-10">
                      {result.personalized_explanation}
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={handleLog}
                    disabled={logging}
                    className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-3xl shadow-primary-500/40 active:scale-95 transition-transform"
                  >
                    {logging ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <><Plus className="w-6 h-6" /> {t.commitToLog}</>
                    )}
                  </button>
                  <button 
                    onClick={() => {setResult(null); setImage(null); setPreview(null);}}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/5 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                  >
                    {t.discardAndRescan}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-20 text-center flex flex-col items-center justify-center min-h-[500px] border-dashed border-dark-700/40 bg-dark-950/40"
              >
                <div className="w-28 h-28 rounded-[3rem] bg-dark-900 flex items-center justify-center mb-10 border border-white/5 shadow-inner group">
                   <Activity className="w-12 h-12 text-dark-800 group-hover:text-primary-500/50 transition-colors duration-700" />
                </div>
                <h3 className="font-black text-3xl mb-4 text-dark-500 uppercase tracking-tighter italic">{t.engineStandby}</h3>
                <p className="text-[10px] text-dark-700 max-w-[280px] leading-relaxed mx-auto italic font-black uppercase tracking-[0.2em]">
                  {t.scanningInstructions}
                </p>
                <div className="mt-12 flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-dark-800 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-dark-800 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-dark-800 animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert Panel */}
          <AnimatePresence>
            {result?.health_alerts?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-10 border-l-4 border-amber-500/50 shadow-3xl shadow-amber-500/10 bg-amber-500/[0.02]"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 shadow-2xl shadow-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-7 h-7 animate-pulse" />
                  </div>
                  <h3 className="font-black text-2xl text-amber-500 uppercase tracking-tighter leading-none">{t.clinicalWarnings}</h3>
                </div>
                <div className="space-y-5">
                  {result.health_alerts.map((alert, i) => (
                    <div key={i} className="flex gap-5 text-sm p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all group">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(245,158,11,1)]" />
                      <p className="text-amber-200/80 leading-relaxed font-bold italic tracking-wide">{alert}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Sensors Monitoring */}
      <SensorsPanel />
    </div>
  )
}

function SensorsPanel() {
  const { t } = useLanguage()
  const [motionData, setMotionData] = useState({ steps: 0, activity: 'Calibrated' });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    let lastAccel = { x: 0, y: 0, z: 0 };
    let steps = 0;

    const handleMotion = (event) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;
      const delta = Math.sqrt(
        Math.pow(accel.x - lastAccel.x, 2) +
        Math.pow(accel.y - lastAccel.y, 2) +
        Math.pow(accel.z - lastAccel.z, 2)
      );
      if (delta > 12) {
        steps++;
        setMotionData({ steps, activity: delta > 25 ? 'High Intensity' : 'Movement' });
      }
      lastAccel = { x: accel.x, y: accel.y, z: accel.z };
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [active]);

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`glass p-6 shadow-3xl border-white/10 w-72 backdrop-blur-3xl transition-all duration-500 ${active ? 'ring-2 ring-primary-500/50 scale-105' : 'opacity-80 grayscale'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]'}`} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">SENSORS {active ? (t.active || 'ACTIVE') : (t.sensorsOff || 'OFF')}</span>
          </div>
          <button 
            onClick={() => setActive(!active)}
            className={`text-[9px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300
                       ${active ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary-500 text-dark-950 shadow-2xl shadow-primary-500/20'}`}
          >
            {active ? t.lock : t.startLabel}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[8px] text-dark-600 uppercase font-black mb-2 tracking-[0.2em]">{t.state}</p>
            <p className="font-black text-sm truncate uppercase tracking-tighter text-white italic">{motionData.activity}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-dark-600 uppercase font-black mb-2 tracking-[0.2em]">{t.dynamics}</p>
            <p className="font-black text-3xl text-primary-500 leading-none italic">{motionData.steps}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
