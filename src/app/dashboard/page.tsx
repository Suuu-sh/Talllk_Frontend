'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Situation } from '@/types'
import Header from '@/components/Header'

export default function Dashboard() {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchSituations()
  }, [router])

  const fetchSituations = async () => {
    try {
      const response = await api.get('/situations')
      setSituations(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/situations', formData)
      setFormData({ title: '', description: '' })
      setShowModal(false)
      fetchSituations()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">シチュエーション一覧</h2>
            <p className="text-gray-600 dark:text-gray-400">シチュエーション別に会話を準備しましょう</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規作成
          </button>
        </div>

        {situations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-full mb-6">
              <svg className="w-16 h-16 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">まだシチュエーションがありません</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">最初のシチュエーションを作成して、会話の準備を始めましょう</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              最初のシチュエーションを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {situations.map((situation) => (
              <div
                key={situation.id}
                onClick={() => router.push(`/situations/${situation.id}`)}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md cursor-pointer card-hover border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-500 transition-colors duration-200"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{situation.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {situation.description || '説明なし'}
                </p>
                <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">
                  詳細を見る
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">新しいシチュエーション</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：面接、デート、商談"
                  className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">説明（任意）</label>
                <textarea
                  placeholder="このシチュエーションについて簡単に説明してください"
                  className="input-field resize-none dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
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
