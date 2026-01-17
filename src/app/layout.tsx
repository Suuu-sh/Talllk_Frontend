import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
