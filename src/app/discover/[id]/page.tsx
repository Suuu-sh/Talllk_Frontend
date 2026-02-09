'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PublicSituationDetail, Topic, Question } from '@/types'

type TreeNode = {
  id: number
  type: 'folder' | 'file'
  title: string
  answer?: string
  topicId?: number
  children?: TreeNode[]
}

export default function DiscoverDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [situation, setSituation] = useState<PublicSituationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingStar, setIsTogglingStar] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TreeNode | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (params.id) {
      fetchSituation()
    }
  }, [router, params.id])

  const fetchSituation = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<PublicSituationDetail>(`/discover/situations/${params.id}`)
      setSituation(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await api.post(`/discover/situations/${params.id}/save`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStar = async () => {
    if (!situation || isTogglingStar) return
    const newValue = !situation.is_starred
    const originalCount = situation.star_count ?? 0
    const nextCount = Math.max(0, originalCount + (newValue ? 1 : -1))
    setSituation({ ...situation, is_starred: newValue, star_count: nextCount })
    setIsTogglingStar(true)
    try {
      if (newValue) {
        await api.post(`/discover/situations/${params.id}/star`)
      } else {
        await api.delete(`/discover/situations/${params.id}/star`)
      }
    } catch (err) {
      console.error(err)
      setSituation({ ...situation, is_starred: !newValue, star_count: originalCount })
    } finally {
      setIsTogglingStar(false)
    }
  }

  const handleToggleFollow = async () => {
    if (!situation?.user || situation.user.is_self || isTogglingFollow) return
    const newValue = !situation.user.is_following
    const updatedUser = { ...situation.user, is_following: newValue }
    setSituation({ ...situation, user: updatedUser })
    setIsTogglingFollow(true)
    try {
      if (newValue) {
        await api.post(`/users/${situation.user.id}/follow`)
      } else {
        await api.delete(`/users/${situation.user.id}/follow`)
      }
    } catch (err) {
      console.error(err)
      setSituation({ ...situation, user: { ...situation.user, is_following: !newValue } })
    } finally {
      setIsTogglingFollow(false)
    }
  }

  const tree = useMemo(() => {
    if (!situation) return []
    const nodes = new Map<number, TreeNode>()
    const questionNodes = new Map<number, TreeNode>()
    const roots: TreeNode[] = []

    situation.topics.forEach((topic: Topic) => {
      nodes.set(topic.id, {
        id: topic.id,
        type: 'folder',
        title: topic.title,
        children: [],
      })
    })

    situation.topics.forEach((topic: Topic) => {
      const node = nodes.get(topic.id)
      if (!node) return
      if (topic.parent_id !== null) {
        const parent = nodes.get(topic.parent_id)
        if (parent && parent.children) {
          parent.children.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    situation.questions.forEach((question: Question) => {
      questionNodes.set(question.id, {
        id: question.id,
        type: 'file',
        title: question.question,
        answer: question.answer,
        topicId: question.topic_id,
        children: [],
      })
    })

    situation.questions.forEach((question: Question) => {
      const node = questionNodes.get(question.id)
      if (!node) return
      if (question.parent_id !== null) {
        const parent = questionNodes.get(question.parent_id)
        if (parent && parent.children) {
          parent.children.push(node)
        }
        return
      }

      const topicParent = nodes.get(question.topic_id)
      if (topicParent && topicParent.children) {
        topicParent.children.push(node)
      }
    })

    return roots
  }, [situation])

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeKey)) {
        next.delete(nodeKey)
      } else {
        next.add(nodeKey)
      }
      return next
    })
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    const nodeKey = `${node.type}-${node.id}`
    const hasChildren = (node.children && node.children.length > 0) ?? false
    const isExpanded = expandedNodes.has(nodeKey)
    const isFolder = node.type === 'folder'

    return (
      <div key={nodeKey} className="animate-fadeUp" style={{ animationDelay: `${depth * 30}ms` }}>
        <div
          className={`group flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 cursor-pointer
            ${isFolder
              ? 'bg-brand-50/50 dark:bg-brand-900/20 hover:bg-brand-100/70 dark:hover:bg-brand-900/30'
              : 'bg-surface hover:bg-subtle border border-line'
            }
          `}
          onClick={() => {
            if (hasChildren) {
              toggleNode(nodeKey)
            }
            if (!isFolder) {
              setSelectedTask(node)
            }
          }}
        >
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isFolder
              ? 'bg-brand-100 dark:bg-brand-800/50 text-brand-600 dark:text-brand-400'
              : 'bg-layer text-ink-muted'
          }`}>
            {isFolder ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {hasChildren && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleNode(nodeKey)
                  }}
                  className="text-ink-faint hover:text-ink-body transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <span className={`font-semibold line-clamp-2 break-words ${
                isFolder ? 'text-brand-700 dark:text-brand-300' : 'text-ink'
              }`}>
                {node.title}
              </span>
              {isFolder && node.children && node.children.length > 0 && (
                <span className="badge-brand text-xs flex-shrink-0">{node.children.length}</span>
              )}
            </div>
            {!isFolder && node.answer && (
              <p className="text-sm text-ink-muted mt-1 line-clamp-1">
                {node.answer}
              </p>
            )}
          </div>

          {/* View button for questions */}
          {!isFolder && (
            <div className="flex-shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedTask(node)
                }}
                className="btn-icon-sm"
                title="詳細"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 pl-4 border-l-2 border-brand-200/50 dark:border-brand-700/30 space-y-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base">
        {/* Skeleton Nav */}
        <div className="glass-card-solid sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-3">
              <div className="w-28 h-8 bg-layer rounded-lg animate-pulse" />
              <div className="hidden sm:block w-32 h-4 bg-layer rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Skeleton Header Card */}
          <div className="glass-card-solid rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-layer animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="w-48 h-6 bg-layer rounded animate-pulse" />
                <div className="w-64 h-4 bg-layer rounded animate-pulse" />
                <div className="flex gap-3">
                  <div className="w-20 h-4 bg-layer rounded animate-pulse" />
                  <div className="w-20 h-4 bg-layer rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          {/* Skeleton Tree */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface">
                <div className="w-10 h-10 rounded-xl bg-layer animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-layer rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  <div className="h-3 bg-layer rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!situation) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-ink mb-2">見つかりません</h2>
          <p className="text-ink-muted mb-4">このシチュエーションは存在しないか、公開されていません。</p>
          <button
            onClick={() => router.push('/discover')}
            className="btn-primary"
          >
            Discoverに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base transition-colors duration-300">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-0 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="glass-card-solid sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push('/discover')}
                className="btn-ghost flex items-center gap-2 text-brand-600 dark:text-brand-400 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Discoverに戻る</span>
              </button>
              <span className="hidden sm:block text-sm font-semibold text-ink-sub truncate max-w-[200px] lg:max-w-[300px]">
                {situation.title}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col">
        {/* Header Card */}
        <div className="glass-card-solid rounded-3xl p-6 mb-8 animate-fadeUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">{situation.title}</h1>
                <p className="text-ink-muted mt-1">{situation.description || '説明なし'}</p>
                {situation.user && (
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => router.push(`/users/${situation.user?.id}`)}
                      className="flex items-center gap-2 text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                      <span className="text-sm text-ink-muted">
                        {situation.user.name || '匿名ユーザー'}
                      </span>
                    </button>
                    {!situation.user.is_self && (
                      <button
                        onClick={handleToggleFollow}
                        disabled={isTogglingFollow}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          situation.user.is_following
                            ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-brand-500 text-white bg-brand-500 hover:bg-brand-600'
                        }`}
                      >
                        {situation.user.is_following ? 'フォロー中' : 'フォロー'}
                      </button>
                    )}
                  </div>
                )}
                {situation.labels && situation.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
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
                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="font-medium">{situation.topics.length}</span>
                    <span>フォルダ</span>
                  </div>
                  <div className="w-px h-4 bg-line" />
                  <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{situation.questions.length}</span>
                    <span>質問</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleStar}
                  disabled={isTogglingStar}
                  className={`btn-icon-sm transition-all duration-300 ${
                    situation.is_starred
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-ink-faint hover:text-yellow-500'
                  }`}
                  title={situation.is_starred ? 'スター解除' : 'スター'}
                >
                  {isTogglingStar ? (
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
                      : 'text-ink-muted'
                  }`}
                >
                  {situation.star_count ?? 0}
                </span>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary w-10 h-10 p-0 flex items-center justify-center"
                aria-label={isSaving ? '保存中' : 'この準備を保存'}
                title={isSaving ? '保存中' : 'この準備を保存'}
              >
                {isSaving ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`grid gap-6 ${selectedTask ? 'lg:grid-cols-2 lg:items-stretch' : ''} lg:flex-1 lg:min-h-0`}>
          {/* Tree View */}
          <div className={selectedTask ? 'lg:col-span-1 min-w-0 lg:h-full lg:overflow-y-auto lg:min-h-0' : ''}>
            {tree.length > 0 ? (
              <div className="space-y-3">{tree.map((node) => renderNode(node))}</div>
            ) : (
              <div className="text-center py-16 animate-fadeUp">
                <div className="inline-block p-6 bg-layer rounded-2xl mb-4">
                  <svg className="w-12 h-12 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">
                  コンテンツがありません
                </h3>
                <p className="text-ink-muted">
                  このシチュエーションにはまだフォルダや質問がありません
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel — Desktop */}
          {selectedTask && (
            <div className="hidden lg:block lg:col-span-1 min-w-0">
              <div className="glass-card-solid rounded-3xl overflow-hidden animate-scaleIn relative h-full flex flex-col min-h-0">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn-icon-sm absolute top-4 right-4"
                  aria-label="詳細を閉じる"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-6 pt-10 space-y-4 flex-1 overflow-y-auto min-h-0">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      質問
                    </div>
                    <div className="font-semibold text-ink">{selectedTask.title}</div>
                  </div>
                  <div className="divider" />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      回答
                    </div>
                    <div className="bg-inset rounded-xl p-4 text-ink-sub whitespace-pre-wrap">
                      {selectedTask.answer || '（未回答）'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Detail Panel — Mobile Bottom Sheet */}
          {selectedTask && (
            <div
              className="lg:hidden fixed inset-0 z-40 animate-fadeIn"
              onClick={() => setSelectedTask(null)}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div
                className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slideUp relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-edge" />
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn-icon-sm absolute top-4 right-4"
                  aria-label="詳細を閉じる"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="px-6 pt-6 pb-8 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      質問
                    </div>
                    <div className="font-semibold text-ink">{selectedTask.title}</div>
                  </div>
                  <div className="divider" />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      回答
                    </div>
                    <div className="bg-inset rounded-xl p-4 text-ink-sub whitespace-pre-wrap">
                      {selectedTask.answer || '（未回答）'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-8 max-w-sm w-full shadow-glass-lg animate-scaleIn text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">
              保存しました
            </h3>
            <p className="text-ink-muted mb-6">
              この準備があなたのシチュエーションに追加されました
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/home')}
                className="btn-primary w-full"
              >
                マイシチュエーションを見る
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn-secondary w-full"
              >
                このまま閲覧する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
