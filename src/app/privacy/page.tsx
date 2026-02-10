'use client'

import { useI18n } from '@/contexts/I18nContext'

export default function PrivacyPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-base transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-ink-sub hover:text-ink transition-colors">
            <img src="/brand/talllk-icon.svg" alt="Talllk" className="w-5 h-5" />
            <span className="font-semibold">Talllk</span>
          </a>
        </div>
        <div className="glass-card-muted rounded-3xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink mb-4">
            {t({ ja: 'プライバシーポリシー', en: 'Privacy Policy' })}
          </h1>
          <p className="text-ink-muted">{t({ ja: '内容は準備中です。', en: 'Content coming soon.' })}</p>
        </div>
      </div>
    </div>
  )
}
