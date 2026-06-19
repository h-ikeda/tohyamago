/**
 * imageFadeIn — 写真の「遅延感」をやわらげるフェードイン制御 (クライアント側)。
 *
 * レスポンシブ画像 (srcset/sizes) でモバイルの転送量を削れても、低速回線では
 * 画像が「カクッ」と差し込まれて表示される。そこで、まだ読み込めていない画像は
 * 一旦透明にしておき、読み込み完了時にふわっとフェードインさせて遅延感を消す。
 * (古いインターレース/プログレッシブ JPEG の「徐々に表示」に相当する現代的手法。
 *  出力が webp のため真のプログレッシブは効かないので、表示の滑らかさで代替する。)
 *
 * プログレッシブエンハンスメント: ルート要素 (<html>) に `js` クラスが付いている
 * 場合のみ CSS 側で `img[data-fade-in]` を透明化する。JS 無効時はクラスが付かず
 * 画像はそのまま表示される。本関数は完了時に `is-loaded` を付けて表示へ戻す。
 *
 * DOM 操作を純粋な形で切り出し jsdom でテストできるようにしている
 * (newsArchiveFilter などと同じ方針)。
 */

/** 画像が既に読み込み済み (キャッシュ等) かどうか。 */
function isAlreadyLoaded(img: HTMLImageElement): boolean {
  // complete は src 未設定でも true になりうるため naturalWidth も併せて確認する。
  return img.complete && img.naturalWidth > 0
}

/** 1 枚の画像にフェードイン挙動を割り当てる。 */
function setupImage(img: HTMLImageElement): void {
  if (img.dataset.fadeBound === 'true') return // 二重バインド防止
  img.dataset.fadeBound = 'true'

  if (isAlreadyLoaded(img)) {
    img.classList.add('is-loaded')
    return
  }

  const reveal = () => img.classList.add('is-loaded')
  // load で表示。読み込み失敗時も透明のままにせず表示へ戻す (alt や枠を見せる)。
  img.addEventListener('load', reveal, { once: true })
  img.addEventListener('error', reveal, { once: true })
}

/**
 * root 配下の `img[data-fade-in]` すべてにフェードインを割り当てる。
 * 戻り値は処理対象となった画像枚数 (テスト用)。
 */
export function initImageFadeIn(root: ParentNode = document): number {
  const images = root.querySelectorAll<HTMLImageElement>('img[data-fade-in]')
  images.forEach(setupImage)
  return images.length
}
