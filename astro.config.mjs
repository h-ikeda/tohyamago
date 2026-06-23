import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import remarkBreaks from 'remark-breaks'
import { resolveBuildEnv } from './src/buildEnv'

// ビルド時変数 (GA_MEASUREMENT_ID / PDFJS_EXPRESS_VIEWER) を本番 / プレビューで
// 出し分ける。単一 Worker のビルド変数に *_PRODUCTION / *_PREVIEW を登録しておき、
// Cloudflare が注入する WORKERS_CI_BRANCH を見て素の名前へ解決する。設定後は
// import.meta.env.GA_MEASUREMENT_ID 等が従来どおり読める。詳細は src/buildEnv.ts。
Object.assign(process.env, resolveBuildEnv(process.env))

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
