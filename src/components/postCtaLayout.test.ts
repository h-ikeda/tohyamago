import { describe, it, expect } from 'vitest'
import { ctaPositions } from './postCtaLayout'

describe('ctaPositions', () => {
  it('every 件ごとの記事直後に CTA を挿入する', () => {
    // 36 件・間隔 12 → 12,24 件目の直後 (index 11, 23)
    expect([...ctaPositions(36, 12)]).toEqual([11, 23])
  })

  it('最終記事の直後には挿入しない (末尾の本 CTA と重複させない)', () => {
    // 24 件・間隔 12 → 本来 index 11, 23 だが 23 は最終記事なので除外
    expect([...ctaPositions(24, 12)]).toEqual([11])
  })

  it('記事数が間隔以下なら挿入しない', () => {
    expect([...ctaPositions(12, 12)]).toEqual([])
    expect([...ctaPositions(5, 12)]).toEqual([])
  })

  it('every が 0 以下なら常に空 (無効化)', () => {
    expect([...ctaPositions(100, 0)]).toEqual([])
    expect([...ctaPositions(100, -3)]).toEqual([])
  })

  it('記事 0 件でも例外を投げず空を返す', () => {
    expect([...ctaPositions(0, 12)]).toEqual([])
  })
})
