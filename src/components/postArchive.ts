/**
 * 近況アーカイブ (年別) の集計を行う純粋関数群。
 * 記事スキーマにはタグ・カテゴリが無いため、後方互換を保てる
 * 「公開年」を切り口に、これまでの歩みをたどれるアーカイブを組み立てる。
 */

/** 年でまとめた記事グループ。 */
export interface YearGroup<T> {
  year: number
  posts: T[]
}

/**
 * 記事を公開年でグループ化し、新しい年が先頭に来るよう並べる。
 * 各グループ内の記事は、入力の並び順をそのまま保持する
 * (呼び出し側で新しい順にソート済みの配列を渡す想定)。
 *
 * @param posts date を持つ記事の配列
 * @returns 年の降順に並んだ {year, posts} の配列
 */
export function groupPostsByYear<T extends { data: { date: Date } }>(
  posts: T[],
): YearGroup<T>[] {
  const byYear = new Map<number, T[]>()
  for (const post of posts) {
    // UTC 基準。日付は ISO 8601 (Z) 保存のため、実行 TZ に依存させない。
    const year = post.data.date.getUTCFullYear()
    const group = byYear.get(year)
    if (group) {
      group.push(post)
    } else {
      byYear.set(year, [post])
    }
  }
  return [...byYear.entries()]
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year)
}
