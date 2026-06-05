import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FarmCalendar, {
  type CalendarCrop,
  type CalendarEvent,
  startColumn,
  endColumn,
  formatMonthPart,
  formatPeriod,
  labelOnLeft,
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
        end: 4.0,
        intensity: 'medium',
        note: '種芋の植付け。初参加歓迎。',
      },
      { label: '収穫（芋掘り）', start: 7.1, end: 8.0, intensity: 'hard' },
    ],
  },
]

const events: CalendarEvent[] = [
  {
    id: 'shimotsuki',
    name: '霜月祭り',
    start: 12.0,
    end: 12.2,
    category: '地域行事',
    note: '国指定重要無形民俗文化財。',
  },
  {
    id: 'momijigari',
    name: 'もみじ狩り',
    start: 10.2,
    end: 10.2,
    category: '地域行事',
  },
]

describe('FarmCalendar の純粋関数 (36 列・旬粒度)', () => {
  it('startColumn は月.旬を 1〜36 の列に変換する', () => {
    expect(startColumn(1.0)).toBe(1) // 1月上旬
    expect(startColumn(1.1)).toBe(2) // 1月中旬
    expect(startColumn(1.2)).toBe(3) // 1月下旬
    expect(startColumn(4.0)).toBe(10) // 4月上旬
    expect(startColumn(12.2)).toBe(36) // 12月下旬
  })

  it('endColumn は開始列の次の列 (排他的終端) を返す', () => {
    expect(endColumn(4.0)).toBe(11)
    expect(endColumn(12.2)).toBe(37)
  })

  it('formatMonthPart は上旬・中旬・下旬を表記する', () => {
    expect(formatMonthPart(5.0)).toBe('5月上旬')
    expect(formatMonthPart(5.1)).toBe('5月中旬')
    expect(formatMonthPart(5.2)).toBe('5月下旬')
  })

  it('formatPeriod は単一の旬と期間を出し分ける', () => {
    expect(formatPeriod(11.0, 11.0)).toBe('11月上旬')
    expect(formatPeriod(4.0, 4.2)).toBe('4月上旬〜4月下旬')
  })

  it('labelOnLeft は年末に終わるバーのラベルを左側に寄せる', () => {
    expect(labelOnLeft(5.1)).toBe(false) // 5月中旬 → 右
    expect(labelOnLeft(10.2)).toBe(false) // 10月下旬 → 右
    expect(labelOnLeft(11.0)).toBe(true) // 11月上旬 → 左
    expect(labelOnLeft(12.2)).toBe(true) // 12月下旬 → 左
  })
})

