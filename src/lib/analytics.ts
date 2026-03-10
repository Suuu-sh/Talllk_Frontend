export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? ''

const FIRST_TOUCH_KEY = 'talllk_first_touch_utm'
const LAST_TOUCH_KEY = 'talllk_last_touch_utm'

const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

type SearchParamsLike = {
  get: (name: string) => string | null
}

type AnalyticsValue = string | number | boolean | null | undefined
type EventParams = Record<string, AnalyticsValue>

type StoredAttribution = Partial<Record<(typeof UTM_PARAMS)[number], string>> & {
  captured_at?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function isEnabled() {
  return GA_MEASUREMENT_ID.length > 0
}

function safeReadStorage(key: string): StoredAttribution {
  if (!isBrowser()) {
    return {}
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as StoredAttribution
  } catch {
    return {}
  }
}

function safeWriteStorage(key: string, value: StoredAttribution) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function extractUtm(searchParams: SearchParamsLike): StoredAttribution {
  const utm: StoredAttribution = {}

  for (const key of UTM_PARAMS) {
    const value = searchParams.get(key)
    if (value) {
      utm[key] = value
    }
  }

  if (Object.keys(utm).length === 0) {
    return {}
  }

  return {
    ...utm,
    captured_at: new Date().toISOString(),
  }
}

function getAttributionParams() {
  const lastTouch = safeReadStorage(LAST_TOUCH_KEY)
  if (Object.keys(lastTouch).length > 0) {
    return lastTouch
  }

  return safeReadStorage(FIRST_TOUCH_KEY)
}

function callGtag(command: string, eventName: string, params: EventParams) {
  if (!isEnabled() || !isBrowser()) {
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag(command, eventName, params)
    return
  }

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = []
  }

  window.dataLayer.push([command, eventName, params])
}

export function captureUtmFromSearch(searchParams: SearchParamsLike) {
  if (!isBrowser()) {
    return
  }

  const utm = extractUtm(searchParams)
  if (Object.keys(utm).length === 0) {
    return
  }

  safeWriteStorage(LAST_TOUCH_KEY, utm)

  const firstTouch = safeReadStorage(FIRST_TOUCH_KEY)
  if (Object.keys(firstTouch).length === 0) {
    safeWriteStorage(FIRST_TOUCH_KEY, utm)
  }
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  callGtag('event', eventName, {
    ...getAttributionParams(),
    ...params,
  })
}

export function pageview(url: string) {
  trackEvent('page_view', {
    page_path: url,
    page_location: isBrowser() ? window.location.href : undefined,
    page_title: isBrowser() ? document.title : undefined,
  })
}

export function trackSignUpCompleted(method: 'email' | 'google' | 'apple' = 'email') {
  trackEvent('sign_up', { method })
}

export function trackLoginCompleted(method: 'email' | 'google' | 'apple' = 'email') {
  trackEvent('login', { method })
}
