import styles from '@/app/landing.module.css'

const tableRows = [
  { scene: '面接', readiness: '94%', updated: '2h ago' },
  { scene: '商談', readiness: '88%', updated: '1d ago' },
  { scene: '初対面', readiness: '91%', updated: '4h ago' },
]

export function LandingDashboardMock() {
  return (
    <div className={styles.dashboardShell} aria-hidden="true">
      <div className={styles.dashboardFrame}>
        <div className={styles.dashboardTopbar}>
          <span className={styles.dashboardDot} />
          <span className={styles.dashboardDot} />
          <span className={styles.dashboardDot} />
          <div className={styles.dashboardToolbar}>
            <span className={styles.dashboardToolbarItem} />
            <span className={styles.dashboardToolbarItem} />
          </div>
        </div>

        <div className={styles.dashboardBody}>
          <aside className={styles.dashboardSidebar}>
            <span className={styles.dashboardNavItem} />
            <span className={styles.dashboardNavItem} />
            <span className={styles.dashboardNavItem} />
            <span className={styles.dashboardNavItem} />
          </aside>

          <div className={styles.dashboardContent}>
            <article className={styles.dashboardChartCard}>
              <div className={styles.dashboardChartHeader} />
              <div className={styles.dashboardBars}>
                <span className={styles.dashboardBar} />
                <span className={styles.dashboardBar} />
                <span className={styles.dashboardBar} />
                <span className={styles.dashboardBar} />
                <span className={styles.dashboardBar} />
                <span className={styles.dashboardBar} />
              </div>
            </article>

            <article className={styles.dashboardTableCard}>
              {tableRows.map((row) => (
                <div key={row.scene} className={styles.dashboardTableRow}>
                  <p className={styles.dashboardTableCell}>{row.scene}</p>
                  <p className={styles.dashboardTableCell}>{row.readiness}</p>
                  <p className={styles.dashboardTableCell}>{row.updated}</p>
                </div>
              ))}
            </article>
          </div>
        </div>
      </div>

      <div className={`${styles.dashboardSticker} ${styles.dashboardStickerOne}`}>
        <p className={styles.stickerLabel}>READY SCORE</p>
        <p className={styles.stickerValue}>92%</p>
      </div>
      <div className={`${styles.dashboardSticker} ${styles.dashboardStickerTwo}`}>
        <p className={styles.stickerLabel}>NEXT ACTION</p>
        <p className={styles.stickerValue}>Flow Review</p>
      </div>

      <div className={styles.dashboardFloatingCard}>
        <p className={styles.floatingCardTitle}>Next conversation</p>
        <ul className={styles.floatingList}>
          <li className={styles.floatingItem}>導入質問を確認</li>
          <li className={styles.floatingItem}>深掘りカードを選択</li>
          <li className={styles.floatingItem}>締めの一言を準備</li>
        </ul>
      </div>
    </div>
  )
}
