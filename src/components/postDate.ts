const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * 記事の日付を「YYYY年M月D日(曜)」形式の文字列に整形する純粋関数。
 * 近況一覧・記事個別ページ・アーカイブで共通して使う。
 *
 * @param date 記事の公開日 (frontmatter の date)
 * @returns 例: 2018年8月11日(土)
 */
export function formatPostDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAYS[date.getDay()]
  return `${year}年${month}月${day}日(${weekday})`
}
