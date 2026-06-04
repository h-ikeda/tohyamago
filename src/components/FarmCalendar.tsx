import { useId, useMemo, useState } from 'react'

/**
 * FarmCalendar — 農作業ガントチャート (React island)。
 *
 * 横軸＝1〜12 月 (半月粒度＝24 列)、縦軸＝作物。各作業を期間バーで表示し、
 * 地域イベントを別レーンに重畳する。当月をハイライトし「今・近いうちに
 * 参加できる作業」へ視線を誘導する。バーのクリックで詳細＋参加 CTA を開く。
 *
 * データは calendar.astro が getCollection('crops'|'events') で取得し props で渡す。
 */

export interface CalendarTask {
  label: string
  start: number
  end: number
  volunteer: boolean
  note?: string
}

export interface CalendarCrop {
  id: string
  name: string
  emoji?: string
  color: string
  order: number
  tasks: CalendarTask[]
}

export interface CalendarEvent {
  id: string
  name: string
  start: number
  end: number
  category: string
  location?: string
  url?: string
  note?: string
}

export const MONTH_COLUMNS = 24

/** 半月値 (1.0〜12.5) を 1〜24 のグリッド列 (開始) に変換する。整数=上旬, .5=下旬。 */
export function startColumn(halfMonth: number): number {
  const month = Math.floor(halfMonth)
  const isLatter = halfMonth % 1 !== 0
  return (month - 1) * 2 + (isLatter ? 1 : 0) + 1
}

/** 半月値を、その半月セルを塗りつぶす grid-column 終端 (排他的) に変換する。 */
export function endColumn(halfMonth: number): number {
  return startColumn(halfMonth) + 1
}

/** 半月値を「N月上旬 / N月下旬」の表記に変換する。 */
export function formatHalfMonth(halfMonth: number): string {
  const month = Math.floor(halfMonth)
  const part = halfMonth % 1 !== 0 ? '下旬' : '上旬'
  return `${month}月${part}`
}

/** start〜end の期間表記。単一半月なら 1 つだけ返す。 */
export function formatPeriod(start: number, end: number): string {
  return start === end
    ? formatHalfMonth(start)
    : `${formatHalfMonth(start)}〜${formatHalfMonth(end)}`
}

/**
 * 重なり合う期間を縦に積むためのレーン割当 (区間分割の貪欲法)。
 * 同じレーンには期間が重ならない項目だけを載せる。
 */
