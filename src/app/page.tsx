'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login?mode=signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card-solid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="px-4 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-lg tracking-wider rounded-xl shadow-glow-sm">
              Talllk
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary text-sm py-2"
                >
                  ダッシュボード
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary text-sm py-2"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-8 animate-fadeUp">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            会話準備アプリ
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fadeUp stagger-1">
            大切な会話に、
            <br />
            <span className="text-gradient">自信を持って臨む</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-fadeUp stagger-2">
            友達との雑談、気になる人とのデート、初対面の会話...
            <br className="hidden sm:block" />
            話題に困らない自分になるための会話準備アプリ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeUp stagger-3">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-lg px-8 py-4"
            >
              {isLoggedIn ? 'ダッシュボードへ' : 'サインアップ'}
            </button>
            <a
              href="#features"
              className="btn-secondary text-lg px-8 py-4"
            >
              詳しく見る
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="max-w-4xl mx-auto mt-16 animate-fadeUp stagger-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 blur-3xl rounded-3xl" />
            <div className="relative glass-card-solid rounded-3xl p-6 shadow-glass-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Situation Card */}
                <div className="bg-brand-50 dark:bg-brand-900/30 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">初デート</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">4つのトピック</div>
                </div>
                {/* Topic Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">趣味の話</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">5つの質問</div>
                </div>
                {/* Question Card */}
                <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">休日は何してる？</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">回答準備済み</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              シンプルで使いやすい
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              直感的なインターフェースで、すぐに会話の準備を始められます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'シチュエーション管理',
                description: '友達との会話、デート、面接など、場面ごとに話題を整理できます',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ),
                title: '階層的な整理',
                description: 'フォルダと質問をツリー構造で管理。関連する話題をまとめられます',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: '質問の紐付け',
                description: '関連する質問同士をリンク。話題が広がっても迷いません',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card-solid rounded-2xl p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              3ステップで準備完了
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'シチュエーション作成', desc: 'デート、友達との食事など場面を作成' },
              { step: '2', title: '質問を追加', desc: '話したいこと、聞きたいことをメモ' },
              { step: '3', title: '本番で活用', desc: '準備があるから余裕を持てる' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                今すぐ始めよう
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
                無料で登録して、次の大切な会話に備えましょう
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-white text-brand-600 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-brand-50 transition-colors shadow-lg"
              >
                {isLoggedIn ? 'ダッシュボードへ' : 'サインアップ'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="px-4 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold tracking-wider rounded-xl">
            Talllk
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            会話準備アプリ
          </p>
        </div>
      </footer>
    </div>
  )
}
