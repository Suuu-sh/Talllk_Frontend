'use client'

import { SignIn, SignUp, useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/contexts/I18nContext'

export default function Login() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsSignUp(params.get('mode') === 'signup')
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home')
    }
  }, [isLoaded, isSignedIn, router])

  const redirectUrl = '/home'

  return (
    <div className="min-h-screen flex bg-base overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-400/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-brand-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors text-sm font-medium">
          ← {t({ ja: 'ホームに戻る', en: 'Back to Home' })}
        </button>
        <button onClick={toggleTheme} className="btn-icon" aria-label={t({ ja: 'テーマ切替', en: 'Toggle theme' })}>
          {theme === 'light' ? '☾' : '☀'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto my-auto px-4 py-24">
        <div className="text-center mb-8">
          <h1 className="font-logo text-4xl font-bold text-brand-500 mb-2">Talllk</h1>
          <p className="text-ink-muted">
            {isSignUp ? t({ ja: 'アカウントを作成', en: 'Create your account' }) : t({ ja: 'ログイン', en: 'Sign in' })}
          </p>
        </div>

        <div className="flex justify-center">
          {isSignUp ? (
            <SignUp routing="hash" signInUrl="/login" forceRedirectUrl={redirectUrl} fallbackRedirectUrl={redirectUrl} />
          ) : (
            <SignIn routing="hash" signUpUrl="/login?mode=signup" forceRedirectUrl={redirectUrl} fallbackRedirectUrl={redirectUrl} />
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsSignUp((value) => !value)}
          className="mt-6 w-full text-center text-sm text-brand-600 hover:text-brand-700"
        >
          {isSignUp
            ? t({ ja: 'すでにアカウントがありますか？ログイン', en: 'Already have an account? Sign in' })
            : t({ ja: 'アカウントを作成する', en: 'Create an account' })}
        </button>
      </div>
    </div>
  )
}
