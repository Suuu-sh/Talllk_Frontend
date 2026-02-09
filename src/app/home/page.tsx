'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Situation, UserProfile } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'
import { toTitleReading } from '@/lib/reading'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8080'

const getInitial = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const getAvatarGradient = (id: number): string => {
  const gradients = [
    'from-brand-400 to-brand-600',
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
  ]
  return gradients[id % gradients.length]
}

const dummyChartData1 = [
  { day: '月', value: 3 },
  { day: '火', value: 5 },
  { day: '水', value: 4 },
  { day: '木', value: 7 },
  { day: '金', value: 6 },
  { day: '土', value: 8 },
  { day: '日', value: 9 },
]

const dummyChartData2 = [
  { day: '月', value: 2 },
  { day: '火', value: 4 },
  { day: '水', value: 3 },
  { day: '木', value: 5 },
  { day: '金', value: 8 },
  { day: '土', value: 6 },
  { day: '日', value: 7 },
]

export default function Dashboard() {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
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
    fetchData()
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

  const fetchData = async () => {
    try {
      const [situationsRes, profileRes] = await Promise.all([
        api.get('/situations'),
        api.get<UserProfile>('/users/me'),
      ])
      setSituations(situationsRes.data.data || [])
      setProfile(profileRes.data)
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
      fetchData()
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
                <span className="badge-brand text-xs">Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold text-ink">
                ホーム
              </h1>
            </div>
          </div>
        </div>

        {/* 4-column Dashboard Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card-muted rounded-2xl p-5 min-h-[20rem]">
                <div className="h-6 bg-layer rounded-lg w-3/4 mb-4" />
                <div className="h-4 bg-layer rounded w-full mb-2" />
                <div className="h-4 bg-layer rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeUp stagger-2">
            {/* Column 1: Profile */}
            <div className="glass-card-muted rounded-2xl p-5 flex flex-col items-center justify-center min-h-[20rem]">
              {/* Avatar */}
              <div
                className={`w-20 h-20 rounded-full shadow-lg shrink-0 ${
                  profile?.avatar_url ? '' : `bg-gradient-to-br ${getAvatarGradient(profile?.id ?? 0)}`
                } flex items-center justify-center overflow-hidden mb-4`}
              >
                {profile?.avatar_url ? (
                  <img
                    src={`${API_BASE}${profile.avatar_url}`}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {getInitial(profile?.name || '')}
                  </span>
                )}
              </div>
              {/* Name */}
              <h2 className="text-lg font-bold text-ink mb-1">
                {profile?.name || 'ユーザー'}
              </h2>
              <p className="text-xs text-ink-muted mb-4">マイプロフィール</p>
              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-surface/70 px-3 py-2 text-center">
                  <div className="text-xs text-ink-muted">フォロー中</div>
                  <div className="text-xl font-bold text-ink">{profile?.following_count ?? 0}</div>
                </div>
                <div className="rounded-xl border border-line bg-surface/70 px-3 py-2 text-center">
                  <div className="text-xs text-ink-muted">フォロワー</div>
                  <div className="text-xl font-bold text-ink">{profile?.follower_count ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Column 2: Chart 1 — 学習進捗 */}
            <div className="glass-card-muted rounded-2xl p-5 flex flex-col min-h-[20rem]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">学習進捗</h3>
                <span className="text-[10px] text-ink-faint bg-layer px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dummyChartData1}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line, #e5e7eb)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-ink-muted, #9ca3af)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-muted, #9ca3af)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface, #fff)',
                        border: '1px solid var(--color-line, #e5e7eb)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-brand-500, #6366f1)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'var(--color-brand-500, #6366f1)' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Column 3: Chart 2 — アクティビティ */}
            <div className="glass-card-muted rounded-2xl p-5 flex flex-col min-h-[20rem]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">アクティビティ</h3>
                <span className="text-[10px] text-ink-faint bg-layer px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dummyChartData2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line, #e5e7eb)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-ink-muted, #9ca3af)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-muted, #9ca3af)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface, #fff)',
                        border: '1px solid var(--color-line, #e5e7eb)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#a855f7' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Column 4: Favorites */}
            <div className="glass-card-muted rounded-2xl p-5 flex flex-col min-h-[20rem]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">お気に入り</h3>
                {favoriteSituations.length > 0 && (
                  <span className="text-[10px] text-ink-faint bg-layer px-2 py-0.5 rounded-full">
                    {favoriteSituations.length}件
                  </span>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 scrollbar-hide">
                {favoriteSituations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                      <div className="relative p-4 bg-yellow-500/15 rounded-2xl">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-ink-sub mb-1">お気に入りがありません</p>
                    <p className="text-xs text-ink-muted mb-3">シチュエーションタブで追加</p>
                    <button
                      onClick={() => router.push('/situations')}
                      className="btn-accent-soft inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      シチュエーションを見る
                    </button>
                  </div>
                ) : (
                  favoriteSituations.map((situation) => (
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
                      className={`group flex items-center gap-3 rounded-xl p-3 cursor-pointer border border-line hover:border-brand-200 dark:hover:border-brand-500/30 bg-surface/50 hover:bg-surface transition-all duration-200 ${
                        dragOverSituationId === situation.id
                          ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-surface'
                          : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-500 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-ink truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {truncateText(situation.title, 15)}
                        </h4>
                        <p className="text-xs text-ink-muted truncate">
                          {truncateText(situation.description || '説明なし', 20)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(situation, e)}
                        disabled={togglingFavoriteIds.has(situation.id)}
                        className="text-yellow-500 shrink-0"
                        title="お気に入り解除"
                      >
                        {togglingFavoriteIds.has(situation.id) ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
