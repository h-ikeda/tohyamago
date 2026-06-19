import { describe, it, expect, beforeEach } from 'vitest'
import { applySeasonFilter } from './newsArchiveFilter'

function setup() {
  document.body.innerHTML = `
    <div data-archive>
      <nav>
        <button data-season-filter="all" aria-pressed="true">すべて</button>
        <button data-season-filter="spring" aria-pressed="false">春</button>
        <button data-season-filter="summer" aria-pressed="false">夏</button>
      </nav>
      <ul>
        <li data-year-nav="2020"></li>
        <li data-year-nav="2019"></li>
      </ul>
      <section data-year-section data-year="2020">
        <span data-count>2</span>
        <ul>
          <li data-season="spring">a</li>
          <li data-season="summer">b</li>
        </ul>
      </section>
      <section data-year-section data-year="2019">
        <span data-count>1</span>
        <ul>
          <li data-season="summer">c</li>
        </ul>
      </section>
    </div>`
  return document.querySelector('[data-archive]') as HTMLElement
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('applySeasonFilter', () => {
  it('選択した季節の記事だけを表示する', () => {
    const root = setup()
    applySeasonFilter(root, 'spring')
    const items = root.querySelectorAll<HTMLElement>('[data-season]')
    const visible = [...items]
      .filter((el) => !el.hidden)
      .map((el) => el.textContent)
    expect(visible).toEqual(['a'])
  })

  it('可視記事が 0 件の年セクションと年ナビ項目を隠す', () => {
    const root = setup()
    applySeasonFilter(root, 'spring')
    const sec2019 = root.querySelector<HTMLElement>('[data-year="2019"]')!
    const nav2019 = root.querySelector<HTMLElement>('[data-year-nav="2019"]')!
    expect(sec2019.hidden).toBe(true)
    expect(nav2019.hidden).toBe(true)
    // 春の記事を持つ 2020 は表示されたまま
    expect(root.querySelector<HTMLElement>('[data-year="2020"]')!.hidden).toBe(
      false,
    )
  })

  it('件数表示を可視記事数に更新する', () => {
    const root = setup()
    applySeasonFilter(root, 'summer')
    const counts = [...root.querySelectorAll('[data-count]')].map(
      (el) => el.textContent,
    )
    expect(counts).toEqual(['1', '1']) // 2020 は summer 1 件, 2019 も 1 件
  })

  it("'all' で全件を再表示する", () => {
    const root = setup()
    applySeasonFilter(root, 'spring')
    applySeasonFilter(root, 'all')
    const items = root.querySelectorAll<HTMLElement>('[data-season]')
    expect([...items].every((el) => !el.hidden)).toBe(true)
    expect(root.querySelector<HTMLElement>('[data-year="2019"]')!.hidden).toBe(
      false,
    )
  })

  it('選択中のボタンだけ aria-pressed=true にする', () => {
    const root = setup()
    applySeasonFilter(root, 'summer')
    const pressed = [...root.querySelectorAll('[data-season-filter]')]
      .filter((b) => b.getAttribute('aria-pressed') === 'true')
      .map((b) => (b as HTMLElement).dataset.seasonFilter)
    expect(pressed).toEqual(['summer'])
  })
})
