/**
 * Button の末尾矢印を href から決める純粋関数。
 *
 * 別ページへ遷移するボタンには「遷移する」ことが直感的に伝わるよう矢印を付ける。
 * - 内部ページ (/...): → (サイト内で次のページへ前進)
 * - 外部リンク (http...): ↗ (別タブ・外部サイトへ。SiteHeader の外部リンク表記と統一)
 * - 同一ページ内アンカー (#...): なし (ページ遷移ではなくスクロールのため)
 *
 * `override` を渡すと自動判定を上書きできる (true=矢印あり / false=矢印なし)。
 * 「戻る」など前進の意味にそぐわないボタンは呼び出し側で false を指定する。
 */
export type ButtonArrow = {
  /** 外部リンク (別タブ) かどうか */
  external: boolean
  /** 表示するグリフ */
  glyph: '→' | '↗'
}

export function resolveButtonArrow(
  href: string,
  override?: boolean,
): ButtonArrow | null {
  const external = href.startsWith('http')
  const anchor = href.startsWith('#')
  const showArrow = override ?? !anchor
  if (!showArrow) return null
  return external
    ? { external: true, glyph: '↗' }
    : { external: false, glyph: '→' }
}
