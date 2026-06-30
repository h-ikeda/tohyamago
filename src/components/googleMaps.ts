/// <reference types="google.maps" />

// Maps JavaScript API まわりの純粋関数とローダ。インタラクティブ地図 (AccessMap.tsx)
// と Astro 側 (access.astro) で共有する。DOM/外部スクリプトに触れない関数はここで
// テストし、React 島はこの薄い土台の上に乗せる。

// 地図リンク (検索 / 経路) の URL を組み立てる純粋関数。情報ウィンドウや各カードの
// 「地図」リンクで共有する。API キー不要の公開 URL なので、地図が出せない環境でも着地する。
export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function directionsUrl(query: string, travelmode = 'driving'): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=${travelmode}`
}

// 地図に立てるピン (目的地など) 1 件分の情報。
export interface MapPlace {
  name: string
  lat: number
  lng: number
  address?: string
  // 地図 / 経路リンクに使う検索クエリ (通常は住所か施設名)。座標が多少ずれても
  // このクエリで開けば正しい場所に着地する。
  query: string
}

// Maps JavaScript API ローダ <script> の URL を組み立てる純粋関数。
export interface LoaderOptions {
  language?: string
  region?: string
  libraries?: readonly string[]
}

export function googleMapsLoaderUrl(
  apiKey: string,
  options: LoaderOptions = {},
): string {
  const params = new URLSearchParams({
    key: apiKey,
    v: 'weekly',
    loading: 'async',
  })
  if (options.libraries && options.libraries.length > 0) {
    params.set('libraries', options.libraries.join(','))
  }
  if (options.language) params.set('language', options.language)
  if (options.region) params.set('region', options.region)
  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 情報ウィンドウ (ピンのクリックで開く吹き出し) の HTML。施設名・住所と、経路 /
// 地図リンクを表示する。InfoWindow は文字列 HTML を受け取るため、念のため施設名等は
// エスケープしておく。
export function placeInfoWindowContent(place: MapPlace): string {
  const address = place.address
    ? `<p style="margin:0 0 8px;color:#4b5563;font-size:13px;line-height:1.5;">${escapeHtml(place.address)}</p>`
    : ''
  return [
    '<div style="max-width:230px;font-family:inherit;">',
    `<p style="margin:0 0 4px;font-weight:600;color:#1f3a2e;font-size:15px;">${escapeHtml(place.name)}</p>`,
    address,
    '<p style="margin:0;display:flex;flex-wrap:wrap;gap:10px;font-size:13px;">',
    `<a href="${directionsUrl(place.query)}" target="_blank" rel="noopener noreferrer" style="color:#b45309;font-weight:600;">ルートを調べる</a>`,
    `<a href="${mapSearchUrl(place.query)}" target="_blank" rel="noopener noreferrer" style="color:#1f6f43;font-weight:600;">Googleマップで開く</a>`,
    '</p>',
    '</div>',
  ].join('')
}

// ブランドカラー (緑) に寄せた控えめな地図スタイル。観光スポット等のラベルを抑え、
// 自然・水・道路を落ち着いた色みに整える。
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#d7e7cd' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#eef3e9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#aecbd6' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cdd6c5' }],
  },
]

// 同一ページ内での多重読み込みを防ぐためのキャッシュ。複数の島から呼ばれても
// <script> は 1 度だけ挿入し、同じ Promise を共有する。
let loaderPromise: Promise<typeof google.maps> | null = null

/**
 * Maps JavaScript API を一度だけ読み込み、google.maps 名前空間で解決する。
 * 既に読み込み済みなら即時解決。読み込み失敗時は reject し、キャッシュを捨てて
 * 再試行できるようにする。
 *
 * @param apiKey ブラウザ用 API キー
 * @param doc テスト用に差し替え可能な document (既定は実 document)
 */
export function loadGoogleMaps(
  apiKey: string,
  doc: Document = document,
): Promise<typeof google.maps> {
  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve(google.maps)
  }
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise((resolve, reject) => {
    const script = doc.createElement('script')
    script.src = googleMapsLoaderUrl(apiKey, { language: 'ja', region: 'JP' })
    script.async = true
    script.addEventListener('load', () => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve(google.maps)
      } else {
        loaderPromise = null
        reject(new Error('Google Maps の初期化に失敗しました'))
      }
    })
    script.addEventListener('error', () => {
      loaderPromise = null
      reject(new Error('Google Maps スクリプトの読み込みに失敗しました'))
    })
    doc.head.appendChild(script)
  })
  return loaderPromise
}
