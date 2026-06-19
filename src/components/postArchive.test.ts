import { describe, it, expect } from 'vitest'
import { groupPostsByYear } from './postArchive'

const post = (iso: string) => ({ data: { date: new Date(iso) } })

describe('groupPostsByYear', () => {
  it('公開年でまとめ、新しい年が先頭に来る', () => {
    const groups = groupPostsByYear([
      post('2019-04-06T00:00:00Z'),
      post('2018-08-11T00:00:00Z'),
      post('2019-02-10T00:00:00Z'),
      post('2020-01-01T00:00:00Z'),
    ])
    expect(groups.map((g) => g.year)).toEqual([2020, 2019, 2018])
    expect(groups[1].posts).toHaveLength(2)
  })

  it('各グループ内は入力の並び順を保持する', () => {
    const a = post('2019-12-01T00:00:00Z')
    const b = post('2019-01-01T00:00:00Z')
    const groups = groupPostsByYear([a, b])
    expect(groups[0].posts).toEqual([a, b])
  })

  it('空配列なら空を返す', () => {
    expect(groupPostsByYear([])).toEqual([])
  })
})
