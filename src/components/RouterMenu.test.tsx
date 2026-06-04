import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RouterMenu from './RouterMenu'

describe('RouterMenu', () => {
  it('初期状態では「法令」ボタンが見え、メニューは隠れている', () => {
    const { container } = render(<RouterMenu />)

    expect(screen.getByRole('button', { name: '法令' })).toBeVisible()

    const menu = container.querySelector('menu')
    expect(menu).not.toBeNull()
    expect(menu).toHaveStyle({ display: 'none' })
  })

  it('「法令」ボタンを押すとメニューが開き、法令関連リンクが表示される', async () => {
    const user = userEvent.setup()
    const { container } = render(<RouterMenu />)

    await user.click(screen.getByRole('button', { name: '法令' }))

    const menu = container.querySelector('menu')!
    // display:none が外れて表示される
    expect(menu.style.display).not.toBe('none')

    expect(screen.getByRole('link', { name: '定款' })).toHaveAttribute(
      'href',
      '/articles',
    )
    expect(screen.getByRole('link', { name: '公告' })).toHaveAttribute(
      'href',
      '/public_notices',
    )
  })

  it('ヘッダーで網羅済みのページ (活動趣旨・入会案内・成果品販売) は含まない', async () => {
    const user = userEvent.setup()
    render(<RouterMenu />)

    await user.click(screen.getByRole('button', { name: '法令' }))

    expect(screen.queryByRole('link', { name: '活動趣旨' })).toBeNull()
    expect(screen.queryByRole('link', { name: '入会案内' })).toBeNull()
    expect(screen.queryByRole('link', { name: '成果品販売' })).toBeNull()
  })

  it('現在のパスに対応するリンクへアクティブ装飾が付く', async () => {
    const user = userEvent.setup()
    render(<RouterMenu currentPath="/articles" />)
    await user.click(screen.getByRole('button', { name: '法令' }))

    const active = screen.getByRole('link', { name: '定款' })
    expect(active.className).toContain('before:border-l-accent')

    const inactive = screen.getByRole('link', { name: '公告' })
    expect(inactive.className).toContain('before:border-transparent')
  })
})
