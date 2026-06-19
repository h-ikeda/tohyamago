const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * 記事の日付を「YYYY年M月D日(曜)」形式の文字列に整形する純粋関数。
 * 近況一覧・記事個別ページ・アーカイブで共通して使う。
 *
 * 日付は frontmatter に UTC (ISO 8601 の Z) で保存されるため、UTC 基準で
 * 取り出す。これにより SSG の実行タイムゾーンに依存せず、年グループ化
 * (postArchive) や季節判定 (postSeason) とも基準を揃えられる。
 *
 * @param date 記事の公開日 (frontmatter の date)
 * @returns 例: 2018年8月11日(土)
 */
export function formatPostDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const weekday = WEEKDAYS[date.getUTCDay()]
  return `${year}年${month}月${day}日(${weekday})`
}
