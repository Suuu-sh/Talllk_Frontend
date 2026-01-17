'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Theme } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const [themes, setThemes] = useState<Theme[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchThemes()
  }, [router])

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes')
      setThemes(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/themes', formData)
      setFormData({ title: '', description: '' })
      setShowModal(false)
      fetchThemes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">talllk</h1>
          <button onClick={handleLogout} className="text-red-600">ログアウト</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">テーマ一覧</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + 新規作成
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => router.push(`/themes/${theme.id}`)}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">{theme.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{theme.description}</p>
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            テーマがありません。新規作成してください。
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">新しいテーマ</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                required
                placeholder="タイトル（例：面接、デート）"
                className="w-full px-3 py-2 border rounded-md mb-4"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="説明（任意）"
                className="w-full px-3 py-2 border rounded-md mb-4"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
