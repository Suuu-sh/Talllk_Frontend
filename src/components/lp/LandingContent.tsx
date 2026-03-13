'use client'

import styles from '@/app/landing.module.css'
import { LandingMockVisual } from '@/components/lp/LandingMockVisual'
import { useI18n } from '@/contexts/I18nContext'

type LandingContentProps = {
  scrolled: boolean
  isDark: boolean
  isLoggedIn: boolean
  onToggleTheme: () => void
  onPrimaryAction: () => void
  onLoginAction: () => void
}

type Copy = {
  ja: string
  en: string
}

type ValueCard = {
  title: Copy
  text: Copy
}

type WorkflowStep = {
  step: string
  title: Copy
  text: Copy
}

const valueCards: ValueCard[] = [
  {
    title: { ja: '会話を分解して準備', en: 'Break down conversations before they happen' },
    text: {
      ja: '導入、深掘り、締めをカード化。重要な会話でも迷いを減らします。',
      en: 'Prepare openers, deep-dive questions, and closers as reusable cards for high-stakes conversations.',
    },
  },
  {
    title: { ja: 'シーンをテンプレ化', en: 'Template each scenario' },
    text: {
      ja: '面接、商談、初対面などを再利用可能なフローとして蓄積できます。',
      en: 'Save interviews, business meetings, and first-time chats as reusable conversation flows.',
    },
  },
  {
    title: { ja: '本番前に最終確認', en: 'Final check right before go-time' },
    text: {
      ja: '直前30秒で要点を見返し、最善の状態で会話に入れます。',
      en: 'Review key points in 30 seconds and enter the conversation with confidence.',
    },
  },
]

const workflowSteps: WorkflowStep[] = [
  {
    step: '01',
    title: { ja: 'シーンを決める', en: 'Define the scene' },
    text: { ja: 'これからの会話シーンを決める', en: 'Choose the exact conversation context.' },
  },
  {
    step: '02',
    title: { ja: '流れを組み立てる', en: 'Design the flow' },
    text: { ja: '質問の順序と広げ方をつくる', en: 'Build question order and branching paths.' },
  },
  {
    step: '03',
    title: { ja: '実践する', en: 'Run it' },
    text: { ja: '本番前に見返して実践する', en: 'Do a final review and use it in real life.' },
  },
]

