import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Recognition ──
export const recognizeFood = async (imageFile) => {
  const formData = new FormData()
  formData.append('file', imageFile)
  const res = await api.post('/api/v1/recognize/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ── Nutrition ──
export const searchNutrition = async (query) => {
  const res = await api.get(`/api/v1/nutrition/search?q=${encodeURIComponent(query)}`)
  return res.data
}

export const getFoodNutrition = async (foodName) => {
  const res = await api.get(`/api/v1/nutrition/food/${encodeURIComponent(foodName)}`)
  return res.data
}

export const getDailyTargets = async () => {
  const res = await api.get('/api/v1/nutrition/daily-targets')
  return res.data
}

// ── Meals ──
export const logMeal = async (mealData) => {
  const res = await api.post('/api/v1/meals/', mealData)
  return res.data
}

export const getTodayMeals = async () => {
  const res = await api.get('/api/v1/meals/today')
  return res.data
}

export const getDailySummary = async (lang = 'en') => {
  const res = await api.get(`/api/v1/meals/summary?lang=${lang}`)
  return res.data
}

export const getMealHistory = async (days = 7) => {
  const res = await api.get(`/api/v1/meals/history?days=${days}`)
  return res.data
}

export const deleteMeal = async (mealId) => {
  const res = await api.delete(`/api/v1/meals/${mealId}`)
  return res.data
}

// ── Health ──
export const checkHealth = async (nutritionData) => {
  const res = await api.post('/api/v1/health/check', nutritionData)
  return res.data
}

export const getHealthRules = async () => {
  const res = await api.get('/api/v1/health/rules')
  return res.data
}

export const getSupportedConditions = async () => {
  const res = await api.get('/api/v1/health/conditions')
  return res.data
}

export const getMedicalRecommendations = async () => {
  const res = await api.get('/api/v1/health/recommendations')
  return res.data
}

export const bookProvider = async (providerId) => {
  const res = await api.post('/api/v1/health/book', { provider_id: providerId })
  return res.data
}

export const verifyEmail = async (verifyData) => {
  const res = await api.post('/api/v1/auth/verify-email', verifyData)
  return res.data
}

// ── Auth ──
export const register = async (userData) => {
  const res = await api.post('/api/v1/auth/register', userData)
  return res.data
}

export const login = async (credentials) => {
  const res = await api.post('/api/v1/auth/login', credentials)
  return res.data
}

export const loginGuest = async (onboardingData) => {
  const res = await api.post('/api/v1/auth/guest', onboardingData)
  return res.data
}

// ── Profile ──
export const getUserProfile = async () => {
  const res = await api.get('/api/v1/auth/profile')
  return res.data
}

export const updateHealthProfile = async (profileData) => {
  const res = await api.put('/api/v1/auth/profile/health', profileData)
  return res.data
}

export const updateAccountProfile = async (accountData) => {
  const res = await api.put('/api/v1/auth/profile/account', accountData)
  return res.data
}

export default api
