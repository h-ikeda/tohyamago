import { describe, it, expect } from 'vitest'
import {
  SITE_URL,
  SITE_NAME,
  buildTitle,
  absoluteUrl,
  canonicalPath,
  normalizeDescription,
  organizationJsonLd,
  websiteJsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from './siteMeta'

describe('buildTitle', () => {
  it('タイトル指定時は団体名を接尾辞に付ける', () => {
    expect(buildTitle('活動趣旨')).toBe(`活動趣旨 | ${SITE_NAME}`)
  })

  it('未指定・空白のみのときは団体名のみ', () => {
    expect(buildTitle()).toBe(SITE_NAME)
    expect(buildTitle('   ')).toBe(SITE_NAME)
  })

  it('前後の空白はトリムする', () => {
    expect(buildTitle('  近況  ')).toBe(`近況 | ${SITE_NAME}`)
  })
})

describe('absoluteUrl', () => {
  it('ルート相対パスを正規オリジンの絶対 URL にする', () => {
    expect(absoluteUrl('/news')).toBe(`${SITE_URL}/news`)
  })

  it('基点 URL を差し替えられる', () => {
    expect(absoluteUrl('/news', 'https://example.com')).toBe(
      'https://example.com/news',
    )
  })

  it('既に絶対 URL ならそのまま返す', () => {
    expect(absoluteUrl('https://shop.tohyamago.org')).toBe(
      'https://shop.tohyamago.org/',
    )
  })
})

describe('canonicalPath', () => {
  it('/index.html はルート / に正規化する', () => {
    expect(canonicalPath('/index.html')).toBe('/')
  })

  it('末尾の .html を落とす', () => {
    expect(canonicalPath('/purpose.html')).toBe('/purpose')
    expect(canonicalPath('/news/2024-05-01.html')).toBe('/news/2024-05-01')
  })

  it('.html が無いパスはそのまま (末尾スラッシュのみ除去)', () => {
    expect(canonicalPath('/purpose')).toBe('/purpose')
    expect(canonicalPath('/news/')).toBe('/news')
    expect(canonicalPath('/')).toBe('/')
  })
})

describe('normalizeDescription', () => {
  it('改行・連続空白を 1 つの空白に均す', () => {
    expect(normalizeDescription('あ\n\nい  う')).toBe('あ い う')
  })

  it('最大長を超えると末尾を省略記号にする', () => {
    const text = 'あ'.repeat(130)
    const result = normalizeDescription(text, 120)
    expect(result.length).toBe(121) // 120 文字 + 「…」
    expect(result.endsWith('…')).toBe(true)
  })

  it('最大長以内はそのまま', () => {
    expect(normalizeDescription('短い説明', 120)).toBe('短い説明')
  })
})

describe('organizationJsonLd', () => {
  it('Organization 型と基本属性を持つ', () => {
    const data = organizationJsonLd()
    expect(data['@type']).toBe('Organization')
    expect(data.name).toBe(SITE_NAME)
    expect(data.url).toBe(`${SITE_URL}/`)
    expect(Array.isArray(data.sameAs)).toBe(true)
  })

  it('住所を PostalAddress として構造化する', () => {
    const address = organizationJsonLd().address as Record<string, unknown>
    expect(address['@type']).toBe('PostalAddress')
    expect(address.addressCountry).toBe('JP')
    expect(address.postalCode).toBe('399-1311')
  })

  it('基点 URL を差し替えるとロゴ URL も追従する', () => {
    const data = organizationJsonLd('https://example.com')
    expect(data.logo).toBe('https://example.com/favicon.svg')
  })
})

describe('websiteJsonLd', () => {
  it('WebSite 型でサイト名・言語を持つ', () => {
    const data = websiteJsonLd()
    expect(data['@type']).toBe('WebSite')
    expect(data.name).toBe(SITE_NAME)
    expect(data.inLanguage).toBe('ja')
  })
})

describe('articleJsonLd', () => {
  const base = {
    title: '茶摘みのようす',
    description: '新茶の手摘みをしました。',
    url: `${SITE_URL}/news/2024-05-01`,
    datePublished: '2024-05-01T00:00:00.000Z',
  }

  it('BlogPosting として見出し・URL・公開日を構造化する', () => {
    const data = articleJsonLd(base)
    expect(data['@type']).toBe('BlogPosting')
    expect(data.headline).toBe('茶摘みのようす')
    expect(data.url).toBe(base.url)
    expect(data.datePublished).toBe(base.datePublished)
  })

  it('画像があれば image を、なければ省く', () => {
    expect(articleJsonLd(base).image).toBeUndefined()
    const withImage = articleJsonLd({
      ...base,
      image: `${SITE_URL}/_astro/tea.jpg`,
    })
    expect(withImage.image).toBe(`${SITE_URL}/_astro/tea.jpg`)
  })

  it('タグは keywords にまとめる', () => {
    const data = articleJsonLd({ ...base, tags: ['茶摘み', '下栗'] })
    expect(data.keywords).toBe('茶摘み, 下栗')
  })

  it('タグが空なら keywords を出さない', () => {
    expect(articleJsonLd({ ...base, tags: [] }).keywords).toBeUndefined()
  })
})

describe('breadcrumbJsonLd', () => {
  it('順序付きの ListItem を 1 始まりで生成する', () => {
    const data = breadcrumbJsonLd([
      { name: 'トップ', url: `${SITE_URL}/` },
      { name: '近況', url: `${SITE_URL}/news` },
    ])
    expect(data['@type']).toBe('BreadcrumbList')
    const items = data.itemListElement as Record<string, unknown>[]
    expect(items).toHaveLength(2)
    expect(items[0].position).toBe(1)
    expect(items[1].position).toBe(2)
    expect(items[1].name).toBe('近況')
  })
})
