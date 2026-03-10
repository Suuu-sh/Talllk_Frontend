import styles from '@/app/landing.module.css'
import { LandingMockVisual } from '@/components/lp/LandingMockVisual'

type LandingContentProps = {
  scrolled: boolean
  isDark: boolean
  isLoggedIn: boolean
  onToggleTheme: () => void
  onPrimaryAction: () => void
  onLoginAction: () => void
}

const valueCards = [
  {
    title: '会話を分解して準備',
    text: '導入、深掘り、締めをカード化。重要な会話でも迷いを減らします。',
  },
  {
    title: 'シーンをテンプレ化',
    text: '面接、商談、初対面などを再利用可能なフローとして蓄積できます。',
  },
  {
    title: '本番前に最終確認',
    text: '直前30秒で要点を見返し、最善の状態で会話に入れます。',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Scene',
    text: 'これからの会話シーンを決める',
  },
  {
    step: '02',
    title: 'Flow',
    text: '質問の順序と広げ方をつくる',
  },
  {
    step: '03',
    title: 'Run',
    text: '本番前に見返して実践する',
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
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        メインコンテンツへスキップ
      </a>

      <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <a href="#" className={styles.brand}>
            <span className={styles.brandBadge}>Talllk</span>
          </a>

          <nav className={styles.navMenu} aria-label="LP内ナビゲーション">
            <a className={styles.navLink} href="#showcase">
              Showcase
            </a>
            <a className={styles.navLink} href="#value">
              Value
            </a>
            <a className={styles.navLink} href="#workflow">
              Workflow
            </a>
            <a className={styles.navLink} href="#cta">
              CTA
            </a>
          </nav>

          <div className={styles.navActions}>
            <button
              type="button"
              onClick={onToggleTheme}
              className={styles.themeButton}
              aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
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
              ログイン
            </button>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              {isLoggedIn ? 'ダッシュボードへ' : '無料ではじめる'}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.heroEyebrow}>Conversation readiness app</p>
          <h1 className={styles.heroTitle}>
            人生の大事な会話は、
            <br />
            準備で変わる。
          </h1>
          <p className={styles.heroLead}>
            重要な場面ほど会話が結果を左右します。Talllkは会話を事前準備し、
            いつでも最善の状態で臨めるようにするアプリです。
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              {isLoggedIn ? 'ダッシュボードへ' : '無料で試す'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onLoginAction}>
              ログイン
            </button>
          </div>
          <p className={styles.heroMeta}>No credit card / 30秒で開始</p>
        </section>

        <section id="showcase" className={styles.showcaseSection}>
          <LandingMockVisual />
        </section>

        <section id="value" className={styles.valueSection}>
          <p className={styles.sectionHeading}>With Talllk you can</p>
          <h2 className={styles.sectionTitle}>重要な会話に向けて、
            いつでも準備を回せる</h2>
          <div className={styles.cardGrid}>
            {valueCards.map((card) => (
              <article key={card.title} className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>{card.title}</h3>
                <p className={styles.infoCardText}>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className={styles.workflowSection}>
          <p className={styles.sectionHeading}>Workflow</p>
          <h2 className={styles.sectionTitle}>3ステップで会話を設計する</h2>
          <div className={styles.stepsGrid}>
            {workflowSteps.map((step) => (
              <article key={step.step} className={styles.stepCard}>
                <p className={styles.stepNumber}>{step.step}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cta" className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <h2 className={styles.ctaTitle}>次の大事な会話を、今準備する</h2>
            <p className={styles.ctaText}>
              転機は突然やってきます。だからこそ、ふだんから会話を準備しておく。
            </p>
            <div className={styles.ctaActions}>
              <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
                {isLoggedIn ? 'ダッシュボードへ' : '無料ではじめる'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <p className={styles.footerBrand}>Talllk</p>
            <p>Conversation readiness for high-stakes moments.</p>
          </div>
          <div className={styles.footerLinks}>
            <a className={styles.footerLink} href="#showcase">
              Showcase
            </a>
            <a className={styles.footerLink} href="#value">
              Value
            </a>
            <a className={styles.footerLink} href="/privacy">
              Privacy
            </a>
            <a className={styles.footerLink} href="/terms">
              Terms
            </a>
          </div>
        </div>
        <div className={styles.divider} />
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Talllk</p>
      </footer>
    </div>
  )
}
