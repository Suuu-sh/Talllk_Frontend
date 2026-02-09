'use client'

import { useEffect, useRef, useState } from 'react'
import { toRomaji } from 'wanakana'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Label, Situation } from '@/types'
import Header from '@/components/Header'
import TabNavigation, { Tab } from '@/components/TabNavigation'
import LabelInput from '@/components/LabelInput'
import { toTitleReading } from '@/lib/reading'

export default function SituationsPage() {
  const FILTER_STORAGE_KEY = 'talllk:situationsFilters'
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [activeTab] = useState<Tab>('situations')
  const [filterQuery, setFilterQuery] = useState('')
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false)
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [labelOptions, setLabelOptions] = useState<Label[]>([])
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  const [isLabelLoading, setIsLabelLoading] = useState(false)
  const labelDropdownRef = useRef<HTMLDivElement | null>(null)
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false)
  const visibilityDropdownRef = useRef<HTMLDivElement | null>(null)
  const [togglingFavoriteIds, setTogglingFavoriteIds] = useState<Set<number>>(new Set())
  const [togglingPublicIds, setTogglingPublicIds] = useState<Set<number>>(new Set())
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
    const stored = localStorage.getItem(FILTER_STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      setFilterQuery(typeof parsed.query === 'string' ? parsed.query : '')
      setFilterFavoritesOnly(Boolean(parsed.favoritesOnly))
      if (parsed.visibility === 'public' || parsed.visibility === 'private' || parsed.visibility === 'all') {
        setFilterVisibility(parsed.visibility)
      } else {
        setFilterVisibility(parsed.publicOnly ? 'public' : 'all')
      }
      setSelectedLabelIds(
        Array.isArray(parsed.labelIds)
          ? parsed.labelIds
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isFinite(id))
          : []
      )
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        query: filterQuery,
        favoritesOnly: filterFavoritesOnly,
        visibility: filterVisibility,
        labelIds: selectedLabelIds,
      })
    )
  }, [filterQuery, filterFavoritesOnly, filterVisibility, selectedLabelIds])

  useEffect(() => {
    if (!isLabelOpen) return
    if (labelOptions.length > 0) return
    let isMounted = true
    const fetchLabels = async () => {
      setIsLabelLoading(true)
      try {
        const response = await api.get('/labels')
        if (!isMounted) return
        setLabelOptions(response.data?.data || [])
      } catch (err) {
        if (!isMounted) return
        setLabelOptions([])
      } finally {
        if (!isMounted) return
        setIsLabelLoading(false)
      }
    }
    fetchLabels()
    return () => {
      isMounted = false
    }
  }, [isLabelOpen, labelOptions.length])

  useEffect(() => {
    if (!isLabelOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!labelDropdownRef.current) return
      if (!labelDropdownRef.current.contains(event.target as Node)) {
        setIsLabelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLabelOpen])

  useEffect(() => {
    if (!isVisibilityOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!visibilityDropdownRef.current) return
      if (!visibilityDropdownRef.current.contains(event.target as Node)) {
        setIsVisibilityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisibilityOpen])

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const titleReading = await toTitleReading(formData.title)
      await api.post('/situations', {
        title: formData.title,
        title_reading: titleReading,
        description: formData.description,
        label_ids: selectedLabels.map((label) => label.id),
      })
      setFormData({ title: '', description: '' })
      setSelectedLabels([])
      setShowModal(false)
      fetchSituations()
    } catch (err) {
      console.error(err)
    }
  }

  const updateSituation = (id: number, patch: Partial<Situation>) => {
    setSituations((prev) =>
      prev.map((situation) => (situation.id === id ? { ...situation, ...patch } : situation))
    )
  }

  const sortedSituations = [...situations].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order
    }
    return a.id - b.id
  })

  const normalizedQuery = toRomaji(filterQuery.trim()).toLowerCase()
  const filteredSituations = sortedSituations.filter((situation) => {
    if (filterFavoritesOnly && !situation.is_favorite) return false
    if (filterVisibility === 'public' && !situation.is_public) return false
    if (filterVisibility === 'private' && situation.is_public) return false
    if (selectedLabelIds.length > 0) {
      if (!situation.labels || situation.labels.length === 0) return false
      const hasMatch = situation.labels.some((label) => selectedLabelIds.includes(label.id))
      if (!hasMatch) return false
    }
    if (!normalizedQuery) return true
    const haystack = toRomaji(
      `${situation.title} ${situation.title_reading ?? ''} ${situation.description ?? ''}`
    ).toLowerCase()
    const tokens = haystack.split(/[^a-z0-9]+/).filter(Boolean)
    return tokens.some((token) => token.startsWith(normalizedQuery))
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
        labels: situation.labels ?? [],
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

  const favoriteCount = situations.filter((s) => s.is_favorite).length
  const publicCount = situations.filter((s) => s.is_public).length

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
        {/* Filter + Create */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3 animate-fadeUp relative z-40">
          {!isLoading && situations.length > 0 && (
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl glass-card-muted px-3 py-2 transition-all duration-300 focus-within:shadow-xl focus-within:shadow-brand-500/10 focus-within:border-brand-400/50 dark:focus-within:border-brand-500/50">
                <div className="flex items-center gap-2 flex-1">
                  <svg className="w-4 h-4 text-ink-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="タイトル・説明で検索"
                    className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => setFilterQuery('')}
                      className="p-0.5 rounded-full text-ink-faint hover:text-ink-body hover:bg-subtle transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 relative" ref={labelDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setFilterFavoritesOnly((prev) => !prev)}
                    aria-pressed={filterFavoritesOnly}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      filterFavoritesOnly
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 shadow-sm'
                        : 'text-ink-muted hover:bg-subtle hover:text-ink-sub'
                    }`}
                  >
                    お気に入り
                  </button>
                  <div className="relative" ref={visibilityDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisibilityOpen((prev) => !prev)
                        setIsLabelOpen(false)
                      }}
                      aria-pressed={filterVisibility !== 'all' || isVisibilityOpen}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        filterVisibility !== 'all' || isVisibilityOpen
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 shadow-sm'
                          : 'text-ink-muted hover:bg-subtle hover:text-ink-sub'
                      }`}
                    >
                      公開
                    </button>
                    {isVisibilityOpen && (
                      <div className="absolute left-0 top-full mt-2 w-40 rounded-2xl bg-surface border border-line shadow-xl z-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterVisibility('all')
                            setIsVisibilityOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            filterVisibility === 'all'
                              ? 'bg-layer text-ink-sub'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          すべて
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterVisibility('public')
                            setIsVisibilityOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            filterVisibility === 'public'
                              ? 'bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          公開のみ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterVisibility('private')
                            setIsVisibilityOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            filterVisibility === 'private'
                              ? 'bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'text-ink-muted hover:bg-subtle'
                          }`}
                        >
                          非公開のみ
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLabelOpen((prev) => !prev)
                      setIsVisibilityOpen(false)
                    }}
                    aria-pressed={isLabelOpen || selectedLabelIds.length > 0}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isLabelOpen || selectedLabelIds.length > 0
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 shadow-sm'
                        : 'text-ink-muted hover:bg-subtle hover:text-ink-sub'
                    }`}
                  >
                    ラベル{selectedLabelIds.length > 0 ? `(${selectedLabelIds.length})` : ''}
                  </button>
                  {isLabelOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-surface border border-line shadow-xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-line">
                        <span className="text-xs font-semibold text-ink-muted">
                          ラベル選択
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedLabelIds([])}
                          className="text-xs text-brand-500 hover:underline"
                          disabled={selectedLabelIds.length === 0}
                        >
                          すべて解除
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {isLabelLoading ? (
                          <div className="px-4 py-3 text-sm text-ink-muted">読み込み中...</div>
                        ) : labelOptions.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-ink-muted">ラベルがありません</div>
                        ) : (
                          <div className="p-2 flex flex-wrap gap-2">
                            {labelOptions.map((label) => {
                              const isSelected = selectedLabelIds.includes(label.id)
                              return (
                                <button
                                  key={label.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedLabelIds((prev) =>
                                      isSelected
                                        ? prev.filter((id) => id !== label.id)
                                        : [...prev, label.id]
                                    )
                                  }}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                    isSelected
                                      ? 'border-transparent text-white'
                                      : 'border-line text-ink-sub hover:bg-subtle'
                                  }`}
                                  style={isSelected ? { backgroundColor: label.color } : undefined}
                                >
                                  {label.name}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {situations.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-accent-soft text-sm flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl font-semibold"
              aria-label="新規作成"
              title="新規作成"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="sm:inline">新規作成</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative z-0">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-card-muted rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
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
        ) : situations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 animate-fadeUp mt-3">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full" />
              <div className="relative p-8 bg-brand-500/15 rounded-3xl">
                <svg className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink mb-3">
              まだシチュエーションがありません
            </h3>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              面接、デート、商談など、準備したい場面を追加して会話の練習を始めましょう
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-accent-soft inline-flex items-center justify-center w-10 h-10 p-0 "
              aria-label="最初のシチュエーションを作成"
              title="最初のシチュエーションを作成"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        ) : filteredSituations.length === 0 ? (
          <div className="text-center py-12 animate-fadeUp">
            <div className="inline-block p-6 bg-layer rounded-2xl mb-4">
              <svg className="w-12 h-12 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-ink mb-3">
              該当するシチュエーションがありません
            </h3>
            <p className="text-ink-muted mb-6">
              検索条件を変更してみてください
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeUp stagger-2 mt-3 pt-2">
            {filteredSituations.map((situation) => (
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
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-layer flex items-center justify-center text-ink">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 19a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-4l-2-2H6a2 2 0 00-2 2v14z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-brand-500 truncate">
                          {truncateText(situation.title)}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublic(situation, e)}
                          disabled={togglingPublicIds.has(situation.id)}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-line text-ink-muted bg-surface/70 hover:bg-surface transition-colors"
                        >
                          {situation.is_public ? '公開' : '非公開'}
                        </button>
                      </div>
                      {situation.labels && situation.labels.length > 0 ? (
                        <div className="flex items-center gap-2 text-xs text-ink-muted mt-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: situation.labels[0].color }}
                          />
                          <span className="truncate">{situation.labels[0].name}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-muted mt-2">ラベルなし</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleToggleFavorite(situation, e)}
                      disabled={togglingFavoriteIds.has(situation.id)}
                      className={`transition-all duration-300 ${
                        situation.is_favorite
                          ? 'text-yellow-500'
                          : 'text-ink-muted hover:text-ink'
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
              </div>
            ))}
          </div>
        )}
        </div>
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
              <div>
                <h3 className="text-2xl font-bold text-ink">
                  新しいシチュエーション
                </h3>
                <p className="text-sm text-ink-muted mt-1">準備したい場面を追加しましょう</p>
              </div>
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
                <label className="block text-sm font-semibold text-ink-sub mb-2">
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
                <label className="block text-sm font-semibold text-ink-sub mb-2">
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
                  <label className="block text-sm font-semibold text-ink-sub mb-2">
                    ラベル（任意）
                  </label>
                  <LabelInput
                    value={selectedLabels}
                    onChange={setSelectedLabels}
                    placeholder="ラベルを検索・作成"
                  />
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
