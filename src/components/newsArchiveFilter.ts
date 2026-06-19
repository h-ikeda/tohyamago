/**
 * 近況アーカイブ (年別) の季節フィルタ — クライアント側 DOM 操作ロジック。
 * インライン script から呼ぶ処理を分離し、jsdom でテスト可能にする。
 *
 * 期待する DOM 構造:
 *   [data-archive]
 *     [data-season-filter="all|spring|summer|autumn|winter"]  … フィルタボタン
 *     [data-year-nav="2019"]                                  … 年ジャンプ項目
 *     [data-year-section][data-year="2019"]
 *       [data-count]                                          … 件数表示
 *       [data-season="spring"] …                              … 各記事
 *
 * JS が無くても全件表示される (プログレッシブエンハンスメント)。
 *
 * @param root アーカイブ全体のルート要素
 * @param season 選択中の季節。'all' は全表示。
 */
export function applySeasonFilter(root: ParentNode, season: string): void {
  // 各記事の表示/非表示を切り替える
  root.querySelectorAll<HTMLElement>('[data-season]').forEach((el) => {
    el.hidden = season !== 'all' && el.dataset.season !== season
  })

  // 年セクションは可視記事が 0 件なら隠し、件数表示と年ナビ項目も同期する
  root.querySelectorAll<HTMLElement>('[data-year-section]').forEach((sec) => {
    const visible = sec.querySelectorAll('[data-season]:not([hidden])').length
    sec.hidden = visible === 0

    const count = sec.querySelector<HTMLElement>('[data-count]')
    if (count) count.textContent = String(visible)

    const year = sec.dataset.year
    if (year) {
      const nav = root.querySelector<HTMLElement>(`[data-year-nav="${year}"]`)
      if (nav) nav.hidden = visible === 0
    }
  })

  // フィルタボタンの押下状態を更新 (aria-pressed で見た目も切り替わる)
  root.querySelectorAll<HTMLElement>('[data-season-filter]').forEach((btn) => {
    btn.setAttribute(
      'aria-pressed',
      String(btn.dataset.seasonFilter === season),
    )
  })
}
