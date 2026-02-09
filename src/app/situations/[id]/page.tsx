'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Label, Situation, Topic, Question } from '@/types'
import LabelInput from '@/components/LabelInput'
import { toTitleReading } from '@/lib/reading'

type SituationDetail = Situation & {
  topics: Topic[]
  questions: Question[]
}

type TreeNode = {
  id: number
  type: 'folder' | 'file'
  title: string
  answer?: string
  topicId?: number
  sortOrder?: number
  linkedTopicId?: number | null
  linkedTopicTitle?: string
  linkedQuestionId?: number | null
  linkedQuestionTitle?: string
  children?: TreeNode[]
}

type DragItem = {
  kind: 'topic' | 'question'
  id: number
  topicId?: number
}

export default function SituationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [situation, setSituation] = useState<SituationDetail | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSituationModal, setShowSituationModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalType, setModalType] = useState<'folder' | 'file'>('folder')
  const [parentTopicId, setParentTopicId] = useState<number | null>(null)
  const [parentQuestionId, setParentQuestionId] = useState<number | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editingQuestionHasChildren, setEditingQuestionHasChildren] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null)
  const [editingTopicHasChildren, setEditingTopicHasChildren] = useState(false)
  const [situationForm, setSituationForm] = useState({ title: '', description: '' })
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [folderForm, setFolderForm] = useState({ title: '', description: '' })
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    linkedTopicId: null as number | null,
    linkedQuestionId: null as number | null,
  })
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TreeNode | null>(null)
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [createContext, setCreateContext] = useState({
    parentTopicId: null as number | null,
    parentQuestionId: null as number | null,
    allowFolder: true,
    allowQuestion: true,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'question' | 'topic' | 'situation'
    message: string
  } | null>(null)
  const [isTogglingPublic, setIsTogglingPublic] = useState(false)
  const [showPublicConfirm, setShowPublicConfirm] = useState(false)
  const [pendingPublicValue, setPendingPublicValue] = useState<boolean | null>(null)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSituation()
    }
  }, [params.id])

  const fetchSituation = async () => {
    try {
      const response = await api.get(`/situations/${params.id}`)
      setSituation(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getTopicById = (topicId: number) => situation?.topics.find((topic) => topic.id === topicId)
  const getQuestionById = (questionId: number) =>
    situation?.questions.find((question) => question.id === questionId)

  const parseDragItem = (event: React.DragEvent) => {
    if (dragItem) return dragItem
    const raw = event.dataTransfer.getData('text/plain')
    if (!raw) return null
    try {
      return JSON.parse(raw) as DragItem
    } catch {
      return null
    }
  }

  const handleDragStart = (item: DragItem) => (event: React.DragEvent) => {
    setDragItem(item)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify(item))
  }

  const handleDragEnd = () => {
    setDragItem(null)
    setDragOverKey(null)
  }

  const moveTopic = async (topicId: number, parentId: number | null) => {
    const topic = getTopicById(topicId)
    if (!topic) return
    try {
      await api.put(`/situations/${params.id}/topics/${topicId}`, {
        title: topic.title,
        description: topic.description,
        parent_id: parentId,
      })
      await fetchSituation()
    } catch (err) {
      console.error(err)
    }
  }

  const moveQuestion = async (options: {
    questionId: number
    sourceTopicId: number
    targetTopicId: number
    parentQuestionId: number | null
  }) => {
    const question = getQuestionById(options.questionId)
    if (!question) return
    try {
      await api.put(
        `/situations/${params.id}/topics/${options.sourceTopicId}/questions/${options.questionId}`,
        {
          question: question.question,
          answer: question.answer,
          linked_topic_id: question.linked_topic_id,
          linked_question_id: question.linked_question_id,
          parent_id: options.parentQuestionId,
          topic_id: options.targetTopicId,
        }
      )
      await fetchSituation()
    } catch (err) {
      console.error(err)
    }
  }

  const getTopicOrder = (parentId: number | null) => {
    if (!situation) return []
    return situation.topics
      .filter((topic) => (topic.parent_id ?? null) === parentId)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return a.id - b.id
      })
      .map((topic) => topic.id)
  }

  const getQuestionOrder = (topicId: number, parentQuestionId: number | null) => {
    if (!situation) return []
    return situation.questions
      .filter(
        (question) =>
          question.topic_id === topicId && (question.parent_id ?? null) === parentQuestionId
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return a.id - b.id
      })
      .map((question) => question.id)
  }

  const applyTopicOrder = (orderedIds: number[]) => {
    const orderById = new Map<number, number>()
    orderedIds.forEach((id, index) => orderById.set(id, index + 1))
    setSituation((prev) =>
      prev
        ? {
            ...prev,
            topics: prev.topics.map((topic) =>
              orderById.has(topic.id) ? { ...topic, sort_order: orderById.get(topic.id)! } : topic
            ),
          }
        : prev
    )
  }

  const applyQuestionOrder = (orderedIds: number[]) => {
    const orderById = new Map<number, number>()
    orderedIds.forEach((id, index) => orderById.set(id, index + 1))
    setSituation((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((question) =>
              orderById.has(question.id)
                ? { ...question, sort_order: orderById.get(question.id)! }
                : question
            ),
          }
        : prev
    )
  }

  const reorderIds = (ids: number[], draggedId: number, targetIndex: number) => {
    if (!ids.includes(draggedId)) return ids
    const next = ids.filter((id) => id !== draggedId)
    const insertIndex = Math.max(0, Math.min(targetIndex, next.length))
    next.splice(insertIndex, 0, draggedId)
    return next
  }

  const reorderTopics = async (parentId: number | null, orderedIds: number[]) => {
    if (!situation) return
    applyTopicOrder(orderedIds)
    try {
      await api.post(`/situations/${params.id}/topics/reorder`, {
        parent_id: parentId,
        ordered_ids: orderedIds,
      })
    } catch (err) {
      console.error(err)
      await fetchSituation()
    }
  }

  const reorderQuestions = async (
    topicId: number,
    parentQuestionId: number | null,
    orderedIds: number[]
  ) => {
    if (!situation) return
    applyQuestionOrder(orderedIds)
    try {
      await api.post(`/situations/${params.id}/topics/${topicId}/questions/reorder`, {
        parent_id: parentQuestionId,
        ordered_ids: orderedIds,
      })
    } catch (err) {
      console.error(err)
      await fetchSituation()
    }
  }

  const sortTreeNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      const orderA = a.sortOrder ?? 0
      const orderB = b.sortOrder ?? 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return a.id - b.id
    })
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTreeNodes(node.children)
      }
    })
  }

  const tree = useMemo(() => {
    if (!situation) return []
    const nodes = new Map<number, TreeNode>()
    const questionNodes = new Map<number, TreeNode>()
    const roots: TreeNode[] = []
    const topicTitles = new Map<number, string>()
    const questionTitles = new Map<number, string>()

    situation.topics.forEach((topic) => {
      topicTitles.set(topic.id, topic.title)
      nodes.set(topic.id, {
        id: topic.id,
        type: 'folder',
        title: topic.title,
        sortOrder: topic.sort_order,
        children: [],
      })
    })

    situation.topics.forEach((topic) => {
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

    situation.questions.forEach((question) => {
      questionTitles.set(question.id, question.question)
      questionNodes.set(question.id, {
        id: question.id,
        type: 'file',
        title: question.question,
        answer: question.answer,
        topicId: question.topic_id,
        sortOrder: question.sort_order,
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

    situation.questions.forEach((question) => {
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

    sortTreeNodes(roots)
    return roots
  }, [situation])

  const openFolderModal = (parentId: number | null) => {
    setModalType('folder')
    setParentTopicId(parentId)
    setParentQuestionId(null)
    setEditingQuestionId(null)
    setEditingQuestionHasChildren(false)
    setEditingTopicId(null)
    setEditingTopicHasChildren(false)
    setFolderForm({ title: '', description: '' })
    setShowCreateModal(false)
    setShowModal(true)
  }

  const openEditFolderModal = (node: TreeNode) => {
    if (node.type !== 'folder') return
    const topic = getTopicById(node.id)
    if (!topic) return
    setModalType('folder')
    setParentTopicId(topic.parent_id ?? null)
    setParentQuestionId(null)
    setEditingQuestionId(null)
    setEditingQuestionHasChildren(false)
    setEditingTopicId(node.id)
    setEditingTopicHasChildren((node.children?.length ?? 0) > 0)
    setFolderForm({ title: topic.title, description: topic.description || '' })
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

  const handleDeleteQuestion = () => {
    if (editingQuestionId === null || parentTopicId === null) return
    const message = editingQuestionHasChildren
      ? '子タスクも削除されます。削除しますか？'
      : '削除しますか？'
    setDeleteConfirm({ type: 'question', message })
  }

  const confirmDeleteQuestion = async () => {
    if (editingQuestionId === null || parentTopicId === null) return
    try {
      await api.delete(
        `/situations/${params.id}/topics/${parentTopicId}/questions/${editingQuestionId}`
      )
      setShowModal(false)
      setEditingQuestionId(null)
      setEditingQuestionHasChildren(false)
      await fetchSituation()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleDeleteTopic = () => {
    if (editingTopicId === null) return
    const message = editingTopicHasChildren
      ? '子フォルダ・質問も削除されます。削除しますか？'
      : '削除しますか？'
    setDeleteConfirm({ type: 'topic', message })
  }

  const confirmDeleteTopic = async () => {
    if (editingTopicId === null) return
    try {
      await api.delete(`/situations/${params.id}/topics/${editingTopicId}`)
      setShowModal(false)
      setEditingTopicId(null)
      setEditingTopicHasChildren(false)
      await fetchSituation()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleDeleteSituation = () => {
    const hasChildren = (situation?.topics?.length ?? 0) > 0 || (situation?.questions?.length ?? 0) > 0
    const message = hasChildren
      ? 'すべてのフォルダ・質問も削除されます。削除しますか？'
      : 'このシチュエーションを削除しますか？'
    setDeleteConfirm({ type: 'situation', message })
  }

  const confirmDeleteSituation = async () => {
    try {
      await api.delete(`/situations/${params.id}`)
      router.push('/home')
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalType === 'folder') {
        if (editingTopicId !== null) {
          await api.put(`/situations/${params.id}/topics/${editingTopicId}`, {
            title: folderForm.title,
            description: folderForm.description,
            parent_id: parentTopicId,
          })
        } else {
          await api.post(`/situations/${params.id}/topics`, {
            title: folderForm.title,
            description: folderForm.description,
            parent_id: parentTopicId,
          })
        }
      } else if (modalType === 'file' && parentTopicId !== null) {
        if (editingQuestionId !== null) {
          await api.put(
            `/situations/${params.id}/topics/${parentTopicId}/questions/${editingQuestionId}`,
            {
              question: questionForm.question,
              answer: questionForm.answer,
              linked_topic_id: questionForm.linkedTopicId,
              linked_question_id: questionForm.linkedQuestionId,
            }
          )
        } else {
          await api.post(`/situations/${params.id}/topics/${parentTopicId}/questions`, {
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
      setEditingTopicId(null)
      setEditingTopicHasChildren(false)
      await fetchSituation()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSituationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const titleReading = await toTitleReading(situationForm.title)
      await api.put(`/situations/${params.id}`, {
        title: situationForm.title,
        title_reading: titleReading,
        description: situationForm.description,
        label_ids: selectedLabels.map((label) => label.id),
      })
      setShowSituationModal(false)
      await fetchSituation()
    } catch (err) {
      console.error(err)
    }
  }

  const updatePublicStatus = async (newValue: boolean) => {
    if (!situation || isTogglingPublic) return
    setSituation({ ...situation, is_public: newValue })
    setIsTogglingPublic(true)
    try {
      await api.put(`/situations/${params.id}`, {
        title: situation.title,
        description: situation.description,
        is_public: newValue,
        labels: situation.labels ?? [],
      })
    } catch (err) {
      console.error(err)
      setSituation({ ...situation, is_public: !newValue })
    } finally {
      setIsTogglingPublic(false)
    }
  }

  const handlePublicClick = () => {
    if (!situation || isTogglingPublic) return
    const nextValue = !situation.is_public
    setPendingPublicValue(nextValue)
    setShowPublicConfirm(true)
  }

  const handleConfirmPublic = async () => {
    if (pendingPublicValue === null) return
    const nextValue = pendingPublicValue
    setShowPublicConfirm(false)
    setPendingPublicValue(null)
    await updatePublicStatus(nextValue)
  }

  const handleToggleFavorite = async () => {
    if (!situation || isTogglingFavorite) return
    const newValue = !situation.is_favorite
    setSituation({ ...situation, is_favorite: newValue })
    setIsTogglingFavorite(true)
    try {
      await api.put(`/situations/${params.id}`, {
        title: situation.title,
        description: situation.description,
        is_favorite: newValue,
        labels: situation.labels ?? [],
      })
    } catch (err) {
      console.error(err)
      setSituation({ ...situation, is_favorite: !newValue })
    } finally {
      setIsTogglingFavorite(false)
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

  const getTopicParentId = (topicId: number) => {
    const topic = situation?.topics.find((item) => item.id === topicId)
    return topic?.parent_id ?? null
  }

  const getQuestionParentId = (questionId: number) => {
    const question = situation?.questions.find((item) => item.id === questionId)
    return question?.parent_id ?? null
  }

  const getQuestionTopicId = (questionId: number) => {
    const question = situation?.questions.find((item) => item.id === questionId)
    return question?.topic_id
  }

  const renderTopicDropZone = (parentId: number | null, index: number) => {
    const zoneKey = `topic-drop-${parentId ?? 'root'}-${index}`
    return (
      <div
        key={zoneKey}
        className={`h-3 rounded-xl transition-all duration-150 ${
          dragOverKey === zoneKey ? 'bg-brand-200/70 dark:bg-brand-700/40' : 'bg-transparent'
        }`}
        onDragOver={(event) => {
          const item = parseDragItem(event)
          if (!item || item.kind !== 'topic') return
          const currentParentId = getTopicParentId(item.id)
          if ((currentParentId ?? null) !== (parentId ?? null)) return
          event.preventDefault()
          setDragOverKey(zoneKey)
        }}
        onDragLeave={() => setDragOverKey(null)}
        onDrop={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          setDragOverKey(null)
          const item = parseDragItem(event)
          if (!item || item.kind !== 'topic') return
          const currentParentId = getTopicParentId(item.id)
          if ((currentParentId ?? null) !== (parentId ?? null)) return
          const orderedIds = getTopicOrder(parentId)
          const nextIds = reorderIds(orderedIds, item.id, index)
          if (nextIds.join(',') === orderedIds.join(',')) return
          await reorderTopics(parentId, nextIds)
        }}
      />
    )
  }

  const renderQuestionDropZone = (
    topicId: number,
    parentQuestionId: number | null,
    index: number
  ) => {
    const zoneKey = `question-drop-${topicId}-${parentQuestionId ?? 'root'}-${index}`
    return (
      <div
        key={zoneKey}
        className={`h-3 rounded-xl transition-all duration-150 ${
          dragOverKey === zoneKey ? 'bg-brand-200/70 dark:bg-brand-700/40' : 'bg-transparent'
        }`}
        onDragOver={(event) => {
          const item = parseDragItem(event)
          if (!item || item.kind !== 'question') return
          const currentTopicId = getQuestionTopicId(item.id)
          const currentParentId = getQuestionParentId(item.id)
          if (currentTopicId !== topicId) return
          if ((currentParentId ?? null) !== (parentQuestionId ?? null)) return
          event.preventDefault()
          setDragOverKey(zoneKey)
        }}
        onDragLeave={() => setDragOverKey(null)}
        onDrop={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          setDragOverKey(null)
          const item = parseDragItem(event)
          if (!item || item.kind !== 'question') return
          const currentTopicId = getQuestionTopicId(item.id)
          const currentParentId = getQuestionParentId(item.id)
          if (currentTopicId !== topicId) return
          if ((currentParentId ?? null) !== (parentQuestionId ?? null)) return
          const orderedIds = getQuestionOrder(topicId, parentQuestionId)
          const nextIds = reorderIds(orderedIds, item.id, index)
          if (nextIds.join(',') === orderedIds.join(',')) return
          await reorderQuestions(topicId, parentQuestionId, nextIds)
        }}
      />
    )
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    const nodeKey = `${node.type}-${node.id}`
    const hasChildren = (node.children && node.children.length > 0) ?? false
    const isExpanded = expandedNodes.has(nodeKey)
    const isDragOver = dragOverKey === nodeKey
    const isFolder = node.type === 'folder'
    const folderChildren = (node.children ?? []).filter((child) => child.type === 'folder')
    const fileChildren = (node.children ?? []).filter((child) => child.type === 'file')
    const questionScopeTopicId = isFolder ? node.id : node.topicId ?? null
    const questionScopeParentId = isFolder ? null : node.id

    return (
      <div key={nodeKey} className="animate-fadeUp" style={{ animationDelay: `${depth * 30}ms` }}>
        <div
          className={`group flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 cursor-pointer
            ${isFolder
              ? 'bg-brand-50/50 dark:bg-brand-900/20 hover:bg-brand-100/70 dark:hover:bg-brand-900/30'
              : 'bg-surface hover:bg-subtle border border-line'
            }
            ${isDragOver ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface' : ''}
          `}
          draggable
          onDragStart={handleDragStart(
            node.type === 'folder'
              ? { kind: 'topic', id: node.id }
              : { kind: 'question', id: node.id, topicId: node.topicId }
          )}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOverKey(nodeKey)
          }}
          onDragLeave={() => setDragOverKey(null)}
          onDrop={async (event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragOverKey(null)
            const item = parseDragItem(event)
            if (!item) return
            if (node.type === 'folder') {
              if (item.kind === 'topic') {
                if (item.id === node.id) return
                await moveTopic(item.id, node.id)
                return
              }
              if (item.kind === 'question' && item.topicId !== undefined) {
                await moveQuestion({
                  questionId: item.id,
                  sourceTopicId: item.topicId,
                  targetTopicId: node.id,
                  parentQuestionId: null,
                })
              }
              return
            }
            if (node.type === 'file' && item.kind === 'question') {
              if (item.id === node.id) return
              const targetTopicId = node.topicId ?? item.topicId
              if (targetTopicId === undefined || item.topicId === undefined) return
              await moveQuestion({
                questionId: item.id,
                sourceTopicId: item.topicId,
                targetTopicId,
                parentQuestionId: node.id,
              })
            }
          }}
          onClick={() => {
            if (isFolder) {
              if (hasChildren) {
                toggleNode(nodeKey)
              }
              return
            }
            setSelectedTask(node)
            if (hasChildren) {
              toggleNode(nodeKey)
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
            {!isFolder && (node.linkedTopicTitle || node.linkedQuestionTitle) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {node.linkedTopicTitle && (
                  <span className="badge-brand text-xs max-w-[220px] truncate">
                    {node.linkedTopicTitle}
                  </span>
                )}
                {node.linkedQuestionTitle && (
                  <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs max-w-[220px] truncate">
                    {node.linkedQuestionTitle}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {isFolder ? (
              <>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    openEditFolderModal(node)
                  }}
                  className="btn-icon-sm"
                  title="編集"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
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
                  className="btn-icon-sm bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800"
                  title="追加"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    openEditQuestionModal(node)
                  }}
                  className="btn-icon-sm"
                  title="編集"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
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
                  className="btn-icon-sm bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
                  title="子質問を追加"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 pl-4 border-l-2 border-brand-200/50 dark:border-brand-700/30 space-y-2">
            {folderChildren.length > 0 && (
              <div className="space-y-2">
                {renderTopicDropZone(node.id, 0)}
                {folderChildren.map((child, index) => (
                  <div key={`topic-${child.id}`}>
                    {renderNode(child, depth + 1)}
                    {renderTopicDropZone(node.id, index + 1)}
                  </div>
                ))}
              </div>
            )}
            {fileChildren.length > 0 && questionScopeTopicId !== null && (
              <div className="space-y-2">
                {renderQuestionDropZone(questionScopeTopicId, questionScopeParentId, 0)}
                {fileChildren.map((child, index) => (
                  <div key={`question-${child.id}`}>
                    {renderNode(child, depth + 1)}
                    {renderQuestionDropZone(
                      questionScopeTopicId,
                      questionScopeParentId,
                      index + 1
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderRootDropZone = () => (
    <div
      className={`mb-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
        dragOverKey === 'root'
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-line hover:border-edge'
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragOverKey('root')
      }}
      onDragLeave={() => setDragOverKey(null)}
      onDrop={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDragOverKey(null)
        const item = parseDragItem(event)
        if (!item) return
        if (item.kind === 'topic') {
          await moveTopic(item.id, null)
          return
        }
        if (item.kind === 'question' && item.topicId !== undefined) {
          await moveQuestion({
            questionId: item.id,
            sourceTopicId: item.topicId,
            targetTopicId: item.topicId,
            parentQuestionId: null,
          })
        }
      }}
    >
      <div className="px-4 py-3 text-sm text-ink-faint text-center">
        ここにドロップしてルートへ移動
      </div>
    </div>
  )

  const renderRootTopics = () => (
    <div className="space-y-3">
      {renderTopicDropZone(null, 0)}
      {tree.map((node, index) => (
        <div key={`root-${node.id}`}>
          {renderNode(node, 0)}
          {renderTopicDropZone(null, index + 1)}
        </div>
      ))}
    </div>
  )

  if (!situation) {
    return (
      <div className="min-h-screen bg-base">
        {/* Skeleton Nav */}
        <div className="glass-card-solid sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-3">
              <div className="w-16 h-8 bg-layer rounded-lg animate-pulse" />
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
                onClick={() => router.back()}
                className="btn-ghost flex items-center gap-2 text-brand-600 dark:text-brand-400 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">戻る</span>
              </button>
              <span className="hidden sm:block text-sm font-semibold text-ink-sub truncate max-w-[200px] lg:max-w-[300px]">
                {situation.title}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${selectedTask ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:py-4' : 'py-4 sm:py-6 lg:py-8'}`}>
        {/* Left Column: Header Card + Tree View */}
        <div className={selectedTask ? 'lg:overflow-y-auto lg:h-full lg:pr-2 py-0 sm:py-0 lg:py-0' : ''}>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`btn-icon transition-all duration-300 ${
                    situation.is_favorite === true
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : ''
                  }`}
                  title={situation.is_favorite ? 'お気に入り解除' : 'お気に入りに追加'}
                >
                  {isTogglingFavorite ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill={situation.is_favorite === true ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handlePublicClick}
                  disabled={isTogglingPublic}
                  className={`btn-icon transition-all duration-300 ${
                    situation.is_public === true
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                  }`}
                  title={situation.is_public ? '公開中（クリックで非公開に）' : '非公開（クリックで公開に）'}
                >
                  {isTogglingPublic ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : situation.is_public === true ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() =>
                    openCreateModal({
                      parentTopicId: null,
                      parentQuestionId: null,
                      allowFolder: true,
                      allowQuestion: false,
                    })
                  }
                  className="btn-icon"
                  title="追加"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setSituationForm({
                      title: situation.title,
                      description: situation.description,
                    })
                    setSelectedLabels(situation.labels || [])
                    setShowSituationModal(true)
                  }}
                  className="btn-icon"
                  title="編集"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tree View */}
          {tree.length > 0 ? (
            <>
              {renderRootDropZone()}
              {renderRootTopics()}
            </>
          ) : (
            <div className="text-center py-16 animate-fadeUp">
              <div className="inline-block p-6 bg-layer rounded-2xl mb-4">
                <svg className="w-12 h-12 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">
                フォルダがありません
              </h3>
              <p className="text-ink-muted mb-6">
                最初のフォルダを作成して質問を追加しましょう
              </p>
              <button
                onClick={() =>
                  openCreateModal({
                    parentTopicId: null,
                    parentQuestionId: null,
                    allowFolder: true,
                    allowQuestion: false,
                  })
                }
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                フォルダを作成
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel — Desktop (Right Column) */}
        {selectedTask && (
          <div className="hidden lg:flex lg:flex-col lg:overflow-y-auto lg:h-full min-w-0">
            <div className="glass-card-solid rounded-3xl overflow-hidden animate-scaleIn relative flex-1 flex flex-col min-h-0">
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-icon-sm absolute top-4 right-4 z-10"
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
                {(selectedTask.linkedTopicTitle || selectedTask.linkedQuestionTitle) && (
                  <>
                    <div className="divider" />
                    <div>
                      <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">紐付け</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.linkedTopicTitle && (
                          <span className="badge-brand">{selectedTask.linkedTopicTitle}</span>
                        )}
                        {selectedTask.linkedQuestionTitle && (
                          <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {selectedTask.linkedQuestionTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <button
                  onClick={() => openEditQuestionModal(selectedTask)}
                  className="w-full btn-secondary flex items-center justify-center gap-2 mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  この質問を編集
                </button>
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
                  {(selectedTask.linkedTopicTitle || selectedTask.linkedQuestionTitle) && (
                    <>
                      <div className="divider" />
                      <div>
                        <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">紐付け</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.linkedTopicTitle && (
                            <span className="badge-brand">{selectedTask.linkedTopicTitle}</span>
                          )}
                          {selectedTask.linkedQuestionTitle && (
                            <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              {selectedTask.linkedQuestionTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => openEditQuestionModal(selectedTask)}
                    className="w-full btn-secondary flex items-center justify-center gap-2 mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    この質問を編集
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-md w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">
                {modalType === 'folder'
                  ? editingTopicId !== null
                    ? 'フォルダを編集'
                    : 'フォルダを追加'
                  : editingQuestionId !== null
                  ? '質問を編集'
                  : '質問を追加'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-icon-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'folder' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      フォルダ名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例：自己紹介"
                      className="input-field"
                      value={folderForm.title}
                      onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      説明（任意）
                    </label>
                    <textarea
                      placeholder="このフォルダについて"
                      className="input-field resize-none"
                      rows={3}
                      value={folderForm.description}
                      onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      質問 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例：自己紹介をお願いします"
                      className="input-field"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      回答（任意）
                    </label>
                    <textarea
                      placeholder="準備した回答を入力"
                      className="input-field resize-none"
                      rows={4}
                      value={questionForm.answer}
                      onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      フォルダへの紐付け
                    </label>
                    <select
                      className="input-field"
                      value={questionForm.linkedTopicId ?? ''}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          linkedTopicId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">なし</option>
                      {situation.topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-sub mb-2">
                      質問への紐付け
                    </label>
                    <select
                      className="input-field"
                      value={questionForm.linkedQuestionId ?? ''}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          linkedQuestionId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">なし</option>
                      {situation.questions
                        .filter((q) => q.id !== editingQuestionId)
                        .map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.question}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {(modalType === 'folder' && editingTopicId !== null) || (modalType === 'file' && editingQuestionId !== null) ? '更新する' : '作成する'}
                </button>
                {modalType === 'file' && editingQuestionId !== null && (
                  <button
                    type="button"
                    onClick={handleDeleteQuestion}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-2xl transition-colors"
                  >
                    削除
                  </button>
                )}
                {modalType === 'folder' && editingTopicId !== null && (
                  <button
                    type="button"
                    onClick={handleDeleteTopic}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-2xl transition-colors"
                  >
                    削除
                  </button>
                )}
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

      {/* Create Type Selection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-sm w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-ink mb-6 text-center">
              何を作成しますか？
            </h3>
            <div className="space-y-3">
              {createContext.allowFolder && (
                <button
                  type="button"
                  onClick={() => openFolderModal(createContext.parentTopicId)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">フォルダ</div>
                    <div className="text-sm text-ink-muted">質問をグループ化</div>
                  </div>
                </button>
              )}
              {createContext.allowQuestion && createContext.parentTopicId !== null && (
                <button
                  type="button"
                  onClick={() =>
                    openFileModal(createContext.parentTopicId!, createContext.parentQuestionId)
                  }
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-800/50 flex items-center justify-center text-green-600 dark:text-green-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">質問</div>
                    <div className="text-sm text-ink-muted">Q&Aを追加</div>
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-full btn-secondary"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Situation Edit Modal */}
      {showSituationModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowSituationModal(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-md w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">シチュエーションを編集</h3>
              <button onClick={() => setShowSituationModal(false)} className="btn-icon-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSituationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-sub mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="シチュエーション名"
                  className="input-field"
                  value={situationForm.title}
                  onChange={(e) => setSituationForm({ ...situationForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-sub mb-2">
                  説明（任意）
                </label>
                <textarea
                  placeholder="このシチュエーションについて"
                  className="input-field resize-none"
                  rows={3}
                  value={situationForm.description}
                  onChange={(e) => setSituationForm({ ...situationForm, description: e.target.value })}
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
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  更新する
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSituationModal(false)
                    handleDeleteSituation()
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-2xl transition-colors"
                >
                  削除
                </button>
                <button
                  type="button"
                  onClick={() => setShowSituationModal(false)}
                  className="btn-secondary flex-1"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPublicConfirm && pendingPublicValue !== null && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowPublicConfirm(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-sm w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-ink">
                {pendingPublicValue ? '公開しますか？' : '非公開にしますか？'}
              </h3>
              <p className="text-sm text-ink-muted mt-2">
                {pendingPublicValue
                  ? '公開すると他のユーザーに表示されます。'
                  : '非公開にすると他のユーザーから見えなくなります。'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn-secondary px-4 py-2 text-sm"
                onClick={() => {
                  setShowPublicConfirm(false)
                  setPendingPublicValue(null)
                }}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm"
                onClick={handleConfirmPublic}
                disabled={isTogglingPublic}
              >
                {pendingPublicValue ? '公開する' : '非公開にする'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="glass-card-solid rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">削除の確認</h3>
              <p className="text-ink-body">{deleteConfirm.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={
                  deleteConfirm.type === 'question'
                    ? confirmDeleteQuestion
                    : deleteConfirm.type === 'topic'
                    ? confirmDeleteTopic
                    : confirmDeleteSituation
                }
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                削除
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 px-4 bg-layer hover:bg-subtle text-ink-sub font-medium rounded-xl transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
