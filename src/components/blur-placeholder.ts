/**
 * blur-placeholder — ビルド時に画像の LQIP (Low Quality Image Placeholder) を生成する。
 *
 * 元画像を極小サイズ (幅 ~20px) に縮小した webp を base64 data URI 化し、
 * 本画像の読み込み前に「ぼかした下絵」として即時表示する (blur-up)。
 * これにより低速回線でも白い空白やカクッとした差し込みが起きず、遅延感が消える。
 *
 * Astro が画像インポートに渡す ImageMetadata は (公開型には無いが) 元ファイルの
 * 絶対パス `fsPath` を Proxy 経由で保持しているため、それを sharp で読み取る。
 * この関数はサーバー (ビルド/dev) 側でのみ評価され、クライアントには出力されない。
 */
import sharp from 'sharp'
import type { ImageMetadata } from 'astro'

/** ImageMetadata に内部的に付く元ファイルの絶対パス。 */
type ImageWithPath = ImageMetadata & { fsPath?: string }

// 同一画像 (farm.jpg など複数ページで再利用) の再生成を避けるためのキャッシュ。
// キーは fsPath、値は data URI の Promise。
const cache = new Map<string, Promise<string>>()

/** 下絵の幅 (px)。小さいほど軽く・ぼけるが、20px 前後が定番。 */
const PLACEHOLDER_WIDTH = 20

async function generate(fsPath: string): Promise<string> {
  try {
    const buffer = await sharp(fsPath)
      .resize(PLACEHOLDER_WIDTH) // 高さは縦横比を保って自動
      .webp({ quality: 40 })
      .toBuffer()
    return `data:image/webp;base64,${buffer.toString('base64')}`
  } catch {
    // 生成に失敗しても本画像の表示は妨げない (下絵なしで続行)。
    return ''
  }
}

/**
 * 画像の LQIP data URI を返す。生成できない場合は空文字。
 * 同じ元画像に対しては一度だけ生成してキャッシュする。
 */
export function getBlurDataURL(image: ImageMetadata): Promise<string> {
  const fsPath = (image as ImageWithPath).fsPath
  if (!fsPath) return Promise.resolve('')

  const cached = cache.get(fsPath)
  if (cached) return cached

  // 生成に失敗 (空文字) したらキャッシュから外し、次回の再試行を許す。
  // 成功した data URI のみ再利用する。
  const result = generate(fsPath).then((dataUrl) => {
    if (!dataUrl) cache.delete(fsPath)
    return dataUrl
  })
  cache.set(fsPath, result)
  return result
}
