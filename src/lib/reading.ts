let kuroshiroInstance: any | null = null
let initPromise: Promise<any> | null = null

async function getKuroshiro() {
  if (kuroshiroInstance) return kuroshiroInstance
  if (!initPromise) {
    initPromise = (async () => {
      const [{ default: Kuroshiro }, { default: KuromojiAnalyzer }] = await Promise.all([
        import('kuroshiro'),
        import('kuroshiro-analyzer-kuromoji'),
      ])
      const ks = new Kuroshiro()
      await ks.init(new KuromojiAnalyzer({ dictPath: '/kuromoji' }))
      kuroshiroInstance = ks
      return ks
    })()
  }
  return initPromise
}

export async function toTitleReading(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  try {
    const kuroshiro = await getKuroshiro()
    const result = await kuroshiro.convert(trimmed, { to: 'hiragana' })
    return typeof result === 'string' ? result : trimmed
  } catch (err) {
    console.error(err)
    return trimmed
  }
}
