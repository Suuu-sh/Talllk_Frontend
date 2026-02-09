'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Situation } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'
import { toTitleReading } from '@/lib/reading'

export default function Dashboard() {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab] = useState<Tab>('home')
  const [togglingFavoriteIds, setTogglingFavoriteIds] = useState<Set<number>>(new Set())
  const [dragSituation, setDragSituation] = useState<{ id: number; isFavorite: boolean } | null>(null)
  const [dragOverSituationId, setDragOverSituationId] = useState<number | null>(null)
  const readingBackfillIdsRef = useRef<Set<number>>(new Set())
  const truncateText = (text: string, maxLength = 10) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchSituations()
  }, [router])

  useEffect(() => {
    if (isLoading || situations.length === 0) return
    let canceled = false

    const backfillReadings = async () => {
      const targets = situations.filter(
        (situation) =>
          (!situation.title_reading || !situation.title_reading.trim()) &&
          !readingBackfillIdsRef.current.has(situation.id)
      )
      if (targets.length === 0) return

      for (const situation of targets) {
        readingBackfillIdsRef.current.add(situation.id)
        const titleReading = await toTitleReading(situation.title)
        if (canceled) return
        if (!titleReading) continue

        setSituations((prev) =>
          prev.map((item) =>
            item.id === situation.id ? { ...item, title_reading: titleReading } : item
          )
        )

        try {
          const payload: Record<string, unknown> = {
            title: situation.title,
            title_reading: titleReading,
            description: situation.description,
            is_public: situation.is_public,
            is_favorite: situation.is_favorite,
          }
          if (situation.labels) {
            payload.label_ids = situation.labels.map((label) => label.id)
          }
          await api.put(`/situations/${situation.id}`, payload)
        } catch (err) {
          console.error(err)
        }
      }
    }

    backfillReadings()

    return () => {
      canceled = true
    }
  }, [isLoading, situations])

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

  const updateSituation = (id: number, patch: Partial<Situation>) => {
    setSituations((prev) =>
      prev.map((situation) => (situation.id === id ? { ...situation, ...patch } : situation))
    )
  }

  const favoriteSituations = [...situations]
    .filter((s) => s.is_favorite)
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order
      }
      return a.id - b.id
    })

  const sortedSituations = [...situations].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order
    }
    return a.id - b.id
  })

  const reorderSituationGroup = async (isFavoriteGroup: boolean, draggedId: number, targetId: number) => {
    const group = sortedSituations.filter((situation) => situation.is_favorite === isFavoriteGroup)
    const fromIndex = group.findIndex((situation) => situation.id === draggedId)
    const toIndex = group.findIndex((situation) => situation.id === targetId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return

    const nextGroup = [...group]
    const [moved] = nextGroup.splice(fromIndex, 1)
    nextGroup.splice(toIndex, 0, moved)

    const orderById = new Map<number, number>()
    nextGroup.forEach((item, index) => {
      orderById.set(item.id, index + 1)
    })

    setSituations((prev) =>
      prev.map((situation) =>
        situation.is_favorite === isFavoriteGroup && orderById.has(situation.id)
          ? { ...situation, sort_order: orderById.get(situation.id)! }
          : situation
      )
    )

    try {
      await api.post('/situations/reorder', { ordered_ids: nextGroup.map((item) => item.id) })
    } catch (err) {
      console.error(err)
      fetchSituations()
    }
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
        labels: situation.labels ?? [],
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

  return (
    <div className="min-h-screen flex flex-col bg-base transition-colors duration-300">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-0 w-96 h-96 bg-brand-900/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-brand-900/2 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-brand-900/2 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/2 rounded-full blur-3xl" />
      </div>

      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={() => {}} />

      <main className="relative flex-1 min-h-0 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        {/* Welcome */}
        <div className="mb-6 animate-fadeUp">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-brand text-xs">Home</span>
                {!isLoading && favoriteSituations.length > 0 && (
                  <span className="text-xs text-ink-faint">{favoriteSituations.length}件</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-ink">
                お気に入り
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative z-0">
        {isLoading ? (
          <div className="h-full grid grid-flow-col grid-rows-1 md:grid-rows-2 auto-cols-[minmax(13rem,70vw)] sm:auto-cols-[minmax(16rem,48vw)] lg:auto-cols-[calc((100%-10rem)/3)] gap-4 overflow-x-auto scrollbar-hide pb-2 mt-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass-card-muted rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-layer" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-layer" />
                  </div>
                </div>
                <div className="h-6 bg-layer rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-layer rounded w-full mb-2" />
                <div className="h-4 bg-layer rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : favoriteSituations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 animate-fadeUp mt-3">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
              <div className="relative p-8 bg-yellow-500/15 rounded-3xl">
                <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink mb-3">
              お気に入りがありません
            </h3>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              シチュエーションタブでお気に入りを追加しましょう
            </p>
            <button
              onClick={() => router.push('/situations')}
              className="btn-accent-soft inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              シチュエーションを見る
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="h-full grid grid-flow-col grid-rows-1 md:grid-rows-2 auto-cols-[minmax(13rem,70vw)] sm:auto-cols-[minmax(16rem,48vw)] lg:auto-cols-[calc((100%-10rem)/3)] gap-4 overflow-x-auto scrollbar-hide pb-2 animate-fadeUp stagger-2 mt-3 pt-2">
            {favoriteSituations.map((situation) => (
              <div
                key={situation.id}
                onClick={() => router.push(`/situations/${situation.id}`)}
                draggable
                onDragStart={() => {
                  setDragSituation({ id: situation.id, isFavorite: situation.is_favorite })
                }}
                onDragEnd={() => {
                  setDragSituation(null)
                  setDragOverSituationId(null)
                }}
                onDragOver={(event) => {
                  if (!dragSituation || dragSituation.isFavorite !== situation.is_favorite) return
                  event.preventDefault()
                  setDragOverSituationId(situation.id)
                }}
                onDragLeave={() => setDragOverSituationId(null)}
                onDrop={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  if (!dragSituation || dragSituation.isFavorite !== situation.is_favorite) return
                  if (dragSituation.id === situation.id) return
                  setDragOverSituationId(null)
                  await reorderSituationGroup(situation.is_favorite, dragSituation.id, situation.id)
                }}
                className={`group glass-card-muted rounded-2xl p-5 cursor-pointer card-hover border border-line hover:border-brand-200 dark:hover:border-brand-500/30 flex flex-col ${
                  dragOverSituationId === situation.id
                    ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface'
                    : ''
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(situation, e)}
                    disabled={togglingFavoriteIds.has(situation.id)}
                    className={`btn-icon-sm transition-all duration-300 ${
                      situation.is_favorite
                        ? '!text-yellow-500'
                        : 'hover:bg-brand-500/15 hover:text-brand-500'
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
                </div>

                {/* Card Content */}
                <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                  {truncateText(situation.title)}
                </h3>
                <p className="text-ink-muted text-sm mb-2">
                  {truncateText(situation.description || '説明なし', 15)}
                </p>
                {situation.labels && situation.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {situation.labels.slice(0, 4).map((label) => (
                      <span
                        key={label.id}
                        className="badge text-xs"
                        style={{ backgroundColor: label.color, color: '#FFFFFF' }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {situation.labels.length > 4 && (
                      <span className="badge text-xs bg-layer text-ink-sub">
                        +{situation.labels.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center text-brand-500 text-sm font-medium mt-auto">
                  <span className="group-hover:underline">詳細を見る</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