export function LandingContent({
  scrolled,
  isDark,
  isLoggedIn,
  onToggleTheme,
  onPrimaryAction,
  onLoginAction,
}: LandingContentProps) {
  const { t } = useI18n()

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        {t({ ja: 'メインコンテンツへスキップ', en: 'Skip to main content' })}
      </a>

      <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <a href="#" className={styles.brand}>
            <span className={styles.brandBadge}>Talllk</span>
          </a>

          <nav className={styles.navMenu} aria-label={t({ ja: 'LP内ナビゲーション', en: 'Landing page navigation' })}>
            <a className={styles.navLink} href="#showcase">
              {t({ ja: 'ショーケース', en: 'Showcase' })}
            </a>
            <a className={styles.navLink} href="#value">
              {t({ ja: '価値', en: 'Value' })}
            </a>
            <a className={styles.navLink} href="#workflow">
              {t({ ja: '流れ', en: 'Workflow' })}
            </a>
            <a className={styles.navLink} href="#cta">
              {t({ ja: '開始', en: 'Start' })}
            </a>
          </nav>

          <div className={styles.navActions}>
            <button
              type="button"
              onClick={onToggleTheme}
              className={styles.themeButton}
              aria-label={
                isDark
                  ? t({ ja: 'ライトモードに切り替え', en: 'Switch to light mode' })
                  : t({ ja: 'ダークモードに切り替え', en: 'Switch to dark mode' })
              }
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95 6.95 1.4 1.4M5.65 5.65l1.4 1.4m9.9-1.4-1.4 1.4m-8.5 8.5-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                  />
                </svg>
              )}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onLoginAction}>
              {t({ ja: 'ログイン', en: 'Log in' })}
            </button>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              {isLoggedIn
                ? t({ ja: 'ダッシュボードへ', en: 'Go to dashboard' })
                : t({ ja: '無料ではじめる', en: 'Get started free' })}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.heroEyebrow}>{t({ ja: '会話準備アプリ', en: 'Conversation readiness app' })}</p>
          <h1 className={styles.heroTitle}>
            {t({ ja: '人生の大事な会話は、', en: 'High-stakes conversations' })}
            <br />
            {t({ ja: '準備で変わる。', en: 'improve with preparation.' })}
          </h1>
          <p className={styles.heroLead}>
            {t({
              ja: '重要な場面ほど会話が結果を左右します。Talllkは会話を事前準備し、いつでも最善の状態で臨めるようにするアプリです。',
              en: 'The more important the moment, the more conversation quality matters. Talllk helps you prepare in advance and show up at your best every time.',
            })}
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              {isLoggedIn
                ? t({ ja: 'ダッシュボードへ', en: 'Go to dashboard' })
                : t({ ja: '無料で試す', en: 'Try for free' })}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onLoginAction}>
              {t({ ja: 'ログイン', en: 'Log in' })}
            </button>
          </div>
          <p className={styles.heroMeta}>{t({ ja: 'クレカ不要 / 30秒で開始', en: 'No credit card / Start in 30s' })}</p>
        </section>

        <section id="showcase" className={styles.showcaseSection}>
          <LandingMockVisual />
        </section>

        <section id="value" className={styles.valueSection}>
          <p className={styles.sectionHeading}>{t({ ja: 'Talllkでできること', en: 'With Talllk you can' })}</p>
          <h2 className={styles.sectionTitle}>
            {t({ ja: '重要な会話に向けて、いつでも準備を回せる', en: 'Run repeatable prep before every important conversation' })}
          </h2>
          <div className={styles.cardGrid}>
            {valueCards.map((card) => (
              <article key={card.title.ja} className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>{t(card.title)}</h3>
                <p className={styles.infoCardText}>{t(card.text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className={styles.workflowSection}>
          <p className={styles.sectionHeading}>{t({ ja: '使い方', en: 'Workflow' })}</p>
          <h2 className={styles.sectionTitle}>{t({ ja: '3ステップで会話を設計する', en: 'Design conversations in 3 steps' })}</h2>
          <div className={styles.stepsGrid}>
            {workflowSteps.map((step) => (
              <article key={step.step} className={styles.stepCard}>
                <p className={styles.stepNumber}>{step.step}</p>
                <h3 className={styles.stepTitle}>{t(step.title)}</h3>
                <p className={styles.stepText}>{t(step.text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cta" className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <h2 className={styles.ctaTitle}>
              {t({ ja: '次の大事な会話を、今準備する', en: 'Prepare now for your next important conversation' })}
            </h2>
            <p className={styles.ctaText}>
              {t({
                ja: '転機は突然やってきます。だからこそ、ふだんから会話を準備しておく。',
                en: 'Turning points come suddenly. Preparation is what keeps you ready.',
              })}
            </p>
            <div className={styles.ctaActions}>
              <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
                {isLoggedIn
                  ? t({ ja: 'ダッシュボードへ', en: 'Go to dashboard' })
                  : t({ ja: '無料ではじめる', en: 'Get started free' })}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <p className={styles.footerBrand}>Talllk</p>
            <p>
              {t({
                ja: '重要な会話に向けた会話準備アプリ。',
                en: 'Conversation readiness for high-stakes moments.',
              })}
            </p>
          </div>
          <div className={styles.footerLinks}>
            <a className={styles.footerLink} href="#showcase">
              {t({ ja: 'ショーケース', en: 'Showcase' })}
            </a>
            <a className={styles.footerLink} href="#value">
              {t({ ja: '価値', en: 'Value' })}
            </a>
            <a className={styles.footerLink} href="/privacy">
              {t({ ja: 'プライバシー', en: 'Privacy' })}
            </a>
            <a className={styles.footerLink} href="/terms">
              {t({ ja: '利用規約', en: 'Terms' })}
            </a>
          </div>
        </div>
        <div className={styles.divider} />
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Talllk</p>
      </footer>
    </div>
  )
}
