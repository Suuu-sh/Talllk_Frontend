export const colorTokens = {
  brandPrimary: '#111827',
  brandSecondary: '#374151',
  primaryDark: '#1A1A1A',
  secondaryLight: '#FAFAFA',
  quinaryLight: '#F2F2F2',
  primaryTextLight: '#111827',
  secondaryTextLight: '#1F2937',
  tertiaryTextLight: '#6B7280',
  primaryTextDark: '#F9FAFB',
  secondaryTextDark: '#B0B8C4',
  success500: '#22C55E',
  success600: '#16A34A',
  warning500: '#FACC15',
  warning600: '#EAB308',
  error500: '#EF4444',
  error400: '#F87171',
  error700: '#D32F2F',
  infoBlue500: '#3B82F6',
  infoPurple500: '#8B5CF6',
  glassLightBg: 'rgba(255, 255, 255, 0.7)',
  glassDarkBg: 'rgba(26, 26, 26, 0.7)',
  glassBorderLight: 'rgba(255, 255, 255, 0.1)',
  glassBorderDark: 'rgba(0, 0, 0, 0.15)',
  white: '#FFFFFF',
} as const

export const chartMetricColors = {
  sessions: colorTokens.infoBlue500,
  topics: colorTokens.infoPurple500,
  questions: colorTokens.success500,
} as const

const normalizeHexColor = (input: string): string | null => {
  const hex = input.trim().replace('#', '')
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }
  return null
}

export const getContrastTextColor = (hexColor: string): string => {
  const normalized = normalizeHexColor(hexColor)
  if (!normalized) return colorTokens.brandPrimary

  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.6 ? colorTokens.brandPrimary : colorTokens.white
}
