import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nContext'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-logo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Talllk',
  description: 'コミュニケーション準備アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={quicksand.variable}>
      <body>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
