'use client'

import { useI18n } from '@/contexts/I18nContext'

type LocalizedText = {
  ja: string
  en: string
}

type SupportSection = {
  title: LocalizedText
  paragraphs?: LocalizedText[]
  bullets?: LocalizedText[]
}

const SUPPORT_EMAIL = 'support@talllk.net'

const LAST_UPDATED: LocalizedText = {
  ja: '2026年7月2日',
  en: 'July 2, 2026',
}

const supportSections: SupportSection[] = [
  {
    title: {
      ja: '1. お問い合わせ先',
      en: '1. Contact',
    },
    paragraphs: [
      {
        ja: 'Talllk の使い方、不具合、ログイン、課金、通報、アカウント削除に関するお問い合わせは、以下のメールアドレスまでご連絡ください。',
        en: 'For help with Talllk usage, bugs, sign-in, billing, reports, or account deletion, contact us at the email address below.',
      },
      {
        ja: 'お問い合わせ時は、可能な範囲で発生日時、端末名、OSバージョン、アプリバージョン、問題が起きた画面、再現手順をお知らせください。',
        en: 'When contacting support, please include the date and time, device model, OS version, app version, affected screen, and reproduction steps when possible.',
      },
    ],
  },
  {
    title: {
      ja: '2. ログイン・アカウント',
      en: '2. Sign-in and account help',
    },
    bullets: [
      {
        ja: 'メールログイン、Googleログイン、Appleログインに対応しています。',
        en: 'Talllk supports email sign-in, Google sign-in, and Sign in with Apple.',
      },
      {
        ja: 'ログインできない場合は、別のログイン方法を試す前に、入力したメールアドレスや認証方法が以前利用したものと同じか確認してください。',
        en: 'If you cannot sign in, confirm that the email address and authentication method match the one you used previously before trying another method.',
      },
      {
        ja: 'アカウント削除はアプリ内の設定画面から開始できます。操作できない場合はサポートまでご連絡ください。',
        en: 'You can start account deletion from Settings in the app. If you cannot access the app, contact support.',
      },
    ],
  },
  {
    title: {
      ja: '3. 通報・ブロック・公開コンテンツ',
      en: '3. Reports, blocking, and public content',
    },
    paragraphs: [
      {
        ja: 'Discover などの公開コンテンツで問題を見つけた場合は、アプリ内の通報機能またはこのサポート窓口からご連絡ください。必要に応じて内容確認、非表示、削除、アカウント対応などを行います。',
        en: 'If you find problematic public content in Discover or related features, use the in-app report controls or contact this support address. We may review, hide, remove, or take account-level action as appropriate.',
      },
    ],
    bullets: [
      {
        ja: '通報時は、対象のユーザー名、投稿内容、画面、理由をできるだけ具体的に記載してください。',
        en: 'For reports, include the user name, content, screen, and reason as specifically as possible.',
      },
      {
        ja: 'ブロック機能により、対象ユーザーの公開コンテンツを自分の画面で表示しないようにできます。',
        en: 'Blocking can hide another user’s public content from your view.',
      },
    ],
  },
  {
    title: {
      ja: '4. Talllk Pro・購入',
      en: '4. Talllk Pro and purchases',
    },
    paragraphs: [
      {
        ja: 'Talllk Pro の購入、更新、返金、解約は、原則として購入に利用した App Store または各ストアの仕組みに従います。アプリ内の表示とストア上の状態が一致しない場合は、サポートまでご連絡ください。',
        en: 'Talllk Pro purchases, renewals, refunds, and cancellations generally follow the rules of the App Store or store used for purchase. If the app display does not match the store status, contact support.',
      },
    ],
  },
  {
    title: {
      ja: '5. 法的情報',
      en: '5. Legal information',
    },
    bullets: [
      {
        ja: 'プライバシーポリシー: https://talllk.net/privacy',
        en: 'Privacy Policy: https://talllk.net/privacy',
      },
      {
        ja: '利用規約: https://talllk.net/terms',
        en: 'Terms of Service: https://talllk.net/terms',
      },
    ],
  },
]

export default function SupportPage() {
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

        <article className="glass-card-muted rounded-3xl p-6 sm:p-8">
          <div className="border-b border-line pb-6">
            <p className="text-sm font-semibold text-brand-500 mb-2">Talllk Support</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              {t({ ja: 'サポート', en: 'Support' })}
            </h1>
            <p className="text-sm text-ink-muted mt-3">
              {t({ ja: `最終更新日: ${LAST_UPDATED.ja}`, en: `Last updated: ${LAST_UPDATED.en}` })}
            </p>
          </div>

          <section className="mt-8 rounded-2xl border border-line bg-surface/70 p-5">
            <h2 className="text-lg sm:text-xl font-bold text-ink mb-3">
              {t({ ja: 'メールで問い合わせる', en: 'Contact by email' })}
            </h2>
            <p className="text-sm sm:text-base leading-7 text-ink-muted">
              <a className="font-semibold text-brand-600 dark:text-brand-400 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>

          <div className="mt-8 space-y-8">
            {supportSections.map((section) => (
              <section key={section.title.ja}>
                <h2 className="text-lg sm:text-xl font-bold text-ink mb-3">{t(section.title)}</h2>
                <div className="space-y-3 text-sm sm:text-base leading-7 text-ink-muted">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.ja}>{t(paragraph)}</p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc pl-5 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet.ja}>{t(bullet)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
