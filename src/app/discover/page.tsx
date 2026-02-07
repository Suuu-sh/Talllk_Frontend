'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PublicSituation, PaginatedResponse } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'

export default function DiscoverPage() {
  const [activeTab] = useState<Tab>('discover')
  const router = useRouter()
  const [situations, setSituations] = useState<PublicSituation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [togglingStarIds, setTogglingStarIds] = useState<Set<number>>(new Set())
  const [togglingFollowIds, setTogglingFollowIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchSituations()
  }, [router, page])

  // ページがフォーカスを取得したときにデータを再取得
  useEffect(() => {
    const handleFocus = () => {
      fetchSituations()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [page])

  const fetchSituations = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<PaginatedResponse<PublicSituation>>(
        `/discover/situations?page=${page}&per_page=12`
      )
      const newTotalPages = response.data.total_pages || 1

      // If current page exceeds total pages, reset to page 1
      if (page > newTotalPages) {
        setPage(1)
        return
      }

      setSituations(response.data.data || [])
      setTotalPages(newTotalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (savingId !== null || savedIds.has(id)) return
    setSavingId(id)
    try {
      await api.post(`/discover/situations/${id}/save`)
      setSavedIds((prev) => new Set(prev).add(id))
    } catch (err) {
      console.error(err)
    } finally {
      setSavingId(null)
    }
  }

  const updateSituation = (id: number, patch: Partial<PublicSituation>) => {
    setSituations((prev) =>
      prev.map((situation) => (situation.id === id ? { ...situation, ...patch } : situation))
    )
  }

  const updateFollowState = (userId: number, isFollowing: boolean) => {
    setSituations((prev) =>
      prev.map((situation) => {
        if (situation.user?.id !== userId) return situation
        return {
          ...situation,
          user: {
            ...situation.user,
            is_following: isFollowing,
          },
        }
      })
    )
  }

  const handleToggleStar = async (situation: PublicSituation, e: React.MouseEvent) => {
    e.stopPropagation()
    if (togglingStarIds.has(situation.id)) return
    const newValue = !situation.is_starred
    const originalCount = situation.star_count ?? 0
    const nextCount = Math.max(0, originalCount + (newValue ? 1 : -1))
    updateSituation(situation.id, { is_starred: newValue, star_count: nextCount })
    setTogglingStarIds((prev) => new Set(prev).add(situation.id))
    try {
      if (newValue) {
        await api.post(`/discover/situations/${situation.id}/star`)
      } else {
        await api.delete(`/discover/situations/${situation.id}/star`)
      }
    } catch (err) {
      console.error(err)
      updateSituation(situation.id, { is_starred: !newValue, star_count: originalCount })
    } finally {
      setTogglingStarIds((prev) => {
        const next = new Set(prev)
        next.delete(situation.id)
        return next
      })
    }
  }

  const handleToggleFollow = async (userId: number, isFollowing: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    if (togglingFollowIds.has(userId)) return
    const newValue = !isFollowing
    updateFollowState(userId, newValue)
    setTogglingFollowIds((prev) => new Set(prev).add(userId))
    try {
      if (newValue) {
        await api.post(`/users/${userId}/follow`)
      } else {
        await api.delete(`/users/${userId}/follow`)
      }
    } catch (err) {
      console.error(err)
      updateFollowState(userId, !newValue)
    } finally {
      setTogglingFollowIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
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
              みんなの準備を探す
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              公開されているシチュエーションを見つけて、自分の準備に活用しましょう
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-flow-col grid-rows-2 auto-cols-[minmax(18rem,80vw)] sm:auto-cols-[minmax(20rem,60vw)] lg:auto-cols-[calc((100%-7rem)/3)] gap-6 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              公開シチュエーションがありません
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              まだ公開されているシチュエーションがありません。しばらくお待ちください。
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-flow-col grid-rows-2 auto-cols-[minmax(18rem,80vw)] sm:auto-cols-[minmax(20rem,60vw)] lg:auto-cols-[calc((100%-7rem)/3)] gap-6 overflow-x-auto pb-2">
              {situations.map((situation, index) => (
                <div
                  key={situation.id}
                  onClick={() => router.push(`/discover/${situation.id}`)}
                  className={`group glass-card-solid rounded-2xl p-6 cursor-pointer card-hover border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/30 animate-fadeUp stagger-${Math.min(index + 1, 6)} flex flex-col h-[15rem]`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:pointer-events-none md:group-hover:pointer-events-auto">
                      {/* Star Button */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleStar(situation, e)}
                          disabled={togglingStarIds.has(situation.id)}
                          className={`btn-icon-sm transition-all duration-300 ${
                            situation.is_starred
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'hover:bg-brand-100 dark:hover:bg-brand-900/50 hover:text-brand-600 dark:hover:text-brand-400'
                          }`}
                          title={situation.is_starred ? 'スター解除' : 'スター'}
                        >
                          {togglingStarIds.has(situation.id) ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill={situation.is_starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.52 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.785.57-1.84-.197-1.54-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            situation.is_starred
                              ? 'text-yellow-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {situation.star_count ?? 0}
                        </span>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={(e) => handleSave(situation.id, e)}
                        disabled={savingId === situation.id || savedIds.has(situation.id)}
                        className={`btn-icon-sm transition-all duration-300 ${
                          savedIds.has(situation.id)
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                            : 'hover:bg-brand-100 dark:hover:bg-brand-900/50 hover:text-brand-600 dark:hover:text-brand-400'
                        }`}
                        title={savedIds.has(situation.id) ? '保存済み' : '保存'}
                      >
                        {savingId === situation.id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : savedIds.has(situation.id) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    {situation.title.length > 10 ? situation.title.slice(0, 10) + '...' : situation.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {(situation.description || '説明なし').length > 15 ? (situation.description || '説明なし').slice(0, 15) + '...' : (situation.description || '説明なし')}
                  </p>
                  {situation.labels && situation.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2 overflow-hidden max-h-6">
                      {situation.labels.map((label) => (
                        <span
                          key={label.id}
                          className="badge text-xs"
                          style={{ backgroundColor: label.color, color: '#FFFFFF' }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (situation.user?.id) {
                          router.push(`/users/${situation.user.id}`)
                        }
                      }}
                      className="flex items-center gap-2 text-left min-w-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {situation.user?.name || '匿名ユーザー'}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      {situation.user && !situation.user.is_self && (
                        <button
                          onClick={(e) =>
                            handleToggleFollow(
                              situation.user!.id,
                              Boolean(situation.user?.is_following),
                              e
                            )
                          }
                          disabled={togglingFollowIds.has(situation.user.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap ${
                            situation.user?.is_following
                              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-brand-500 text-white bg-brand-500 hover:bg-brand-600'
                          }`}
                        >
                          {situation.user?.is_following ? 'フォロー中' : 'フォロー'}
                        </button>
                      )}
                      <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium">
                        <span className="group-hover:underline">詳細を見る</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  前へ
                </button>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
