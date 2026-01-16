'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function Login() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await api.post(endpoint, formData)
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      } else if (!isLogin) {
        setIsLogin(true)
        setError('登録完了。ログインしてください。')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isLogin ? 'ログイン' : '新規登録'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>
          )}
          {!isLogin && (
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="名前"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="メールアドレス"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="パスワード"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            {isLogin ? 'ログイン' : '登録'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-blue-600 hover:text-blue-800"
          >
            {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
          </button>
        </form>
      </div>
    </div>
  )
}
