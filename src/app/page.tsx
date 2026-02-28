'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IBM_Plex_Mono, Mochiy_Pop_One, Space_Grotesk } from 'next/font/google'
import { LandingContent } from '@/components/lp/LandingContent'
import { useTheme } from '@/contexts/ThemeContext'
import styles from '@/app/landing.module.css'

const displayFont = Mochiy_Pop_One({
  subsets: ['latin'],
  variable: '--lp-font-display',
  weight: ['400'],
})

const sansFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--lp-font-sans',
  weight: ['400', '500', '600', '700'],
})

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--lp-font-mono',
  weight: ['400', '500', '600', '700'],
})

export default function Home() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePrimaryAction = () => {
    router.push('/login?mode=signup')
  }

  const handleSecondaryAction = () => {
    router.push('/login')
  }

  return (
    <div className={`${styles.fontScope} ${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <LandingContent
        scrolled={scrolled}
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
      />
    </div>
  )
}
