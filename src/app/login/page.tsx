'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function Login() {
  const router = useRouter()
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full animate-fadeUp">
        {/* Logo & Header */}
        <div className="text-center mb-10">
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
              className="btn-primary w-full py-4 text-base mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  処理中...
                </span>
              ) : isLogin ? 'ログイン' : 'アカウントを作成'}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            面接、デート、会議などの会話準備に
          </p>
        </div>
      </div>
    </div>
  )
}
