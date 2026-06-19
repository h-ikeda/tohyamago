/**
 * 記事の日付を季節に分類する純粋関数。季節はタグではなく日付から決まるため、
 * 記事スキーマを拡張せずに分類でき、後方互換を保てる。
 *
 * 季節の境界 (両端を含む):
 *  - 春 spring : 3/1 〜 6/20
 *  - 夏 summer : 6/21 〜 9/15
 *  - 秋 autumn : 9/16 〜 12/5
 *  - 冬 winter : 12/6 〜 翌 2 月末 (年をまたぐ)
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SeasonMeta {
  id: Season
  /** 表示ラベル (春/夏/秋/冬) */
  label: string
  /** おおよその期間 (UI の補足表示用) */
  range: string
}

/** 春→夏→秋→冬 の表示順。フィルタ UI・グループ化で共用する。 */
export const SEASONS: readonly SeasonMeta[] = [
  { id: 'spring', label: '春', range: '3月〜6月' },
  { id: 'summer', label: '夏', range: '6月〜9月' },
  { id: 'autumn', label: '秋', range: '9月〜12月' },
  { id: 'winter', label: '冬', range: '12月〜2月' },
]

const SEASON_LABEL: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

/**
 * 日付を季節に分類する。月日を MMDD の整数 (例: 6/21 → 621) に直して
 * 範囲比較する。月内では日付順が崩れないため、この比較で境界を表現できる。
 */
export function getSeason(date: Date): Season {
  const md = (date.getMonth() + 1) * 100 + date.getDate()
  if (md >= 301 && md <= 620) return 'spring'
  if (md >= 621 && md <= 915) return 'summer'
  if (md >= 916 && md <= 1205) return 'autumn'
  return 'winter' // 12/6〜12/31 と 1/1〜2 月末
}

/** 季節の表示ラベル (春/夏/秋/冬) を返す。 */
export function seasonLabel(season: Season): string {
  return SEASON_LABEL[season]
}
