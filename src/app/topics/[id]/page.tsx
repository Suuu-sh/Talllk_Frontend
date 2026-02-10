"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Topic, Question } from "@/types";
import { useI18n } from "@/contexts/I18nContext";

export default function TopicDetail() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  const situationId = searchParams.get("situationId");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (params.id && situationId) {
      fetchTopic();
    }
  }, [params.id, situationId]);

  const fetchTopic = async () => {
    if (!situationId) return;
    try {
      const response = await api.get(
        `/situations/${situationId}/topics/${params.id}`
      );
      setTopic(response.data);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (questionId: number) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationId) return;
    try {
      if (editingQuestion) {
        await api.put(
          `/situations/${situationId}/topics/${params.id}/questions/${editingQuestion.id}`,
          formData
        );
      } else {
        await api.post(
          `/situations/${situationId}/topics/${params.id}/questions`,
          formData
        );
      }
      setFormData({ question: "", answer: "" });
      setShowModal(false);
      setEditingQuestion(null);
      fetchTopic();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (questionId: number) => {
    setDeleteConfirmId(questionId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !situationId) return;
    try {
      await api.delete(
        `/situations/${situationId}/topics/${params.id}/questions/${deleteConfirmId}`
      );
      fetchTopic();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({ question: question.question, answer: question.answer });
    setShowModal(true);
  };

  if (!situationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            {t({ ja: "シチュエーションが指定されていません。", en: "No situation specified." })}
          </p>
          <button
            onClick={() => router.push("/home")}
            className="btn-primary"
          >
            {t({ ja: "ダッシュボードへ戻る", en: "Back to Dashboard" })}
          </button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t({ ja: "読み込み中...", en: "Loading..." })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 overflow-x-hidden">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t({ ja: "戻る", en: "Back" })}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {topic.title}
              </h1>
              <p className="text-gray-600">{topic.description || t({ ja: "説明なし", en: "No description" })}</p>
            </div>
            <div className="ml-4 px-4 py-2 bg-orange-50 rounded-xl">
              <div className="text-sm text-gray-600">{t({ ja: "質問数", en: "Questions" })}</div>
              <div className="text-2xl font-bold text-orange-600">
                {topic.questions?.length || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t({ ja: "質問と回答", en: "Questions & Answers" })}</h2>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({ question: "", answer: "" });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t({ ja: "質問を追加", en: "Add question" })}
          </button>
        </div>

        {!topic.questions || topic.questions.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-6">
              <svg
                className="w-16 h-16 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t({ ja: "まだ質問がありません", en: "No questions yet" })}
            </h3>
            <p className="text-gray-600 mb-6">
              {t({ ja: "最初の質問を追加して、回答を準備しましょう", en: "Add your first question and prepare an answer." })}
            </p>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setFormData({ question: "", answer: "" });
                setShowModal(true);
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t({ ja: "最初の質問を追加", en: "Add first question" })}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {topic.questions?.map((q, index) => {
              const isExpanded = expandedQuestion === q.id;
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl shadow-md card-hover border-2 transition-all duration-300 overflow-hidden border-transparent hover:border-orange-200 ${isAnimating ? "animate-fadeIn" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex justify-between items-start mb-3 min-w-0 overflow-hidden">
                          <h3 className="font-bold text-lg text-gray-900 overflow-hidden break-all flex-1 w-0">
                            <span className="text-orange-600">Q: </span>
                            {q.question}
                          </h3>
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(q);
                              }}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all hover:scale-110"
                              title={t({ ja: "編集", en: "Edit" })}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(q.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                              title={t({ ja: "削除", en: "Delete" })}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-4 overflow-hidden">
                          <p className="text-gray-900 break-all max-w-full">
                            <span className="text-green-600 font-bold">A: </span>
                            {q.answer || t({ ja: "（未回答）", en: "(No answer)" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingQuestion ? t({ ja: "質問を編集", en: "Edit question" }) : t({ ja: "新しい質問", en: "New question" })}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingQuestion(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className="animate-slideUp"
                style={{ animationDelay: "100ms" }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t({ ja: "質問", en: "Question" })} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t({ ja: "例：趣味は何ですか？", en: "e.g. What are your hobbies?" })}
                  className="input-field"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div
                className="animate-slideUp"
                style={{ animationDelay: "200ms" }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t({ ja: "回答", en: "Answer" })}
                </label>
                <textarea
                  placeholder={t({ ja: "準備しておきたい回答を入力してください", en: "Write the answer you'd like to prepare." })}
                  className="input-field resize-none"
                  rows={6}
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                />
                <div className="mt-2 text-xs text-gray-500">
                  {language === "en" ? `${formData.answer.length} chars` : `${formData.answer.length} 文字`}
                </div>
              </div>
              <div
                className="flex gap-3 pt-4 animate-slideUp"
                style={{ animationDelay: "300ms" }}
              >
                <button type="submit" className="btn-primary flex-1">
                  {editingQuestion ? t({ ja: "更新", en: "Update" }) : t({ ja: "追加", en: "Add" })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingQuestion(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  {t({ ja: "キャンセル", en: "Cancel" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t({ ja: "削除の確認", en: "Confirm deletion" })}</h3>
              <p className="text-gray-600">{t({ ja: "この質問を削除しますか？", en: "Delete this question?" })}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                {t({ ja: "削除", en: "Delete" })}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                {t({ ja: "キャンセル", en: "Cancel" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
