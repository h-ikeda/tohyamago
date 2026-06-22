import { test, expect } from '@playwright/test'

/**
 * リグレッション: 「デスクトップでヒーロー画像の縦位置 (object-position) が効かず、
 * 上端合わせで表示される」NG。
 *
 * astro.config.mjs の image.responsiveStyles=true により、Astro は <Image> 用スタイルを
 * カスケードレイヤー外で注入する (data-astro-image-* セレクタや
 * :where([data-astro-image]){height:auto} 等)。Tailwind v4 のユーティリティは
 * @layer utilities に入るため、「レイヤー外の通常宣言 > レイヤー内の通常宣言」という
 * カスケードレイヤー規則により、specificity に関わらず Astro 側が勝つ。結果:
 *   1. <img> の h-full が height:auto に負け、高さが制限されず原寸比で描画される
 *      → object-fit:cover のトリミングが起きず object-position が無効化される。
 *   2. md:object-[50%_38%] が data-astro-image-pos="center" に負ける。
 * いずれも ! (important) で勝たせて修正する。computed style と実レイアウトは
 * 実ブラウザでしか正しく解決できないため、ここで回帰を固定する。
 */

const HERO_ALT = '遠山郷の急斜面に広がる畑と山並み'

test('デスクトップでヒーロー画像が高さ制限され object-position 50% 38% が効く', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const heroImg = page.locator(`img[alt="${HERO_ALT}"]`)
  await expect(heroImg).toBeVisible()

  // object-position が中央に戻されず 50% 38% で解決されていること
  const objectPosition = await heroImg.evaluate(
    (el) => getComputedStyle(el).objectPosition,
  )
  expect(objectPosition).toBe('50% 38%')

  // 高さが制限され (h-full)、object-fit:cover のトリミングが効いていること。
  // height:auto に負けると <img> は原寸比 (4028:3120 ≒ 0.77) の高さになり、
  // 親 (.lqip ラッパー) からはみ出す。制限が効いていれば両者の高さは一致する。
  const { imgHeight, wrapperHeight, imgWidth } = await heroImg.evaluate(
    (el) => {
      const wrapper = el.parentElement as HTMLElement
      return {
        imgHeight: el.getBoundingClientRect().height,
        wrapperHeight: wrapper.getBoundingClientRect().height,
        imgWidth: el.getBoundingClientRect().width,
      }
    },
  )
  // ラッパーと同じ高さに収まっている (1px 程度の丸め誤差は許容)
  expect(Math.abs(imgHeight - wrapperHeight)).toBeLessThanOrEqual(1)
  // 原寸比なら height ≒ width*0.77。トリミングが効いていれば明確にそれより低い
  expect(imgHeight).toBeLessThan(imgWidth * 0.7)
})

test('モバイルでヒーロー画像の object-position が中央 (50% 50%) になる', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const heroImg = page.locator(`img[alt="${HERO_ALT}"]`)
  await expect(heroImg).toBeVisible()

  const objectPosition = await heroImg.evaluate(
    (el) => getComputedStyle(el).objectPosition,
  )
  // object-center / Astro 既定の center はいずれも 50% 50% に解決される
  expect(objectPosition).toBe('50% 50%')
})
