type ClerkSession = {
  getToken?: (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>
}

type ClerkRuntime = {
  loaded?: boolean
  status?: 'degraded' | 'error' | 'loading' | 'ready'
  session?: ClerkSession | null
  user?: unknown
  signOut?: () => Promise<void>
}

declare global {
  interface Window {
    Clerk?: ClerkRuntime
  }
}

const LEGACY_TOKEN_KEY = 'token'

let memoryToken: string | null = null

const hasWindow = (): boolean => typeof window !== 'undefined'

const clearLegacyPersistedToken = (): void => {
  if (!hasWindow()) return
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // Ignore storage access failures in restricted browser modes.
  }
}

export const getAuthToken = (): string | null => {
  const token = memoryToken?.trim()
  return token ? token : null
}

export const setAuthToken = (token: string): void => {
  const normalized = token.trim()
  memoryToken = normalized || null
  clearLegacyPersistedToken()
}

export const clearAuthToken = (): void => {
  memoryToken = null
  clearLegacyPersistedToken()
}

export const hasAuthToken = (): boolean => {
  if (Boolean(getAuthToken())) return true
  if (!hasWindow()) return false
  if (!window.Clerk) return true
  if (window.Clerk.loaded === false || window.Clerk.status === 'loading') return true
  return Boolean(window.Clerk.session || window.Clerk.user)
}
