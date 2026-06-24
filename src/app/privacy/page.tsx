'use client'

import { useI18n } from '@/contexts/I18nContext'

type LocalizedText = {
  ja: string
  en: string
}

type LegalSection = {
  title: LocalizedText
  paragraphs?: LocalizedText[]
  bullets?: LocalizedText[]
}

const SUPPORT_EMAIL = 'support@talllk.net'

const LAST_UPDATED: LocalizedText = {
  ja: '2026年6月24日',
  en: 'June 24, 2026',
}

const privacySections: LegalSection[] = [
  {
    title: {
      ja: '1. このポリシーについて',
      en: '1. About this policy',
    },
    paragraphs: [
      {
        ja: 'このプライバシーポリシーは、Talllk の Web サイト、モバイルアプリ、関連するバックエンド API、サポート対応その他の関連サービス（以下「本サービス」）における個人情報および関連データの取扱いを説明するものです。',
        en: 'This Privacy Policy explains how Talllk handles personal information and related data in the Talllk website, mobile apps, backend APIs, support operations, and related services (collectively, the “Service”).',
      },
      {
        ja: '本サービスの運営者を以下「当方」といいます。ご質問、削除依頼、その他プライバシーに関するお問い合わせは、下記のお問い合わせ先までご連絡ください。',
        en: 'The operator of the Service is referred to below as “we,” “us,” or “our.” For questions, deletion requests, or other privacy inquiries, please contact us using the contact information below.',
      },
    ],
  },
  {
    title: {
      ja: '2. 取得する情報',
      en: '2. Information we collect',
    },
    paragraphs: [
      {
        ja: '本サービスでは、機能提供、アカウント管理、安全性確保、サポート、課金管理、品質改善のために、次のような情報を取得または処理することがあります。',
        en: 'We may collect or process the following categories of information to provide features, manage accounts, keep the Service safe, provide support, manage purchases, and improve quality.',
      },
    ],
    bullets: [
      {
        ja: 'アカウント・プロフィール情報: メールアドレス、表示名、ユーザー名、プロフィール画像、認証事業者から提供されるユーザー ID など。',
        en: 'Account and profile information: email address, display name, username, profile image, user IDs provided by authentication providers, and similar information.',
      },
      {
        ja: 'ユーザーが入力・作成する内容: シチュエーション、トピック、質問、回答、ラベル、公開共有された内容、通報・サポート時に送信される内容など。',
        en: 'User content: situations, topics, questions, answers, labels, publicly shared content, reports, and support messages that you submit.',
      },
      {
        ja: '画像・ファイル: プロフィール画像など、本サービスにアップロードしたファイル。',
        en: 'Images and files: files you upload to the Service, such as profile images.',
      },
      {
        ja: '購入・サブスクリプション情報: Talllk Pro などの権利状態、商品 ID、取引 ID、購入状態、ストアから提供される領収・検証情報。カード番号などの決済手段そのものは、App Store、Google Play、その他決済事業者が処理します。',
        en: 'Purchase and subscription information: entitlement status for Talllk Pro or similar offerings, product IDs, transaction IDs, purchase status, and receipt or validation data provided by app stores. Payment card details are processed by the App Store, Google Play, or other payment providers, not by Talllk.',
      },
      {
        ja: '利用・診断情報: IP アドレス、ユーザーエージェント、端末・ブラウザ・アプリの情報、アクセス日時、API リクエスト情報、クラッシュログ、エラー、パフォーマンス情報など。',
        en: 'Usage and diagnostic information: IP address, user agent, device, browser, and app information, access time, API request information, crash logs, errors, and performance information.',
      },
      {
        ja: '広告関連情報: 広告機能が有効な場合、広告配信・測定・不正防止のために、広告事業者が端末識別子、広告 ID、広告表示・操作情報などを処理することがあります。',
        en: 'Advertising-related information: when advertising features are enabled, ad providers may process device identifiers, advertising IDs, ad impressions, interactions, and similar information for ad delivery, measurement, and fraud prevention.',
      },
    ],
  },
  {
    title: {
      ja: '3. 情報の利用目的',
      en: '3. How we use information',
    },
    bullets: [
      {
        ja: 'アカウント登録、ログイン、本人確認、セッション管理を行うため。',
        en: 'To create accounts, sign users in, verify identity, and manage sessions.',
      },
      {
        ja: 'シチュエーション、トピック、質問、回答、プロフィール、公開共有、フォロー、いいねなどの本サービス機能を提供するため。',
        en: 'To provide Service features such as situations, topics, questions, answers, profiles, public sharing, follows, and likes.',
      },
      {
        ja: 'サブスクリプションや有料機能の提供、権利確認、不正購入防止、カスタマーサポートを行うため。',
        en: 'To provide subscriptions and paid features, verify entitlements, prevent purchase abuse, and support customers.',
      },
      {
        ja: '通報対応、規約違反や不正利用の調査、スパム・攻撃・不正アクセスの防止、安全性確保のため。',
        en: 'To handle reports, investigate violations or abuse, prevent spam, attacks, and unauthorized access, and maintain safety.',
      },
      {
        ja: '障害解析、クラッシュ調査、パフォーマンス改善、サービス改善のため。',
        en: 'To analyze issues, investigate crashes, improve performance, and improve the Service.',
      },
      {
        ja: '法令、規制、裁判所・行政機関からの要請、権利保護に対応するため。',
        en: 'To comply with laws, regulations, court or government requests, and to protect rights.',
      },
    ],
  },
  {
    title: {
      ja: '4. 公開共有とユーザーコンテンツ',
      en: '4. Public sharing and user content',
    },
    paragraphs: [
      {
        ja: '公開共有機能を利用した場合、投稿内容、表示名、ユーザー名、プロフィール画像、いいね数、フォロー情報などが他のユーザーまたは一般の閲覧者に表示されることがあります。公開された情報は、第三者に保存、コピー、再共有される可能性があります。公開したくない個人情報、機密情報、他者の権利を侵害する情報は投稿しないでください。',
        en: 'If you use public sharing features, your content, display name, username, profile image, like counts, follow information, and similar information may be visible to other users or public viewers. Public information may be saved, copied, or reshared by third parties. Do not post personal information, confidential information, or content that infringes others’ rights if you do not want it to be public.',
      },
    ],
  },
  {
    title: {
      ja: '5. 第三者サービス・委託先への提供',
      en: '5. Third-party services and processors',
    },
    paragraphs: [
      {
        ja: '当方は、本サービスの提供に必要な範囲で、外部サービス事業者に情報を処理させることがあります。主な例は次のとおりです。',
        en: 'We may use third-party service providers to process information as needed to provide the Service. Key examples include the following.',
      },
    ],
    bullets: [
      {
        ja: '認証・アカウント管理: Clerk、Apple、Google など。',
        en: 'Authentication and account management: Clerk, Apple, Google, and similar providers.',
      },
      {
        ja: 'ホスティング、API、データベース、ストレージ、CDN: Render、Neon、Cloudflare など。',
        en: 'Hosting, APIs, databases, storage, and CDN: Render, Neon, Cloudflare, and similar providers.',
      },
      {
        ja: 'メール配信: Resend など。',
        en: 'Email delivery: Resend and similar providers.',
      },
      {
        ja: 'クラッシュ解析・診断: Sentry など。',
        en: 'Crash reporting and diagnostics: Sentry and similar providers.',
      },
      {
        ja: 'サブスクリプション・購入管理: RevenueCat、App Store、Google Play など。',
        en: 'Subscription and purchase management: RevenueCat, the App Store, Google Play, and similar providers.',
      },
      {
        ja: '広告配信・測定: Google AdMob など、広告機能を有効にした場合の広告関連事業者。',
        en: 'Advertising delivery and measurement: Google AdMob and other advertising providers when advertising features are enabled.',
      },
    ],
  },
  {
    title: {
      ja: '6. Apple Intelligence など端末・OS 機能の利用',
      en: '6. Device and OS features such as Apple Intelligence',
    },
    paragraphs: [
      {
        ja: '対応端末では、ユーザーが入力した質問・回答テキストを Apple Intelligence などの端末・OS 機能で整える機能を提供することがあります。この機能は、利用可能な端末・OS・言語・地域・設定に依存します。当方の現在の実装では、この整形処理のために入力内容を Talllk のバックエンドへ送信しません。ただし、OS やプラットフォーム提供者による処理は、それぞれのプライバシーポリシーおよび設定に従います。',
        en: 'On supported devices, Talllk may offer features that polish user-entered question and answer text using device or OS features such as Apple Intelligence. Availability depends on the device, OS, language, region, and settings. In our current implementation, Talllk does not send this polishing request to the Talllk backend. Processing by the OS or platform provider is governed by that provider’s privacy policy and settings.',
      },
    ],
  },
  {
    title: {
      ja: '7. アカウント削除、保存期間、ユーザーの権利',
      en: '7. Account deletion, retention, and your rights',
    },
    paragraphs: [
      {
        ja: 'ユーザーは、アプリ内の設定からアカウント削除を開始できます。また、削除、訂正、アクセス、利用停止その他の請求については、サポート窓口へご連絡ください。本人確認のために追加情報をお願いする場合があります。',
        en: 'You can initiate account deletion from the in-app settings. You may also contact support to request deletion, correction, access, restriction, or other privacy rights. We may ask for additional information to verify your identity.',
      },
      {
        ja: '当方は、本サービスの提供、法令遵守、不正対策、紛争対応、バックアップ、監査に必要な期間、情報を保持します。アカウント削除後、法令上保持が必要な情報、決済・不正対策・監査記録、バックアップやログに一時的に残る情報、第三者が保存した公開情報は、直ちに削除できない場合があります。',
        en: 'We retain information for as long as necessary to provide the Service, comply with laws, prevent abuse, resolve disputes, maintain backups, and perform audits. After account deletion, information required by law, purchase, anti-abuse, or audit records, information temporarily remaining in backups or logs, and public information saved by third parties may not be deleted immediately.',
      },
    ],
  },
  {
    title: {
      ja: '8. セキュリティ',
      en: '8. Security',
    },
    paragraphs: [
      {
        ja: '当方は、認証、アクセス制御、暗号化された通信、監視、権限管理など、情報保護のために合理的な安全管理措置を講じます。ただし、インターネット上の送信や保存に完全な安全性を保証することはできません。',
        en: 'We use reasonable safeguards such as authentication, access controls, encrypted communications, monitoring, and permission management to protect information. However, no transmission or storage method on the internet can be guaranteed to be completely secure.',
      },
    ],
  },
  {
    title: {
      ja: '9. 国外への移転',
      en: '9. International transfers',
    },
    paragraphs: [
      {
        ja: '本サービスで利用するクラウド、認証、解析、メール、決済、広告などの事業者は、日本、米国、その他の国・地域で情報を処理する場合があります。当方は、適用法令に従って必要な措置を講じます。',
        en: 'Cloud, authentication, analytics, email, payment, advertising, and other providers used by the Service may process information in Japan, the United States, and other countries or regions. We take measures required by applicable laws.',
      },
    ],
  },
  {
    title: {
      ja: '10. 子どもの利用',
      en: '10. Children',
    },
    paragraphs: [
      {
        ja: '本サービスは、13歳未満の子どもを対象としていません。13歳未満の子どもの情報を取得した可能性がある場合は、サポート窓口までご連絡ください。適切に確認したうえで削除等の対応を行います。',
        en: 'The Service is not directed to children under 13. If you believe we may have collected information from a child under 13, please contact support. We will review and take appropriate deletion or other action.',
      },
    ],
  },
  {
    title: {
      ja: '11. ポリシーの変更',
      en: '11. Changes to this policy',
    },
    paragraphs: [
      {
        ja: '当方は、必要に応じて本ポリシーを変更します。重要な変更がある場合、アプリ内、Web サイト、メール、その他適切な方法で通知することがあります。変更後に本サービスを利用した場合、変更後のポリシーが適用されます。',
        en: 'We may update this Policy as needed. If we make material changes, we may notify you in the app, on the website, by email, or by other appropriate means. If you use the Service after the changes, the updated Policy will apply.',
      },
    ],
  },
]

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

        <article className="glass-card-muted rounded-3xl p-6 sm:p-8">
          <div className="border-b border-line pb-6">
            <p className="text-sm font-semibold text-brand-500 mb-2">Talllk</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              {t({ ja: 'プライバシーポリシー', en: 'Privacy Policy' })}
            </h1>
            <p className="text-sm text-ink-muted mt-3">
              {t({ ja: `最終更新日: ${LAST_UPDATED.ja}`, en: `Last updated: ${LAST_UPDATED.en}` })}
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {privacySections.map((section) => (
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

            <section className="rounded-2xl border border-line bg-surface/70 p-5">
              <h2 className="text-lg sm:text-xl font-bold text-ink mb-3">
                {t({ ja: '12. お問い合わせ', en: '12. Contact' })}
              </h2>
              <p className="text-sm sm:text-base leading-7 text-ink-muted">
                {t({
                  ja: '本ポリシー、個人情報の取扱い、アカウント削除、通報対応に関するお問い合わせは、以下のメールアドレスまでご連絡ください。',
                  en: 'For questions about this Policy, privacy practices, account deletion, or reports, please contact us at the email address below.',
                })}{' '}
                <a className="font-semibold text-brand-600 dark:text-brand-400 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}
