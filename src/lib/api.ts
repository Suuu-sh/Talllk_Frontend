import axios, { InternalAxiosRequestConfig } from 'axios'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authStorage'
import { clerkTokenOptions } from '@/lib/clerkToken'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.talllk.net/api',
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type AuthRetryConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean
}

const getRuntimeClerkToken = async ({
  skipCache = false,
}: {
  skipCache?: boolean
} = {}): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const clerk = window.Clerk
    if (!clerk || clerk.loaded === false || clerk.status === 'loading') {
      await sleep(100)
      continue
    }

    if (!clerk.session && !clerk.user) return null

    try {
      const token = await clerk.session?.getToken?.(
        clerkTokenOptions(skipCache ? { skipCache: true } : {})
      )
      if (typeof token === 'string' && token.trim()) return token
    } catch {
      return null
    }

    await sleep(100)
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
    const status = error?.response?.status
    const originalConfig = error?.config as AuthRetryConfig | undefined
    if (status === 401 && originalConfig && !originalConfig._authRetry) {
      clearAuthToken()
      const freshToken = await getRuntimeClerkToken({ skipCache: true })
      if (freshToken) {
        setAuthToken(freshToken)
        originalConfig._authRetry = true
        originalConfig.headers.Authorization = `Bearer ${freshToken}`
        return api(originalConfig)
      }
    }

    if (status === 401) {
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