export function assignLanes<T extends { start: number; end: number }>(
  items: T[],
): { item: T; lane: number }[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const laneEnds: number[] = []
  return sorted.map((item) => {
    const from = startColumn(item.start)
    let lane = laneEnds.findIndex((end) => end <= from)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = endColumn(item.end)
    return { item, lane }
  })
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

/** バー (作業/イベント) の grid-column。ラベル列ぶん +1 する。 */
function barColumn(start: number, end: number): string {
  return `${1 + startColumn(start)} / ${1 + endColumn(end)}`
}

type SelectedTask = {
  cropName: string
  emoji?: string
  color: string
  task: CalendarTask
}

interface Props {
  crops: CalendarCrop[]
  events: CalendarEvent[]
  /** テスト用に当月を固定できる (1〜12)。既定は実行時の現在月。 */
  currentMonth?: number
}

export default function FarmCalendar({
  crops,
  events,
  currentMonth = new Date().getMonth() + 1,
}: Props) {
  const detailId = useId()
  const [selected, setSelected] = useState<SelectedTask | null>(null)

  // 作物・イベントの行配置を明示的に計算する (レーン重なりを縦に積む)。
  // 行 1 は月ヘッダー。各ブロックは直前ブロックの末尾から積み上げる。
  const { cropBlocks, eventBlock, lastRow } = useMemo(() => {
    const computed = [...crops]
      .sort((a, b) => a.order - b.order)
      .map((crop) => {
        const lanes = assignLanes(crop.tasks)
        const laneCount = Math.max(1, ...lanes.map((l) => l.lane + 1))
        return { crop, lanes, laneCount }
      })

    const blocks = computed.map((block, i) => ({
      ...block,
      startRow: computed.slice(0, i).reduce((row, b) => row + b.laneCount, 2),
    }))

    const eventLanes = assignLanes(events)
    const eventLaneCount = Math.max(1, ...eventLanes.map((l) => l.lane + 1))
    const eventStartRow = computed.reduce((row, b) => row + b.laneCount, 2)
    const evt = {
      lanes: eventLanes,
      laneCount: eventLaneCount,
      startRow: eventStartRow,
    }
    return {
      cropBlocks: blocks,
      eventBlock: evt,
      lastRow: eventStartRow + eventLaneCount,
    }
  }, [crops, events])

  // 当月の 2 列 (上旬・下旬) を覆うハイライト帯の grid-column。ラベル列ぶん +1。
  const bandColumn = `${1 + (currentMonth - 1) * 2 + 1} / span 2`

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[48rem] items-stretch"
          style={{
            gridTemplateColumns: `minmax(5.5rem, max-content) repeat(${MONTH_COLUMNS}, minmax(1.1rem, 1fr))`,
            gridAutoRows: '2.25rem',
          }}
        >
          {/* 当月ハイライト帯 (ヘッダー下から最下行まで) */}
          <div
            data-testid="current-month-band"
            aria-hidden="true"
            className="pointer-events-none rounded-md bg-sunlight-soft/60"
            style={{ gridColumn: bandColumn, gridRow: `2 / ${lastRow}` }}
          />

          {/* ヘッダー: 月ラベル */}
          <div className="sticky left-0 z-10 bg-base" style={{ gridRow: 1 }} />
          {MONTH_LABELS.map((label, i) => (
            <div
              key={label}
              className={`flex items-end justify-center pb-1 font-serif text-xs ${
                i + 1 === currentMonth
                  ? 'font-medium text-accent-strong'
                  : 'text-primary/70'
              }`}
              style={{ gridColumn: `${2 + i * 2} / span 2`, gridRow: 1 }}
            >
              {label}
            </div>
          ))}

          {/* 作物の行 */}
          {cropBlocks.map(({ crop, lanes, laneCount, startRow }) => (
            <div key={crop.id} style={{ display: 'contents' }}>
              <div
                className="sticky left-0 z-10 flex items-center gap-1 bg-base pr-2 text-sm text-body"
                style={{
                  gridColumn: 1,
                  gridRow: `${startRow} / span ${laneCount}`,
                }}
              >
                {crop.emoji && (
                  <span aria-hidden="true" className="text-base">
                    {crop.emoji}
                  </span>
                )}
                <span className="font-serif">{crop.name}</span>
              </div>
              {lanes.map(({ item, lane }) => (
                <TaskBar
                  key={`${crop.id}-${item.label}-${item.start}`}
                  crop={crop}
                  task={item}
                  row={startRow + lane}
                  isSelected={
                    selected?.cropName === crop.name &&
                    selected?.task.label === item.label
                  }
                  detailId={detailId}
                  onSelect={setSelected}
                />
              ))}
            </div>
          ))}

          {/* イベントレーン */}
          <div
            className="sticky left-0 z-10 flex items-center bg-base pr-2 text-sm text-body"
            style={{
              gridColumn: 1,
              gridRow: `${eventBlock.startRow} / span ${eventBlock.laneCount}`,
            }}
          >
            <span className="font-serif">地域の行事</span>
          </div>
          {eventBlock.lanes.map(({ item, lane }) => (
            <EventBar
              key={item.id}
              event={item}
              row={eventBlock.startRow + lane}
            />
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <Legend crops={cropBlocks.map((b) => b.crop)} />

      {/* 選択中の作業の詳細 */}
      <div id={detailId} aria-live="polite" className="mt-4">
        {selected && (
          <TaskDetail selected={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}

function TaskBar({
  crop,
  task,
  row,
  isSelected,
  detailId,
  onSelect,
}: {
  crop: CalendarCrop
  task: CalendarTask
  row: number
  isSelected: boolean
  detailId: string
  onSelect: (s: SelectedTask) => void
}) {
  // ボランティア歓迎の作業は塗りで強調、それ以外は淡色＋枠線で控えめに。
  const style = task.volunteer
    ? { backgroundColor: crop.color, color: '#fff' }
    : {
        backgroundColor: `${crop.color}1f`,
        color: crop.color,
        border: `1px dashed ${crop.color}`,
      }
  return (
    <button
      type="button"
      data-testid="task-bar"
      data-volunteer={task.volunteer}
      aria-controls={detailId}
      aria-expanded={isSelected}
      aria-label={`${crop.name} ${task.label}（${formatPeriod(task.start, task.end)}）${
        task.volunteer ? '・ボランティア歓迎' : ''
      }`}
      onClick={() =>
        onSelect({
          cropName: crop.name,
          emoji: crop.emoji,
          color: crop.color,
          task,
        })
      }
      className={`my-0.5 flex h-7 items-center gap-1 self-center overflow-hidden whitespace-nowrap rounded-full px-2 text-xs font-medium transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isSelected ? 'ring-2 ring-accent ring-offset-1' : ''
      }`}
      style={{
        ...style,
        gridColumn: barColumn(task.start, task.end),
        gridRow: row,
      }}
    >
      {task.volunteer && (
        <span aria-hidden="true" className="shrink-0">
          🙌
        </span>
      )}
      <span className="overflow-hidden text-ellipsis">{task.label}</span>
    </button>
  )
}

function EventBar({ event, row }: { event: CalendarEvent; row: number }) {
  return (
    <div
      data-testid="event-bar"
      title={event.note}
      className="my-0.5 flex h-7 items-center gap-1 self-center overflow-hidden whitespace-nowrap rounded-md border border-dashed border-sky bg-sky-soft px-2 text-xs text-primary-deep"
      style={{ gridColumn: barColumn(event.start, event.end), gridRow: row }}
    >
      <span aria-hidden="true" className="shrink-0">
        ◆
      </span>
      <span className="overflow-hidden text-ellipsis">{event.name}</span>
    </div>
  )
}

function Legend({ crops }: { crops: CalendarCrop[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-body">
      {crops.map((crop) => (
        <span key={crop.id} className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: crop.color }}
          />
          {crop.emoji} {crop.name}
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span aria-hidden="true">🙌</span> ボランティア歓迎
      </span>
      <span className="flex items-center gap-1">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-sm border border-dashed border-sky bg-sky-soft"
        />
        地域の行事
      </span>
    </div>
  )
}

function TaskDetail({
  selected,
  onClose,
}: {
  selected: SelectedTask
  onClose: () => void
}) {
  const { cropName, emoji, color, task } = selected
  return (
    <div
      className="rounded-3xl border border-primary/10 bg-surface p-5 shadow-sm"
      style={{ borderTopColor: color, borderTopWidth: '4px' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg text-primary">
            {emoji} {cropName}・{task.label}
          </p>
          <p className="mt-1 text-sm text-body/80">
            {formatPeriod(task.start, task.end)}
            {task.volunteer && (
              <span className="ml-2 rounded-full bg-accent-soft/40 px-2 py-0.5 text-accent-strong">
                🙌 ボランティア歓迎
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="shrink-0 rounded-full px-2 text-body/50 hover:text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ✕
        </button>
      </div>
      {task.note && (
        <p className="mt-3 leading-relaxed text-body">{task.note}</p>
      )}
      {task.volunteer && (
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/join"
            className="inline-flex items-center justify-center rounded-full bg-accent-strong px-6 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            参加の流れを見る
          </a>
          <a
            href="https://activo.jp/s/a/119414"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-accent-strong px-6 py-2 text-sm font-medium text-accent-strong transition-colors hover:bg-accent-strong hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ボランティア募集を見る
          </a>
        </div>
      )}
    </div>
  )
}
