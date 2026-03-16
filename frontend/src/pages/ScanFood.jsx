import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Camera, Upload, Loader2, Sparkles, AlertTriangle, CheckCircle, X, 
  Maximize, RefreshCw, ShieldCheck, Plus, Flame, Activity
} from 'lucide-react'
import { recognizeFood, logMeal } from '../api'

export default function ScanFood() {
  const navigate = useNavigate()
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

  // Cleanup camera stream on unmount
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
      setError("Could not access camera. Please check permissions.")
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
      const errorMsg = err.response?.data?.detail || "Recognition failed. Please try again."
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
      setError("Failed to add meal to log.")
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Food Intelligence</span> 📸
        </h1>
        <p className="text-dark-400 mt-1">Scan or upload food for instant AI analysis and safety checks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interaction Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 h-fit"
        >
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => { stopCamera(); fileRef.current?.click(); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                ${!isCameraActive && !preview ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30' : 'bg-white/5 border border-white/5 text-dark-400'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button 
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                ${isCameraActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 border border-white/5 text-dark-400'}`}
            >
              <Camera className="w-4 h-4" /> {isCameraActive ? 'Cancel' : 'Use Camera'}
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 min-h-[380px] flex flex-col items-center justify-center
                       bg-dark-950/50 border-2 border-dashed
                       ${preview || isCameraActive ? 'border-primary-500/40 shadow-2xl shadow-primary-500/10' : 'border-white/10'}`}
          >
            {isCameraActive ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <button 
                    onClick={captureImage}
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center group shadow-2xl active:scale-90 transition-transform"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-dark-900 group-hover:border-primary-500 transition-colors" />
                  </button>
                </div>
                <div className="absolute top-4 right-4">
                  <button onClick={stopCamera} className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : preview ? (
              <div className="relative group p-4">
                <img src={preview} alt="Food preview" className="max-h-[380px] rounded-2xl object-cover shadow-2xl border border-white/10" />
                <button 
                  onClick={() => { setPreview(null); setImage(null); }}
                  className="absolute top-6 right-6 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} className="cursor-pointer text-center p-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500/20 to-secondary-400/20
                                flex items-center justify-center mb-6 mx-auto animate-pulse border border-primary-500/10">
                  <Sparkles className="w-10 h-10 text-primary-500" />
                </div>
                <p className="font-bold text-xl mb-2 text-white">Capture or Upload</p>
                <p className="text-sm text-dark-400 max-w-[200px]">Point your camera at your meal for instant analysis</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          <button
            onClick={handleScan}
            disabled={!image || loading || isCameraActive}
            className={`w-full mt-6 btn-primary flex items-center justify-center gap-3 py-4 text-lg font-bold shadow-xl shadow-primary-500/20
                       ${(!image || loading || isCameraActive) && 'opacity-50 cursor-not-allowed grayscale'}`}
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Biological Markers...</>
            ) : (
              <><Sparkles className="w-6 h-6" /> Run Intelligence Scan</>
            )}
          </button>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Column */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-32 h-32" />
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-primary-500 font-black">AI Verification Result</span>
                    </div>
                    <h3 className="text-3xl font-black capitalize tracking-tight text-white leading-none">
                      {result.food_name.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <div className={`px-5 py-3 rounded-2xl flex flex-col items-center justify-center border-2
                    ${result.confidence > 0.8
                      ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-lg shadow-green-500/5'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <span className="text-2xl font-black leading-none">{(result.confidence * 100).toFixed(0)}%</span>
                    <span className="text-[9px] uppercase font-black opacity-80 mt-1 tracking-widest">Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  {[
                    { label: 'Calories', value: `${result.nutrition.calories.toFixed(0)}`, unit: 'kcal', color: 'text-orange-400', icon: Flame },
                    { label: 'Protein', value: `${result.nutrition.protein_g.toFixed(1)}`, unit: 'g', color: 'text-primary-500', icon: CheckCircle },
                    { label: 'Carbs', value: `${result.nutrition.carbs_g.toFixed(1)}`, unit: 'g', color: 'text-secondary-400', icon: Maximize },
                    { label: 'Fat', value: `${result.nutrition.fat_g.toFixed(1)}`, unit: 'g', color: 'text-amber-400', icon: RefreshCw },
                  ].map((n) => (
                    <div key={n.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                         <p className="text-[10px] text-dark-500 font-black uppercase tracking-widest">{n.label}</p>
                         <n.icon className={`w-3 h-3 ${n.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <p className={`text-2xl font-black ${n.color}`}>{n.value}</p>
                        <p className="text-[10px] text-dark-500 font-bold uppercase">{n.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personalized AI Verdict */}
                {result.personalized_verdict && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border-2 mb-8 shadow-2xl relative overflow-hidden group
                      ${result.personalized_verdict === 'Safe' ? 'bg-green-500/5 border-green-500/20' : 
                        result.personalized_verdict === 'Caution' ? 'bg-amber-500/5 border-amber-500/20' : 
                        'bg-red-500/5 border-red-500/20'}`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`p-3 rounded-2xl
                        ${result.personalized_verdict === 'Safe' ? 'bg-green-500/20 text-green-400' : 
                          result.personalized_verdict === 'Caution' ? 'bg-amber-400/20 text-amber-400' : 
                          'bg-red-500/20 text-red-400'}`}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-black uppercase tracking-widest text-xs
                            ${result.personalized_verdict === 'Safe' ? 'text-green-500' : 
                            result.personalized_verdict === 'Caution' ? 'text-amber-500' : 
                            'text-red-500'}`}>
                            Safety Verdict
                        </h4>
                        <p className="text-xl font-black text-white">
                          Condition Match: {result.personalized_verdict}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-dark-300 leading-relaxed font-medium pl-2 border-l-2 border-white/5 ml-3">
                      {result.personalized_explanation}
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={handleLog}
                    disabled={logging}
                    className="w-full btn-primary py-4 text-md font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-primary-500/20"
                  >
                    {logging ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <><Plus className="w-5 h-5" /> Commit to Daily Log</>
                    )}
                  </button>
                  <button 
                    onClick={() => {setResult(null); setImage(null); setPreview(null);}}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-2xl text-xs font-bold transition-all"
                  >
                    Discard and Rescan
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-12 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed border-dark-700"
              >
                <div className="w-24 h-24 rounded-full bg-dark-900 flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                   <Activity className="w-10 h-10 text-dark-700" />
                </div>
                <h3 className="font-black text-2xl mb-3 text-dark-300 uppercase tracking-tight">Intelligence Engine Standby</h3>
                <p className="text-sm text-dark-500 max-w-[280px] leading-relaxed mx-auto italic font-medium">
                  Scanning for biological matter... Provide an image to begin molecular nutritional breakdown.
                </p>
                <div className="mt-8 flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-800" />
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
                className="glass p-6 border-l-4 border-amber-500/50 shadow-2xl shadow-amber-500/5"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-black text-lg text-amber-500 uppercase tracking-tighter">Clinical Safety Warnings</h3>
                </div>
                <div className="space-y-3">
                  {result.health_alerts.map((alert, i) => (
                    <div key={i} className="flex gap-4 text-sm p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-lg shadow-amber-500/50" />
                      <p className="text-amber-200/80 leading-relaxed font-bold italic">{alert}</p>
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
        setMotionData({ steps, activity: delta > 25 ? 'High Intensity' : 'Movement Detected' });
      }
      lastAccel = { x: accel.x, y: accel.y, z: accel.z };
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [active]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`glass p-5 shadow-2xl border-white/10 w-64 backdrop-blur-2xl transition-all ${active ? 'ring-2 ring-primary-500/30' : 'opacity-80 grayscale'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">SENSORS {active ? 'ACTIVE' : 'OFF'}</span>
          </div>
          <button 
            onClick={() => setActive(!active)}
            className="text-[10px] bg-white/10 px-2 py-1 rounded-md font-bold hover:bg-white/20 transition-colors"
          >
            {active ? 'LOCK' : 'START'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[8px] text-dark-500 uppercase font-black mb-1">State</p>
            <p className="font-bold text-sm truncate">{motionData.activity}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-dark-500 uppercase font-black mb-1">Dynamics</p>
            <p className="font-black text-xl text-primary-500 leading-none">{motionData.steps}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
