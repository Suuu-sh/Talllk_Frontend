import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AuthTokenSync from '@/components/AuthTokenSync'
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
        <ClerkProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthTokenSync />
              {children}
            </I18nProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
