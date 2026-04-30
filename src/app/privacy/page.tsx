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
    title: { ja: '1. 収集する情報', en: '1. Information we collect' },
    body: {
      ja: [
        'アカウント作成・ログインのために、メールアドレス、表示名、ユーザーID、認証トークンなどを取り扱います。GoogleログインまたはAppleログインを利用する場合は、各プロバイダから提供される認証情報を利用します。',
        'アプリ内で作成したシチュエーション、トピック、質問、回答、ラベル、プロフィール画像など、ユーザーが入力・保存したコンテンツを取り扱います。',
        '品質改善と障害調査のために、クラッシュ情報、パフォーマンス情報、端末・アプリの基本情報などの診断データを収集することがあります。',
      ],
      en: [
        'For account creation and sign-in, we process information such as email address, display name, user ID, and authentication tokens. If you use Google Sign-In or Sign in with Apple, we use authentication information provided by those services.',
        'We process content you create or save in the app, including situations, topics, questions, answers, labels, and profile images.',
        'To improve quality and investigate issues, we may collect diagnostics such as crash data, performance data, and basic device/app information.',
      ],
    },
  },
  {
    title: { ja: '2. 利用目的', en: '2. How we use information' },
    body: {
      ja: [
        'アカウント管理、同期、データ保存、公開設定、購入状態の確認、サポート対応、セキュリティ保護、障害調査、サービス改善のために利用します。',
        'Talllk Proユーザーは、対応端末で、入力した質問と回答をApple Intelligenceのシステム機能で整えることができます。この整形処理はTalllkのバックエンドへ送信せず、端末上またはAppleが提供するシステム機能内で行われます。',
        '取得した情報を第三者広告のために販売したり、他社データと結び付けてトラッキングしたりすることはありません。',
      ],
      en: [
        'We use information to provide account management, sync, data storage, publishing controls, subscription status checks, support, security, troubleshooting, and service improvement.',
        'Talllk Pro users can use Apple Intelligence system features on supported devices to polish user-entered questions and answers. This polish request is not sent to the Talllk backend and is processed on device or within Apple-provided system functionality.',
        'We do not sell your information for third-party advertising or combine it with third-party data to track you.',
      ],
    },
  },
  {
    title: { ja: '3. 共有・委託先', en: '3. Service providers' },
    body: {
      ja: [
        'サービス提供に必要な範囲で、認証・データ保存・決済確認・分析/クラッシュレポートなどの外部サービスを利用します。例: Supabase、Google、Apple、RevenueCat、Sentry。',
        'これらの事業者には、Talllkの機能提供、保守、セキュリティ、法令遵守に必要な範囲でのみ情報が共有されます。',
      ],
      en: [
        'We use service providers for authentication, data storage, purchase validation, analytics, and crash reporting. Examples include Supabase, Google, Apple, RevenueCat, and Sentry.',
        'Information is shared with these providers only as needed to operate, maintain, secure, and comply with legal obligations for Talllk.',
      ],
    },
  },
  {
    title: { ja: '4. 公開コンテンツとモデレーション', en: '4. Public content and moderation' },
    body: {
      ja: [
        '公開機能を有効にした場合、ユーザーが公開したコンテンツやプロフィールの一部が他のユーザーに表示されます。公開前に個人情報や不適切な内容が含まれていないか確認してください。',
        `不適切なコンテンツを見つけた場合は、アプリ内の通報機能または ${supportEmail} まで連絡してください。必要に応じてコンテンツの削除、ユーザーの制限、ブロックなどを行います。`,
      ],
      en: [
        'When public sharing is enabled, content you publish and parts of your profile may be visible to other users. Please review content before publishing and avoid personal or inappropriate information.',
        `If you find objectionable content, use the in-app report feature or contact ${supportEmail}. We may remove content, restrict users, or take other moderation actions when appropriate.`,
      ],
    },
  },
  {
    title: { ja: '5. 保存期間と削除', en: '5. Retention and deletion' },
    body: {
      ja: [
        'アカウントやコンテンツは、サービス提供に必要な期間または法令上必要な期間保存します。ユーザーはアプリ内の設定からアカウント削除を開始できます。',
        '削除リクエスト後、運用上・法令上必要な範囲を除き、アカウント情報と関連データを削除または匿名化します。',
      ],
      en: [
        'We retain accounts and content for as long as needed to provide the service or as required by law. You can initiate account deletion from Settings in the app.',
        'After a deletion request, we delete or anonymize account information and related data except where operationally or legally necessary.',
      ],
    },
  },
  {
    title: { ja: '6. お問い合わせ', en: '6. Contact' },
    body: {
      ja: [`プライバシーに関する質問、データ削除、サポート依頼は ${supportEmail} までお問い合わせください。`],
      en: [`For privacy questions, deletion requests, or support, contact ${supportEmail}.`],
    },
  },
]

export default function PrivacyPage() {
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
              {t({ ja: 'プライバシーポリシー', en: 'Privacy Policy' })}
            </h1>
            <p className="text-sm text-ink-muted">
              {t({ ja: `最終更新日: ${lastUpdated}`, en: `Last updated: ${lastUpdated}` })}
            </p>
          </div>

          <p className="text-ink-muted leading-7">
            {t({
              ja: 'Talllkは、会話準備のためのシチュエーション、トピック、質問、回答を管理するサービスです。このポリシーは、Talllkが取り扱う情報とその利用方法を説明します。',
              en: 'Talllk helps people prepare for conversations by managing situations, topics, questions, and answers. This policy explains what information Talllk handles and how it is used.',
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
