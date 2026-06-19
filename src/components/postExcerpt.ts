/**
 * 記事本文 (Markdown) から一覧カード用のプレーンテキスト抜粋を作る純粋関数。
 * 近況は Facebook 風の短い投稿が多いため、装飾記法を落として 1 行に均し、
 * 指定文字数で切り詰める。写真のみの投稿など本文が空なら空文字を返す。
 *
 * @param body 記事の生 Markdown 本文 (CollectionEntry.body)。未定義可。
 * @param maxLength 抜粋の最大文字数 (これを超えると末尾を「…」で省略)。
 * @returns 1 行に均したプレーンテキスト抜粋。本文が無ければ空文字。
 */
export function postExcerpt(body: string | undefined, maxLength = 80): string {
  if (!body) return ''
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 画像記法を除去
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // リンクは表示テキストだけ残す
    .replace(/[#*_>`~]/g, '') // 見出し・強調・引用などの装飾記号
    .replace(/\s+/g, ' ') // 改行・連続空白を 1 つの空白へ
    .trim()
  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength).trimEnd() + '…'
}
