import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import remarkBreaks from 'remark-breaks'

export default defineConfig({
  integrations: [react()],
  // 画像はモバイル回線でも遅延感が出ないよう、レスポンシブ画像 (srcset/sizes) を
  // 全 <Image> で自動生成する。layout='constrained' でコンテナ幅に追従しつつ
  // 原寸を超えない複数解像度を用意し、回線・画面に応じた最小サイズを配信する。
  // 出力フォーマットは Astro 既定の webp (旧 jpg より大幅に軽量)。
  image: {
    layout: 'constrained',
    // responsive 用の低詳細度グローバルスタイルを注入 (既存の Tailwind クラスが優先される)。
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
})
