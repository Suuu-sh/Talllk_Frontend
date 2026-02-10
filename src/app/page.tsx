'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/contexts/I18nContext'

export default function Home() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll-reveal IntersectionObserver
  const mainRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    const els = root.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-count')
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [isLoggedIn])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/home')
    } else {
      router.push('/login?mode=signup')
    }
  }

  const scrolledNavClass = scrolled
    ? 'bg-surface/80 backdrop-blur-lg shadow-sm'
    : 'bg-transparent'

  return (
    <div ref={mainRef} className="min-h-screen bg-base">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolledNavClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="font-logo text-xl font-bold text-brand-500 px-3 py-1 border-2 border-brand-500 rounded-xl">
              Talllk
            </span>
            <div className="flex items-center gap-3">
              <a href="#features" className="hidden sm:inline-block btn-ghost text-sm">
                {t({ ja: '機能', en: 'Features' })}
              </a>
              <a href="#how-it-works" className="hidden sm:inline-block btn-ghost text-sm">
                {t({ ja: '使い方', en: 'How it works' })}
              </a>
              <button
                onClick={toggleTheme}
                className="btn-icon"
                aria-label={t({ ja: 'テーマ切替', en: 'Toggle theme' })}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => router.push('/home')}
                  className="btn-primary text-sm py-2"
                >
                  {t({ ja: 'ダッシュボード', en: 'Dashboard' })}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary text-sm py-2"
                >
                  {t({ ja: 'ログイン', en: 'Log in' })}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-brand-400/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 sm:w-80 sm:h-80 bg-brand-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-8 animate-fadeUp">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            {t({ ja: '会話準備アプリ', en: 'Conversation Prep App' })}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink mb-4 animate-fadeUp stagger-1">
            {t({ ja: 'もう、話題に困らない', en: 'Never run out of topics' })}
          </h1>

          <p className="text-xl sm:text-2xl text-ink-sub font-medium mb-6 animate-fadeUp stagger-2">
            {t({ ja: '大切な会話に、', en: 'Step into important conversations' })}
            <span className="text-gradient animate-shimmer">
              {t({ ja: '自信を持って臨む', en: 'with confidence' })}
            </span>
          </p>

          <p className="text-lg text-ink-body mb-10 max-w-2xl mx-auto animate-fadeUp stagger-3">
            {t({ ja: '友達との雑談、気になる人とのデート、初対面の会話...', en: 'Chats with friends, dates, first meetings...' })}
            <br className="hidden sm:block" />
            {t({ ja: '話題に困らない自分になるための会話準備アプリ', en: 'Prepare so you never run out of things to say.' })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeUp stagger-4">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-lg px-8 py-4  flex items-center gap-2"
            >
              {isLoggedIn ? t({ ja: 'ダッシュボードへ', en: 'Go to Dashboard' }) : t({ ja: '無料ではじめる', en: 'Get started free' })}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <span className="text-sm text-ink-muted">{t({ ja: '無料 / 30秒で登録', en: 'Free / Sign up in 30 seconds' })}</span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-4xl mx-auto mt-16 animate-fadeUp stagger-5">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 blur-3xl rounded-3xl" />
          <div className="relative glass-card-solid rounded-3xl p-6 shadow-glass-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Situation Card */}
              <div className="bg-brand-500/10 rounded-2xl p-4 animate-float">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="font-semibold text-ink mb-1">
                  {t({ ja: '初デート', en: 'First date' })}
                </div>
                <div className="text-sm text-ink-muted">
                  {t({ ja: '4つのトピック', en: '4 topics' })}
                </div>
              </div>
              {/* Topic Card */}
              <div className="bg-surface rounded-2xl p-4 border border-line animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="w-10 h-10 rounded-xl bg-layer flex items-center justify-center text-ink-muted mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="font-semibold text-ink mb-1">
                  {t({ ja: '趣味の話', en: 'Hobbies' })}
                </div>
                <div className="text-sm text-ink-muted">
                  {t({ ja: '5つの質問', en: '5 questions' })}
                </div>
              </div>
              {/* Question Card */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="font-semibold text-ink mb-1">
                  {t({ ja: '休日は何してる？', en: 'What do you do on weekends?' })}
                </div>
                <div className="text-sm text-ink-muted">
                  {t({ ja: '回答準備済み', en: 'Answers ready' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-16">
            {[
              { value: '1,200+', label: t({ ja: 'ユーザー', en: 'Users' }) },
              { value: '5,000+', label: t({ ja: 'シチュエーション作成', en: 'Situations created' }) },
              { value: '98%', label: t({ ja: '満足度', en: 'Satisfaction' }) },
            ].map((stat, i) => (
              <div key={i} className={`text-center scroll-reveal-count scroll-delay-${i + 1}`}>
                <div className="text-2xl sm:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm sm:text-base text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Yuki',
                role: t({ ja: '大学生', en: 'Student' }),
                text: t({
                  ja: '初対面の人と話すのが苦手だったけど、事前に話題を準備できるようになって会話が楽しくなりました！',
                  en: 'I used to struggle with first-time conversations, but preparing topics beforehand made chatting enjoyable.',
                }),
              },
              {
                name: 'Kenji',
                role: t({ ja: '転職活動中', en: 'Job seeker' }),
                text: t({
                  ja: '面接の質問を整理するのに最適。想定質問と回答をまとめておけるので、本番で落ち着いて対応できました。',
                  en: 'Perfect for organizing interview questions. Having answers ready helped me stay calm during interviews.',
                }),
              },
              {
                name: 'Mika',
                role: t({ ja: '会社員', en: 'Office worker' }),
                text: t({
                  ja: '取引先との会食前にいつも使っています。話題のストックがあると心の余裕が全然違います。',
                  en: 'I use it before client dinners. Having topics prepared makes a huge difference.',
                }),
              },
            ].map((review, i) => (
              <div key={i} className={`glass-card-solid rounded-2xl p-6 ${i % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right'} scroll-reveal scroll-delay-${i + 1}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-ink text-sm">{review.name}</div>
                    <div className="text-xs text-ink-muted">{review.role}</div>
                  </div>
                </div>
                <p className="text-ink-body text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <span className="badge-brand mb-4 inline-block">
              {t({ ja: '機能', en: 'Features' })}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
              {t({ ja: 'シンプルで使いやすい', en: 'Simple and intuitive' })}
            </h2>
            <p className="text-ink-body text-lg max-w-2xl mx-auto">
              {t({ ja: '直感的なインターフェースで、すぐに会話の準備を始められます', en: 'Start preparing in seconds with an intuitive interface.' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: t({ ja: 'シチュエーション管理', en: 'Situation management' }),
                description: t({ ja: '友達との会話、デート、商談など、場面ごとに話題を整理できます', en: 'Organize topics by context—friends, dates, meetings.' }),
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ),
                title: t({ ja: '階層的な整理', en: 'Hierarchical structure' }),
                description: t({ ja: 'フォルダと質問をツリー構造で管理。関連する話題をまとめられます', en: 'Manage folders and questions in a tree structure.' }),
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: t({ ja: '質問の紐付け', en: 'Link questions' }),
                description: t({ ja: '関連する質問同士をリンク。話題が広がっても迷いません', en: 'Link related questions so you never lose the thread.' }),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`glass-card-solid rounded-2xl p-6 card-hover scroll-reveal-scale scroll-reveal scroll-delay-${i + 1}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-500 mb-4 -sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-ink-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="text-layer">
        <svg viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]">
          <path d="M0,0 C360,60 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 bg-layer">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <span className="badge-brand mb-4 inline-block">
              {t({ ja: '使い方', en: 'How It Works' })}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
              {t({ ja: '3ステップで準備完了', en: 'Ready in 3 steps' })}
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dotted line connector (md+) */}
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] border-t-2 border-dashed border-brand-300 dark:border-brand-700" />

            {[
              {
                step: '1',
                title: t({ ja: 'シチュエーション作成', en: 'Create a situation' }),
                desc: t({ ja: 'デート、友達との食事など場面を作成', en: 'Create a context like a date or dinner.' }),
                icon: (
                  <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: t({ ja: '質問を追加', en: 'Add questions' }),
                desc: t({ ja: '話したいこと、聞きたいことをメモ', en: 'Note what you want to ask or say.' }),
                icon: (
                  <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: t({ ja: '本番で活用', en: 'Use it in real life' }),
                desc: t({ ja: '準備があるから余裕を持てる', en: 'Preparation gives you confidence.' }),
                icon: (
                  <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className={`relative text-center scroll-reveal scroll-delay-${i + 1}`}>
                <div className="w-16 h-16 rounded-full bg-brand-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 relative z-10 animate-pulse-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-ink-body mb-3">
                  {item.desc}
                </p>
                <div className="flex justify-center">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider (flipped) */}
      <div className="text-layer rotate-180">
        <svg viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]">
          <path d="M0,0 C360,60 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative scroll-reveal-scale scroll-reveal">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-8 sm:p-12 text-center text-white overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/10" />

              <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">
                {t({ ja: '次の大切な会話、準備はできてますか？', en: 'Ready for your next important conversation?' })}
              </h2>
              <p className="relative text-brand-100 text-lg mb-8 max-w-xl mx-auto">
                {t({ ja: '無料で登録して、次の大切な会話に備えましょう', en: 'Sign up free and get ready for the moment.' })}
              </p>
              <button
                onClick={handleGetStarted}
                className="relative bg-white text-brand-600 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-brand-50 transition-colors shadow-lg"
              >
                {isLoggedIn ? t({ ja: 'ダッシュボードへ', en: 'Go to Dashboard' }) : t({ ja: '無料ではじめる', en: 'Get started free' })}
              </button>
              <p className="relative text-brand-200 text-sm mt-4">
                {t({ ja: 'クレジットカード不要・30秒で登録完了', en: 'No credit card required · Sign up in 30 seconds' })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <span className="font-logo text-lg font-bold text-brand-500 px-3 py-1 border-2 border-brand-500 rounded-xl inline-block mb-3">
                Talllk
              </span>
              <p className="text-sm text-ink-muted">
                {t({ ja: '大切な会話に自信を持って臨むための会話準備アプリ', en: 'Prepare with confidence for important conversations.' })}
              </p>
            </div>
            {/* Product links */}
            <div>
              <h4 className="font-semibold text-ink mb-3 text-sm">{t({ ja: 'プロダクト', en: 'Product' })}</h4>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li><a href="#features" className="hover:text-brand-500 transition-colors">{t({ ja: '機能', en: 'Features' })}</a></li>
                <li><a href="#how-it-works" className="hover:text-brand-500 transition-colors">{t({ ja: '使い方', en: 'How it works' })}</a></li>
              </ul>
            </div>
            {/* SNS / Links */}
            <div>
              <h4 className="font-semibold text-ink mb-3 text-sm">{t({ ja: 'リンク', en: 'Links' })}</h4>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li><a href="/privacy" className="hover:text-brand-500 transition-colors">{t({ ja: 'プライバシーポリシー', en: 'Privacy Policy' })}</a></li>
                <li><a href="/terms" className="hover:text-brand-500 transition-colors">{t({ ja: '利用規約', en: 'Terms of Service' })}</a></li>
              </ul>
            </div>
          </div>
          <div className="divider mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-ink-faint">
              &copy; {new Date().getFullYear()} Talllk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
