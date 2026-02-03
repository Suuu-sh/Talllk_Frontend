'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Situation } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'

export default function Dashboard() {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', labels: [] as string[] })
  const [labelInput, setLabelInput] = useState('')
  const [activeTab] = useState<Tab>('home')
  const [togglingFavoriteIds, setTogglingFavoriteIds] = useState<Set<number>>(new Set())
  const [togglingPublicIds, setTogglingPublicIds] = useState<Set<number>>(new Set())

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
      setSituations(response.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/situations', formData)
      setFormData({ title: '', description: '', labels: [] })
      setLabelInput('')
      setShowModal(false)
      fetchSituations()
    } catch (err) {
      console.error(err)
    }
  }

  const addLabel = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (formData.labels.includes(trimmed)) return
    setFormData((prev) => ({ ...prev, labels: [...prev.labels, trimmed] }))
  }

  const removeLabel = (label: string) => {
    setFormData((prev) => ({ ...prev, labels: prev.labels.filter((item) => item !== label) }))
  }

  const updateSituation = (id: number, patch: Partial<Situation>) => {
    setSituations((prev) =>
      prev.map((situation) => (situation.id === id ? { ...situation, ...patch } : situation))
    )
  }

  const handleToggleFavorite = async (situation: Situation, e: React.MouseEvent) => {
    e.stopPropagation()
    if (togglingFavoriteIds.has(situation.id)) return
    const newValue = !situation.is_favorite
    updateSituation(situation.id, { is_favorite: newValue })
    setTogglingFavoriteIds((prev) => new Set(prev).add(situation.id))
    try {
      await api.put(`/situations/${situation.id}`, {
        title: situation.title,
        description: situation.description,
        is_favorite: newValue,
      })
    } catch (err) {
      console.error(err)
      updateSituation(situation.id, { is_favorite: !newValue })
    } finally {
      setTogglingFavoriteIds((prev) => {
        const next = new Set(prev)
        next.delete(situation.id)
        return next
      })
    }
  }

  const handleTogglePublic = async (situation: Situation, e: React.MouseEvent) => {
    e.stopPropagation()
    if (togglingPublicIds.has(situation.id)) return
    const newValue = !situation.is_public
    updateSituation(situation.id, { is_public: newValue })
    setTogglingPublicIds((prev) => new Set(prev).add(situation.id))
    try {
      await api.put(`/situations/${situation.id}`, {
        title: situation.title,
        description: situation.description,
        is_public: newValue,
      })
    } catch (err) {
      console.error(err)
      updateSituation(situation.id, { is_public: !newValue })
    } finally {
      setTogglingPublicIds((prev) => {
        const next = new Set(prev)
        next.delete(situation.id)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeUp">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  シチュエーション
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  会話の場面ごとに準備を整えましょう
                </p>
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

            {/* Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-card-solid rounded-2xl p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-3" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : situations.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 animate-fadeUp">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full" />
                  <div className="relative p-8 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 rounded-3xl">
                    <svg className="w-16 h-16 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  まだシチュエーションがありません
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  面接、デート、商談など、準備したい場面を追加して会話の練習を始めましょう
                </p>
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
              /* Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...situations]
                  .sort((a, b) => Number(Boolean(b.is_favorite)) - Number(Boolean(a.is_favorite)))
                  .map((situation, index) => (
                  <div
                    key={situation.id}
                    onClick={() => router.push(`/situations/${situation.id}`)}
                    className={`group glass-card-solid rounded-2xl p-6 cursor-pointer card-hover border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/30 animate-fadeUp stagger-${Math.min(index + 1, 6)} ${
                      situation.is_favorite
                        ? 'bg-yellow-50/70 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/40 hover:border-yellow-300 dark:hover:border-yellow-600/60'
                        : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:pointer-events-none md:group-hover:pointer-events-auto">
                        <button
                          onClick={(e) => handleToggleFavorite(situation, e)}
                          disabled={togglingFavoriteIds.has(situation.id)}
                          className={`btn-icon-sm transition-all duration-300 ${
                            situation.is_favorite
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-500'
                              : 'hover:bg-brand-100 dark:hover:bg-brand-900/50 hover:text-brand-600 dark:hover:text-brand-400'
                          }`}
                          title={situation.is_favorite ? 'お気に入り解除' : 'お気に入りに追加'}
                        >
                          {togglingFavoriteIds.has(situation.id) ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill={situation.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleTogglePublic(situation, e)}
                          disabled={togglingPublicIds.has(situation.id)}
                          className={`btn-icon-sm transition-all duration-300 ${
                            situation.is_public
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                              : 'hover:bg-brand-100 dark:hover:bg-brand-900/50 hover:text-brand-600 dark:hover:text-brand-400'
                          }`}
                          title={situation.is_public ? '公開中（クリックで非公開に）' : '非公開（クリックで公開に）'}
                        >
                          {togglingPublicIds.has(situation.id) ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : situation.is_public ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                      {situation.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {situation.description || '説明なし'}
                    </p>
                    {situation.labels && situation.labels.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {situation.labels.map((label) => (
                          <span key={label} className="badge-brand text-xs">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium">
                      <span className="group-hover:underline">詳細を見る</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-8 max-w-md w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                新しいシチュエーション
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-icon-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：面接、デート、商談"
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  説明（任意）
                </label>
                  <textarea
                    placeholder="このシチュエーションについて簡単に説明してください"
                    className="input-field resize-none"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ラベル（任意）
                  </label>
                  <input
                    type="text"
                    placeholder="例：面接, 初対面"
                    className="input-field"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addLabel(labelInput)
                        setLabelInput('')
                      }
                    }}
                    onBlur={() => {
                      addLabel(labelInput)
                      setLabelInput('')
                    }}
                  />
                  {formData.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.labels.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => removeLabel(label)}
                          className="badge-brand text-xs"
                          title="削除"
                        >
                          {label} <span className="ml-1">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  作成する
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
