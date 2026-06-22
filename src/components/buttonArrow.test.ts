import { describe, it, expect } from 'vitest'
import { resolveButtonArrow } from './buttonArrow'

describe('resolveButtonArrow', () => {
  it('内部ページへのリンクは前進を示す → を出す', () => {
    expect(resolveButtonArrow('/join')).toEqual({ external: false, glyph: '→' })
    expect(resolveButtonArrow('/news/archive')).toEqual({
      external: false,
      glyph: '→',
    })
  })

  it('外部リンク (http/https) は別タブを示す ↗ を出す', () => {
    expect(resolveButtonArrow('https://shop.tohyamago.org')).toEqual({
      external: true,
      glyph: '↗',
    })
    expect(resolveButtonArrow('http://example.com')).toEqual({
      external: true,
      glyph: '↗',
    })
  })

  it('同一ページ内アンカー (#) はページ遷移ではないので矢印を出さない', () => {
    expect(resolveButtonArrow('#p1')).toBeNull()
  })

  it('override=false で矢印を強制的に消せる (「戻る」など前進にそぐわない場合)', () => {
    expect(resolveButtonArrow('/', false)).toBeNull()
    expect(resolveButtonArrow('https://example.com', false)).toBeNull()
  })

  it('override=true でアンカーにも矢印を強制できる', () => {
    expect(resolveButtonArrow('#p1', true)).toEqual({
      external: false,
      glyph: '→',
    })
  })
})
