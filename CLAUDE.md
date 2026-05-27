# 遠山郷応援会 ウェブサイト

一般社団法人遠山郷応援会の公式ウェブサイト。

## ホスティング

Cloudflare Pages にデプロイする静的サイト。GitHub Actions の `cloudflare-pages.yml` ワークフローが `main` ブランチへの push、Pull Request、`facebook_feeds` repository_dispatch で発火し、`wrangler pages deploy` で `dist/` を公開する。

## 技術スタック

| 用途 | ライブラリ |
|------|-----------|
| フレームワーク | Astro 5 (静的サイト生成) |
| インタラクティブ部品 | Vue 3 (Astro Islands、`<script setup>`) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 (`@tailwindcss/vite`) |
| PDF表示 | @pdftron/pdfjs-express-viewer (クライアント側) |

## ディレクトリ構造

```
tohyamago/
├── astro.config.mjs            # Astro 設定 (Vue + Tailwind v4)
├── tsconfig.json
├── package.json
├── src/
│   ├── pages/                  # ファイルベースルーティング
│   │   ├── index.astro         # トップ (近況/予定タブ)
│   │   ├── purpose.astro       # 活動趣旨
│   │   ├── membership.astro    # 入会案内
│   │   ├── articles.astro      # 定款 (PDF, fullscreen)
│   │   ├── public_notices.astro# 公告
│   │   └── notation.astro      # 特定商取引法に基づく表記
│   ├── layouts/
│   │   └── BaseLayout.astro    # 共通レイアウト + フッター + RouterMenu
│   ├── components/
│   │   ├── RouterMenu.vue      # フローティングメニュー (client:load)
│   │   ├── HomeTabs.vue        # 近況/予定タブ (client:load, hash 同期)
│   │   ├── FacebookFeed.astro  # ビルド時に Facebook API から取得
│   │   └── PdfViewer.vue       # PDF.js Express ラッパー (client:only)
│   ├── lib/
│   │   ├── facebook.ts         # Facebook Graph API フェッチ
│   │   └── facebook-mock.json  # 開発時のモック
│   ├── assets/                 # Astro が処理する画像・PDF
│   │   ├── farm.jpg
│   │   ├── mounts.jpg
│   │   └── articles.pdf
│   └── styles/global.css       # Tailwind の import と body スタイル
├── public/
│   ├── _headers                # Cloudflare Pages のヘッダー設定
│   └── .well-known/
│       └── apple-developer-merchantid-domain-association
└── .github/workflows/cloudflare-pages.yml
```

## ページ一覧

| パス | コンポーネント | 説明 |
|------|---------------|------|
| `/` | `index.astro` | トップページ。「近況」(Facebook フィード) と「予定」タブを `#feed` / `#events` で切替 |
| `/purpose` | `purpose.astro` | 活動趣旨 |
| `/membership` | `membership.astro` | 入会案内 |
| `/articles` | `articles.astro` | 定款 (PDF ビューワー、fullscreen) |
| `/public_notices` | `public_notices.astro` | 公告 |
| `/notation` | `notation.astro` | 特定商取引法に基づく表記 |

## 外部連携

### Facebook Graph API
- `src/lib/facebook.ts` がビルド時に API を呼ぶ
- `FACEBOOK_PAGE_ID` と `FACEBOOK_ACCESS_TOKEN` が未設定なら `facebook-mock.json` を返す
- 静的に HTML へ埋め込まれるため、フィード更新は再ビルドで反映 (GitHub Actions の `repository_dispatch: facebook_feeds` で起動)

### 外部リンク
- ボランティア募集: `https://activo.jp/s/a/119414`
- 成果品販売: `https://shop.tohyamago.org`

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `FACEBOOK_PAGE_ID` | Facebook ページ ID |
| `FACEBOOK_ACCESS_TOKEN` | Facebook アクセストークン |
| `PDFJS_EXPRESS_VIEWER` | PDF.js Express ビューワーライセンスキー |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages デプロイ用 (GitHub Secrets) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID (GitHub Secrets) |

## 開発コマンド

```bash
npm ci          # 依存インストール
npm run dev     # 開発サーバー (http://localhost:4321)
npm run build   # 静的ビルド (dist/)
npm run preview # ビルド成果物のローカル確認
```

## ビルド時の補助処理

PDF.js Express ビューワーは `node_modules/@pdftron/pdfjs-express-viewer/public/` 配下に静的アセット (Web Worker 等) を持つ。GitHub Actions のワークフローでは `astro build` の後にこれらを `dist/` へコピーしている。ローカルで `npm run preview` する場合も同様のコピーが必要。

## デザイン規則

- カラーテーマ: green / lime (山・自然を想起)
- 三角形 (▲) の装飾モチーフをロゴ・見出し・フッターに使用
  - Tailwind の `before:` / `after:` 疑似要素で border-trick を利用して描画
- フォントウェイト: light (`:root` に `font-weight: var(--font-weight-light)` を設定)
- レスポンシブ: モバイルファーストで設計
- ナビゲーション: 左下フローティングボタン「目次」を押してメニューを展開
