import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import StoryArt from './StoryArt'

describe('StoryArt', () => {
  it('SVG を描画する (viewBox は 16:9 相当)', () => {
    const { container } = render(<StoryArt scene="hero" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('viewBox', '0 0 800 450')
    // 背景として敷き詰められるよう slice で覆う
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice')
  })

  it('title を与えると role="img" + aria-label になる', () => {
    const { container } = render(
      <StoryArt scene="hero" title="谷を見上げる人影" />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', '谷を見上げる人影')
    expect(svg).not.toHaveAttribute('aria-hidden')
  })

  it('title が無ければ装飾として aria-hidden になる', () => {
    const { container } = render(<StoryArt scene="field" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
  })

  it('シーンごとにグラデーション ID が分かれ、別ページで衝突しない', () => {
    const { container } = render(<StoryArt scene="winter" />)
    expect(container.querySelector('#art-winter-sky')).not.toBeNull()
    expect(container.querySelector('#art-field-sky')).toBeNull()
  })

  it('冬のシーンだけ雪化粧 (白い頂) が描かれる', () => {
    const { container: winter } = render(<StoryArt scene="winter" />)
    const { container: field } = render(<StoryArt scene="field" />)
    // 雪は白い <g> 配下の polygon。冬は描画され、夏の畑シーンには無い。
    const snowPolys = (c: HTMLElement) =>
      c.querySelectorAll('g[fill="#ffffff"] polygon')
    expect(snowPolys(winter).length).toBeGreaterThan(0)
    expect(snowPolys(field).length).toBe(0)
  })

  it('未知のシーンは hero にフォールバックする', () => {
    // @ts-expect-error 故意に不正なシーンを渡す
    const { container } = render(<StoryArt scene="unknown" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
