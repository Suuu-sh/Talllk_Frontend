'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PaginatedResponse, PublicSituation, UserProfile } from '@/types'

type UserProfileModalProps = {
  mode: 'me' | 'user'
  userId?: string
}

const getInitial = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const getAvatarGradient = (id: number): string => {
  const gradients = [
    'from-brand-400 to-brand-600',
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
  ]
  return gradients[id % gradients.length]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8080'

export default function UserProfileModal({ mode, userId }: UserProfileModalProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [situations, setSituations] = useState<PublicSituation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingHeader, setUploadingHeader] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const headerInputRef = useRef<HTMLInputElement>(null)
  const truncateText = (text: string, maxLength = 10) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (mode === 'me' || userId) {
      fetchProfile()
    }
  }, [mode, userId, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const profileResponse = mode === 'me'
        ? await api.get<UserProfile>('/users/me')
        : await api.get<UserProfile>(`/users/${userId}`)
      const nextProfile = profileResponse.data
      setProfile(nextProfile)

      const situationsResponse = await api.get<PaginatedResponse<PublicSituation>>(
        `/discover/situations?user_id=${nextProfile.id}&page=1&per_page=12`
      )
      setSituations(situationsResponse.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFollow = async () => {
    if (!profile || profile.is_self || isTogglingFollow) return
    const newValue = !profile.is_following
    const originalCount = profile.follower_count
    const nextCount = Math.max(0, originalCount + (newValue ? 1 : -1))
    setProfile({ ...profile, is_following: newValue, follower_count: nextCount })
    setIsTogglingFollow(true)
    try {
      if (newValue) {
        await api.post(`/users/${profile.id}/follow`)
      } else {
        await api.delete(`/users/${profile.id}/follow`)
      }
    } catch (err) {
      console.error(err)
      setProfile({ ...profile, is_following: !newValue, follower_count: originalCount })
    } finally {
      setIsTogglingFollow(false)
    }
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.put<{ url: string }>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile({ ...profile, avatar_url: res.data.url })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleUploadHeader = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingHeader(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.put<{ url: string }>('/users/me/header', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile({ ...profile, header_image_url: res.data.url })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingHeader(false)
      if (headerInputRef.current) headerInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/discover')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="glass-card-solid rounded-3xl shadow-glass-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scaleIn relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decoration blobs */}
        <div className="absolute top-20 -right-10 w-64 h-64 bg-brand-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-10 w-48 h-48 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors duration-200"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hidden file inputs */}
        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadAvatar} />
        <input ref={headerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadHeader} />

        <div className="relative">
          {isLoading ? (
            /* Skeleton loading */
            <div className="animate-pulse">
              {/* Banner skeleton */}
              <div className="h-28 sm:h-32 bg-layer rounded-t-3xl" />
              {/* Profile card skeleton */}
              <div className="glass-card-solid rounded-b-3xl px-6 pb-6">
                <div className="flex items-end gap-4 -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full bg-edge border-4 border-surface shrink-0" />
                  <div className="pb-2 flex-1">
                    <div className="h-6 bg-layer rounded-lg w-32 mb-2" />
                    <div className="h-4 bg-layer rounded w-20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="rounded-2xl bg-layer h-20" />
                  <div className="rounded-2xl bg-layer h-20" />
                </div>
              </div>
              {/* Situation cards skeleton - horizontal scroll */}
              <div className="px-6 py-6">
                <div className="h-5 bg-layer rounded w-40 mb-4" />
                <div className="grid grid-flow-col grid-rows-1 auto-cols-[minmax(18rem,80vw)] sm:auto-cols-[minmax(20rem,60vw)] lg:auto-cols-[calc((100%-3rem)/3)] gap-6 overflow-x-auto pb-2 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card-solid rounded-2xl p-6">
                      <div className="h-5 bg-layer rounded w-3/4 mb-3" />
                      <div className="flex gap-2 mb-4">
                        <div className="h-5 bg-layer rounded-full w-14" />
                        <div className="h-5 bg-layer rounded-full w-12" />
                      </div>
                      <div className="h-4 bg-layer rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !profile ? (
            /* Not found state */
            <div className="text-center py-20 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-layer mb-6">
                <svg className="w-10 h-10 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-ink-sub mb-2">ユーザーが見つかりません</p>
              <p className="text-sm text-ink-muted">このユーザーは存在しないか、削除された可能性があります。</p>
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="h-28 sm:h-32 rounded-t-3xl relative overflow-hidden">
                {profile.header_image_url ? (
                  <img
                    src={`${API_BASE}${profile.header_image_url}`}
                    alt="ヘッダー画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full" />
                  </div>
                )}
                {profile.is_self && (
                  <button
                    onClick={() => headerInputRef.current?.click()}
                    disabled={uploadingHeader}
                    className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors duration-200"
                    aria-label="ヘッダー画像を変更"
                  >
                    {uploadingHeader ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Profile card */}
              <div className="glass-card-solid rounded-b-3xl px-6 pb-6 mb-8 animate-fadeUp">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Avatar */}
                  <div
                    className={`-mt-12 w-24 h-24 rounded-full border-4 border-surface shadow-lg shrink-0 relative group ${profile.is_self ? 'cursor-pointer' : ''} ${profile.avatar_url ? '' : `bg-gradient-to-br ${getAvatarGradient(profile.id)}`} flex items-center justify-center overflow-hidden`}
                    onClick={() => profile.is_self && avatarInputRef.current?.click()}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={`${API_BASE}${profile.avatar_url}`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {getInitial(profile.name || '')}
                      </span>
                    )}
                    {profile.is_self && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-200">
                        {uploadingAvatar ? (
                          <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Name + follow */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-3 pb-1">
                    <div>
                      <h1 className="text-2xl font-bold text-ink">
                        {profile.name || 'ユーザー'}
                      </h1>
                      {profile.is_self && (
                        <p className="text-sm text-ink-muted mt-0.5">マイプロフィール</p>
                      )}
                    </div>
                    {!profile.is_self && (
                      <button
                        onClick={handleToggleFollow}
                        disabled={isTogglingFollow}
                        className={`text-sm font-semibold px-5 py-2 rounded-full border transition-all duration-200 ${
                          profile.is_following
                            ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-brand-500 text-white bg-brand-500 hover:bg-brand-600'
                        }`}
                      >
                        {profile.is_following ? 'フォロー中' : 'フォロー'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-2xl border border-line bg-surface/70 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-ink-muted">フォロー中</div>
                      <div className="text-2xl font-bold text-ink">
                        {profile.following_count}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-line bg-surface/70 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-ink-muted">フォロワー</div>
                      <div className="text-2xl font-bold text-ink">
                        {profile.follower_count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section header */}
              <div className="flex items-center justify-between mb-4 px-6">
                <h2 className="text-lg font-semibold text-ink">公開シチュエーション</h2>
                <span className="badge-brand text-xs font-semibold">
                  {situations.length}件
                </span>
              </div>

              {/* Situations - horizontal scroll */}
              <div className="px-6 pb-6">
                {situations.length === 0 ? (
                  <div className="text-center py-16 animate-fadeUp">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full bg-brand-400/10 animate-pulse" />
                      <svg className="w-10 h-10 text-ink-faint relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-ink-body font-medium mb-1">
                      {profile.is_self
                        ? 'まだシチュエーションを公開していません'
                        : '公開シチュエーションがありません'}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {profile.is_self
                        ? 'シチュエーションを作成して公開してみましょう'
                        : 'このユーザーはまだシチュエーションを公開していません'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-flow-col grid-rows-1 auto-cols-[minmax(18rem,80vw)] sm:auto-cols-[minmax(20rem,60vw)] lg:auto-cols-[calc((100%-3rem)/3)] gap-6 overflow-x-auto pb-2 pt-2">
                    {situations.map((situation, index) => (
                      <div
                        key={situation.id}
                        onClick={() => router.push(`/discover/${situation.id}`)}
                        className={`group glass-card-solid rounded-2xl p-6 cursor-pointer card-hover border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/30 animate-fadeUp flex flex-col stagger-${Math.min(index + 1, 6)}`}
                      >
                        <h3 className="text-xl font-bold text-ink mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                          {truncateText(situation.title || '')}
                        </h3>
                        {situation.labels && situation.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {situation.labels.slice(0, 3).map((label) => (
                              <span
                                key={label.id}
                                className="badge text-xs"
                                style={{ backgroundColor: label.color, color: '#FFFFFF' }}
                              >
                                {label.name}
                              </span>
                            ))}
                            {situation.labels.length > 3 && (
                              <span className="badge text-xs bg-layer text-ink-sub">
                                +{situation.labels.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-brand-600 dark:text-brand-400 text-sm font-medium mt-auto">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.52 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.785.57-1.84-.197-1.54-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-xs font-semibold text-yellow-600">
                              {situation.star_count ?? 0}
                            </span>
                          </div>
                          <span className="group-hover:underline flex items-center gap-1">
                            詳細を見る
                            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
