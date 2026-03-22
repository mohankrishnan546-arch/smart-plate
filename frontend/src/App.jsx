import { createContext, useState, useContext, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ScanFood from './pages/ScanFood'
import MealLog from './pages/MealLog'
import HealthProfile from './pages/HealthProfile'
import NutritionSearch from './pages/NutritionSearch'
import CareNetwork from './pages/CareNetwork'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { translations } from './translations'

export const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')
  const isAuthenticated = !!localStorage.getItem('token')

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
    
    // Focused Font Mapping
    const fonts = {
        'ta': "'Hind Madurai', 'Arima', 'Outfit', sans-serif",
        'hi': "'Hind', 'Outfit', sans-serif"
    }

    const selectedFont = fonts[lang] || "'Outfit', sans-serif"
    document.body.style.fontFamily = selectedFont
    
    // Force direct application to root for specific cases
    const root = document.getElementById('root')
    if (root) root.style.fontFamily = selectedFont

    // Global GPS Permission Request at Entry
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => console.log("GPS Precision Active"),
        () => console.log("GPS Restricted"),
        { enableHighAccuracy: false }
      )
    }
  }, [lang])

  const t = translations[lang] || translations.en

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="scan" element={<ScanFood />} />
          <Route path="meals" element={<MealLog />} />
          <Route path="health" element={<HealthProfile />} />
          <Route path="search" element={<NutritionSearch />} />
          <Route path="care" element={<CareNetwork />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </LanguageContext.Provider>
  )
}

export default App
