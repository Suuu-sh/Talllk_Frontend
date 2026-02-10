'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Situation, UserProfile } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'
import { toTitleReading } from '@/lib/reading'
import { useI18n } from '@/contexts/I18nContext'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

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

type ChartMetric = 'sessions' | 'topics' | 'questions'
type ChartRange = '1d' | '7d' | '30d'
type ChartType = 'line' | 'area' | 'bar'

const getMetricConfig = (lang: 'ja' | 'en'): Record<ChartMetric, { label: string; color: string }> => ({
  sessions: { label: lang === 'en' ? 'Sessions' : 'セッション数', color: '#6366f1' },
  topics: { label: lang === 'en' ? 'Topics added' : 'トピック追加', color: '#a855f7' },
  questions: { label: lang === 'en' ? 'Q&A added' : 'Q&A追加', color: '#06b6d4' },
})

const getRangeLabels = (lang: 'ja' | 'en'): Record<ChartRange, string> => ({
  '1d': '24h',
  '7d': lang === 'en' ? '7d' : '7日',
  '30d': lang === 'en' ? '30d' : '30日',
})

const getChartTypeLabels = (lang: 'ja' | 'en'): Record<ChartType, string> => ({
  line: lang === 'en' ? 'Line' : '折れ線',
  area: lang === 'en' ? 'Area' : 'エリア',
  bar: lang === 'en' ? 'Bar' : '棒グラフ',
})

const generateDummyData = (
  range: ChartRange,
  lang: 'ja' | 'en'
): Record<ChartMetric, { label: string; sessions: number; topics: number; questions: number }[]> => {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  if (range === '1d') {
    const hours = Array.from({ length: 12 }, (_, i) => `${(i * 2).toString().padStart(2, '0')}:00`)
    return {
      sessions: hours.map(h => ({ label: h, sessions: rand(0, 5), topics: rand(0, 3), questions: rand(0, 8) })),
      topics: hours.map(h => ({ label: h, sessions: rand(0, 5), topics: rand(0, 3), questions: rand(0, 8) })),
      questions: hours.map(h => ({ label: h, sessions: rand(0, 5), topics: rand(0, 3), questions: rand(0, 8) })),
    }
  }
  if (range === '7d') {
    const days = lang === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['月', '火', '水', '木', '金', '土', '日']
    const data = days.map(d => ({ label: d, sessions: rand(1, 10), topics: rand(0, 6), questions: rand(1, 15) }))
    return { sessions: data, topics: data, questions: data }
  }
  const days = Array.from({ length: 30 }, (_, i) =>
    lang === 'en' ? `${i + 1}` : `${i + 1}日`
  )
  const data = days.map(d => ({ label: d, sessions: rand(0, 12), topics: rand(0, 8), questions: rand(0, 20) }))
  return { sessions: data, topics: data, questions: data }
}

