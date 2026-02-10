'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'

export type Tab = 'home' | 'situations' | 'discover' | 'following'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const router = useRouter()

  const { t } = useI18n()
  const tabs = [
    { id: 'home' as Tab, label: t({ ja: 'ホーム', en: 'Home' }), href: '/home', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'situations' as Tab, label: t({ ja: 'シチュエーション', en: 'Situations' }), href: '/situations', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ) },
    { id: 'discover' as Tab, label: t({ ja: '見つける', en: 'Discover' }), href: '/discover', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ) },
    { id: 'following' as Tab, label: t({ ja: 'フォロー中', en: 'Following' }), href: '/following', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ) },
  ]

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.href) {
      router.push(tab.href)
    } else {
      onTabChange(tab.id)
    }
  }

  return (
    <>
      <div className="glass-card-solid border-t-0 border-x-0 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium
                  whitespace-nowrap transition-all duration-200
                  border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'text-brand-600 dark:text-brand-400 border-brand-500'
                    : 'text-ink-muted border-transparent hover:text-ink-sub hover:border-edge'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </>
  )
}
