import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FarmCalendar, {
  type CalendarCrop,
  type CalendarEvent,
  startColumn,
  endColumn,
  formatHalfMonth,
  formatPeriod,
  assignLanes,
} from './FarmCalendar'

const crops: CalendarCrop[] = [
  {
    id: 'imo',
    name: '下栗芋',
    emoji: '🥔',
    color: '#a65f3b',
    order: 1,
    tasks: [
      {
        label: '植付け',
        start: 4.0,
        end: 4.5,
        volunteer: true,
        note: '種芋の植付け。初参加歓迎。',
      },
      { label: '中切り', start: 6.0, end: 8.5, volunteer: false },
    ],
  },
]

const events: CalendarEvent[] = [
  {
    id: 'shimotsuki',
    name: '霜月祭り',
    start: 12.0,
    end: 12.5,
    category: '地域行事',
    note: '国指定重要無形民俗文化財。',
  },
]

describe('FarmCalendar の純粋関数', () => {
  it('startColumn は半月値を 1〜24 の列に変換する', () => {
    expect(startColumn(1.0)).toBe(1) // 1月上旬
    expect(startColumn(1.5)).toBe(2) // 1月下旬
    expect(startColumn(4.0)).toBe(7) // 4月上旬
    expect(startColumn(12.5)).toBe(24) // 12月下旬
  })

  it('endColumn は開始列の次の列 (排他的終端) を返す', () => {
    expect(endColumn(4.0)).toBe(8)
    expect(endColumn(12.5)).toBe(25)
  })

  it('formatHalfMonth は上旬・下旬を表記する', () => {
    expect(formatHalfMonth(5.0)).toBe('5月上旬')
    expect(formatHalfMonth(5.5)).toBe('5月下旬')
  })

  it('formatPeriod は単一半月と期間を出し分ける', () => {
    expect(formatPeriod(11.0, 11.0)).toBe('11月上旬')
    expect(formatPeriod(4.0, 4.5)).toBe('4月上旬〜4月下旬')
  })

  it('assignLanes は重なる期間を別レーンに、重ならない期間は同レーンに積む', () => {
    const result = assignLanes([
      { start: 4.0, end: 7.0 },
      { start: 5.0, end: 6.0 },
      { start: 8.0, end: 9.0 },
    ])
    const laneOf = (start: number) =>
      result.find((r) => r.item.start === start)!.lane
    expect(laneOf(4.0)).toBe(0)
    expect(laneOf(5.0)).toBe(1) // 4.0 と重なるので別レーン
    expect(laneOf(8.0)).toBe(0) // 4.0 と重ならないので同レーンに戻る
  })
})

describe('FarmCalendar コンポーネント', () => {
  it('当月の列をハイライトし、当月ラベルを強調する', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    // 5月 → 上旬列 = (5-1)*2+1 = 9、ラベル列ぶん +1 で 10 列目から 2 列ぶん
    const band = screen.getByTestId('current-month-band')
    expect(band.style.gridColumn).toBe('10 / span 2')

    expect(screen.getByText('5月').className).toContain('text-accent-strong')
  })

  it('ボランティア作業は強調し、非ボランティア作業は破線で控えめに描く', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    const planting = screen.getByRole('button', { name: /植付け/ })
    expect(planting.dataset.volunteer).toBe('true')
    // 強調バーには 🙌 マークが付く
    expect(planting.textContent).toContain('🙌')
    expect(planting.style.borderStyle).not.toBe('dashed')

    const nakagiri = screen.getByRole('button', { name: /中切り/ })
    expect(nakagiri.dataset.volunteer).toBe('false')
    expect(nakagiri.style.border).toContain('dashed')
  })

  it('地域イベントを描画する', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)
    const eventBar = screen.getByTestId('event-bar')
    expect(eventBar.textContent).toContain('霜月祭り')
    // 12月上旬 → 列 23、ラベル列ぶん +1 で 24 から
    expect(eventBar.style.gridColumn).toBe('24 / 26')
  })

  it('作業バーをクリックすると詳細と参加 CTA が開く', async () => {
    const user = userEvent.setup()
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    const planting = screen.getByRole('button', { name: /植付け/ })
    expect(planting).toHaveAttribute('aria-expanded', 'false')

    await user.click(planting)

    expect(planting).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('種芋の植付け。初参加歓迎。')).toBeInTheDocument()

    const joinCta = screen.getByRole('link', { name: '参加の流れを見る' })
    expect(joinCta).toHaveAttribute('href', '/join')
  })

  it('非ボランティア作業の詳細には参加 CTA を出さない', async () => {
    const user = userEvent.setup()
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    await user.click(screen.getByRole('button', { name: /中切り/ }))

    expect(
      screen.queryByRole('link', { name: '参加の流れを見る' }),
    ).not.toBeInTheDocument()
  })
})
