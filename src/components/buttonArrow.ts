/**
 * Button の末尾矢印を href から決める純粋関数。
 *
 * 別ページへ遷移するボタンには「遷移する」ことが直感的に伝わるよう矢印アイコンを付ける。
 * - 内部ページ (/...): 'internal' → 短い右矢印 (サイト内で次のページへ前進)
 * - 外部リンク (http...): 'external' → 四角から斜めに飛び出す矢印 (別タブ・外部サイトへ)
 * - 同一ページ内アンカー (#...): null (ページ遷移ではなくスクロールのため矢印なし)
 *
 * `override` を渡すと自動判定を上書きできる (true=矢印あり / false=矢印なし)。
 * 「戻る」など前進の意味にそぐわないボタンは呼び出し側で false を指定する。
 * (アイコンの実体は Button.astro の SVG。ここでは種別のみ決める)
 */
export type ButtonArrowKind = 'internal' | 'external'

export function resolveButtonArrow(
  href: string,
  override?: boolean,
): ButtonArrowKind | null {
  const external = href.startsWith('http')
  const anchor = href.startsWith('#')
  const showArrow = override ?? !anchor
  if (!showArrow) return null
  return external ? 'external' : 'internal'
}
