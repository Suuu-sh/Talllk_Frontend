const DEFAULT_API_ORIGIN = 'https://api.talllk.net'

const apiOrigin = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || `${DEFAULT_API_ORIGIN}/api`).replace(/\/api\/?$/, '')
  try {
    const parsed = new URL(raw)
    return parsed.origin
  } catch {
    return DEFAULT_API_ORIGIN
  }
}

const hasExplicitScheme = (value: string): boolean => /^[a-z][a-z\d+.-]*:/i.test(value)

const isSafeHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') return false
    return true
  } catch {
    return false
  }
}

export const resolveProfileImageSrc = (raw?: string): string => {
  const value = raw?.trim()
  if (!value) return ''

  if (value.startsWith('https://') || value.startsWith('http://')) {
    return isSafeHttpUrl(value) ? value : ''
  }

  if (hasExplicitScheme(value)) return ''

  try {
    return new URL(value.replace(/^\/+/, ''), `${apiOrigin()}/`).toString()
  } catch {
    return ''
  }
}
