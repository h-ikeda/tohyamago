import type { CalendarCrop, Intensity } from './FarmCalendar'

/**
 * homeTasks — トップページ「今月の活動」プレビュー用のロジック。
 *
 * 農作業カレンダー (crops コレクション) から「指定月に参加できる作業」を抽出する。
 * Astro フロントマター (ビルド時) で使うが、月またぎや境界の判定を回帰テストできるよう
 * 純粋関数として切り出す (CLAUDE.md「インラインのロジックは *.ts へ分離してテスト可能に」)。
 *
 * 作業期間は月.旬 (整数=上旬 / .1=中旬 / .2=下旬) で持つため、ある月 N は
 * 区間 [N.0, N.2] を覆うものとして重なり判定する。
 */

export interface ActiveTask {
  cropId: string
  cropName: string
  emoji?: string
  color: string
  label: string
  intensity: Intensity
  note?: string
}

export interface MonthTasks {
  /** 1〜12。当月に作業が無い場合は最も近い先の月。 */
  month: number
  tasks: ActiveTask[]
}

/** 作業期間 [start, end] (月.旬) が指定月 (1〜12) に重なるか。 */
export function isTaskInMonth(
  task: { start: number; end: number },
  month: number,
): boolean {
  // 月 N は [N.0 .. N.2] を覆う。区間の重なりで判定する。
  return task.start <= month + 0.2 && task.end >= month
}

/** 指定月に参加できる作業を、作物の表示順 (order) で平坦化して返す。 */
export function tasksInMonth(
  crops: CalendarCrop[],
  month: number,
): ActiveTask[] {
  return [...crops]
    .sort((a, b) => a.order - b.order)
    .flatMap((crop) =>
      crop.tasks
        .filter((task) => isTaskInMonth(task, month))
        .map((task) => ({
          cropId: crop.id,
          cropName: crop.name,
          emoji: crop.emoji,
          color: crop.color,
          label: task.label,
          intensity: task.intensity,
          note: task.note,
        })),
    )
}

/**
 * fromMonth (当月) を起点に、参加できる作業がある最も近い月を返す。
 * 当月に作業があれば当月、無ければ翌月以降を 12 か月ぶん探索する。
 * 作業が一つも無い場合は当月と空配列を返す。
 */
export function upcomingTasks(
  crops: CalendarCrop[],
  fromMonth: number,
): MonthTasks {
  for (let offset = 0; offset < 12; offset++) {
    const month = ((fromMonth - 1 + offset) % 12) + 1
    const tasks = tasksInMonth(crops, month)
    if (tasks.length > 0) return { month, tasks }
  }
  return { month: fromMonth, tasks: [] }
}
