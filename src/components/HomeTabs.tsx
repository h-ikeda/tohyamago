import { useState, useEffect, type ReactNode } from 'react'

export default function HomeTabs({ feed }: { feed?: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'feed' | 'events'>('feed')

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(window.location.hash === '#events' ? 'events' : 'feed')
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const select = (tab: 'feed' | 'events') => {
    setActiveTab(tab)
    const newHash = `#${tab}`
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash)
    }
  }

  return (
    <>
      <nav className="mx-auto mb-6 flex w-fit gap-2 font-serif text-lg font-medium">
        <a
          className={`rounded-full px-8 py-1.5 tracking-widest transition-colors ${
            activeTab !== 'events'
              ? 'bg-primary-deep text-white shadow-sm'
              : 'text-primary/60 hover:text-primary'
          }`}
          href="#feed"
          onClick={(e) => { e.preventDefault(); select('feed') }}
        >
          近況
        </a>
        <a
          className={`rounded-full px-8 py-1.5 tracking-widest transition-colors ${
            activeTab === 'events'
              ? 'bg-primary-deep text-white shadow-sm'
              : 'text-primary/60 hover:text-primary'
          }`}
          href="#events"
          onClick={(e) => { e.preventDefault(); select('events') }}
        >
          予定
        </a>
      </nav>

      <section style={{ display: activeTab === 'events' ? undefined : 'none' }} className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <p className="rounded-3xl border-t-4 border-t-sunlight border border-primary/10 bg-surface px-6 py-5 leading-loose text-body shadow-sm">
          今後の活動予定は、
          <a
            className="text-accent-strong underline underline-offset-2 hover:opacity-80"
            href="https://activo.jp/s/a/119414"
            target="_blank"
            rel="noopener noreferrer"
          >
            ボランティア募集ページ
          </a>
          に掲載しています。「所属期間/頻度」欄をご確認下さい。
        </p>
        <a
          className="mx-auto my-6 flex w-fit items-center gap-2 rounded-full bg-accent-strong px-8 py-3 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg
                     after:block after:h-0 after:border-y-[6px] after:border-l-[10px] after:border-y-transparent after:border-l-white"
          href="https://activo.jp/s/a/119414"
          target="_blank"
          rel="noopener noreferrer"
        >
          ボランティア募集中!
        </a>
      </section>

      <div style={{ display: activeTab === 'feed' ? undefined : 'none' }}>
        {feed}
      </div>
    </>
  )
}
