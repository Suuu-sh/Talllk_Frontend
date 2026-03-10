'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IBM_Plex_Mono, Mochiy_Pop_One, Space_Grotesk } from 'next/font/google'
import { useTheme } from '@/contexts/ThemeContext'
import { LandingContent } from '@/components/lp/LandingContent'
import styles from '@/app/landing.module.css'
import { trackEvent } from '@/lib/analytics'

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePrimaryAction = () => {
    trackEvent('lp_cta_click', {
      cta_target: isLoggedIn ? 'dashboard' : 'signup',
      cta_location: 'landing',
    })

    if (isLoggedIn) {
      router.push('/home')
      return
    }
    router.push('/login?mode=signup')
  }

  const handleLoginAction = () => {
    trackEvent('lp_login_click', {
      cta_location: 'landing',
    })
    router.push('/login')
  }

  return (
    <div className={`${styles.fontScope} ${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <LandingContent
        scrolled={scrolled}
        isDark={theme === 'dark'}
        isLoggedIn={Boolean(isLoggedIn)}
        onToggleTheme={toggleTheme}
        onPrimaryAction={handlePrimaryAction}
        onLoginAction={handleLoginAction}
      />
    </div>
  )
}
