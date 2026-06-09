import axios from 'axios'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authStorage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.talllk.net/api',
})

const getRuntimeClerkToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  const clerk = (window as any).Clerk
  const token = await clerk?.session?.getToken?.()
  return typeof token === 'string' && token.trim() ? token : null
}

api.interceptors.request.use(async (config) => {
  let token = getAuthToken()
  if (!token) {
    token = await getRuntimeClerkToken()
    if (token) setAuthToken(token)
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        await (window as any).Clerk?.signOut?.()
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
