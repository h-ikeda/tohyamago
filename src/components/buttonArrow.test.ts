import { describe, it, expect } from 'vitest'
import { resolveButtonArrow, isExternalHref } from './buttonArrow'

describe('isExternalHref', () => {
  it('http(s):// で始まる URL のみ外部とみなす', () => {
    expect(isExternalHref('https://shop.tohyamago.org')).toBe(true)
    expect(isExternalHref('http://example.com')).toBe(true)
  })

  it('プロトコルなしの相対パスは外部とみなさない', () => {
    expect(isExternalHref('/join')).toBe(false)
    expect(isExternalHref('#p1')).toBe(false)
    // 'http' で始まるが URL ではない相対パス (誤検知しないこと)
    expect(isExternalHref('http-status')).toBe(false)
    expect(isExternalHref('/httpie')).toBe(false)
  })
})

describe('resolveButtonArrow', () => {
  it('内部ページへのリンクは内部矢印 (前進) を出す', () => {
    expect(resolveButtonArrow('/join')).toBe('internal')
    expect(resolveButtonArrow('/news/archive')).toBe('internal')
    // 'http' で始まる相対パスは内部扱い
    expect(resolveButtonArrow('/http-status')).toBe('internal')
  })

  it('外部リンク (http/https) は外部矢印 (別タブ) を出す', () => {
    expect(resolveButtonArrow('https://shop.tohyamago.org')).toBe('external')
    expect(resolveButtonArrow('http://example.com')).toBe('external')
  })

  it('同一ページ内アンカー (#) はページ遷移ではないので矢印を出さない', () => {
    expect(resolveButtonArrow('#p1')).toBeNull()
  })

  it('override=false で矢印を強制的に消せる (「戻る」など前進にそぐわない場合)', () => {
    expect(resolveButtonArrow('/', false)).toBeNull()
    expect(resolveButtonArrow('https://example.com', false)).toBeNull()
  })

  it('override=true でアンカーにも矢印を強制できる (種別は href から判定)', () => {
    expect(resolveButtonArrow('#p1', true)).toBe('internal')
    expect(resolveButtonArrow('https://example.com', true)).toBe('external')
  })
})
