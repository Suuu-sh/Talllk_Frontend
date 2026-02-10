'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/contexts/I18nContext'
import api from '@/lib/api'
import type { Label } from '@/types'

export default function Header() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [labels, setLabels] = useState<Label[]>([])
  const [isLabelLoading, setIsLabelLoading] = useState(false)
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [isDeletingLabelId, setIsDeletingLabelId] = useState<number | null>(null)
  const [newLabelName, setNewLabelName] = useState('')
  const [labelError, setLabelError] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const sortLabels = (items: Label[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, language === 'en' ? 'en' : 'ja'))

  const openLabelModal = () => {
    setShowSettings(false)
    setLabelError(null)
    setShowLabelModal(true)
  }

  const closeLabelModal = () => {
    setShowLabelModal(false)
    setNewLabelName('')
    setLabelError(null)
  }

  useEffect(() => {
    if (!showLabelModal) return
    let isMounted = true
    const fetchLabels = async () => {
      setIsLabelLoading(true)
      setLabelError(null)
      try {
        const response = await api.get('/labels')
        if (!isMounted) return
        setLabels(sortLabels(response.data?.data || []))
      } catch (err) {
        if (!isMounted) return
        setLabels([])
        setLabelError(t({ ja: 'ラベルの取得に失敗しました', en: 'Failed to fetch labels.' }))
      } finally {
        if (!isMounted) return
        setIsLabelLoading(false)
      }
    }
    fetchLabels()
    return () => {
      isMounted = false
    }
  }, [showLabelModal])

  const handleCreateLabel = async (event?: React.FormEvent) => {
    event?.preventDefault()
    const trimmed = newLabelName.trim()
    if (!trimmed || isCreatingLabel) return
    setIsCreatingLabel(true)
    setLabelError(null)
    try {
      const response = await api.post('/labels', { name: trimmed })
      const created = response.data as Label
      setLabels((prev) => sortLabels([...prev.filter((label) => label.id !== created.id), created]))
      setNewLabelName('')
    } catch (err) {
      setLabelError(t({ ja: 'ラベルの作成に失敗しました', en: 'Failed to create label.' }))
    } finally {
      setIsCreatingLabel(false)
    }
  }

  const handleDeleteLabel = async (label: Label) => {
    if (isDeletingLabelId) return
    if (!confirm(t({ ja: `「${label.name}」を削除しますか？`, en: `Delete "${label.name}"?` }))) return
    setIsDeletingLabelId(label.id)
    setLabelError(null)
    try {
      await api.delete(`/labels/${label.id}`)
      setLabels((prev) => prev.filter((item) => item.id !== label.id))
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setLabelError(t({ ja: '使用中のラベルは削除できません', en: 'This label is in use and cannot be deleted.' }))
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setLabelError(t({ ja: 'ラベルが見つかりませんでした', en: 'Label not found.' }))
      } else {
        setLabelError(t({ ja: 'ラベルの削除に失敗しました', en: 'Failed to delete label.' }))
      }
    } finally {
      setIsDeletingLabelId(null)
    }
  }

  return (
    <>
      <nav className="glass-card-solid sticky top-0 z-20 transition-all duration-300 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-3 group"
            >
              <span className="font-logo text-xl font-bold text-brand-500 px-3 py-1 border-2 border-brand-500 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                Talllk
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-icon"
                title={t({ ja: '通知', en: 'Notifications' })}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-icon"
                title={t({ ja: '設定', en: 'Settings' })}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-ghost flex items-center gap-2 text-ink-body hover:text-red-600 dark:hover:text-red-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">{t({ ja: 'ログアウト', en: 'Log out' })}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-sm w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ink">{t({ ja: '設定', en: 'Settings' })}</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-icon-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Appearance */}
              <div className="flex items-center justify-between p-4 bg-layer rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-500">
                    {theme === 'dark' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05zm-9.5 6.69A8.14 8.14 0 017.08 5.22v.27a10.15 10.15 0 0010.14 10.14 9.79 9.79 0 002.1-.22 8.11 8.11 0 01-7.18 4.32z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink">{t({ ja: '外観', en: 'Appearance' })}</div>
                    <div className="text-xs text-ink-muted">
                      {theme === 'dark'
                        ? t({ ja: 'ダークモード', en: 'Dark mode' })
                        : t({ ja: 'ライトモード', en: 'Light mode' })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 shrink-0 ${
                    theme === 'dark' ? 'bg-brand-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-4 bg-layer rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink">{t({ ja: '言語', en: 'Language' })}</div>
                    <div className="text-xs text-ink-muted">
                      {language === 'ja' ? '日本語' : 'English'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center rounded-lg border border-line overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setLanguage('ja')}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      language === 'ja'
                        ? 'bg-brand-500 text-white'
                        : 'text-ink-muted hover:bg-subtle'
                    }`}
                  >
                    日本語
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      language === 'en'
                        ? 'bg-brand-500 text-white'
                        : 'text-ink-muted hover:bg-subtle'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Label Management */}
              <button
                type="button"
                onClick={openLabelModal}
                className="w-full flex items-center justify-between p-4 bg-layer rounded-2xl hover:bg-subtle transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M3 11.5l7.5-7.5a2.121 2.121 0 013 0l7.5 7.5a2.121 2.121 0 010 3l-7.5 7.5a2.121 2.121 0 01-3 0l-7.5-7.5a2.121 2.121 0 010-3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-ink">{t({ ja: 'ラベル管理', en: 'Label management' })}</div>
                    <div className="text-xs text-ink-muted">
                      {t({ ja: 'ラベルの追加・削除', en: 'Add or remove labels' })}
                    </div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-ink-faint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-layer rounded-2xl hover:bg-red-500/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-red-500">{t({ ja: 'ログアウト', en: 'Log out' })}</div>
                    <div className="text-xs text-ink-muted">
                      {t({ ja: 'アカウントからサインアウト', en: 'Sign out of your account' })}
                    </div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-ink-faint group-hover:text-red-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Divider + Version */}
              <div className="pt-2">
                <div className="divider mb-3" />
                <div className="text-center">
                  <span className="text-[11px] text-ink-faint">Talllk v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Label Modal */}
      {showLabelModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeLabelModal}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-md w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">{t({ ja: 'ラベル管理', en: 'Label management' })}</h3>
              <button
                onClick={closeLabelModal}
                className="btn-icon-sm"
                aria-label={t({ ja: '閉じる', en: 'Close' })}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateLabel} className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="input-field flex-1"
                placeholder={t({ ja: '新しいラベル名', en: 'New label name' })}
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 text-sm"
                disabled={isCreatingLabel || newLabelName.trim().length === 0}
              >
                {isCreatingLabel ? t({ ja: '追加中', en: 'Adding' }) : t({ ja: '追加', en: 'Add' })}
              </button>
            </form>

            {labelError && (
              <div className="text-sm text-red-500 mb-3">{labelError}</div>
            )}

            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
              {isLabelLoading ? (
                <div className="text-sm text-ink-muted py-4 text-center">
                  {t({ ja: '読み込み中...', en: 'Loading...' })}
                </div>
              ) : labels.length === 0 ? (
                <div className="text-sm text-ink-muted py-4 text-center">
                  {t({ ja: 'ラベルがありません', en: 'No labels' })}
                </div>
              ) : (
                labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl border border-line bg-surface/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm text-ink-sub truncate">
                        {label.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLabel(label)}
                      className="btn-icon-sm text-red-500 hover:text-red-600"
                      disabled={isDeletingLabelId === label.id}
                      title={t({ ja: '削除', en: 'Delete' })}
                    >
                      {isDeletingLabelId === label.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 7h12m-9 0V6a3 3 0 016 0v1m-7 0h8m-1 0v11a2 2 0 01-2 2H9a2 2 0 01-2-2V7m3 4v6m4-6v6" />
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

      {/* Notifications Modal */}
      {showNotifications && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="glass-card-solid rounded-3xl p-6 max-w-sm w-full shadow-glass-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">{t({ ja: '通知', en: 'Notifications' })}</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="btn-icon-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-layer mb-4">
                <svg className="w-7 h-7 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-ink-muted">
                {t({ ja: '通知はありません', en: 'No notifications' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
