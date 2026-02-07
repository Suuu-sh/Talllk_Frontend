'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PaginatedResponse, PublicSituation, UserProfile } from '@/types'

type UserProfileModalProps = {
  mode: 'me' | 'user'
  userId?: string
}

export default function UserProfileModal({ mode, userId }: UserProfileModalProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [situations, setSituations] = useState<PublicSituation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)
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
        className="glass-card-solid rounded-3xl shadow-glass-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 backdrop-blur bg-white/70 dark:bg-gray-900/70">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ユーザープロフィール</h2>
          <button onClick={handleClose} className="btn-icon-sm" aria-label="閉じる">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {isLoading ? (
            <div className="glass-card-solid rounded-3xl p-8 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-4" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/4" />
            </div>
          ) : !profile ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">ユーザーが見つかりません</p>
            </div>
          ) : (
            <>
              <div className="glass-card-solid rounded-3xl p-6 mb-8 animate-fadeUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.name || 'ユーザー'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">公開プロフィール</p>
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

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-4 py-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">フォロー中</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.following_count}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-4 py-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">フォロワー</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.follower_count}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">公開シチュエーション</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {situations.length}件
                </span>
              </div>

              {situations.length === 0 ? (
                <div className="text-center py-16 animate-fadeUp">
                  <p className="text-gray-500 dark:text-gray-400">公開シチュエーションがありません</p>
                </div>
              ) : (
                <div className="grid grid-flow-col grid-rows-1 auto-cols-[minmax(18rem,80vw)] sm:auto-cols-[minmax(20rem,60vw)] lg:auto-cols-[calc((100%-7rem)/3)] gap-6 overflow-x-auto pb-2">
                  {situations.map((situation, index) => (
                    <div
                      key={situation.id}
                      onClick={() => router.push(`/discover/${situation.id}`)}
                      className={`group glass-card-solid rounded-2xl p-6 cursor-pointer card-hover border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/30 animate-fadeUp flex flex-col h-[14rem] stagger-${Math.min(index + 1, 6)}`}
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
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
                            <span className="badge text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
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
                        <span className="group-hover:underline">詳細を見る</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
