import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ScanFood from './pages/ScanFood'
import MealLog from './pages/MealLog'
import HealthProfile from './pages/HealthProfile'
import NutritionSearch from './pages/NutritionSearch'
import CareNetwork from './pages/CareNetwork'
import Login from './pages/Login'
import { Navigate } from 'react-router-dom'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="scan" element={<ScanFood />} />
        <Route path="meals" element={<MealLog />} />
        <Route path="health" element={<HealthProfile />} />
        <Route path="search" element={<NutritionSearch />} />
        <Route path="care" element={<CareNetwork />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
