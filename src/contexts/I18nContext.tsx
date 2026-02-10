'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'ja' | 'en'

type Translation = {
  ja: string
  en: string
}

type I18nContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (text: Translation) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)
const STORAGE_KEY = 'talllk-language'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ja' || saved === 'en') {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (text: Translation) => (language === 'en' ? text.en : text.ja),
    }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
