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

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{topic.title}</h1>
              <p className="text-gray-600">{topic.description || '説明なし'}</p>
            </div>
            <div className="ml-4 px-4 py-2 bg-blue-50 rounded-xl">
              <div className="text-sm text-gray-600">質問数</div>
              <div className="text-2xl font-bold text-blue-600">{topic.questions?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">質問と回答</h2>
          <button
            onClick={() => {
              setEditingQuestion(null)
              setFormData({ question: '', answer: '' })
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            質問を追加
          </button>
        </div>

        {(!topic.questions || topic.questions.length === 0) ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">まだ質問がありません</h3>
            <p className="text-gray-600 mb-6">最初の質問を追加して、回答を準備しましょう</p>
            <button
              onClick={() => {
                setEditingQuestion(null)
                setFormData({ question: '', answer: '' })
                setShowModal(true)
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              最初の質問を追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {topic.questions?.map((q, index) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-md p-6 card-hover border-2 border-transparent hover:border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-900 flex items-start gap-2">
                        <span className="text-blue-600">Q:</span>
                        <span>{q.question}</span>
                      </h3>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-900 whitespace-pre-wrap flex items-start gap-2">
                        <span className="text-green-600 font-bold">A:</span>
                        <span>{q.answer || '（未回答）'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingQuestion ? '質問を編集' : '新しい質問'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  質問 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：趣味は何ですか？"
                  className="input-field"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">回答</label>
                <textarea
                  placeholder="準備しておきたい回答を入力してください"
                  className="input-field resize-none"
                  rows={6}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingQuestion ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingQuestion(null)
                  }}
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
