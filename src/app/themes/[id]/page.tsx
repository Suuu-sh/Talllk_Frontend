'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Theme, Topic, Question } from '@/types'

type ThemeDetail = Theme & {
  topics: Topic[]
  questions: Question[]
}

type TreeNode = {
  id: number
  type: 'folder' | 'file'
  title: string
  answer?: string
  topicId?: number
  linkedTopicId?: number | null
  linkedTopicTitle?: string
  linkedQuestionId?: number | null
  linkedQuestionTitle?: string
  children?: TreeNode[]
}

export default function ThemeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [theme, setTheme] = useState<ThemeDetail | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalType, setModalType] = useState<'folder' | 'file'>('folder')
  const [parentTopicId, setParentTopicId] = useState<number | null>(null)
  const [parentQuestionId, setParentQuestionId] = useState<number | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editingQuestionHasChildren, setEditingQuestionHasChildren] = useState(false)
  const [themeForm, setThemeForm] = useState({ title: '', description: '' })
  const [folderForm, setFolderForm] = useState({ title: '', description: '' })
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    linkedTopicId: null as number | null,
    linkedQuestionId: null as number | null,
  })
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TreeNode | null>(null)
  const [createContext, setCreateContext] = useState({
    parentTopicId: null as number | null,
    parentQuestionId: null as number | null,
    allowFolder: true,
    allowQuestion: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchTheme()
    }
  }, [params.id])

  const fetchTheme = async () => {
    try {
      const response = await api.get(`/themes/${params.id}`)
      setTheme(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const tree = useMemo(() => {
    if (!theme) return []
    const nodes = new Map<number, TreeNode>()
    const questionNodes = new Map<number, TreeNode>()
    const roots: TreeNode[] = []
    const topicTitles = new Map<number, string>()
    const questionTitles = new Map<number, string>()

    theme.topics.forEach((topic) => {
      topicTitles.set(topic.id, topic.title)
      nodes.set(topic.id, {
        id: topic.id,
        type: 'folder',
        title: topic.title,
        children: [],
      })
    })

    theme.topics.forEach((topic) => {
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

    theme.questions.forEach((question) => {
      questionTitles.set(question.id, question.question)
      questionNodes.set(question.id, {
        id: question.id,
        type: 'file',
        title: question.question,
        answer: question.answer,
        topicId: question.topic_id,
        linkedTopicId: question.linked_topic_id,
        linkedTopicTitle: question.linked_topic_id
          ? topicTitles.get(question.linked_topic_id)
          : undefined,
        linkedQuestionId: question.linked_question_id,
        linkedQuestionTitle: question.linked_question_id
          ? questionTitles.get(question.linked_question_id)
          : undefined,
        children: [],
      })
    })

    theme.questions.forEach((question) => {
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
  }, [theme])

  const openFolderModal = (parentId: number | null) => {
    setModalType('folder')
    setParentTopicId(parentId)
    setParentQuestionId(null)
    setEditingQuestionId(null)
    setEditingQuestionHasChildren(false)
    setFolderForm({ title: '', description: '' })
    setShowCreateModal(false)
    setShowModal(true)
  }

  const openFileModal = (topicId: number, questionId: number | null) => {
    setModalType('file')
    setParentTopicId(topicId)
    setParentQuestionId(questionId)
    setEditingQuestionId(null)
    setEditingQuestionHasChildren(false)
    setQuestionForm({
      question: '',
      answer: '',
      linkedTopicId: null,
      linkedQuestionId: null,
    })
    setShowCreateModal(false)
    setShowModal(true)
  }

  const openEditQuestionModal = (node: TreeNode) => {
    if (node.type !== 'file' || node.topicId === undefined) return
    setModalType('file')
    setParentTopicId(node.topicId)
    setParentQuestionId(null)
    setEditingQuestionId(node.id)
    setEditingQuestionHasChildren((node.children?.length ?? 0) > 0)
    setQuestionForm({
      question: node.title,
      answer: node.answer ?? '',
      linkedTopicId: node.linkedTopicId ?? null,
      linkedQuestionId: node.linkedQuestionId ?? null,
    })
    setShowCreateModal(false)
    setShowModal(true)
  }

  const openCreateModal = (context: {
    parentTopicId: number | null
    parentQuestionId: number | null
    allowFolder: boolean
    allowQuestion: boolean
  }) => {
    setCreateContext(context)
    setShowCreateModal(true)
  }

  const handleDeleteQuestion = async () => {
    if (editingQuestionId === null || parentTopicId === null) return
    const message = editingQuestionHasChildren
      ? '子タスクも削除されます。削除しますか？'
      : '削除しますか？'
    if (!confirm(message)) return
    try {
      await api.delete(
        `/themes/${params.id}/topics/${parentTopicId}/questions/${editingQuestionId}`
      )
      setShowModal(false)
      setEditingQuestionId(null)
      setEditingQuestionHasChildren(false)
      await fetchTheme()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalType === 'folder') {
        await api.post(`/themes/${params.id}/topics`, {
          title: folderForm.title,
          description: folderForm.description,
          parent_id: parentTopicId,
        })
      } else if (modalType === 'file' && parentTopicId !== null) {
        if (editingQuestionId !== null) {
          await api.put(
            `/themes/${params.id}/topics/${parentTopicId}/questions/${editingQuestionId}`,
            {
              question: questionForm.question,
              answer: questionForm.answer,
              linked_topic_id: questionForm.linkedTopicId,
              linked_question_id: questionForm.linkedQuestionId,
            }
          )
        } else {
          await api.post(`/themes/${params.id}/topics/${parentTopicId}/questions`, {
            question: questionForm.question,
            answer: questionForm.answer,
            parent_id: parentQuestionId,
            linked_topic_id: questionForm.linkedTopicId,
            linked_question_id: questionForm.linkedQuestionId,
          })
        }
      }

      setShowModal(false)
      setEditingQuestionId(null)
      await fetchTheme()
    } catch (err) {
      console.error(err)
    }
  }

  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put(`/themes/${params.id}`, themeForm)
      setShowThemeModal(false)
      await fetchTheme()
    } catch (err) {
      console.error(err)
    }
  }

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
    const padding = 12 + depth * 16
    const nodeKey = `${node.type}-${node.id}`
    const hasChildren = (node.children && node.children.length > 0) ?? false
    const isExpanded = expandedNodes.has(nodeKey)
    return (
      <div key={`${node.type}-${node.id}`} style={{ paddingLeft: padding }}>
        <div
          className="flex items-start justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 cursor-pointer"
          onClick={() => {
            if (hasChildren) {
              toggleNode(nodeKey)
            }
          }}
        >
          <div>
            <div className="flex items-center gap-2 font-semibold">
              {hasChildren && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleNode(nodeKey)
                  }}
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span>{node.type === 'folder' ? 'フォルダ' : '質問'}: {node.title}</span>
            </div>
            {node.type === 'file' && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                回答: {node.answer || '（未回答）'}
              </div>
            )}
            {node.type === 'file' && node.linkedTopicTitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                紐付け: {node.linkedTopicTitle}
              </div>
            )}
            {node.type === 'file' && node.linkedQuestionTitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                紐付け(質問): {node.linkedQuestionTitle}
              </div>
            )}
          </div>
          {node.type === 'folder' && (
            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  openCreateModal({
                    parentTopicId: node.id,
                    parentQuestionId: null,
                    allowFolder: true,
                    allowQuestion: true,
                  })
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-lg"
                title="作成"
                aria-label="作成"
              >
                ＋
              </button>
            </div>
          )}
          {node.type === 'file' && (
            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  openEditQuestionModal(node)
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-lg"
                title="編集"
                aria-label="編集"
              >
                ✎
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedTask(node)
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-lg"
                title="拡大"
                aria-label="拡大"
              >
                ⤢
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  if (node.topicId !== undefined) {
                    openCreateModal({
                      parentTopicId: node.topicId,
                      parentQuestionId: node.id,
                      allowFolder: false,
                      allowQuestion: true,
                    })
                  }
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 text-lg"
                title="作成"
                aria-label="作成"
              >
                ＋
              </button>
            </div>
          )}
        </div>
        {node.children && node.children.length > 0 && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!theme) {
    return <div className="p-4 text-gray-600 dark:text-gray-400">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 text-lg"
          >
            ← 戻る
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{theme.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{theme.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  openCreateModal({
                    parentTopicId: null,
                    parentQuestionId: null,
                    allowFolder: true,
                    allowQuestion: false,
                  })
                }
                className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white text-2xl hover:bg-blue-700"
                title="作成"
                aria-label="作成"
              >
                ＋
              </button>
              <button
                onClick={() => {
                  setThemeForm({ title: theme.title, description: theme.description })
                  setShowThemeModal(true)
                }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 text-lg"
                title="編集"
                aria-label="編集"
              >
                ✎
              </button>
            </div>
          </div>
        </div>

        {selectedTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {tree.length > 0 ? (
                <div className="space-y-4">{tree.map((node) => renderNode(node))}</div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                  フォルダがありません。まずはルートフォルダを作成してください。
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">タスク概要</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  閉じる
                </button>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">質問</div>
                <div className="font-semibold">{selectedTask.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">回答</div>
                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {selectedTask.answer || '（未回答）'}
                </div>
                {selectedTask.linkedTopicTitle && (
                  <>
                    <div className="text-sm text-gray-500 dark:text-gray-400">紐付け</div>
                    <div className="text-gray-700 dark:text-gray-200">
                      {selectedTask.linkedTopicTitle}
                    </div>
                  </>
                )}
                {selectedTask.linkedQuestionTitle && (
                  <>
                    <div className="text-sm text-gray-500 dark:text-gray-400">紐付け(質問)</div>
                    <div className="text-gray-700 dark:text-gray-200">
                      {selectedTask.linkedQuestionTitle}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {tree.length > 0 ? (
              <div className="space-y-4">{tree.map((node) => renderNode(node))}</div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                フォルダがありません。まずはルートフォルダを作成してください。
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {modalType === 'folder'
                ? 'フォルダを追加'
                : editingQuestionId !== null
                ? '質問を編集'
                : '質問を追加'}
            </h3>
            <form onSubmit={handleSubmit}>
              {modalType === 'folder' ? (
                <>
                  <input
                    type="text"
                    required
                    placeholder="フォルダ名"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={folderForm.title}
                    onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
                  />
                  <textarea
                    placeholder="説明（任意）"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                    value={folderForm.description}
                    onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="質問"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  />
                  <textarea
                    placeholder="回答（任意）"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={4}
                    value={questionForm.answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                  />
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={questionForm.linkedTopicId ?? ''}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        linkedTopicId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">紐付けなし</option>
                    {theme.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        紐付け: {topic.title}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={questionForm.linkedQuestionId ?? ''}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        linkedQuestionId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">紐付け(質問)なし</option>
                    {theme.questions
                      .filter((q) => q.id !== editingQuestionId)
                      .map((q) => (
                        <option key={q.id} value={q.id}>
                          紐付け(質問): {q.question}
                        </option>
                      ))}
                  </select>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingQuestionId !== null ? '更新' : '作成'}
                </button>
                {modalType === 'file' && editingQuestionId !== null && (
                  <button
                    type="button"
                    onClick={handleDeleteQuestion}
                    className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                  >
                    削除
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">作成</h3>
            <div className="flex gap-2">
              {createContext.allowFolder && (
                <button
                  type="button"
                  onClick={() => openFolderModal(createContext.parentTopicId)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 text-lg"
                >
                  [F] フォルダ
                </button>
              )}
              {createContext.allowQuestion && createContext.parentTopicId !== null && (
                <button
                  type="button"
                  onClick={() =>
                    openFileModal(
                      createContext.parentTopicId!,
                      createContext.parentQuestionId
                    )
                  }
                  className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 text-lg"
                >
                  [Q] 質問
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 py-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {showThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">テーマを編集</h3>
            <form onSubmit={handleThemeSubmit}>
              <input
                type="text"
                required
                placeholder="テーマ名"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={themeForm.title}
                onChange={(e) => setThemeForm({ ...themeForm, title: e.target.value })}
              />
              <textarea
                placeholder="説明（任意）"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                rows={3}
                value={themeForm.description}
                onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  更新
                </button>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
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
