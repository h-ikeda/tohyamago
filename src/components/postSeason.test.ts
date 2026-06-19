import { describe, it, expect } from 'vitest'
import { getSeason, seasonLabel, SEASONS } from './postSeason'

// getSeason は UTC 基準で判定するため、テストも UTC で月日を組み立てる
const d = (month: number, day: number) =>
  new Date(Date.UTC(2020, month - 1, day))

describe('getSeason', () => {
  it('春は 3/1〜6/20 (境界を含む)', () => {
    expect(getSeason(d(3, 1))).toBe('spring')
    expect(getSeason(d(5, 10))).toBe('spring')
    expect(getSeason(d(6, 20))).toBe('spring')
  })

  it('夏は 6/21〜9/15', () => {
    expect(getSeason(d(6, 21))).toBe('summer')
    expect(getSeason(d(8, 1))).toBe('summer')
    expect(getSeason(d(9, 15))).toBe('summer')
  })

  it('秋は 9/16〜12/5', () => {
    expect(getSeason(d(9, 16))).toBe('autumn')
    expect(getSeason(d(10, 28))).toBe('autumn')
    expect(getSeason(d(12, 5))).toBe('autumn')
  })

  it('冬は 12/6〜翌 2 月末 (年をまたぐ)', () => {
    expect(getSeason(d(12, 6))).toBe('winter')
    expect(getSeason(d(12, 31))).toBe('winter')
    expect(getSeason(d(1, 1))).toBe('winter')
    expect(getSeason(d(2, 10))).toBe('winter')
    expect(getSeason(d(2, 29))).toBe('winter') // 閏日も冬
  })
})

describe('seasonLabel / SEASONS', () => {
  it('季節の表示ラベルを返す', () => {
    expect(seasonLabel('spring')).toBe('春')
    expect(seasonLabel('winter')).toBe('冬')
  })

  it('SEASONS は春→夏→秋→冬の順', () => {
    expect(SEASONS.map((s) => s.id)).toEqual([
      'spring',
      'summer',
      'autumn',
      'winter',
    ])
  })
})
