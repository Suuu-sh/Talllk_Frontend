import styles from '@/app/landing.module.css'
import { LandingDashboardMock } from '@/components/lp/LandingPhoneMock'

type LandingContentProps = {
  scrolled: boolean
  isDark: boolean
  onToggleTheme: () => void
  onPrimaryAction: () => void
  onSecondaryAction: () => void
}

const logoChips = ['STARTUP', 'SALES', 'CAREER', 'CREATOR', 'STUDENT']

const valueCards = [
  {
    title: '会話を準備タスクに分解',
    text: '導入・深掘り・締めをカード化して、迷いを減らします。',
  },
  {
    title: '重要シーンをテンプレ化',
    text: '面接、商談、初対面などを再利用可能な形で保存できます。',
  },
  {
    title: '本番前に30秒で確認',
    text: '会話の直前に流れを見返し、最善の状態で臨めます。',
  },
]

const workflowCards = [
  {
    title: 'Scene',
    text: 'これからの会話シーンを選ぶ',
  },
  {
    title: 'Flow',
    text: '質問の流れを組み立てる',
  },
  {
    title: 'Review',
    text: '直前に要点だけ確認する',
  },
]

export function LandingContent({
  scrolled,
  isDark,
  onToggleTheme,
  onPrimaryAction,
  onSecondaryAction,
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

          <nav className={styles.navLinks} aria-label="LP内ナビゲーション">
            <a className={styles.navLink} href="#problem">
              Problem
            </a>
            <a className={styles.navLink} href="#how-it-works">
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

            <button type="button" className={styles.secondaryButton} onClick={onSecondaryAction}>
              ログイン
            </button>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              無料ではじめる
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero}>
          <p className={`${styles.heroBadge} ${styles.reveal}`}>Conversation readiness platform</p>
          <h1 className={`${styles.heroTitle} ${styles.reveal} ${styles.revealDelayOne}`}>
            人生の大事な会話を、
            <br />
            いつでも最善の状態に。
          </h1>
          <p className={`${styles.heroSubtitle} ${styles.reveal}`}>
            重要な場面ほど会話の質が結果を左右します。Talllkは会話を事前準備し、当日の成功確率を高めるアプリです。
          </p>
          <div className={`${styles.heroCtas} ${styles.reveal}`}>
            <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
              無料で試す
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onSecondaryAction}>
              ログイン
            </button>
          </div>
          <p className={`${styles.heroMeta} ${styles.reveal}`}>No credit card required / 30秒で開始</p>
        </section>

        <section className={`${styles.heroVisualSection} ${styles.reveal}`}>
          <LandingDashboardMock />
        </section>

        <section className={`${styles.logoStrip} ${styles.reveal}`}>
          <p className={styles.logoLabel}>Used for high-stakes conversations</p>
          <div className={styles.logoRow}>
            {logoChips.map((chip) => (
              <span key={chip} className={styles.logoChip}>
                {chip}
              </span>
            ))}
          </div>
        </section>

        <section id="problem" className={`${styles.section} ${styles.reveal}`}>
          <p className={styles.sectionBadge}>Problem / Outcome</p>
          <h2 className={styles.sectionTitle}>会話準備を習慣化すると、重要な場面で差が出る</h2>
          <p className={styles.sectionLead}>感覚ではなく、準備可能なタスクとして会話を設計します。</p>

          <div className={styles.valueGrid}>
            {valueCards.map((card) => (
              <article key={card.title} className={styles.valueCard}>
                <h3 className={styles.valueCardTitle}>{card.title}</h3>
                <p className={styles.valueCardText}>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className={`${styles.section} ${styles.reveal}`}>
          <p className={styles.sectionBadge}>Workflow</p>
          <h2 className={styles.sectionTitle}>3ステップで会話を準備する</h2>

          <div className={styles.bentoGrid}>
            <article className={`${styles.bentoCard} ${styles.bentoLarge}`}>
              <h3 className={styles.bentoTitle}>準備の流れを固定すると、会話は安定する</h3>
              <p className={styles.bentoText}>
                その場の思いつきではなく、事前に流れをつくる。これがTalllkの基本です。
              </p>
            </article>

            <div className={styles.miniGrid}>
              {workflowCards.map((card) => (
                <article key={card.title} className={styles.miniCard}>
                  <h3 className={styles.miniCardTitle}>{card.title}</h3>
                  <p className={styles.miniCardText}>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.quoteSection} ${styles.reveal}`}>
          <p className={styles.quoteText}>「準備してから臨むだけで、会話の入り方が変わった。」</p>
          <p className={styles.quoteMeta}>User Voice</p>
        </section>

        <section id="cta" className={`${styles.ctaSection} ${styles.reveal}`}>
          <div className={styles.ctaPanel}>
            <h2 className={styles.ctaTitle}>次の重要な会話を、今準備する</h2>
            <p className={styles.ctaText}>
              転機は突然来ます。だからこそ、普段から会話を準備しておく。
            </p>
            <div className={styles.ctaActions}>
              <button type="button" className={styles.primaryButton} onClick={onPrimaryAction}>
                無料ではじめる
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
            <a className={styles.footerLink} href="#problem">
              Problem
            </a>
            <a className={styles.footerLink} href="#how-it-works">
              Workflow
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
