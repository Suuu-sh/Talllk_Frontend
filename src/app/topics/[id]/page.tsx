'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { Topic, Question } from '@/types'

export default function TopicDetail() {
  const router = useRouter()
  const params = useParams()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({ question: '', answer: '' })

  useEffect(() => {
    if (params.id) {
      fetchTopic()
    }
  }, [params.id])

  const fetchTopic = async () => {
    try {
      const response = await api.get(`/topics/${params.id}`)
      setTopic(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await api.put(`/topics/${params.id}/questions/${editingQuestion.id}`, formData)
      } else {
        await api.post(`/topics/${params.id}/questions`, formData)
      }
      setFormData({ question: '', answer: '' })
      setShowModal(false)
      setEditingQuestion(null)
      fetchTopic()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm('削除しますか？')) return
    try {
      await api.delete(`/topics/${params.id}/questions/${questionId}`)
      fetchTopic()
    } catch (err) {
      console.error(err)
    }
  }

  const openEditModal = (question: Question) => {
    setEditingQuestion(question)
    setFormData({ question: question.question, answer: question.answer })
    setShowModal(true)
  }

  if (!topic) return <div className="p-4">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="text-blue-600">← 戻る</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
          <p className="text-gray-600">{topic.description}</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">質問と回答</h2>
          <button
            onClick={() => {
              setEditingQuestion(null)
              setFormData({ question: '', answer: '' })
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + 追加
          </button>
        </div>

        <div className="space-y-4">
          {topic.questions?.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Q: {q.question}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(q)}
                    className="text-blue-600 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">A: {q.answer || '（未回答）'}</p>
            </div>
          ))}
        </div>

        {(!topic.questions || topic.questions.length === 0) && (
          <div className="text-center text-gray-500 mt-12">
            質問がありません。追加してください。
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingQuestion ? '質問を編集' : '新しい質問'}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                required
                placeholder="質問"
                className="w-full px-3 py-2 border rounded-md mb-4"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
              <textarea
                placeholder="回答"
                className="w-full px-3 py-2 border rounded-md mb-4"
                rows={5}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingQuestion ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingQuestion(null)
                  }}
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
