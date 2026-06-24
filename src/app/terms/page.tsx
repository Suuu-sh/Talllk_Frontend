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

const termsSections: LegalSection[] = [
  {
    title: {
      ja: '1. 規約への同意',
      en: '1. Acceptance of these Terms',
    },
    paragraphs: [
      {
        ja: 'この利用規約（以下「本規約」）は、Talllk の Web サイト、モバイルアプリ、関連するバックエンド API、サポート対応その他の関連サービス（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。',
        en: 'These Terms of Service (the “Terms”) govern your use of the Talllk website, mobile apps, backend APIs, support operations, and related services (collectively, the “Service”). By using the Service, you agree to these Terms.',
      },
      {
        ja: '本規約に同意できない場合は、本サービスを利用しないでください。未成年者が本サービスを利用する場合、法定代理人の同意を得たうえで利用してください。',
        en: 'If you do not agree to these Terms, do not use the Service. If you are a minor, you must use the Service only with the consent of your parent or legal guardian.',
      },
    ],
  },
  {
    title: {
      ja: '2. アカウント',
      en: '2. Accounts',
    },
    paragraphs: [
      {
        ja: '本サービスの一部機能を利用するには、アカウント登録またはログインが必要です。ユーザーは、登録情報を正確かつ最新に保ち、アカウント認証情報および端末の管理について責任を負います。アカウントの不正利用に気付いた場合は、速やかにサポート窓口へ連絡してください。',
        en: 'Some features require account registration or sign-in. You are responsible for keeping your registration information accurate and up to date, and for safeguarding your account credentials and devices. If you become aware of unauthorized account use, contact support promptly.',
      },
      {
        ja: '当方は、セキュリティ、不正利用防止、法令・本規約違反への対応のため、アカウントの利用制限、停止、削除、再認証の要求を行うことがあります。',
        en: 'We may restrict, suspend, delete, or require re-authentication for an account to protect security, prevent abuse, or respond to violations of laws or these Terms.',
      },
    ],
  },
  {
    title: {
      ja: '3. 本サービスの内容',
      en: '3. The Service',
    },
    paragraphs: [
      {
        ja: 'Talllk は、会話の準備、シチュエーション・トピック・質問・回答の整理、公開共有、フォロー、いいね、プロフィール表示、サブスクリプション機能などを提供するサービスです。機能の内容、利用条件、表示、提供範囲は、端末、OS、地域、言語、アカウント状態、サブスクリプション状態、設定により異なる場合があります。',
        en: 'Talllk helps users prepare conversations and organize situations, topics, questions, and answers. It may include public sharing, follows, likes, profiles, subscriptions, and related features. Features, availability, display, and conditions may vary depending on device, OS, region, language, account status, subscription status, and settings.',
      },
      {
        ja: '当方は、必要に応じて本サービスの全部または一部を変更、追加、停止、終了することがあります。重要な変更がある場合は、合理的な方法で通知するよう努めます。',
        en: 'We may modify, add, suspend, or discontinue all or part of the Service as needed. We will endeavor to notify users by reasonable means when there are material changes.',
      },
    ],
  },
  {
    title: {
      ja: '4. ユーザーコンテンツと公開共有',
      en: '4. User content and public sharing',
    },
    paragraphs: [
      {
        ja: 'ユーザーは、自分が本サービスへ入力、作成、アップロード、公開、送信するテキスト、画像、プロフィール情報その他のコンテンツ（以下「ユーザーコンテンツ」）について責任を負います。ユーザーコンテンツの権利は、ユーザーまたは正当な権利者に留保されます。',
        en: 'You are responsible for text, images, profile information, and other content that you enter, create, upload, publish, or send through the Service (“User Content”). Rights in User Content remain with you or the applicable rights holder.',
      },
      {
        ja: 'ユーザーは、当方に対し、本サービスの提供、保存、同期、表示、公開共有、配信、バックアップ、解析、改善、サポート、通報・安全対策に必要な範囲で、ユーザーコンテンツを利用、複製、保存、表示、公衆送信、加工する非独占的、無償、世界的なライセンスを付与します。',
        en: 'You grant us a non-exclusive, royalty-free, worldwide license to use, copy, store, display, transmit, modify, and process User Content as necessary to provide, store, sync, display, publicly share, deliver, back up, analyze, improve, support, and protect the Service.',
      },
      {
        ja: '公開共有機能を利用した場合、ユーザーコンテンツ、表示名、ユーザー名、プロフィール画像、いいね数、フォロー情報などが他のユーザーまたは一般の閲覧者に表示されることがあります。公開した内容は第三者に保存、コピー、再共有される可能性があるため、公開したくない情報は投稿しないでください。',
        en: 'If you use public sharing features, User Content, display name, username, profile image, like counts, follow information, and similar information may be visible to other users or public viewers. Public content may be saved, copied, or reshared by third parties, so do not post information you do not want to make public.',
      },
    ],
  },
  {
    title: {
      ja: '5. 禁止事項',
      en: '5. Prohibited conduct',
    },
    paragraphs: [
      {
        ja: 'ユーザーは、本サービスの利用にあたり、次の行為を行ってはなりません。',
        en: 'You must not engage in the following conduct when using the Service.',
      },
    ],
    bullets: [
      {
        ja: '法令、公序良俗、本規約、ガイドライン、第三者との契約に違反する行為。',
        en: 'Violating laws, public order, these Terms, guidelines, or agreements with third parties.',
      },
      {
        ja: '他者への嫌がらせ、脅迫、差別、ヘイト、名誉毀損、なりすまし、ストーキング、性的搾取、未成年者を害する行為。',
        en: 'Harassment, threats, discrimination, hate, defamation, impersonation, stalking, sexual exploitation, or conduct that harms minors.',
      },
      {
        ja: '他者の個人情報、秘密情報、認証情報、著作権・商標権・肖像権・プライバシー権その他の権利を侵害する情報の投稿または共有。',
        en: 'Posting or sharing information that infringes personal information, confidential information, credentials, copyrights, trademarks, portrait rights, privacy rights, or other rights of others.',
      },
      {
        ja: 'スパム、詐欺、フィッシング、マルウェア配布、不正アクセス、脆弱性探索、過度なリクエスト、サービス妨害、セキュリティ制御の回避。',
        en: 'Spam, fraud, phishing, malware distribution, unauthorized access, vulnerability probing, excessive requests, denial of service, or bypassing security controls.',
      },
      {
        ja: '本サービス、クライアント、API、モデル、課金、認証の不正利用、リバースエンジニアリング、スクレイピング、自動化された大量取得。',
        en: 'Misuse of the Service, clients, APIs, models, payments, or authentication, including reverse engineering, scraping, or automated bulk extraction.',
      },
      {
        ja: '違法、有害、暴力的、露骨な性的表現、犯罪助長、自己または他者への危害を助長するコンテンツの投稿または共有。',
        en: 'Posting or sharing illegal, harmful, violent, sexually explicit, crime-enabling, or self-harm or harm-to-others enabling content.',
      },
    ],
  },
  {
    title: {
      ja: '6. 通報、ブロック、モデレーション',
      en: '6. Reports, blocking, and moderation',
    },
    paragraphs: [
      {
        ja: 'ユーザーは、不適切なコンテンツまたはユーザーを通報できる場合があります。当方は、通報、法令・本規約違反、セキュリティ上の必要性、サービス運営上の必要性に応じて、コンテンツの削除、表示制限、公開停止、アカウント制限、アカウント停止、関係機関への報告その他の措置を行うことがあります。',
        en: 'Users may be able to report inappropriate content or users. In response to reports, legal or Terms violations, security needs, or operational needs, we may remove content, limit visibility, unpublish content, restrict accounts, suspend accounts, report to relevant authorities, or take other measures.',
      },
      {
        ja: '当方は、すべてのコンテンツを事前確認する義務を負うものではなく、措置の理由や詳細を常に開示できるとは限りません。',
        en: 'We are not obligated to pre-screen all content, and we may not always be able to disclose the reasons or details for moderation actions.',
      },
    ],
  },
  {
    title: {
      ja: '7. Talllk Pro、サブスクリプション、アプリ内購入',
      en: '7. Talllk Pro, subscriptions, and in-app purchases',
    },
    paragraphs: [
      {
        ja: 'Talllk Pro などの有料機能は、App Store、Google Play、RevenueCat、その他の決済・購読管理サービスを通じて提供される場合があります。価格、更新、無料トライアル、キャンセル、返金、税金、支払方法は、購入時に表示される条件および各ストアまたは決済事業者の規約に従います。',
        en: 'Paid features such as Talllk Pro may be provided through the App Store, Google Play, RevenueCat, or other payment and subscription management services. Prices, renewals, free trials, cancellations, refunds, taxes, and payment methods are governed by the conditions shown at purchase and by the terms of the applicable store or payment provider.',
      },
      {
        ja: '自動更新サブスクリプションは、ユーザーが各ストアのアカウント設定で解約しない限り更新される場合があります。アプリを削除してもサブスクリプションは自動的には解約されません。返金の可否は、各ストアまたは決済事業者の判断・規約に従います。',
        en: 'Auto-renewing subscriptions may renew unless you cancel through your store account settings. Deleting the app does not automatically cancel a subscription. Refund eligibility is determined by the applicable store or payment provider under their policies.',
      },
      {
        ja: '当方は、有料機能の内容、利用条件、提供範囲を変更することがあります。ただし、適用法令および各ストアのルールに従います。',
        en: 'We may change the content, conditions, and availability of paid features, subject to applicable laws and store rules.',
      },
    ],
  },
  {
    title: {
      ja: '8. Apple Intelligence などの AI・端末機能',
      en: '8. AI and device features such as Apple Intelligence',
    },
    paragraphs: [
      {
        ja: '対応端末では、ユーザーが入力した質問・回答テキストを Apple Intelligence などの端末・OS 機能で整える機能を提供することがあります。これらの機能の可用性、品質、出力内容は、端末、OS、言語、地域、設定、プラットフォーム提供者の仕様に依存します。',
        en: 'On supported devices, Talllk may offer features that polish user-entered question and answer text using device or OS features such as Apple Intelligence. Availability, quality, and outputs depend on the device, OS, language, region, settings, and platform provider specifications.',
      },
      {
        ja: 'AI や端末機能の出力は、不正確、不完全、または不適切な場合があります。ユーザーは出力内容を自ら確認し、重要な判断、医療・法律・金融・安全に関わる判断を、出力だけに依存して行わないでください。',
        en: 'Outputs from AI or device features may be inaccurate, incomplete, or inappropriate. You are responsible for reviewing outputs and must not rely solely on them for important decisions or for medical, legal, financial, or safety-related decisions.',
      },
    ],
  },
  {
    title: {
      ja: '9. 第三者サービス',
      en: '9. Third-party services',
    },
    paragraphs: [
      {
        ja: '本サービスは、認証、ホスティング、データベース、ストレージ、メール配信、クラッシュ解析、広告、決済、サブスクリプション管理、OS 機能など、第三者サービスと連携する場合があります。第三者サービスの利用には、それぞれの規約、プライバシーポリシー、手数料、制限が適用される場合があります。当方は、第三者サービスの変更、停止、不具合、データ取扱いについて、当方の責めに帰すべき場合を除き責任を負いません。',
        en: 'The Service may integrate with third-party services for authentication, hosting, databases, storage, email delivery, crash reporting, advertising, payments, subscription management, OS features, and similar functions. Third-party terms, privacy policies, fees, and limitations may apply. Except where attributable to us, we are not responsible for changes, suspension, failures, or data practices of third-party services.',
      },
    ],
  },
  {
    title: {
      ja: '10. 知的財産権',
      en: '10. Intellectual property',
    },
    paragraphs: [
      {
        ja: '本サービスに関するソフトウェア、デザイン、ロゴ、商標、文章、画像、データベース、その他の権利は、当方または正当な権利者に帰属します。本規約は、ユーザーに対し、本サービスまたは第三者の知的財産権を譲渡または許諾するものではありません。',
        en: 'Software, designs, logos, trademarks, text, images, databases, and other rights related to the Service belong to us or the applicable rights holders. These Terms do not transfer or license intellectual property rights in the Service or third-party property to you except as expressly stated.',
      },
    ],
  },
  {
    title: {
      ja: '11. 保証の否認',
      en: '11. Disclaimers',
    },
    paragraphs: [
      {
        ja: '本サービスは、現状有姿かつ提供可能な範囲で提供されます。当方は、適用法令で認められる最大限の範囲で、本サービスが中断しないこと、エラーがないこと、安全であること、特定目的に適合すること、ユーザーの期待する結果を得られること、データが常に保存・復元されることを保証しません。',
        en: 'The Service is provided “as is” and “as available.” To the maximum extent permitted by applicable law, we do not warrant that the Service will be uninterrupted, error-free, secure, fit for a particular purpose, achieve your expected results, or always preserve or restore data.',
      },
      {
        ja: 'ユーザーは、必要に応じて自ら重要な情報の控えを保存し、出力内容や公開内容を確認する責任を負います。',
        en: 'You are responsible for keeping your own copies of important information when needed and for reviewing outputs and public content.',
      },
    ],
  },
  {
    title: {
      ja: '12. 責任の制限',
      en: '12. Limitation of liability',
    },
    paragraphs: [
      {
        ja: '当方は、適用法令で認められる最大限の範囲で、本サービスの利用または利用不能に起因する間接損害、特別損害、付随的損害、結果損害、逸失利益、データ喪失、事業中断、第三者との紛争について責任を負いません。',
        en: 'To the maximum extent permitted by applicable law, we are not liable for indirect, special, incidental, consequential, or punitive damages, lost profits, data loss, business interruption, or disputes with third parties arising from use of or inability to use the Service.',
      },
      {
        ja: '当方が責任を負う場合でも、当方の責任は、ユーザーが当該損害発生前の直近12か月間に本サービスに対して実際に支払った金額、または1万円のいずれか高い額を上限とします。ただし、当方の故意または重過失、消費者契約法その他の強行法規により制限が認められない場合を除きます。',
        en: 'Where we are liable, our aggregate liability is limited to the greater of the amount you actually paid for the Service in the 12 months before the event giving rise to the claim or JPY 10,000, except where limitation is not permitted due to our intentional misconduct, gross negligence, consumer protection laws, or other mandatory laws.',
      },
    ],
  },
  {
    title: {
      ja: '13. 利用停止、終了、アカウント削除',
      en: '13. Suspension, termination, and account deletion',
    },
    paragraphs: [
      {
        ja: 'ユーザーは、いつでも本サービスの利用を停止できます。アカウント削除は、アプリ内の設定から開始できます。削除後のデータ取扱いは、プライバシーポリシーに従います。',
        en: 'You may stop using the Service at any time. You can initiate account deletion from the in-app settings. Handling of data after deletion is described in the Privacy Policy.',
      },
      {
        ja: '当方は、ユーザーが本規約に違反した場合、不正利用またはセキュリティ上のリスクがある場合、法令・権利保護・サービス運営上必要な場合、事前通知なく本サービスの利用を制限、停止、終了することがあります。',
        en: 'We may restrict, suspend, or terminate your use of the Service without prior notice if you violate these Terms, if there is abuse or a security risk, or if necessary for legal, rights-protection, or operational reasons.',
      },
    ],
  },
  {
    title: {
      ja: '14. 規約の変更',
      en: '14. Changes to these Terms',
    },
    paragraphs: [
      {
        ja: '当方は、必要に応じて本規約を変更することがあります。重要な変更がある場合、アプリ内、Web サイト、メール、その他適切な方法で通知することがあります。変更後に本サービスを利用した場合、変更後の規約に同意したものとみなされます。',
        en: 'We may update these Terms as needed. If we make material changes, we may notify you in the app, on the website, by email, or by other appropriate means. If you use the Service after the changes, you will be deemed to have agreed to the updated Terms.',
      },
    ],
  },
  {
    title: {
      ja: '15. 準拠法・紛争解決',
      en: '15. Governing law and disputes',
    },
    paragraphs: [
      {
        ja: '本規約は、抵触法の規定を除き、日本法に準拠します。ただし、ユーザーの居住地における強行法規または消費者保護法により別途保護が与えられる場合、その保護は排除されません。',
        en: 'These Terms are governed by the laws of Japan, excluding conflict-of-law rules. However, mandatory laws or consumer protection laws in your place of residence may provide you with additional protections, and those protections are not excluded.',
      },
      {
        ja: '本サービスに関して紛争が生じた場合、当方およびユーザーは、まず誠実に協議して解決を図るものとします。',
        en: 'If a dispute arises regarding the Service, you and we will first attempt to resolve it through good-faith discussions.',
      },
    ],
  },
]

export default function TermsPage() {
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
              {t({ ja: '利用規約', en: 'Terms of Service' })}
            </h1>
            <p className="text-sm text-ink-muted mt-3">
              {t({ ja: `最終更新日: ${LAST_UPDATED.ja}`, en: `Last updated: ${LAST_UPDATED.en}` })}
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {termsSections.map((section) => (
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
                {t({ ja: '16. お問い合わせ', en: '16. Contact' })}
              </h2>
              <p className="text-sm sm:text-base leading-7 text-ink-muted">
                {t({
                  ja: '本規約、本サービス、通報、サポートに関するお問い合わせは、以下のメールアドレスまでご連絡ください。',
                  en: 'For questions about these Terms, the Service, reports, or support, please contact us at the email address below.',
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
