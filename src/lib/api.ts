import axios from 'axios'
import { clearAuthToken, getAuthToken } from '@/lib/authStorage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.talllk.net/api',
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
