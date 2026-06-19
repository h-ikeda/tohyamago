/**
 * 近況アーカイブ (/news) で記事の合間に「次は、あなたの番です」CTA を
 * 差し込む位置を決める純粋関数。記事一覧が縦に長くなりすぎて末尾の CTA に
 * 辿り着けない問題への対策として、一定間隔で CTA を再登場させる。
 *
 * - `every` 件ごとに記事の直後へ CTA を 1 つ挿入する。
 * - 最終記事の直後 (index === total - 1) には挿入しない。
 *   ページ末尾には本 CTA を別途置くため、重複を避ける。
 *
 * @param total 記事の総数
 * @param every CTA を挟む間隔 (記事数)。0 以下なら挿入しない。
 * @returns CTA を直後に表示する記事インデックス (0 始まり) の Set
 */
export function ctaPositions(total: number, every: number): Set<number> {
  const positions = new Set<number>()
  if (every <= 0) return positions
  for (let i = every - 1; i < total - 1; i += every) {
    positions.add(i)
  }
  return positions
}
