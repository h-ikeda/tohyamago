import { test, expect } from '@playwright/test'

/**
 * リグレッション: 「デスクトップでヒーロー画像の object-position が中央に戻ってしまう」NG。
 *
 * astro.config.mjs の image.responsiveStyles=true により、Astro は全 <Image> に
 * data-astro-image-pos を必ず付与し (position 未指定なら "center")、
 * [data-astro-image-pos="center"]{ object-position: center } をグローバルに注入する。
 * この属性セレクタは Tailwind の object-* ユーティリティと specificity が同じ (0,1,0) で、
 * 注入順が後のため、通常クラス指定の md:object-[50%_68%] が上書きされてしまう。
 *
 * 修正は末尾 ! (Tailwind v4 の important) で確実に勝たせること。computed style は
 * 実ブラウザでしか正しく解決できないため、ここで回帰を固定する。
 */
test('デスクトップでヒーロー画像の object-position が 50% 68% になる', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const heroImg = page.locator('img[alt="遠山郷の急斜面に広がる畑と山並み"]')
  await expect(heroImg).toBeVisible()

  const objectPosition = await heroImg.evaluate(
    (el) => getComputedStyle(el).objectPosition,
  )
  // 50% 68% が解決された値 (ブラウザは % をそのまま返す)
  expect(objectPosition).toBe('50% 68%')
})

test('モバイルでヒーロー画像の object-position が中央 (50% 50%) になる', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const heroImg = page.locator('img[alt="遠山郷の急斜面に広がる畑と山並み"]')
  await expect(heroImg).toBeVisible()

  const objectPosition = await heroImg.evaluate(
    (el) => getComputedStyle(el).objectPosition,
  )
  // object-center / Astro 既定の center はいずれも 50% 50% に解決される
  expect(objectPosition).toBe('50% 50%')
})
