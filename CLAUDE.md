# 遠山郷応援会 ウェブサイト

一般社団法人遠山郷応援会の公式ウェブサイト。

## ホスティング

Cloudflare Pages にデプロイする静的サイト。デプロイは **Cloudflare ダッシュボードの GitHub 連携 (Workers Builds)** を使用し、`main` への push や PR の作成で自動的にビルド・公開される。GitHub Actions (`ci.yml`) はビルド検証のみを行う CI として動作し、デプロイは行わない。

### Cloudflare ダッシュボード側の設定

- Build command: `npm run build`
- Build output directory: `dist` (`wrangler.toml` の `pages_build_output_dir` でも指定済み)
- Root directory: `/`
- Node version: 22
- 環境変数: `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`, `PDFJS_EXPRESS_VIEWER`

### Facebook フィード更新時の再デプロイ

旧構成では GitHub の `repository_dispatch: facebook_feeds` で再ビルドしていたが、Cloudflare 連携運用ではダッシュボードで発行した **Deploy Hook URL** を直接呼ぶ方式に切り替える (例: 外部スケジューラ等から POST する)。

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
├── wrangler.toml               # Cloudflare Pages 設定 (出力ディレクトリ)
└── .github/workflows/ci.yml    # ビルド検証 CI (デプロイは Cloudflare 側)
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
- 静的に HTML へ埋め込まれるため、フィード更新は再ビルドで反映 (Cloudflare Pages の Deploy Hook URL を叩く)

### 外部リンク
- ボランティア募集: `https://activo.jp/s/a/119414`
- 成果品販売: `https://shop.tohyamago.org`

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `FACEBOOK_PAGE_ID` | Facebook ページ ID |
| `FACEBOOK_ACCESS_TOKEN` | Facebook アクセストークン |
| `PDFJS_EXPRESS_VIEWER` | PDF.js Express ビューワーライセンスキー |

GitHub Actions の CI でも参照するため、上記は Cloudflare ダッシュボードに加えて GitHub Secrets にも登録する。

## 開発コマンド

```bash
npm ci          # 依存インストール
npm run dev     # 開発サーバー (http://localhost:4321)
npm run build   # 静的ビルド (dist/)
npm run preview # ビルド成果物のローカル確認
```

## ビルド時の補助処理

PDF.js Express ビューワーは `node_modules/@pdftron/pdfjs-express-viewer/public/` 配下に静的アセット (Web Worker 等) を持つ。`npm run build` の `postbuild` フックでこれらを `dist/` へコピーしているため、ローカル / GitHub Actions / Cloudflare Pages のいずれの環境でも自動で配置される。

## デザイン規則

- カラーテーマ: green / lime (山・自然を想起)
- 三角形 (▲) の装飾モチーフをロゴ・見出し・フッターに使用
  - Tailwind の `before:` / `after:` 疑似要素で border-trick を利用して描画
- フォントウェイト: light (`:root` に `font-weight: var(--font-weight-light)` を設定)
- レスポンシブ: モバイルファーストで設計
- ナビゲーション: 左下フローティングボタン「目次」を押してメニューを展開