export default function Dashboard() {
  const router = useRouter()
  const { language, t } = useI18n()
  const [situations, setSituations] = useState<Situation[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab] = useState<Tab>('home')
  const [togglingFavoriteIds, setTogglingFavoriteIds] = useState<Set<number>>(new Set())
  const [dragSituation, setDragSituation] = useState<{ id: number; isFavorite: boolean } | null>(null)
  const [dragOverSituationId, setDragOverSituationId] = useState<number | null>(null)
  const [chartMetric, setChartMetric] = useState<ChartMetric>('sessions')
  const [chartRange, setChartRange] = useState<ChartRange>('7d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [chartDataCache] = useState(() => generateDummyData('7d', language))
  const [chartData, setChartData] = useState(chartDataCache)
  const readingBackfillIdsRef = useRef<Set<number>>(new Set())
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const truncateText = (text: string, maxLength = 15) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  useEffect(() => {
    setChartData(generateDummyData(chartRange, language))
  }, [chartRange, language])

  const metricConfig = getMetricConfig(language)
  const rangeLabels = getRangeLabels(language)
  const chartTypeLabels = getChartTypeLabels(language)

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

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.put<{ url: string }>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile({ ...profile, avatar_url: res.data.url })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
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
        {/* 2-column Dashboard */}
        {isLoading ? (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-4 animate-pulse">
            <div className="glass-card-muted rounded-2xl p-5 min-h-[22rem]" />
            <div className="flex flex-col gap-4">
              <div className="glass-card-muted rounded-2xl p-5 min-h-[10rem]" />
              <div className="glass-card-muted rounded-2xl p-5 min-h-[20rem]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-4 animate-fadeUp stagger-2">
            {/* Left Column: Profile */}
            <section className="glass-card-muted rounded-2xl lg:self-stretch lg:h-full flex flex-col">
              {/* Avatar + Info */}
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadAvatar} />
              <div className="flex flex-col items-center px-4 pt-4 pb-4">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className={`w-[13.5rem] h-[13.5rem] rounded-full border-[3px] border-surface shadow-lg shrink-0 cursor-pointer ${
                    profile?.avatar_url ? '' : `bg-gradient-to-br ${getAvatarGradient(profile?.id ?? 0)}`
                  } flex items-center justify-center overflow-hidden ring-2 ring-white/10 relative group`}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={`${API_BASE}${profile.avatar_url}`}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-white drop-shadow-sm">
                      {getInitial(profile?.name || '')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-200">
                    {uploadingAvatar ? (
                      <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-ink mt-3 mb-0.5">
                  {profile?.name || t({ ja: 'ユーザー', en: 'User' })}
                </h2>
                <p className="text-[11px] text-ink-faint tracking-wide uppercase mb-5">
                  {t({ ja: 'マイプロフィール', en: 'My Profile' })}
                </p>

                {/* Stats */}
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10 px-3 py-2.5 text-center">
                    <div className="text-xl font-bold text-ink leading-none mb-1">{profile?.following_count ?? 0}</div>
                    <div className="text-[10px] text-ink-muted font-medium">
                      {t({ ja: 'フォロー中', en: 'Following' })}
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 px-3 py-2.5 text-center">
                    <div className="text-xl font-bold text-ink leading-none mb-1">{profile?.follower_count ?? 0}</div>
                    <div className="text-[10px] text-ink-muted font-medium">
                      {t({ ja: 'フォロワー', en: 'Followers' })}
                    </div>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="w-full mt-3 flex items-center justify-center gap-4 text-[11px] text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{t({ ja: 'オンライン', en: 'Online' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.52 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.785.57-1.84-.197-1.54-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                    <span>
                      {favoriteSituations.length}{' '}
                      {t({ ja: 'お気に入り', en: 'favorites' })}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              {/* Favorites */}
              <section className="glass-card-muted rounded-2xl p-4 flex flex-col min-h-[10rem]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink">{t({ ja: 'お気に入り', en: 'Favorites' })}</h3>
                  {favoriteSituations.length > 0 && (
                    <span className="text-[10px] text-ink-faint bg-layer px-2 py-0.5 rounded-full">
                      {language === 'en' ? `${favoriteSituations.length} items` : `${favoriteSituations.length}件`}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
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
                      <p className="text-sm font-medium text-ink-sub mb-1">
                        {t({ ja: 'お気に入りがありません', en: 'No favorites yet' })}
                      </p>
                      <p className="text-xs text-ink-muted mb-3">
                        {t({ ja: 'シチュエーションタブで追加', en: 'Add from Situations' })}
                      </p>
                      <button
                        onClick={() => router.push('/situations')}
                        className="btn-accent-soft inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {t({ ja: 'シチュエーションを見る', en: 'Go to Situations' })}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favoriteSituations.slice(0, 4).map((situation) => (
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
                          className={`group flex items-start justify-between gap-3 rounded-2xl p-4 cursor-pointer border border-line bg-surface/40 hover:bg-surface/60 transition-all duration-200 ${
                            dragOverSituationId === situation.id
                              ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-surface'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-500 shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-brand-400 truncate">
                                  {truncateText(situation.title, 15)}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full border border-line text-ink-muted bg-surface/70">
                                  {situation.is_public
                                    ? t({ ja: '公開', en: 'Public' })
                                    : t({ ja: '非公開', en: 'Private' })}
                                </span>
                              </div>
                              {situation.labels && situation.labels.length > 0 ? (
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted mt-1">
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
                                <p className="text-xs text-ink-muted mt-1">
                                  {t({ ja: 'ラベルなし', en: 'No label' })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleToggleFavorite(situation, e)}
                              disabled={togglingFavoriteIds.has(situation.id)}
                              className="text-yellow-500 hover:opacity-80 transition-opacity"
                              title={t({ ja: 'お気に入り解除', en: 'Remove favorite' })}
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
                            <div className="text-ink-faint">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="8" cy="7" r="1.5" />
                                <circle cx="8" cy="12" r="1.5" />
                                <circle cx="8" cy="17" r="1.5" />
                                <circle cx="13" cy="7" r="1.5" />
                                <circle cx="13" cy="12" r="1.5" />
                                <circle cx="13" cy="17" r="1.5" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Activity Chart — CloudWatch style */}
              <section className="glass-card-muted rounded-2xl p-4 flex flex-col min-h-[20rem]">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">
                    {t({ ja: 'アクティビティ', en: 'Activity' })}
                  </h3>
                  <span className="text-[10px] text-ink-faint bg-layer px-2 py-0.5 rounded-full">
                    {t({ ja: '近日公開', en: 'Coming Soon' })}
                  </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Metric selector */}
                    <div className="flex items-center rounded-lg border border-line overflow-hidden">
                      {(Object.keys(metricConfig) as ChartMetric[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setChartMetric(m)}
                          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            chartMetric === m
                              ? 'bg-brand-500 text-white'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          {metricConfig[m].label}
                        </button>
                      ))}
                    </div>

                    {/* Chart type */}
                    <div className="flex items-center rounded-lg border border-line overflow-hidden">
                      {(Object.keys(chartTypeLabels) as ChartType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setChartType(t)}
                          className={`px-2 py-1 text-[11px] font-medium transition-colors ${
                            chartType === t
                              ? 'bg-brand-500 text-white'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          {chartTypeLabels[t]}
                        </button>
                      ))}
                    </div>

                    {/* Range selector */}
                    <div className="flex items-center rounded-lg border border-line overflow-hidden">
                      {(Object.keys(rangeLabels) as ChartRange[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setChartRange(r)}
                          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            chartRange === r
                              ? 'bg-brand-500 text-white'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          {rangeLabels[r]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="flex items-center gap-3 mb-3">
                  {(Object.keys(metricConfig) as ChartMetric[]).map((m) => {
                    const data = chartData[m]
                    const total = data.reduce((sum, d) => sum + d[m], 0)
                    const avg = data.length > 0 ? (total / data.length).toFixed(1) : '0'
                    const max = data.length > 0 ? Math.max(...data.map(d => d[m])) : 0
                    return (
                      <button
                        key={m}
                        onClick={() => setChartMetric(m)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                          chartMetric === m ? 'bg-surface/80 border border-line' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metricConfig[m].color }} />
                          <div className="text-left">
                            <div className="text-[10px] text-ink-muted">{metricConfig[m].label}</div>
                            <div className="text-sm font-bold text-ink leading-none">
                              {total}
                              <span className="text-[10px] font-normal text-ink-faint ml-1">
                                {t({ ja: '平均', en: 'avg' })} {avg} / {t({ ja: '最大', en: 'max' })} {max}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                  })}
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={chartData[chartMetric]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line, #e5e7eb)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" interval={chartRange === '30d' ? 4 : 0} />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--color-surface, #fff)', border: '1px solid var(--color-line, #e5e7eb)', borderRadius: '0.75rem', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey={chartMetric} name={metricConfig[chartMetric].label} fill={metricConfig[chartMetric].color} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : chartType === 'area' ? (
                      <AreaChart data={chartData[chartMetric]}>
                        <defs>
                          <linearGradient id={`grad-${chartMetric}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={metricConfig[chartMetric].color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={metricConfig[chartMetric].color} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line, #e5e7eb)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" interval={chartRange === '30d' ? 4 : 0} />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--color-surface, #fff)', border: '1px solid var(--color-line, #e5e7eb)', borderRadius: '0.75rem', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey={chartMetric} name={metricConfig[chartMetric].label} stroke={metricConfig[chartMetric].color} strokeWidth={2} fill={`url(#grad-${chartMetric})`} dot={{ r: 2, fill: metricConfig[chartMetric].color }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    ) : (
                      <LineChart data={chartData[chartMetric]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line, #e5e7eb)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" interval={chartRange === '30d' ? 4 : 0} />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--color-ink-muted, #9ca3af)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--color-surface, #fff)', border: '1px solid var(--color-line, #e5e7eb)', borderRadius: '0.75rem', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey={chartMetric} name={metricConfig[chartMetric].label} stroke={metricConfig[chartMetric].color} strokeWidth={2} dot={{ r: 2, fill: metricConfig[chartMetric].color }} activeDot={{ r: 5 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
