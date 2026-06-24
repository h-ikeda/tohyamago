import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { unified } from '@astrojs/markdown-remark'
import remarkBreaks from 'remark-breaks'
import { resolveBuildEnv } from './src/buildEnv'

// ビルド時変数 (GA_MEASUREMENT_ID / PDFJS_EXPRESS_VIEWER) を本番 / プレビューで
// 出し分ける。単一 Worker のビルド変数に *_PRODUCTION / *_PREVIEW を登録しておき、
// Cloudflare が注入する WORKERS_CI_BRANCH を見て素の名前へ解決する。設定後は
// import.meta.env.GA_MEASUREMENT_ID 等が従来どおり読める。詳細は src/buildEnv.ts。
Object.assign(process.env, resolveBuildEnv(process.env))

export default defineConfig({
  // canonical / OGP / 構造化データの絶対 URL の基点。公開ドメインに合わせる
  // (src/components/siteMeta.ts の SITE_URL と一致させること)。
  site: 'https://www.tohyamago.org',
  // sitemap.xml を自動生成 (検索エンジン / AI クローラーの巡回を助ける)。
  // robots.txt (public/robots.txt) から参照する。
  integrations: [react(), sitemap()],
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
  // Astro 7 で markdown.remarkPlugins は非推奨。@astrojs/markdown-remark の
  // unified() に渡してデフォルトプロセッサを拡張する方式へ移行した。
  markdown: {
    processor: unified({ remarkPlugins: [remarkBreaks] }),
  },
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
})
