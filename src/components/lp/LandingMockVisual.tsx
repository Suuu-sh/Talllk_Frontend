import styles from '@/app/landing.module.css'

export function LandingMockVisual() {
  return (
    <div className={styles.mockWrap}>
      <div className={styles.stagePanel}>
        <div className={styles.phoneDeck}>
          <article className={`${styles.phoneCard} ${styles.phoneCardBackOne}`}>
            <div className={styles.phoneHeader} />
            <div className={styles.phoneBadgeRow}>
              <span className={styles.badgePill} />
              <span className={styles.badgePill} />
            </div>
            <div className={styles.phoneList}>
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
            </div>
          </article>
          <article className={`${styles.phoneCard} ${styles.phoneCardBackTwo}`}>
            <div className={styles.phoneHeader} />
            <div className={styles.phoneBadgeRow}>
              <span className={styles.badgePill} />
            </div>
            <div className={styles.phoneList}>
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
            </div>
          </article>
          <article className={`${styles.phoneCard} ${styles.phoneCardMain}`}>
            <div className={styles.phoneHeader} />
            <div className={styles.phoneBadgeRow}>
              <span className={styles.badgePill} />
              <span className={styles.badgePill} />
              <span className={styles.badgePill} />
            </div>
            <div className={styles.phoneList}>
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
              <span className={styles.phoneListItem} />
            </div>
            <div className={styles.phoneFooter} />
          </article>
          <span className={styles.sticker}>READY FLOW</span>
        </div>
      </div>

      <div className={styles.secondaryPanel}>
        <div className={styles.tiltCardRow}>
          <div className={styles.tiltCard} />
          <div className={styles.tiltCard} />
          <div className={styles.tiltCard} />
        </div>
      </div>

      <div className={styles.mascotWrap}>
        <div className={styles.mascotCircle}>
          <span className={styles.mascotEye} />
          <span className={styles.mascotEye} />
          <span className={styles.mascotMouth} />
        </div>
        <p className={styles.mascotCaption}>いつでも準備して、会話の質を上げる。</p>
      </div>

      <span className={styles.floatingBubble}>Plan before talk</span>
    </div>
  )
}
