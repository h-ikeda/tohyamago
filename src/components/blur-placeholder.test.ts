import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ImageMetadata } from 'astro'

// sharp はネイティブ依存かつ実ファイルを要するためモックする。
// チェーン sharp(path).resize().webp().toBuffer() の最終段だけ差し替える。
const toBuffer = vi.fn()
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn(() => ({
      webp: vi.fn(() => ({ toBuffer })),
    })),
  })),
}))

import sharp from 'sharp'
import { getBlurDataURL } from './blur-placeholder'

/** fsPath の有無を制御したダミー ImageMetadata を作る。 */
function image(fsPath?: string): ImageMetadata {
  return {
    src: '/x.webp',
    width: 100,
    height: 100,
    format: 'jpg',
    fsPath,
  } as unknown as ImageMetadata
}

describe('getBlurDataURL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fsPath が無ければ空文字を返し sharp を呼ばない', async () => {
    expect(await getBlurDataURL(image(undefined))).toBe('')
    expect(sharp).not.toHaveBeenCalled()
  })

  it('成功時は webp の base64 data URI を返す', async () => {
    toBuffer.mockResolvedValue(Buffer.from('hello'))
    const url = await getBlurDataURL(image('/a.jpg'))
    expect(url).toBe(
      `data:image/webp;base64,${Buffer.from('hello').toString('base64')}`,
    )
  })

  it('同一 fsPath の成功結果はキャッシュし sharp を一度だけ呼ぶ', async () => {
    toBuffer.mockResolvedValue(Buffer.from('cached'))
    await getBlurDataURL(image('/b.jpg'))
    await getBlurDataURL(image('/b.jpg'))
    expect(sharp).toHaveBeenCalledTimes(1)
  })

  it('生成失敗時は空文字を返し、失敗はキャッシュせず再試行できる', async () => {
    toBuffer.mockRejectedValue(new Error('boom'))
    expect(await getBlurDataURL(image('/c.jpg'))).toBe('')
    // 失敗はキャッシュされないため、再度呼ぶと sharp が改めて実行される。
    expect(await getBlurDataURL(image('/c.jpg'))).toBe('')
    expect(sharp).toHaveBeenCalledTimes(2)
  })
})
