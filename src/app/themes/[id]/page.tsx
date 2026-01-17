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
  children?: TreeNode[]
}

export default function ThemeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [theme, setTheme] = useState<ThemeDetail | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [modalType, setModalType] = useState<'folder' | 'file'>('folder')
  const [parentTopicId, setParentTopicId] = useState<number | null>(null)
  const [parentQuestionId, setParentQuestionId] = useState<number | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editingQuestionHasChildren, setEditingQuestionHasChildren] = useState(false)
  const [themeForm, setThemeForm] = useState({ title: '', description: '' })
  const [folderForm, setFolderForm] = useState({ title: '', description: '' })
  const [questionForm, setQuestionForm] = useState({ question: '', answer: '' })
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TreeNode | null>(null)

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

    theme.topics.forEach((topic) => {
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
      questionNodes.set(question.id, {
        id: question.id,
        type: 'file',
        title: question.question,
        answer: question.answer,
        topicId: question.topic_id,
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
    setShowModal(true)
  }

  const openFileModal = (topicId: number, questionId: number | null) => {
    setModalType('file')
    setParentTopicId(topicId)
    setParentQuestionId(questionId)
    setEditingQuestionId(null)
    setEditingQuestionHasChildren(false)
    setQuestionForm({ question: '', answer: '' })
    setShowModal(true)
  }

  const openEditQuestionModal = (node: TreeNode) => {
    if (node.type !== 'file' || node.topicId === undefined) return
    setModalType('file')
    setParentTopicId(node.topicId)
    setParentQuestionId(null)
    setEditingQuestionId(node.id)
    setEditingQuestionHasChildren((node.children?.length ?? 0) > 0)
    setQuestionForm({ question: node.title, answer: node.answer ?? '' })
    setShowModal(true)
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
            }
          )
        } else {
          await api.post(`/themes/${params.id}/topics/${parentTopicId}/questions`, {
            question: questionForm.question,
            answer: questionForm.answer,
            parent_id: parentQuestionId,
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
          className="flex items-start justify-between bg-white border rounded-md px-4 py-3 cursor-pointer"
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
                  className="text-xs text-gray-600"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span>{node.type === 'folder' ? 'フォルダ' : '質問'}: {node.title}</span>
            </div>
            {node.type === 'file' && (
              <div className="text-sm text-gray-600 mt-1">
                回答: {node.answer || '（未回答）'}
              </div>
            )}
          </div>
          {node.type === 'folder' && (
            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  openFolderModal(node.id)
                }}
                className="text-sm text-blue-600"
              >
                + フォルダ
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  openFileModal(node.id, null)
                }}
                className="text-sm text-green-600"
              >
                + 質問
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
                className="text-sm text-blue-600"
              >
                編集
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedTask(node)
                }}
                className="text-sm text-purple-600"
              >
                拡大
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  if (node.topicId !== undefined) {
                    openFileModal(node.topicId, node.id)
                  }
                }}
                className="text-sm text-green-600"
              >
                + 深掘り
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
    return <div className="p-4">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-blue-600">← 戻る</button>
          <button
            onClick={() => openFolderModal(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + ルートフォルダ作成
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{theme.title}</h1>
              <p className="text-gray-600">{theme.description}</p>
            </div>
            <button
              onClick={() => {
                setThemeForm({ title: theme.title, description: theme.description })
                setShowThemeModal(true)
              }}
              className="text-sm text-blue-600"
            >
              テーマ編集
            </button>
          </div>
        </div>

        {selectedTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {tree.length > 0 ? (
                <div className="space-y-4">{tree.map((node) => renderNode(node))}</div>
              ) : (
                <div className="text-center text-gray-500 mt-12">
                  フォルダがありません。まずはルートフォルダを作成してください。
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6 h-fit lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">タスク概要</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-sm text-gray-500"
                >
                  閉じる
                </button>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-500">質問</div>
                <div className="font-semibold">{selectedTask.title}</div>
                <div className="text-sm text-gray-500">回答</div>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedTask.answer || '（未回答）'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {tree.length > 0 ? (
              <div className="space-y-4">{tree.map((node) => renderNode(node))}</div>
            ) : (
              <div className="text-center text-gray-500 mt-12">
                フォルダがありません。まずはルートフォルダを作成してください。
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
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
                    className="w-full px-3 py-2 border rounded-md mb-4"
                    value={folderForm.title}
                    onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
                  />
                  <textarea
                    placeholder="説明（任意）"
                    className="w-full px-3 py-2 border rounded-md mb-4"
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
                    className="w-full px-3 py-2 border rounded-md mb-4"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  />
                  <textarea
                    placeholder="回答（任意）"
                    className="w-full px-3 py-2 border rounded-md mb-4"
                    rows={4}
                    value={questionForm.answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                  />
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
                  className="flex-1 bg-gray-200 py-2 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">テーマを編集</h3>
            <form onSubmit={handleThemeSubmit}>
              <input
                type="text"
                required
                placeholder="テーマ名"
                className="w-full px-3 py-2 border rounded-md mb-4"
                value={themeForm.title}
                onChange={(e) => setThemeForm({ ...themeForm, title: e.target.value })}
              />
              <textarea
                placeholder="説明（任意）"
                className="w-full px-3 py-2 border rounded-md mb-4"
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
                  className="flex-1 bg-gray-200 py-2 rounded-md hover:bg-gray-300"
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
