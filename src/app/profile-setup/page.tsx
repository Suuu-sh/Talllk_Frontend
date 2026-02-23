'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import api from '@/lib/api'
import { useI18n } from '@/contexts/I18nContext'
import { UserProfile } from '@/types'

const USER_ID_PATTERN = /^[a-z0-9_]{3,30}$/

export default function ProfileSetupPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [name, setName] = useState('')
  const [userID, setUserID] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.replace('/login')
        return
      }

      try {
        const res = await api.get<UserProfile>('/users/me')
        if (!isActive) return

        if (res.data.profile_completed) {
          router.replace('/home')
          return
        }

        setName(res.data.name || '')
        setUserID(res.data.user_id || '')
      } catch (err: any) {
        if (!isActive) return
        if (err?.response?.status === 401) {
          localStorage.removeItem('token')
          router.replace('/login')
          return
        }
        setError(err?.response?.data?.error || t({ ja: 'プロフィールの取得に失敗しました。', en: 'Failed to load profile.' }))
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [router, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const normalizedUserID = userID.trim().toLowerCase()

    if (!trimmedName) {
      setError(t({ ja: 'Usernameを入力してください。', en: 'Please enter your username.' }))
      return
    }
    if (!USER_ID_PATTERN.test(normalizedUserID)) {
      setError(
        t({
          ja: 'userIDは3〜30文字の英小文字・数字・_で入力してください。',
          en: 'userID must be 3-30 chars using lowercase letters, numbers, and _.',
        })
      )
      return
    }

    setError('')
    setIsSaving(true)
    try {
      await api.patch('/users/me/profile', {
        name: trimmedName,
        user_id: normalizedUserID,
      })
      router.replace('/home')
    } catch (err: any) {
      setError(err?.response?.data?.error || t({ ja: 'プロフィール保存に失敗しました。', en: 'Failed to save profile.' }))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="text-ink-muted text-sm">{t({ ja: '読み込み中...', en: 'Loading...' })}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-card-solid rounded-3xl shadow-glass-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink mb-2">
          {t({ ja: 'プロフィール設定', en: 'Complete your profile' })}
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          {t({
            ja: '続行するにはUsernameと@userIDの設定が必要です。',
            en: 'Set your Username and @userID to continue.',
          })}
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-sub mb-2">
              {t({ ja: 'Username', en: 'Username' })}
            </label>
            <input
              type="text"
              className="input-field"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t({ ja: '表示名を入力', en: 'Display name' })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-sub mb-2">
              {t({ ja: 'userID', en: 'userID' })}
            </label>
            <div className="flex items-center rounded-xl border border-line bg-layer px-3">
              <span className="text-ink-muted pr-1">@</span>
              <input
                type="text"
                className="w-full bg-transparent py-3 text-ink placeholder:text-ink-faint focus:outline-none"
                maxLength={30}
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                placeholder={t({ ja: '英小文字・数字・_', en: 'lowercase, numbers, _' })}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={isSaving}>
            {isSaving ? t({ ja: '保存中...', en: 'Saving...' }) : t({ ja: '保存して続行', en: 'Save and continue' })}
          </button>
        </form>
      </div>
    </div>
  )
}
