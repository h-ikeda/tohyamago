import { useState, useEffect, useCallback } from 'react'

/**
 * StoryReader — 「活動の始まり物語」をライトノベル風に読ませるリーダー島。
 *
 * 長い読み物を一気に表示すると圧倒されてしまうため、章ごとにページ送り
 * (ページネーション) して読み進めやすくする。各ページの文末には、本作が
 * 実話をもとにした AI 編集の読み物である旨を明示する。
 *
 * - 現在ページは URL ハッシュ (#p1〜#pN) と同期し、共有・ブラウザ戻る/進むに対応。
 * - ← / → キーでもページ送りできる。
 * - 最終ページには参加 (/join)・近況への CTA を表示し「知る → 参加する」へ誘導する。
 */
export interface StoryPage {
  /** 章ラベル (例: プロローグ / 第一話) */
  kicker: string
  /** 章タイトル */
  title: string
  /** 本文段落。「」で始まる行はセリフとして字下げしない。 */
  paragraphs: string[]
}

/** 各ページ末尾に添える注記 (実話ベース + AI 編集の明示)。 */
export const STORY_NOTE =
  '※ 本作は実話をもとにした読み物です。臨場感を出すため、AI による編集・脚色を加えています。事実を忠実に再現したものではありません。'

const JOIN_URL = '/join'

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

export default function StoryReader({ pages }: { pages: StoryPage[] }) {
  const total = pages.length
  const [index, setIndex] = useState(0)

  // URL ハッシュ (#p2 等) から現在ページを復元する。共有・戻る/進むに追従。
  useEffect(() => {
    const syncFromHash = () => {
      const match = window.location.hash.match(/^#p(\d+)$/)
      const next = match ? Number(match[1]) - 1 : 0
      setIndex(clamp(next, 0, total - 1))
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [total])

  const goto = useCallback(
    (next: number, scroll = true) => {
      const clamped = clamp(next, 0, total - 1)
      setIndex(clamped)
      const hash = `#p${clamped + 1}`
      if (window.location.hash !== hash) {
        history.replaceState(null, '', hash)
      }
      // ページ送り時は読み出し位置を本文の先頭へ戻す。
      if (scroll) {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
          // jsdom 等 scrollTo 未実装環境では無視する。
        }
      }
    },
    [total],
  )

  // ← / → キーでページ送り (入力欄にフォーカスがない場合のみ)。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') goto(index + 1)
      if (e.key === 'ArrowLeft') goto(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goto])

  const page = pages[index]
  const isFirst = index === 0
  const isLast = index === total - 1
  const progress = total > 1 ? ((index + 1) / total) * 100 : 100

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* 進捗表示: 章ラベルとページ番号 + バー */}
      <div className="mb-4 flex items-center justify-between font-serif text-sm tracking-wide text-primary-deep">
        <span className="flex items-center gap-2 before:text-xs before:text-accent-strong before:content-['▲']">
          {page.kicker}
        </span>
        <span aria-hidden="true">
          {index + 1} / {total}
        </span>
      </div>
      <div
        className="mb-8 h-1 w-full overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label="読み進み"
      >
        <span
          className="block h-full rounded-full bg-sunlight transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 本文カード */}
      <article
        aria-live="polite"
        className="overflow-hidden rounded-3xl border border-primary/10 border-t-4 border-t-sunlight bg-surface px-6 py-10 shadow-sm md:px-12 md:py-14"
      >
        <h2 className="mb-8 font-serif text-2xl font-medium leading-snug text-primary md:text-3xl">
          {page.title}
        </h2>
        <div className="space-y-5 font-serif text-[1.05rem] leading-loose text-body md:text-lg">
          {page.paragraphs.map((text, i) => {
            const isDialogue = text.startsWith('「')
            // 空文字は行間 (情景の「間」) として小さなスペーサーにする。
            if (text === '') {
              return <div key={i} className="h-3" aria-hidden="true" />
            }
            return (
              <p key={i} className={isDialogue ? '' : 'indent-4'}>
                {text}
              </p>
            )
          })}
        </div>

        {/* 最終ページの CTA: 「知る → 参加する」へ送り出す */}
        {isLast && (
          <div className="mt-10 rounded-2xl bg-sunlight-soft/60 px-6 py-7 text-center">
            <p className="font-serif text-lg text-primary-deep">
              物語の続きは、畑にあります。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-strong px-8 py-3 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
                href={JOIN_URL}
              >
                あなたも畑へ
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-strong bg-surface px-8 py-3 font-medium text-accent-strong transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:text-white hover:shadow-lg"
                href="/#feed"
              >
                その後の近況を見る
              </a>
            </div>
          </div>
        )}

        {/* 実話ベース + AI 編集の注記 (各ページ末尾) */}
        <p className="mt-10 border-t border-primary/10 pt-5 text-xs leading-relaxed text-body/55">
          {STORY_NOTE}
        </p>
      </article>

      {/* ページ送りコントロール */}
      <nav
        className="mt-8 flex items-center justify-between gap-3"
        aria-label="ページ送り"
      >
        <button
          type="button"
          onClick={() => goto(index - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-2.5 font-medium text-primary-deep transition-all enabled:hover:-translate-y-0.5 enabled:hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-30
                     before:block before:h-0 before:border-y-[5px] before:border-r-[8px] before:border-y-transparent before:border-r-current"
        >
          前の話
        </button>

        {/* 章ジャンプ用ドット */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {pages.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goto(i)}
              title={`${p.kicker}　${p.title}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? 'w-6 bg-accent-strong'
                  : 'w-2.5 bg-primary/20 hover:bg-primary/40'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goto(index + 1)}
          disabled={isLast}
          className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-5 py-2.5 font-medium text-white shadow-sm transition-all enabled:hover:-translate-y-0.5 enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30
                     after:block after:h-0 after:border-y-[5px] after:border-l-[8px] after:border-y-transparent after:border-l-white"
        >
          次の話
        </button>
      </nav>
    </div>
  )
}
