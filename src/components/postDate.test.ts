import { describe, it, expect } from 'vitest'
import { formatPostDate } from './postDate'

describe('formatPostDate', () => {
  it('YYYY年M月D日(曜) 形式に整形する', () => {
    // 2018-08-11 は土曜日
    expect(formatPostDate(new Date('2018-08-11T04:59:58.000Z'))).toBe(
      '2018年8月11日(土)',
    )
  })

  it('月日はゼロ埋めしない', () => {
    // 2019-02-10 は日曜日
    expect(formatPostDate(new Date('2019-02-10T03:01:25.000Z'))).toBe(
      '2019年2月10日(日)',
    )
  })
})
