import { useEffect, useId, useMemo, useRef, useState } from 'react'

/**
 * FarmCalendar — 農作業ガントチャート (React island)。
 *
 * 横軸＝1〜12 月 (半月粒度＝24 列)、縦軸＝作物。各作業を 1 作業 1 行の期間バーで
 * 表示し、地域イベントを別レーンに重畳する。当月をハイライトし「今・近いうちに
 * 参加できる作業」へ視線を誘導する。バーの選択で詳細＋参加 CTA を開く。
 *
 * モバイルでバー幅が狭くても読めるよう、ラベルはバーの中ではなく横に置く
 * (バーが年末に寄る場合は左側)。月ごとの縦線と作物ごとの区切り線で見やすくする。
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
 * バーのラベルを左右どちらに置くかを決める。年末 (11 月以降に終わる) バーは
 * 右へ出すと見切れるため左側に置く。
 */
export function labelOnLeft(end: number): boolean {
  return endColumn(end) >= 22
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
  const detailRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<SelectedTask | null>(null)

  // 選択された作業の詳細が画面外にあれば、その位置までスクロールして気付かせる。
  useEffect(() => {
    if (!selected || !detailRef.current) return
    try {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch {
      // scrollIntoView 未実装の環境 (jsdom 等) は無視する。
    }
  }, [selected])

  // 1 作業 1 行で行配置を計算する (各ブロックは直前ブロックの末尾から積み上げる)。
  // 行 1 は月ヘッダー。
  const { cropBlocks, eventBlock, lastRow } = useMemo(() => {
    const prepared = [...crops]
      .sort((a, b) => a.order - b.order)
      .map((crop) => {
        const tasks = [...crop.tasks].sort(
          (a, b) => a.start - b.start || a.end - b.end,
        )
        return { crop, tasks, rowCount: Math.max(1, tasks.length) }
      })

    const blocks = prepared.map((block, i) => ({
      ...block,
      startRow: prepared.slice(0, i).reduce((row, b) => row + b.rowCount, 2),
    }))

    const eventList = [...events].sort(
      (a, b) => a.start - b.start || a.end - b.end,
    )
    const eventStartRow = prepared.reduce((row, b) => row + b.rowCount, 2)
    const eventRowCount = Math.max(1, eventList.length)
    return {
      cropBlocks: blocks,
      eventBlock: {
        events: eventList,
        rowCount: eventRowCount,
        startRow: eventStartRow,
      },
      lastRow: eventStartRow + eventRowCount,
    }
  }, [crops, events])

  // 当月の 2 列 (上旬・下旬) を覆うハイライト帯の grid-column。ラベル列ぶん +1。
  const bandColumn = `${1 + (currentMonth - 1) * 2 + 1} / span 2`

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[44rem] items-stretch"
          style={{
            gridTemplateColumns: `minmax(5.5rem, max-content) repeat(${MONTH_COLUMNS}, minmax(1rem, 1fr))`,
            gridAutoRows: '2.5rem',
          }}
        >
          {/* 当月ハイライト帯 (ヘッダー下から最下行まで) */}
          <div
            data-testid="current-month-band"
            aria-hidden="true"
            className="pointer-events-none rounded-md bg-sunlight-soft/50"
            style={{ gridColumn: bandColumn, gridRow: `2 / ${lastRow}` }}
          />

          {/* 月ごとの縦グリッド線 */}
          {MONTH_LABELS.map((label, i) => (
            <div
              key={`vline-${label}`}
              aria-hidden="true"
              className="pointer-events-none border-l border-primary/10"
              style={{ gridColumn: 2 + i * 2, gridRow: `1 / ${lastRow}` }}
            />
          ))}
          {/* 右端の閉じ線 */}
          <div
            aria-hidden="true"
            className="pointer-events-none border-r border-primary/10"
            style={{ gridColumn: '25 / 26', gridRow: `1 / ${lastRow}` }}
          />

          {/* 作物・イベントブロックの区切り線 (先頭以外の各ブロック上端) */}
          {[...cropBlocks.slice(1), eventBlock].map((block, i) => (
            <div
              key={`sep-${i}`}
              aria-hidden="true"
              className="pointer-events-none self-start border-t border-primary/15"
              style={{ gridColumn: '1 / -1', gridRow: block.startRow }}
            />
          ))}

          {/* ヘッダー: 月ラベル */}
          <div className="sticky left-0 z-20 bg-base" style={{ gridRow: 1 }} />
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
          {cropBlocks.map(({ crop, tasks, rowCount, startRow }) => (
            <div key={crop.id} style={{ display: 'contents' }}>
              <div
                className="sticky left-0 z-20 flex items-center gap-1 bg-base pr-2 text-sm text-body"
                style={{
                  gridColumn: 1,
                  gridRow: `${startRow} / span ${rowCount}`,
                }}
              >
                {crop.emoji && (
                  <span aria-hidden="true" className="text-base">
                    {crop.emoji}
                  </span>
                )}
                <span className="font-serif">{crop.name}</span>
              </div>
              {tasks.map((task, i) => (
                <TaskBar
                  key={`${crop.id}-${task.label}-${task.start}`}
                  crop={crop}
                  task={task}
                  row={startRow + i}
                  isSelected={
                    selected?.cropName === crop.name &&
                    selected?.task.label === task.label
                  }
                  detailId={detailId}
                  onSelect={setSelected}
                />
              ))}
            </div>
          ))}

          {/* イベントレーン */}
          <div
            className="sticky left-0 z-20 flex items-center bg-base pr-2 text-sm text-body"
            style={{
              gridColumn: 1,
              gridRow: `${eventBlock.startRow} / span ${eventBlock.rowCount}`,
            }}
          >
            <span className="font-serif">地域の行事</span>
          </div>
          {eventBlock.events.map((event, i) => (
            <EventBar
              key={event.id}
              event={event}
              row={eventBlock.startRow + i}
            />
          ))}
        </div>
      </div>

      {/* 選択中の作業の詳細 (カレンダー直下。選択時にここへスクロール) */}
      <div ref={detailRef} id={detailId} aria-live="polite" className="mt-5">
        {selected && (
          <TaskDetail selected={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {/* 凡例 */}
      <Legend crops={cropBlocks.map((b) => b.crop)} />
    </div>
  )
}

/** バーの横に置くラベル。狭いバーでも読めるよう、バーの外側へオーバーフローさせる。 */
function BarLabel({ end, children }: { end: number; children: string }) {
  const left = labelOnLeft(end)
  return (
    <span
      className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-body ${
        left ? 'right-full mr-1.5 text-right' : 'left-full ml-1.5'
      }`}
    >
      {children}
    </span>
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
  // ボランティア歓迎の作業は塗りで強調、それ以外は淡色＋破線で控えめに。
  const style = task.volunteer
    ? { backgroundColor: crop.color }
    : {
        backgroundColor: `${crop.color}26`,
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
      className={`relative my-1 flex h-6 items-center justify-center self-center overflow-visible rounded-full transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isSelected ? 'ring-2 ring-accent ring-offset-1' : ''
      }`}
      style={{
        ...style,
        gridColumn: barColumn(task.start, task.end),
        gridRow: row,
      }}
    >
      {task.volunteer && (
        <span aria-hidden="true" className="text-[0.7rem] leading-none">
          🙌
        </span>
      )}
      <BarLabel end={task.end}>{task.label}</BarLabel>
    </button>
  )
}

function EventBar({ event, row }: { event: CalendarEvent; row: number }) {
  return (
    <div
      data-testid="event-bar"
      title={event.note}
      className="relative my-1 flex h-6 items-center justify-center self-center overflow-visible rounded-md border border-dashed border-sky bg-sky-soft text-xs text-primary-deep"
      style={{ gridColumn: barColumn(event.start, event.end), gridRow: row }}
    >
      <span aria-hidden="true" className="text-[0.7rem] leading-none">
        ◆
      </span>
      <BarLabel end={event.end}>{event.name}</BarLabel>
    </div>
  )
}

function Legend({ crops }: { crops: CalendarCrop[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-body">
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
      className="rounded-3xl border border-primary/10 bg-surface p-5 shadow-lg"
      style={{ borderTopColor: color, borderTopWidth: '4px' }}
    >
      <span className="mb-3 flex w-fit items-center gap-1 rounded-full bg-sunlight-soft px-3 py-0.5 font-serif text-xs tracking-wide text-primary-deep before:text-[0.6rem] before:text-accent-strong before:content-['▲']">
        選択中の作業
      </span>
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
