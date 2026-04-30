'use client'

import { useI18n } from '@/contexts/I18nContext'

type Section = {
  title: { ja: string; en: string }
  body: { ja: string[]; en: string[] }
}

const lastUpdated = '2026-04-30'
const supportEmail = 'support@talllk.net'

const sections: Section[] = [
  {
    title: { ja: '1. 利用条件', en: '1. Eligibility and accounts' },
    body: {
      ja: [
        'Talllkを利用するには、本規約とプライバシーポリシーに同意する必要があります。アカウント情報は正確に保ち、第三者に利用させないでください。',
        'アカウントの管理責任はユーザーにあります。不正利用に気づいた場合は速やかにサポートへ連絡してください。',
      ],
      en: [
        'To use Talllk, you must agree to these Terms and the Privacy Policy. Keep your account information accurate and do not allow others to use your account.',
        'You are responsible for your account. If you notice unauthorized use, contact support promptly.',
      ],
    },
  },
  {
    title: { ja: '2. ユーザーコンテンツ', en: '2. User content' },
    body: {
      ja: [
        'ユーザーは、自分が入力・投稿・保存するコンテンツについて責任を負います。他者の権利を侵害する内容、違法な内容、攻撃的・差別的・性的・暴力的・スパム等の不適切な内容を投稿しないでください。',
        '公開機能を利用する場合、公開したコンテンツは他のユーザーに表示されることがあります。個人情報や機密情報を公開しないでください。',
      ],
      en: [
        'You are responsible for the content you enter, post, or save. Do not post content that infringes others’ rights or is illegal, abusive, discriminatory, sexual, violent, spam, or otherwise inappropriate.',
        'If you use public sharing, published content may be visible to other users. Do not publish personal or confidential information.',
      ],
    },
  },
  {
    title: { ja: '3. 禁止事項とモデレーション', en: '3. Prohibited conduct and moderation' },
    body: {
      ja: [
        'サービスの不正利用、リバースエンジニアリング、過度なアクセス、セキュリティ回避、他者への嫌がらせ、権利侵害、法令違反は禁止します。',
        `不適切なコンテンツや行為を見つけた場合は、アプリ内の通報機能または ${supportEmail} まで連絡してください。Talllkは、必要に応じてコンテンツの削除、公開停止、アカウント制限、ブロック等を行うことがあります。`,
      ],
      en: [
        'Do not misuse the service, reverse engineer it, overload it, bypass security, harass others, infringe rights, or violate laws.',
        `If you find objectionable content or behavior, use the in-app report feature or contact ${supportEmail}. Talllk may remove content, disable publishing, restrict accounts, or take other moderation actions when appropriate.`,
      ],
    },
  },
  {
    title: { ja: '4. 有料機能', en: '4. Paid features' },
    body: {
      ja: [
        'Talllk Proなどの有料機能を提供する場合、iOSアプリ内ではApp Storeのアプリ内課金を通じて購入・復元・管理できます。価格、期間、更新条件は購入画面に表示されます。',
        '購入、更新、返金はAppleの規約と手続きに従います。',
      ],
      en: [
        'If paid features such as Talllk Pro are offered, purchases, restoration, and management in the iOS app are handled through App Store In-App Purchase. Pricing, duration, and renewal terms are shown on the purchase screen.',
        'Purchases, renewals, and refunds follow Apple’s terms and processes.',
      ],
    },
  },
  {
    title: { ja: '5. 免責・変更', en: '5. Disclaimers and changes' },
    body: {
      ja: [
        'Talllkは、サービスの継続性、完全性、特定目的への適合性を保証しません。ユーザーのデータ保護のため、必要に応じてバックアップや確認を行ってください。',
        'Talllkは、機能、規約、ポリシーを変更することがあります。重要な変更は、合理的な方法で通知します。',
      ],
      en: [
        'Talllk does not guarantee uninterrupted availability, completeness, or fitness for a particular purpose. Please keep backups or confirmations as needed to protect your data.',
        'Talllk may update features, these Terms, or policies. Material changes will be communicated in a reasonable manner.',
      ],
    },
  },
  {
    title: { ja: '6. お問い合わせ', en: '6. Contact' },
    body: {
      ja: [`本規約に関するお問い合わせは ${supportEmail} までご連絡ください。`],
      en: [`For questions about these Terms, contact ${supportEmail}.`],
    },
  },
]

export default function TermsPage() {
  const { t, language } = useI18n()
  const locale = language === 'en' ? 'en' : 'ja'

  return (
    <div className="min-h-screen bg-base transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-ink-sub hover:text-ink transition-colors">
            <img src="/brand/talllk-icon.svg" alt="Talllk" className="w-5 h-5" />
            <span className="font-semibold">Talllk</span>
          </a>
        </div>
        <div className="glass-card-muted rounded-3xl p-6 sm:p-8 space-y-7">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">
              {t({ ja: '利用規約', en: 'Terms of Service' })}
            </h1>
            <p className="text-sm text-ink-muted">
              {t({ ja: `最終更新日: ${lastUpdated}`, en: `Last updated: ${lastUpdated}` })}
            </p>
          </div>

          <p className="text-ink-muted leading-7">
            {t({
              ja: 'この利用規約は、Talllkの利用条件を定めるものです。Talllkを利用することで、本規約に同意したものとみなされます。',
              en: 'These Terms describe the conditions for using Talllk. By using Talllk, you agree to these Terms.',
            })}
          </p>

          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title.en}>
                <h2 className="text-lg font-semibold text-ink mb-3">{section.title[locale]}</h2>
                <div className="space-y-3">
                  {section.body[locale].map((paragraph) => (
                    <p key={paragraph} className="text-ink-muted leading-7">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
