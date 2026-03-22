import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Navigation, Phone, 
  MapPin, Shield, Star, Activity, AlertTriangle, Loader2, Sparkles, HeartPulse,
  ChevronRight, CheckCircle2, LocateFixed, ExternalLink
} from 'lucide-react'
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
  const [location, setLocation] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState('prompt') // 'granted', 'denied', 'prompt'
  const lastFetchedLocation = useRef(null)

  useEffect(() => {
    // Check permission status but don't auto-start. Let user click 'Start'.
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermission(result.state)
        result.onchange = () => setPermission(result.state)
      })
    }
  }, [])

  const [hasStarted, setHasStarted] = useState(false)
  const watchIdRef = useRef(null)

  const initiateScan = () => {
    setHasStarted(true)
    handleStartLiveTracking()
  }

  const handleStartLiveTracking = () => {
    setLoading(true)
    if (!navigator.geolocation) {
       setPermission('denied')
       setLoading(false)
       return
    }

    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        
        const prev = lastFetchedLocation.current
        if (!prev || Math.abs(prev.lat - latitude) > 0.005 || Math.abs(prev.lon - longitude) > 0.005) {
          lastFetchedLocation.current = { lat: latitude, lon: longitude }
          setLocation({ lat: latitude, lon: longitude })
          setPermission('granted')
          await fetchNearbyHospitals(latitude, longitude)
        } else {
          setLoading(false)
        }
      },
      (err) => {
        console.error("GPS Error:", err)
        setPermission('denied')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const [manualArea, setManualArea] = useState('')

  const handleManualSearch = async () => {
    if (!manualArea) return
    setHasStarted(true)
    setLoading(true)
    try {
      console.log(`Searching for: ${manualArea}`)
      // Nomatim Geo-coding for the area string
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualArea)}`)
      const geoData = await geoRes.json()
      if (geoData.length > 0) {
        const { lat, lon } = geoData[0]
        setLocation({ lat: parseFloat(lat), lon: parseFloat(lon), manual: true })
        setPermission('granted')
        await fetchNearbyHospitals(parseFloat(lat), parseFloat(lon))
      } else {
        alert(t.areaNotFound || "Area not found. Please try a different name.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Manual search failed:", err)
      setLoading(false)
    }
  }

  const fetchNearbyHospitals = async (lat, lon) => {
    try {
      setLoading(true)
      // Including clinic, healthcare and doctors as requested
      const query = `[out:json];(node["amenity"~"hospital|clinic|doctors"](around:20000, ${lat}, ${lon});node["healthcare"](around:20000, ${lat}, ${lon});way["amenity"~"hospital|clinic|doctors"](around:20000, ${lat}, ${lon});way["healthcare"](around:20000, ${lat}, ${lon}););out center;`
      const res = await fetch(`https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      const data = await res.json()
      
      const mapped = (data?.elements || []).map(el => ({
        id: el.id,
        name: el.tags.name || (el.tags.amenity === 'clinic' ? t.localClinic || 'Neighborhood Clinic' : t.unknownHospital || 'Clinical Facility'),
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags["addr:street"] || el.tags["addr:full"] || t.addressAvailableOnMap || 'Address available on map',
        phone: el.tags.phone || el.tags["contact:phone"] || 'N/A',
        website: el.tags.website || null,
        emergency: el.tags.emergency === 'yes' || el.tags.amenity === 'hospital'
      }))

      const sorted = mapped.sort((a,b) => {
         const distA = Math.sqrt(Math.pow(a.lat-lat, 2) + Math.pow(a.lon-lon, 2))
         const distB = Math.sqrt(Math.pow(b.lat-lat, 2) + Math.pow(b.lon-lon, 2))
         return distA - distB
      })

      setHospitals(sorted)
    } catch (err) {
      console.error("Healthcare search failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 text-center lg:text-left">
        <div className="max-w-3xl">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center gap-2 shadow-2xl shadow-primary-500/5">
                <LocateFixed className="w-4 h-4 animate-pulse" />
                <span className="text-[9px] uppercase font-black tracking-[0.2em]">{t.nearbyCare || 'Live Hospital Radar'}</span>
            </div>
          </div>
          <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
            {t.medicalGuardianHub || 'Medical Guardian Hub'} 🛡️
          </h1>
          <p className="text-dark-400 text-lg font-bold italic border-l-4 border-primary-500/20 pl-8 leading-relaxed max-w-2xl">
             {t.gpsNote || 'Real-time triangulation of clinical facilities within your immediate biological perimeter. Active GPS required for precision mapping.'}
          </p>
          {location?.isIP && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3">
               <AlertTriangle className="w-4 h-4" />
               {t.ipNotice || 'Showing approximate facilities based on Network IP (Precision GPS Denied)'}
            </div>
          )}
        </div>
      </div>

      {!hasStarted && !loading ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-20 text-center border-dashed border-primary-500/30 bg-primary-500/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary-500/5 blur-3xl" />
             <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-8 animate-bounce relative z-10">
                <Navigation className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic relative z-10">
                {permission === 'denied' ? (t.gpsDenied || 'GPS Access Denied') : (t.enableGps || 'Activate Clinical Radar')}
            </h2>
            <p className="text-dark-400 font-bold mb-10 max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-relaxed relative z-10">
                {permission === 'denied' 
                  ? (t.gpsHelp || 'It looks like the GPS pulse is blocked. Please tap the "Lock icon" 🔒 next to the URL in your browser address bar and set Location to "Allow" to continue.') 
                  : (t.gpsRequest || 'System requires proximity data to identify surrounding hospital infrastructure.')}
            </p>
            <div className="flex flex-col gap-4 relative z-10 max-w-md mx-auto">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder={t.enterArea || "Enter City or Area Name..."}
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 transition-all font-bold"
                />
                <button 
                  onClick={handleManualSearch}
                  className="absolute right-3 top-2.5 p-3 rounded-xl bg-primary-500/20 text-primary-500 hover:bg-primary-500 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 my-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{t.or || 'OR'}</span>
                  <div className="h-px flex-1 bg-white/10" />
              </div>

              <button 
                onClick={initiateScan}
                className="btn-primary w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary-500/20"
              >
                 {permission === 'denied' ? <Activity className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                 {permission === 'denied' ? (t.retrySync || 'Refresh System Pulse') : (t.startScanning || 'Start Clinical Scanning')}
              </button>
              
              {permission === 'denied' && (
                <p className="text-[11px] text-amber-500 font-black italic uppercase tracking-widest animate-pulse mt-4">
                   ⚠️ {t.resetInstructions || 'Tap the Lock icon 🔒 in the address bar to reset GPS permission.'}
                </p>
              )}
            </div>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-40 glass border-dashed bg-dark-950/20">
          <div className="relative">
             <Loader2 className="w-20 h-20 text-primary-500 animate-spin" />
             <div className="absolute inset-0 bg-primary-500/20 blur-2xl animate-pulse" />
          </div>
          <p className="mt-10 text-primary-500/70 font-black uppercase tracking-[0.5em] text-[11px] animate-pulse">
             {t.triangulating || 'Scanning Regional Clinical Nodes...'}
          </p>
        </div>
      ) : hospitals.length === 0 && permission === 'granted' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-24 text-center border-dashed border-dark-800 bg-dark-950/40 opacity-80 backdrop-blur-xl">
               <div className="w-28 h-28 rounded-[3.5rem] bg-dark-900 border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-inner group">
                  <AlertTriangle className="w-12 h-12 text-dark-700 group-hover:text-amber-500/50 transition-colors duration-700" />
               </div>
               <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{t.noHospitalsFound || 'No Facilities Detected'}</h3>
               <p className="text-dark-500 font-bold uppercase tracking-[0.2em] text-[10px] italic max-w-xs mx-auto">{t.noHospitalsInfo || 'Increase search radius or verify your regional connectivity'}</p>
          </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          {hospitals.map((h, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass p-10 flex flex-col hover:bg-white/[0.04] hover:border-primary-500/40 transition-all duration-700 rounded-[3.5rem] group relative overflow-hidden"
            >
              <div className="absolute top-[-5%] right-[-5%] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                 <Shield className="w-64 h-64 text-primary-500" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-dark-900 flex items-center justify-center border-2 border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-500/5 group-hover:bg-primary-500/10 transition-colors" />
                    {h.emergency ? <Activity className="w-10 h-10 text-red-500 animate-pulse" /> : <Shield className="w-10 h-10 text-primary-500" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-primary-400 transition-colors">{h.name}</h3>
                    <p className="text-dark-400 text-[10px] uppercase font-bold tracking-widest italic mb-4 max-w-sm leading-relaxed">{h.address}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        {h.emergency && (
                          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20 italic animate-pulse">
                              Emergency Unit
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase tracking-widest border border-primary-500/20 italic">
                            Medical Facility
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[140px]">
                   {h.phone !== 'N/A' && (
                     <a 
                       href={`tel:${h.phone}`}
                       className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 group/call"
                     >
                        <Phone className="w-4 h-4 text-primary-500 group-hover/call:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.call || 'Call'}</span>
                     </a>
                   )}
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center justify-center gap-3 px-8 py-5 bg-primary-500 text-dark-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-3xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all overflow-hidden relative"
                   >
                        <MapPin className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{t.navigate || 'Navigate'}</span>
                        <ExternalLink className="w-3 h-3 relative z-10 opacity-50" />
                   </a>
                   
                   <a 
                     href={h.website || `https://www.google.com/search?q=${encodeURIComponent(h.name)}`}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 group/link"
                   >
                      <Sparkles className="w-4 h-4 text-secondary-400 group-hover/link:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{h.website ? (t.website || 'Website') : (t.clinicInfo || 'Clinic Info')}</span>
                   </a>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[8px] font-black text-dark-500 uppercase tracking-widest">Active Facility </span>
                 </div>
                 <p className="text-[8px] font-black text-dark-600 uppercase tracking-widest">{t.osmSource || 'OSM Real-time Meta'}</p>
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
                     {t.disclaimerNote || 'Hospital data is fetched from live global OpenStreetMap nodes. Precision may vary based on local infrastructure log data.'}
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
