import { describe, it, expect, beforeEach } from 'vitest'
import { initImageFadeIn } from './image-fade-in'

/**
 * jsdom では HTMLImageElement の complete / naturalWidth は読み取り専用かつ
 * 実ロードを行わないため、テスト用に上書きして「読み込み済み/未読込」を再現する。
 */
function makeImage({ loaded }: { loaded: boolean }): HTMLImageElement {
  const img = document.createElement('img')
  img.dataset.fadeIn = ''
  Object.defineProperty(img, 'complete', { value: loaded, configurable: true })
  Object.defineProperty(img, 'naturalWidth', {
    value: loaded ? 100 : 0,
    configurable: true,
  })
  return img
}

describe('initImageFadeIn', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('data-fade-in を持つ画像だけを対象にする', () => {
    const target = makeImage({ loaded: false })
    const plain = document.createElement('img') // data-fade-in なし
    document.body.append(target, plain)

    expect(initImageFadeIn()).toBe(1)
  })

  it('既に読み込み済みの画像は即座に is-loaded を付ける', () => {
    const img = makeImage({ loaded: true })
    document.body.append(img)

    initImageFadeIn()

    expect(img.classList.contains('is-loaded')).toBe(true)
  })

  it('未読込の画像は load 完了で is-loaded を付ける', () => {
    const img = makeImage({ loaded: false })
    document.body.append(img)

    initImageFadeIn()
    expect(img.classList.contains('is-loaded')).toBe(false)

    img.dispatchEvent(new Event('load'))
    expect(img.classList.contains('is-loaded')).toBe(true)
  })

  it('読み込み失敗 (error) でも is-loaded を付けて透明のまま残さない', () => {
    const img = makeImage({ loaded: false })
    document.body.append(img)

    initImageFadeIn()
    img.dispatchEvent(new Event('error'))

    expect(img.classList.contains('is-loaded')).toBe(true)
  })

  it('同じ画像を二重に処理しない (load リスナを多重登録しない)', () => {
    const img = makeImage({ loaded: false })
    document.body.append(img)

    expect(initImageFadeIn()).toBe(1)
    // 2 回目は既に bound 済みなので対象数には数えても再バインドしない
    initImageFadeIn()
    expect(img.dataset.fadeBound).toBe('true')
  })
})
