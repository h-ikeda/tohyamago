import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StoryReader, { STORY_NOTE, type StoryPage } from './StoryReader'

const pages: StoryPage[] = [
  {
    kicker: 'プロローグ',
    title: '冬の、秘境へ',
    paragraphs: ['ある年の冬。', '「二度芋を、つくってみませんか」'],
  },
  {
    kicker: '第一話',
    title: '一枚の貼り紙',
    paragraphs: ['伝承館の片隅に、一枚の貼り紙。'],
  },
  {
    kicker: 'エピローグ',
    title: '畑は、続いていく',
    paragraphs: ['物語はここから枝を広げていく。'],
  },
]

describe('StoryReader', () => {
  beforeEach(() => {
    // 各テストはハッシュなしの状態から始める
    history.replaceState(null, '', '#')
    // jsdom に scrollTo がない環境でも落ちないようにする
    window.scrollTo = vi.fn()
  })

  it('既定では最初のページが表示される', () => {
    render(<StoryReader pages={pages} />)

    expect(
      screen.getByRole('heading', { name: '冬の、秘境へ' }),
    ).toBeInTheDocument()
    expect(screen.getByText('ある年の冬。')).toBeInTheDocument()
    // ページ番号 1 / 3
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('各ページに実話ベース + AI 編集の注記が表示される', () => {
    render(<StoryReader pages={pages} />)
    expect(screen.getByText(STORY_NOTE)).toBeInTheDocument()
    expect(screen.getByText(STORY_NOTE).textContent).toContain('AI')
    expect(screen.getByText(STORY_NOTE).textContent).toContain('実話')
  })

  it('「次の話」で次ページへ進み、ハッシュが同期される', async () => {
    const user = userEvent.setup()
    render(<StoryReader pages={pages} />)

    await user.click(screen.getByRole('button', { name: '次の話' }))

    expect(
      screen.getByRole('heading', { name: '一枚の貼り紙' }),
    ).toBeInTheDocument()
    expect(window.location.hash).toBe('#p2')
  })

  it('最初のページでは「前の話」が無効化される', () => {
    render(<StoryReader pages={pages} />)
    expect(screen.getByRole('button', { name: '前の話' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '次の話' })).toBeEnabled()
  })

  it('最終ページでは「次の話」が無効化され CTA が表示される', async () => {
    const user = userEvent.setup()
    render(<StoryReader pages={pages} />)

    // 最後まで進む
    await user.click(screen.getByRole('button', { name: '次の話' }))
    await user.click(screen.getByRole('button', { name: '次の話' }))

    expect(
      screen.getByRole('heading', { name: '畑は、続いていく' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '次の話' })).toBeDisabled()

    // 参加への CTA が出る
    const cta = screen.getByRole('link', { name: 'あなたも畑へ' })
    expect(cta).toHaveAttribute('href', '/join')
  })

  it('初期ハッシュ #p2 なら 2 ページ目で開く', () => {
    history.replaceState(null, '', '#p2')
    render(<StoryReader pages={pages} />)

    expect(
      screen.getByRole('heading', { name: '一枚の貼り紙' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('範囲外のハッシュは先頭/末尾にクランプされる', () => {
    history.replaceState(null, '', '#p99')
    render(<StoryReader pages={pages} />)

    // 末尾 (3 ページ目) にクランプ
    expect(
      screen.getByRole('heading', { name: '畑は、続いていく' }),
    ).toBeInTheDocument()
  })

  it('→ / ← キーでページ送りできる', async () => {
    const user = userEvent.setup()
    render(<StoryReader pages={pages} />)

    await user.keyboard('{ArrowRight}')
    expect(
      screen.getByRole('heading', { name: '一枚の貼り紙' }),
    ).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(
      screen.getByRole('heading', { name: '冬の、秘境へ' }),
    ).toBeInTheDocument()
  })

  it('セリフ (「で始まる段落) は字下げされない', () => {
    render(<StoryReader pages={pages} />)
    const dialogue = screen.getByText('「二度芋を、つくってみませんか」')
    expect(dialogue.className).not.toContain('indent-4')

    const narration = screen.getByText('ある年の冬。')
    expect(narration.className).toContain('indent-4')
  })
})
