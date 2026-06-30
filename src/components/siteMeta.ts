/**
 * サイト共通のメタ情報と、検索エンジン / SNS / AI 検索向けの構造化データ
 * (JSON-LD) を組み立てる純粋関数群。Astro へ依存しないため Vitest で検証できる。
 *
 * 背景: 新規来訪者の多くは検索結果やフォーラム / SNS のシェアカードを入口にする。
 * その第一印象を決める meta description / OGP / Twitter Card / 構造化データを
 * 一元管理し、各ページから上書きできるようにする (issue #215)。
 */

/**
 * 本番サイトの正規オリジン (canonical / 絶対 URL の基点)。
 * 値はビルド変数 PUBLIC_SITE_URL で上書きでき、未設定時は本番ドメインにフォールバック
 * する。プレビュー・本番とも同じ PUBLIC_SITE_URL を参照し、常に本番 URL を使う方針の
 * ため、ブランチによる出し分けはしない。astro.config.mjs の `site` と同じ既定値・同じ
 * 環境変数を使うこと。
 */
export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || 'https://www.tohyamago.org'

/** 正式名称。<title> 接尾辞・og:site_name・構造化データの組織名に使う。 */
export const SITE_NAME = '一般社団法人遠山郷応援会'

/** 通称 (検索・AI 引用で扱いやすい短い別名)。 */
export const SITE_ALT_NAME = '遠山郷応援会'

/**
 * 既定の meta description。ページ側で description を渡さないときの値。
 * コピー指針に沿い「場所・モノ」より「活動と人のつながり・行動」を主語にする。
 */
export const DEFAULT_DESCRIPTION =
  '長野県飯田市・遠山郷で、山あいの景観と暮らし、受け継がれてきた文化を守り継ぐ活動をしています。下栗の里の畑づくりや季節の手仕事に、はじめての方も一日から参加できます。一般社団法人遠山郷応援会の公式サイトです。'

/** ブランドカラー (theme-color)。global.css の --color-primary-deep と一致させる。 */
export const THEME_COLOR = '#1a7152'

/** 既定の言語ロケール (og:locale)。 */
export const SITE_LOCALE = 'ja_JP'

/**
 * OG / Twitter カード画像の推奨サイズ (px)。
 * BaseLayout の og:image 生成と記事ページの JSON-LD 画像で共有し、
 * 両者が同一の最適化画像 (同じハッシュの出力) を指すようにする。
 */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** 同一団体を指す外部プロフィール (構造化データの sameAs)。 */
export const SAME_AS = [
  'https://shop.tohyamago.org',
  'https://activo.jp/s/a/119414',
]

/**
 * ページ <title> を「○○ | 一般社団法人遠山郷応援会」へ整形する。
 * title 未指定 (トップ) では団体名のみを返す。
 */
export function buildTitle(title?: string): string {
  const trimmed = title?.trim()
  return trimmed ? `${trimmed} | ${SITE_NAME}` : SITE_NAME
}

/**
 * パス (または絶対 URL) を正規オリジン基準の絶対 URL へ解決する。
 * 既に絶対 URL ならそのまま正規化して返す。
 */
export function absoluteUrl(path: string, siteUrl: string = SITE_URL): string {
  return new URL(path, siteUrl).href
}

/**
 * ビルド時の Astro.url.pathname を、実際に公開される URL へ正規化する。
 * 本サイトは build.format='file' + trailingSlash='never' のため、Astro.url は
 * `/purpose.html` や `/index.html` を返すが、Cloudflare は `/purpose`・`/` で配信する。
 * canonical / og:url が実 URL と食い違うと評価が分散するため、`.html` と
 * 末尾スラッシュを落としてルートは `/` に揃える。
 */
export function canonicalPath(pathname: string): string {
  let path = pathname
  if (path.endsWith('/index.html')) {
    path = path.slice(0, -'index.html'.length)
  } else if (path.endsWith('.html')) {
    path = path.slice(0, -'.html'.length)
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }
  return path === '' ? '/' : path
}

/**
 * description を検索スニペット向けに 1 行へ均し、最大長で切り詰める。
 * 改行・連続空白を 1 つにまとめ、超過時は末尾を「…」で省略する。
 */
export function normalizeDescription(text: string, maxLength = 120): string {
  const plain = text.replace(/\s+/g, ' ').trim()
  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength).trimEnd() + '…'
}

/**
 * 団体そのものを表す Organization 構造化データ。
 * 全ページに出力し、検索エンジン / AI に「誰が運営する何のサイトか」を伝える。
 */
export function organizationJsonLd(
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: SITE_ALT_NAME,
    url: absoluteUrl('/', siteUrl),
    logo: absoluteUrl('/favicon.svg', siteUrl),
    image: absoluteUrl('/favicon.svg', siteUrl),
    email: 'receive@tohyamago.org',
    telephone: '+81-50-5236-0637',
    description: DEFAULT_DESCRIPTION,
    foundingDate: '2024-10-01',
    address: {
      '@type': 'PostalAddress',
      postalCode: '399-1311',
      addressCountry: 'JP',
      addressRegion: '長野県',
      addressLocality: '飯田市',
      streetAddress: '南信濃和田1239番地',
    },
    areaServed: '遠山郷 (長野県飯田市南信濃・上村)',
    sameAs: SAME_AS,
  }
}

/**
 * サイト全体を表す WebSite 構造化データ。
 * AI 検索やナレッジパネルがサイト名・言語を把握しやすくする。
 */
export function websiteJsonLd(
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: SITE_ALT_NAME,
    url: absoluteUrl('/', siteUrl),
    inLanguage: 'ja',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  }
}

/** 近況記事ページ向けの引数。 */
export interface ArticleJsonLdInput {
  title: string
  description: string
  url: string
  /** OG 画像の絶対 URL。 */
  image?: string
  datePublished: string
  tags?: string[]
}

/**
 * 近況記事 (/news/[slug]) を表す BlogPosting 構造化データ。
 * 公開日・著者・画像を構造化し、AI 検索の引用・要約に使われやすくする。
 */
export function articleJsonLd(
  input: ArticleJsonLdInput,
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    inLanguage: 'ja',
    datePublished: input.datePublished,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg', siteUrl),
      },
    },
  }
  if (input.image) data.image = input.image
  if (input.tags && input.tags.length > 0) data.keywords = input.tags.join(', ')
  return data
}

/** パンくず 1 項目 (名前と絶対 URL)。 */
export interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * パンくず構造化データ (BreadcrumbList)。
 * 検索結果のパンくず表示や、AI のサイト構造理解を助ける。
 */
export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * JSON-LD を <script type="application/ld+json"> へ安全に埋め込むための文字列化。
 * Astro の set:html は自動エスケープしないため、`<` を `\\u003C` に置換して
 * 本文に `</script>` 相当の文字列が含まれてもスクリプトブロックが早期終了しない
 * ようにする (構造化データの破損・XSS 防止)。
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003C')
}
