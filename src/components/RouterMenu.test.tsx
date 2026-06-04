import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RouterMenu from './RouterMenu'

describe('RouterMenu', () => {
  it('初期状態では「目次」ボタンが見え、メニューは隠れている', () => {
    const { container } = render(<RouterMenu />)

    expect(screen.getByRole('button', { name: '目次' })).toBeVisible()

    const menu = container.querySelector('menu')
    expect(menu).not.toBeNull()
    expect(menu).toHaveStyle({ display: 'none' })
  })

  it('「目次」ボタンを押すとメニューが開く', async () => {
    const user = userEvent.setup()
    const { container } = render(<RouterMenu />)

    await user.click(screen.getByRole('button', { name: '目次' }))

    const menu = container.querySelector('menu')!
    // display:none が外れて表示される
    expect(menu.style.display).not.toBe('none')

    // 主要なナビゲーションリンクが含まれる
    expect(screen.getByRole('link', { name: '活動趣旨' })).toHaveAttribute(
      'href',
      '/purpose',
    )
  })

  it('現在のパスに対応するリンクへアクティブ装飾が付く', async () => {
    const user = userEvent.setup()
    render(<RouterMenu currentPath="/purpose" />)
    await user.click(screen.getByRole('button', { name: '目次' }))

    const active = screen.getByRole('link', { name: '活動趣旨' })
    expect(active.className).toContain('before:border-l-accent')

    const inactive = screen.getByRole('link', { name: '入会案内' })
    expect(inactive.className).toContain('before:border-transparent')
  })

  it('外部リンク (成果品販売) はアクティブにならない', async () => {
    const user = userEvent.setup()
    render(<RouterMenu currentPath="https://shop.tohyamago.org" />)
    await user.click(screen.getByRole('button', { name: '目次' }))

    const external = screen.getByRole('link', { name: '成果品販売' })
    expect(external).toHaveAttribute('href', 'https://shop.tohyamago.org')
    expect(external.className).toContain('before:border-transparent')
  })
})
