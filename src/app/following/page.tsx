'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PaginatedResponse, PublicSituation } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'
import { useI18n } from '@/contexts/I18nContext'

export default function FollowingPage() {
  const [activeTab] = useState<Tab>('following')
  const router = useRouter()
  const { t, language } = useI18n()
  const [situations, setSituations] = useState<PublicSituation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [togglingStarIds, setTogglingStarIds] = useState<Set<number>>(new Set())
  const [togglingFollowIds, setTogglingFollowIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const truncateText = (text: string, maxLength = 15) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

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
        `/discover/situations?following_only=true&page=${page}&per_page=12`
      )
      const newTotalPages = response.data.total_pages || 1

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

  const removeSituationsByUser = (userId: number) => {
    setSituations((prev) => prev.filter((situation) => situation.user?.id !== userId))
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
        removeSituationsByUser(userId)
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

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredSituations = normalizedQuery
    ? situations.filter((s) => {
        const haystack = `${s.title} ${s.description ?? ''} ${s.user?.name ?? ''}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
    : situations

  return (
    <div className="min-h-screen flex flex-col bg-base transition-colors duration-300">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-10 w-72 h-72 bg-brand-900/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-brand-900/2 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-brand-900/2 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-600/2 rounded-full blur-3xl" />
      </div>

      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={() => {}} />

      <main className="relative flex-1 min-h-0 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 animate-fadeUp">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-brand text-xs">Following</span>
              {!isLoading && situations.length > 0 && (
                <span className="text-xs text-ink-faint">
                  {language === 'en' ? `${situations.length} items` : `${situations.length}件`}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-ink">
              {t({ ja: 'フォロー中の準備', en: 'Following' })}
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            {!isLoading && situations.length > 0 && (
              <div className="flex-1 sm:w-64 flex items-center gap-2 rounded-2xl glass-card-muted px-3 py-2 transition-all duration-300 focus-within:shadow-xl focus-within:shadow-brand-500/10 focus-within:border-brand-400/50">
                <svg className="w-4 h-4 text-ink-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t({ ja: 'タイトル・ユーザーで検索', en: 'Search title or user' })}
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded-full text-ink-faint hover:text-ink-body transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-ink-faint min-w-[3rem] text-center">{page}/{totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full grid grid-flow-col grid-rows-1 md:grid-rows-2 auto-cols-[minmax(13rem,70vw)] sm:auto-cols-[minmax(16rem,48vw)] lg:auto-cols-[calc((100%-10rem)/3)] gap-4 overflow-x-auto scrollbar-hide pb-2 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card-muted rounded-2xl p-5 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-layer" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-layer" />
                    <div className="w-8 h-8 rounded-lg bg-layer" />
                  </div>
                </div>
                <div className="h-6 bg-layer rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-layer rounded w-full mb-2" />
                <div className="h-4 bg-layer rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredSituations.length === 0 ? (
          <div className="text-center py-12 animate-fadeUp">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full" />
              <div className="relative p-6 bg-brand-500/15 rounded-3xl">
                {searchQuery ? (
                  <svg className="w-14 h-14 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-14 h-14 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink mb-3">
              {searchQuery
                ? t({ ja: '該当するシチュエーションがありません', en: 'No matching situations' })
                : t({ ja: 'フォロー中の公開シチュエーションがありません', en: 'No public situations from following' })}
            </h3>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              {searchQuery
                ? t({ ja: '検索条件を変更してみてください', en: 'Try adjusting your search.' })
                : t({ ja: '見つけるタブから気になるユーザーをフォローしてみましょう', en: 'Follow users from Discover to see their situations.' })}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/discover')}
                className="btn-primary inline-flex items-center gap-2 "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t({ ja: '見つけるへ', en: 'Go to Discover' })}
              </button>
            )}
          </div>
        ) : (
          <div className="h-full grid grid-flow-col grid-rows-1 md:grid-rows-2 auto-cols-[minmax(13rem,70vw)] sm:auto-cols-[minmax(16rem,48vw)] lg:auto-cols-[calc((100%-10rem)/3)] gap-4 overflow-x-auto scrollbar-hide pb-2 pt-2">
            {filteredSituations.map((situation) => (
              <div
                key={situation.id}
                onClick={() => router.push(`/discover/${situation.id}`)}
                className="group glass-card-muted rounded-2xl p-5 cursor-pointer card-hover border border-line hover:border-brand-200 dark:hover:border-brand-500/30 flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center text-ink group-hover:scale-110  transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleStar(situation, e)}
                      disabled={togglingStarIds.has(situation.id)}
                      className={`btn-icon-sm transition-all duration-300 ${
                        situation.is_starred
                          ? '!text-yellow-500'
                          : 'hover:bg-brand-500/15 hover:text-brand-500'
                      }`}
                      title={situation.is_starred ? t({ ja: 'スター解除', en: 'Unstar' }) : t({ ja: 'スター', en: 'Star' })}
                    >
                      {togglingStarIds.has(situation.id) ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill={situation.is_starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.52 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.785.57-1.84-.197-1.54-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-xs font-semibold ${situation.is_starred ? 'text-yellow-600' : 'text-ink-faint'}`}>
                      {situation.star_count ?? 0}
                    </span>
                    <button
                      onClick={(e) => handleSave(situation.id, e)}
                      disabled={savingId === situation.id || savedIds.has(situation.id)}
                      className={`btn-icon-sm transition-all duration-300 ${
                        savedIds.has(situation.id)
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                          : 'hover:bg-brand-500/15 hover:text-brand-500'
                      }`}
                      title={savedIds.has(situation.id) ? t({ ja: '保存済み', en: 'Saved' }) : t({ ja: '自分にコピー', en: 'Copy to me' })}
                    >
                      {savingId === situation.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : savedIds.has(situation.id) ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <h3 className="text-xl font-bold text-brand-500 mb-1 group-hover:text-brand-400 transition-colors duration-300">
                  {truncateText(situation.title)}
                </h3>
                <p className="text-ink-muted text-sm mb-2">
                  {truncateText(situation.description || t({ ja: '説明なし', en: 'No description' }), 15)}
                </p>
                {situation.labels && situation.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted mb-2">
                    {situation.labels.slice(0, 3).map((label) => (
                      <span key={label.id} className="inline-flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="truncate max-w-[120px]">{label.name}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted mb-2">{t({ ja: 'ラベルなし', en: 'No label' })}</p>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between text-sm mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (situation.user?.id) router.push(`/users/${situation.user.id}`)
                    }}
                    className="flex items-center gap-2 text-left min-w-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                    <span className="text-sm text-ink-muted truncate">
                      {situation.user?.name || t({ ja: '匿名', en: 'Anonymous' })}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {situation.user && !situation.user.is_self && (
                      <button
                        onClick={(e) => handleToggleFollow(situation.user!.id, Boolean(situation.user?.is_following), e)}
                        disabled={togglingFollowIds.has(situation.user.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap ${
                          situation.user?.is_following
                            ? 'border-brand-500 text-brand-500 bg-brand-500/15'
                            : 'border-brand-500 text-white bg-brand-500 hover:bg-brand-600'
                        }`}
                      >
                        {situation.user?.is_following ? t({ ja: 'フォロー中', en: 'Following' }) : t({ ja: 'フォロー', en: 'Follow' })}
                      </button>
                    )}
                    <svg className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
