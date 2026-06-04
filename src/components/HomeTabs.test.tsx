import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeTabs from './HomeTabs'

describe('HomeTabs', () => {
  beforeEach(() => {
    // 各テストはハッシュなしの状態から始める
    history.replaceState(null, '', '#')
  })

  it('既定では「近況」タブが選択され feed が表示される', () => {
    render(<HomeTabs feed={<div data-testid="feed-content">最新の近況</div>} />)

    const feedTab = screen.getByRole('link', { name: '近況' })
    // アクティブなタブには塗りつぶしスタイルが当たる
    expect(feedTab.className).toContain('bg-primary-deep')
    expect(feedTab.className).toContain('text-white')

    expect(screen.getByTestId('feed-content')).toBeInTheDocument()
  })

  it('「予定」タブをクリックすると予定セクションが表示される', async () => {
    const user = userEvent.setup()
    render(<HomeTabs feed={<div data-testid="feed-content">最新の近況</div>} />)

    const eventsTab = screen.getByRole('link', { name: '予定' })
    await user.click(eventsTab)

    // アクティブスタイルが「予定」タブへ移る
    expect(eventsTab.className).toContain('bg-primary-deep')
    expect(screen.getByRole('link', { name: '近況' }).className).toContain(
      'text-primary/60',
    )

    // ボランティア募集導線が見えるようになる
    expect(
      screen.getByRole('link', { name: 'ボランティア募集中!' }),
    ).toBeInTheDocument()

    // ハッシュが同期される
    expect(window.location.hash).toBe('#events')
  })

  it('初期ハッシュが #events なら予定タブで開く', () => {
    history.replaceState(null, '', '#events')
    render(<HomeTabs feed={<div>feed</div>} />)

    expect(screen.getByRole('link', { name: '予定' }).className).toContain(
      'bg-primary-deep',
    )
  })

  it('ボランティア募集リンクは新規タブで安全に開く', async () => {
    const user = userEvent.setup()
    render(<HomeTabs feed={<div>feed</div>} />)
    await user.click(screen.getByRole('link', { name: '予定' }))

    const cta = screen.getByRole('link', { name: 'ボランティア募集中!' })
    expect(cta).toHaveAttribute('href', 'https://activo.jp/s/a/119414')
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
