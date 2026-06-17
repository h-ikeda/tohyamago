import { describe, it, expect } from 'vitest'
import type { CalendarCrop } from './FarmCalendar'
import { isTaskInMonth, tasksInMonth, upcomingTasks } from './homeTasks'

// テスト用の最小データ。order を意図的に逆転させ、並べ替えを検証できるようにする。
const crops: CalendarCrop[] = [
  {
    id: 'soba',
    name: '下栗蕎麦',
    color: '#7c9a3e',
    order: 2,
    tasks: [{ label: '種蒔き', start: 7.1, end: 7.2, intensity: 'light' }],
  },
  {
    id: 'imo',
    name: '下栗芋',
    emoji: '🥔',
    color: '#a65f3b',
    order: 1,
    tasks: [
      { label: '植付け', start: 3.2, end: 4.0, intensity: 'light' },
      {
        label: '土寄せ・除草',
        start: 5.1,
        end: 7.0,
        intensity: 'light',
        note: '苗の生育に合わせて',
      },
    ],
  },
]

describe('isTaskInMonth', () => {
  const task = { start: 5.1, end: 7.0 }

  it('期間が月をまたぐ途中の月は含まれる', () => {
    expect(isTaskInMonth(task, 6)).toBe(true)
  })

  it('開始旬を含む月 (5月中旬開始) は含まれる', () => {
    expect(isTaskInMonth(task, 5)).toBe(true)
  })

  it('終了が上旬 (7.0) の月も上旬ぶんは含まれる', () => {
    expect(isTaskInMonth(task, 7)).toBe(true)
  })

  it('期間より前の月は含まれない', () => {
    expect(isTaskInMonth(task, 4)).toBe(false)
  })

  it('期間より後の月は含まれない', () => {
    expect(isTaskInMonth(task, 8)).toBe(false)
  })
})

describe('tasksInMonth', () => {
  it('指定月に重なる作業だけを作物の order 順で返す', () => {
    const result = tasksInMonth(crops, 7)
    // 7月: 下栗芋「土寄せ・除草」(5.1-7.0) と 下栗蕎麦「種蒔き」(7.1-7.2)
    expect(result.map((t) => t.label)).toEqual(['土寄せ・除草', '種蒔き'])
    // order=1 の下栗芋が先頭
    expect(result[0].cropName).toBe('下栗芋')
    expect(result[0].emoji).toBe('🥔')
    expect(result[0].note).toBe('苗の生育に合わせて')
  })

  it('作業が無い月は空配列', () => {
    expect(tasksInMonth(crops, 1)).toEqual([])
  })
})

describe('upcomingTasks', () => {
  it('当月に作業があれば当月を返す', () => {
    const { month, tasks } = upcomingTasks(crops, 6)
    expect(month).toBe(6)
    expect(tasks).toHaveLength(1)
    expect(tasks[0].label).toBe('土寄せ・除草')
  })

  it('当月に作業が無ければ最も近い先の月を返す', () => {
    // 1月は作業なし → 次にあるのは3月の植付け
    const { month, tasks } = upcomingTasks(crops, 1)
    expect(month).toBe(3)
    expect(tasks[0].label).toBe('植付け')
  })

  it('年をまたいで翌年の最初の作業へ回り込む', () => {
    // 8月以降は作業なし → 翌年3月へ回り込む
    const { month } = upcomingTasks(crops, 9)
    expect(month).toBe(3)
  })
})
