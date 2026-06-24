import axios from 'axios'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authStorage'
import { clerkTokenOptions } from '@/lib/clerkToken'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.talllk.net/api',
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getRuntimeClerkToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = await window.Clerk?.session?.getToken?.(clerkTokenOptions())
    if (typeof token === 'string' && token.trim()) return token
    if (window.Clerk) return null
    await sleep(50)
  }

  return null
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
        await window.Clerk?.signOut?.()
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
