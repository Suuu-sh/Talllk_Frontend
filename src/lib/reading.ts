import { toHiragana } from 'wanakana'

type KuroshiroLike = {
  convert: (text: string, options: { to: 'hiragana' }) => Promise<string>
}

type WindowWithKuroshiro = Window & {
  Kuroshiro?: new () => {
    init: (analyzer: unknown) => Promise<void>
    convert: (text: string, options: { to: 'hiragana' }) => Promise<string>
  }
  KuromojiAnalyzer?: new (options: { dictPath: string }) => unknown
}

const KUROSHIRO_SCRIPT_SRC = '/vendor/kuroshiro.min.js'
const KUROMOJI_ANALYZER_SCRIPT_SRC = '/vendor/kuroshiro-analyzer-kuromoji.min.js'
const containsKanji = /[\u3400-\u4DBF\u4E00-\u9FFF]/

let kuroshiroInstance: KuroshiroLike | null = null
let initPromise: Promise<KuroshiroLike | null> | null = null

async function loadScript(src: string) {
  if (typeof window === 'undefined') return
  const existing = document.querySelector<HTMLScriptElement>(`script[data-reading-src="${src}"]`)
  if (existing) {
    if ((existing as HTMLScriptElement).dataset.ready === '1') return
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), {
        once: true,
      })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.readingSrc = src
    script.addEventListener(
      'load',
      () => {
        script.dataset.ready = '1'
        resolve()
      },
      { once: true }
    )
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), {
      once: true,
    })
    document.head.appendChild(script)
  })
}

async function getKuroshiro() {
  if (kuroshiroInstance) return kuroshiroInstance
  if (typeof window === 'undefined') return null
  if (!initPromise) {
    initPromise = (async () => {
      await loadScript(KUROSHIRO_SCRIPT_SRC)
      await loadScript(KUROMOJI_ANALYZER_SCRIPT_SRC)

      const win = window as WindowWithKuroshiro
      const KuroshiroCtor = win.Kuroshiro
      const KuromojiAnalyzerCtor = win.KuromojiAnalyzer
      if (!KuroshiroCtor || !KuromojiAnalyzerCtor) {
        throw new Error('Kuroshiro bundles are not available on window')
      }

      const instance = new KuroshiroCtor()
      await instance.init(new KuromojiAnalyzerCtor({ dictPath: '/kuromoji' }))
      kuroshiroInstance = instance
      return instance
    })()
  }
  return initPromise
}

export async function toTitleReading(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const fallback = toHiragana(trimmed)
  if (!containsKanji.test(trimmed)) return fallback

  try {
    const kuroshiro = await getKuroshiro()
    if (!kuroshiro) return fallback
    const result = await kuroshiro.convert(trimmed, { to: 'hiragana' })
    return typeof result === 'string' && result.trim() ? result : fallback
  } catch (err) {
    console.error(err)
    return fallback
  }
}
