'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import api from '@/lib/api'

export default function Login() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'signup') {
      setIsLogin(false)
    }
  }, [])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await api.post(endpoint, formData)

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/home')
      } else if (!isLogin) {
        setIsLogin(true)
        setError('登録完了。ログインしてください。')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-brand-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-400/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-brand-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ホームに戻る
        </button>
        <button
          onClick={toggleTheme}
          className="btn-icon"
          aria-label="テーマ切替"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Left panel (lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative max-w-md">
          <div className="mb-8 animate-fadeUp">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-3xl tracking-wider rounded-2xl shadow-glow mb-8">
              Talllk
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              もう、話題に困らない
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              大切な会話に自信を持って臨むための会話準備アプリ
            </p>
          </div>

          <div className="space-y-6 animate-fadeUp stagger-2">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'シチュエーション別に整理',
                desc: 'デート・面接・商談などシーンごとに準備',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '質問と回答を事前準備',
                desc: '聞かれそうなこと・話したいことをメモ',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                ),
                title: '本番で自信を持てる',
                desc: '準備があるから余裕が生まれる',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini social proof */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 animate-fadeUp stagger-3">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-gradient">1,200+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">ユーザー</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-2xl font-bold text-gradient">98%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">満足度</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel / Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-md animate-fadeUp">
          {/* Logo (mobile/tablet only) */}
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-2xl tracking-wider rounded-2xl shadow-glow">
                  Talllk
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {isLogin ? 'おかえりなさい' : 'はじめまして'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              会話の準備をサポートします
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? 'おかえりなさい' : 'はじめまして'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isLogin ? 'アカウントにログインしてください' : '無料でアカウントを作成'}
            </p>
          </div>

          {/* Card */}
          <div className="glass-card-solid rounded-3xl shadow-glass-lg p-8">
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 mb-8 bg-gray-100 dark:bg-gray-700/50 rounded-2xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isLogin
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                新規登録
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl animate-scaleIn ${
                  error.includes('完了')
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                    error.includes('完了') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {error.includes('完了') ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${
                    error.includes('完了')
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>{error}</p>
                </div>
              )}

              {/* Name Field (Register only) */}
              {!isLogin && (
                <div className="animate-fadeUp">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    お名前
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="山田太郎"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder={isLogin ? "パスワードを入力" : "6文字以上"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-base mt-2 shadow-glow flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </span>
                ) : (
                  <>
                    {isLogin ? 'ログイン' : 'アカウントを作成'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {!isLogin && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                無料 / 30秒で登録完了
              </p>
            )}
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              面接、デート、会議などの会話準備に
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
