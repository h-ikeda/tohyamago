import { describe, it, expect } from 'vitest'
import { postExcerpt } from './postExcerpt'

describe('postExcerpt', () => {
  it('本文をそのまま 1 行のプレーンテキストにする', () => {
    expect(postExcerpt('豊作^^')).toBe('豊作^^')
  })

  it('改行・連続空白を 1 つの空白に均す', () => {
    expect(postExcerpt('春、\n種まきの\n\n季節！')).toBe('春、 種まきの 季節！')
  })

  it('ハッシュタグや装飾記号を落として読みやすくする', () => {
    expect(postExcerpt('美味しい季節。#大豆 #収穫 #遠山郷')).toBe(
      '美味しい季節。大豆 収穫 遠山郷',
    )
  })

  it('リンクは表示テキストだけを残す', () => {
    expect(postExcerpt('詳しくは[こちら](https://example.com)へ')).toBe(
      '詳しくはこちらへ',
    )
  })

  it('画像記法は取り除く', () => {
    expect(postExcerpt('![alt](./a.jpg)きれいな景色')).toBe('きれいな景色')
  })

  it('maxLength を超えたら末尾を「…」で省略する', () => {
    expect(postExcerpt('あいうえお', 3)).toBe('あいう…')
  })

  it('maxLength ちょうどなら省略しない', () => {
    expect(postExcerpt('あいう', 3)).toBe('あいう')
  })

  it('本文が空・未定義なら空文字を返す (写真のみの投稿)', () => {
    expect(postExcerpt('')).toBe('')
    expect(postExcerpt(undefined)).toBe('')
    expect(postExcerpt('   \n  ')).toBe('')
  })
})
