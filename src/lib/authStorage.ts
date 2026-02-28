const TOKEN_KEY = 'token'

const hasWindow = (): boolean => typeof window !== 'undefined'

export const getAuthToken = (): string | null => {
  if (!hasWindow()) return null
  const token = window.localStorage.getItem(TOKEN_KEY)
  return token && token.trim() ? token : null
}

export const setAuthToken = (token: string): void => {
  if (!hasWindow()) return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export const clearAuthToken = (): void => {
  if (!hasWindow()) return
  window.localStorage.removeItem(TOKEN_KEY)
}

export const hasAuthToken = (): boolean => Boolean(getAuthToken())
