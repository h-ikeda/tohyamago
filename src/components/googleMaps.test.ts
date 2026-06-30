import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mapSearchUrl,
  directionsUrl,
  googleMapsLoaderUrl,
  placeInfoWindowContent,
  type MapPlace,
} from './googleMaps'

type GoogleGlobal = { google?: { maps: typeof google.maps } }

describe('mapSearchUrl / directionsUrl', () => {
  it('検索 URL は query をエンコードして載せる', () => {
    expect(mapSearchUrl('下栗 1296')).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('下栗 1296')}`,
    )
  })

  it('経路 URL は destination と travelmode を持つ', () => {
    const url = directionsUrl('下栗')
    expect(url).toContain(`destination=${encodeURIComponent('下栗')}`)
    expect(url).toContain('travelmode=driving')
  })
})

describe('googleMapsLoaderUrl', () => {
  it('key・v・loading を必ず含み、未指定の任意項目は載せない', () => {
    const url = googleMapsLoaderUrl('abc')
    expect(url.startsWith('https://maps.googleapis.com/maps/api/js?')).toBe(
      true,
    )
    expect(url).toContain('key=abc')
    expect(url).toContain('v=weekly')
    expect(url).toContain('loading=async')
    expect(url).not.toContain('libraries=')
    expect(url).not.toContain('language=')
    expect(url).not.toContain('region=')
  })

  it('libraries・language・region は指定時のみ載せる', () => {
    const url = googleMapsLoaderUrl('abc', {
      libraries: ['marker', 'places'],
      language: 'ja',
      region: 'JP',
    })
    expect(url).toContain('libraries=marker%2Cplaces')
    expect(url).toContain('language=ja')
    expect(url).toContain('region=JP')
  })
})

describe('placeInfoWindowContent', () => {
  const place: MapPlace = {
    name: '下栗の里',
    lat: 35.3,
    lng: 137.9,
    address: '長野県飯田市上村下栗',
    query: '下栗1296',
  }

  it('名称・住所・経路/地図リンクを含む', () => {
    const html = placeInfoWindowContent(place)
    expect(html).toContain('下栗の里')
    expect(html).toContain('長野県飯田市上村下栗')
    expect(html).toContain(directionsUrl('下栗1296'))
    expect(html).toContain(mapSearchUrl('下栗1296'))
  })

  it('住所が無ければ住所行を出さない', () => {
    const html = placeInfoWindowContent({ ...place, address: undefined })
    expect(html).not.toContain('長野県')
  })

  it('名称の HTML 特殊文字をエスケープする', () => {
    const html = placeInfoWindowContent({ ...place, name: 'A & <b>' })
    expect(html).toContain('A &amp; &lt;b&gt;')
    expect(html).not.toContain('<b>')
  })
})

describe('loadGoogleMaps', () => {
  let appendSpy: ReturnType<typeof vi.spyOn>
  let scripts: HTMLScriptElement[]

  beforeEach(() => {
    // モジュール内のローダ Promise キャッシュをテストごとにリセットする。
    vi.resetModules()
    scripts = []
    appendSpy = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => {
        scripts.push(node as HTMLScriptElement)
        return node
      })
    delete (globalThis as unknown as GoogleGlobal).google
  })

  afterEach(() => {
    appendSpy.mockRestore()
    delete (globalThis as unknown as GoogleGlobal).google
  })

  it('スクリプトを挿入し、load 後に google.maps で解決する', async () => {
    const { loadGoogleMaps } = await import('./googleMaps')
    const promise = loadGoogleMaps('KEY')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toContain('key=KEY')

    const fakeMaps = {} as unknown as typeof google.maps
    ;(globalThis as unknown as GoogleGlobal).google = { maps: fakeMaps }
    scripts[0].dispatchEvent(new Event('load'))

    await expect(promise).resolves.toBe(fakeMaps)
  })

  it('既に読み込み済みなら再挿入せず即時解決する', async () => {
    const { loadGoogleMaps } = await import('./googleMaps')
    const fakeMaps = {} as unknown as typeof google.maps
    ;(globalThis as unknown as GoogleGlobal).google = { maps: fakeMaps }

    await expect(loadGoogleMaps('KEY')).resolves.toBe(fakeMaps)
    expect(scripts).toHaveLength(0)
  })

  it('多重呼び出しでもスクリプトは 1 度だけ挿入し、同じ Promise を返す', async () => {
    const { loadGoogleMaps } = await import('./googleMaps')
    const p1 = loadGoogleMaps('KEY')
    const p2 = loadGoogleMaps('KEY')
    expect(scripts).toHaveLength(1)
    expect(p1).toBe(p2)
  })

  it('error イベントで reject する', async () => {
    const { loadGoogleMaps } = await import('./googleMaps')
    const promise = loadGoogleMaps('KEY')
    scripts[0].dispatchEvent(new Event('error'))
    await expect(promise).rejects.toThrow('スクリプトの読み込み')
  })
})