describe('FarmCalendar コンポーネント', () => {
  it('当月の 3 列をハイライトし、当月ラベルを強調する', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    // 5月 → ラベル列ぶん +1 で (5-1)*3+2 = 14 列目から 3 列ぶん
    const band = screen.getByTestId('current-month-band')
    expect(band.style.gridColumn).toBe('14 / span 3')

    expect(screen.getByText('5月').className).toContain('text-accent-strong')
  })

  it('作業バーに作業強度を data 属性で持たせる (ボランティア強調はしない)', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    const planting = screen.getByRole('button', { name: /植付け/ })
    expect(planting.dataset.intensity).toBe('medium')

    const harvest = screen.getByRole('button', { name: /収穫（芋掘り）/ })
    expect(harvest.dataset.intensity).toBe('hard')

    // 旧仕様の 🙌 ボランティアマークは表示しない
    expect(screen.queryByText('🙌')).not.toBeInTheDocument()
  })

  it('期間のある行事は塗りバー (四角)、単発の行事は◆マークのみで描画する', () => {
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)
    const bars = screen.getAllByTestId('event-bar')

    // 霜月祭り (期間) は塗りバー。12月上旬(+1=35)〜12月下旬の終端(+1=38)
    const shimotsuki = bars.find((b) => b.textContent?.includes('霜月祭り'))!
    expect(shimotsuki.dataset.single).toBe('false')
    expect(shimotsuki.className).toContain('bg-sky')
    expect(shimotsuki.className).not.toContain('dashed')
    expect(shimotsuki.style.gridColumn).toBe('35 / 38')

    // もみじ狩り (単発) は◆マークのみ (塗りバーにしない)
    const momiji = bars.find((b) => b.textContent?.includes('もみじ狩り'))!
    expect(momiji.dataset.single).toBe('true')
    expect(momiji.textContent).toContain('◆')
    expect(momiji.className).not.toContain('bg-sky')
  })

  it('バーをタップするとタップ付近にポップオーバーで詳細と CTA が開く', async () => {
    const user = userEvent.setup()
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    const planting = screen.getByRole('button', { name: /植付け/ })
    expect(planting).toHaveAttribute('aria-expanded', 'false')

    await user.click(planting)

    expect(planting).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('種芋の植付け。初参加歓迎。')
    expect(dialog).toHaveTextContent('作業強度 ふつう')

    const joinCta = screen.getByRole('link', { name: '参加の流れを見る' })
    expect(joinCta).toHaveAttribute('href', '/join')
  })

  it('ポップオーバーは閉じるボタンで閉じ、フォーカスを元のバーへ戻す', async () => {
    const user = userEvent.setup()
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    const planting = screen.getByRole('button', { name: /植付け/ })
    await user.click(planting)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '閉じる' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // a11y: 閉じたら開いたバーへフォーカスが戻る
    expect(planting).toHaveFocus()
  })

  it('Escape キーでポップオーバーを閉じられる', async () => {
    const user = userEvent.setup()
    render(<FarmCalendar crops={crops} events={events} currentMonth={5} />)

    await user.click(screen.getByRole('button', { name: /植付け/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('複数の作物を order 順に積み上げて描画する (emoji なしも許容)', () => {
    const multi: CalendarCrop[] = [
      {
        id: 'b',
        name: 'ビー',
        color: '#111111',
        order: 2,
        tasks: [{ label: '作業B', start: 6.0, end: 6.1, intensity: 'light' }],
      },
      {
        id: 'a',
        name: 'エー',
        emoji: '🅰️',
        color: '#222222',
        order: 1,
        tasks: [{ label: '作業A', start: 3.0, end: 3.1, intensity: 'medium' }],
      },
    ]
    render(<FarmCalendar crops={multi} events={[]} currentMonth={5} />)

    // 2 作物ぶんの作業バーが描画される (作物名は凡例にも出るためボタンで判定)
    const a = screen.getByRole('button', { name: /作業A/ })
    const b = screen.getByRole('button', { name: /作業B/ })
    expect(a).toBeInTheDocument()
    expect(b).toBeInTheDocument()
    // order 昇順 (エー=order1 → ビー=order2) で行が積み上がる
    expect(a.style.gridRow).toBe('2')
    expect(b.style.gridRow).toBe('3')
  })

  it('currentMonth 未指定でも当月のハイライト帯を描画する', () => {
    render(<FarmCalendar crops={crops} events={events} />)
    // クライアントでは実行時の当月が使われ、帯が描画される
    expect(screen.getByTestId('current-month-band')).toBeInTheDocument()
  })

  it('note のない作業でも詳細と CTA を表示する', async () => {
    const user = userEvent.setup()
    const noNote: CalendarCrop[] = [
      {
        id: 'x',
        name: 'エックス',
        color: '#333333',
        order: 1,
        tasks: [{ label: '作業X', start: 4.0, end: 4.1, intensity: 'light' }],
      },
    ]
    render(<FarmCalendar crops={noNote} events={[]} currentMonth={5} />)

    await user.click(screen.getByRole('button', { name: /作業X/ }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('作業強度 軽め')
    expect(
      screen.getByRole('link', { name: '参加の流れを見る' }),
    ).toBeInTheDocument()
  })
})
