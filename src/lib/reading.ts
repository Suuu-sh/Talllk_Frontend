import { toHiragana } from 'wanakana'

export async function toTitleReading(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return toHiragana(trimmed)
}
