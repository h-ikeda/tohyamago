# 遠山郷応援会 ウェブサイト

一般社団法人遠山郷応援会の公式ウェブサイト。

## ホスティング

Cloudflare Pages にデプロイする静的サイト。デプロイは **Cloudflare ダッシュボードの GitHub 連携 (Workers Builds)** を使用し、`main` への push や PR の作成で自動的にビルド・公開される。GitHub Actions (`ci.yml`) は品質チェック (Lint / Format / 型チェック / テスト) とビルド検証を行う CI として動作し、デプロイは行わない。

### Cloudflare ダッシュボード側の設定

- Build command: `npm run build`
- Build output directory: `dist` (`wrangler.toml` の `pages_build_output_dir` でも指定済み)
- Root directory: `/`
- Node version: 22
- 環境変数: `PDFJS_EXPRESS_VIEWER`

## 技術スタック

| 用途                 | ライブラリ                                     |
| -------------------- | ---------------------------------------------- |
| フレームワーク       | Astro 5 (静的サイト生成)                       |
| インタラクティブ部品 | React 19 (Astro Islands)                       |
| 言語                 | TypeScript                                     |
| スタイリング         | Tailwind CSS v4 (`@tailwindcss/vite`)          |
| PDF表示              | @pdftron/pdfjs-express-viewer (クライアント側) |

## ディレクトリ構造

```
tohyamago/
├── astro.config.mjs            # Astro 設定 (React + Tailwind v4)
├── eslint.config.js            # ESLint (flat config: TS / React / a11y / Astro)
├── .prettierrc.json            # Prettier 設定 (.prettierignore も併設)
├── vitest.config.ts            # Vitest 設定 (vitest.setup.ts も併設)
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
│   │   ├── RouterMenu.tsx      # フローティングメニュー (React, client:load)
│   │   ├── RouterMenu.test.tsx # RouterMenu のテスト (Vitest)
│   │   ├── HomeTabs.tsx        # 近況/予定タブ (React, client:load, hash 同期)
│   │   ├── HomeTabs.test.tsx   # HomeTabs のテスト (Vitest)
│   │   ├── Button.astro        # 共通 UI プリミティブ (CTA ボタン)
│   │   ├── Card.astro          # 共通 UI プリミティブ (カード)
│   │   ├── Container.astro     # 共通 UI プリミティブ (コンテナ幅)
│   │   ├── SectionHeading.astro# 共通 UI プリミティブ (▲ 見出し)
│   │   ├── Posts.astro         # Content Collection から記事を描画
│   │   └── PdfViewer.tsx       # PDF.js Express ラッパー (React, client:only)
│   ├── content.config.ts       # Content Collection スキーマ
│   ├── content/
│   │   └── posts/              # 記事 (Markdown) と添付画像
│   ├── assets/                 # Astro が処理する画像・PDF
│   │   ├── farm.jpg
│   │   ├── mounts.jpg
│   │   └── articles.pdf
│   ├── types/                  # 型定義の補完 (例: pdfjs-express-viewer.d.ts)
│   └── styles/global.css       # Tailwind の import と body スタイル
├── public/
│   ├── _headers                # Cloudflare Pages のヘッダー設定
│   └── .well-known/
│       └── apple-developer-merchantid-domain-association
├── wrangler.toml               # Cloudflare Pages 設定 (出力ディレクトリ)
└── .github/workflows/ci.yml    # 品質チェック + ビルド検証 CI (デプロイは Cloudflare 側)
```

## ページ一覧

| パス              | コンポーネント         | 説明                                                                                       |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `/`               | `index.astro`          | トップページ。「近況」(リポジトリ内の記事一覧) と「予定」タブを `#feed` / `#events` で切替 |
| `/purpose`        | `purpose.astro`        | 活動趣旨                                                                                   |
| `/membership`     | `membership.astro`     | 入会案内                                                                                   |
| `/articles`       | `articles.astro`       | 定款 (PDF ビューワー、fullscreen)                                                          |
| `/public_notices` | `public_notices.astro` | 公告                                                                                       |
| `/notation`       | `notation.astro`       | 特定商取引法に基づく表記                                                                   |

## 記事 (Content Collection)

- `src/content/posts/` に `<slug>.md` (Markdown 本文) を配置
- 添付画像は `src/content/posts/<slug>/<filename>` に置き、frontmatter の `images` で参照
- スキーマは `src/content.config.ts` で定義 (`date` / `images` / `sourceUrl`)
- Markdown は `remark-breaks` で単一改行も `<br>` 化されるため、Facebook 風の改行スタイルがそのまま再現される

### 外部リンク

- ボランティア募集: `https://activo.jp/s/a/119414`
- 成果品販売: `https://shop.tohyamago.org`

## 環境変数

| 変数名                 | 用途                                    |
| ---------------------- | --------------------------------------- |
| `PDFJS_EXPRESS_VIEWER` | PDF.js Express ビューワーライセンスキー |

GitHub Actions の CI でも参照するため、Cloudflare ダッシュボードに加えて GitHub Secrets にも登録する。

## 開発コマンド

```bash
npm ci          # 依存インストール
npm run dev     # 開発サーバー (http://localhost:4321)
npm run build   # 静的ビルド (dist/)
npm run preview # ビルド成果物のローカル確認
```

## 品質チェック (Lint / Format / 型チェック / テスト)

ロードマップ Phase 0 の「Lint / Format / 型チェックの整備」に対応。CI (`ci.yml`) でも同じコマンドを実行する。

```bash
npm run lint          # ESLint (TS / React / a11y / Astro)
npm run lint:fix      # ESLint 自動修正
npm run format        # Prettier で整形 (--write)
npm run format:check  # Prettier の整形チェック (CI 用)
npm run typecheck     # astro check による型チェック
npm test              # Vitest を 1 回実行
npm run test:watch    # Vitest ウォッチモード
npm run test:coverage # カバレッジ付きで実行
```

- **Linter**: ESLint 9 (flat config, `eslint.config.js`)。TypeScript / React / React Hooks / jsx-a11y / Astro 対応。整形系ルールは `eslint-config-prettier` で無効化し Prettier に委譲。日本語コンテンツの全角スペースを許容するため `no-irregular-whitespace` は無効。
- **Formatter**: Prettier (`.prettierrc.json`)。セミコロンなし・シングルクォート。`.astro` は `prettier-plugin-astro` で整形。対象外は `.prettierignore`。
- **テスト**: Vitest + Testing Library (jsdom)。React アイランドの代表的な「動き」と「スタイリング」を `src/**/*.test.tsx` に配置。UI は今後大きく変わるため、現時点では網羅より代表ケースの確認を重視する。

## ビルド時の補助処理

PDF.js Express ビューワーは `node_modules/@pdftron/pdfjs-express-viewer/public/` 配下に静的アセット (Web Worker 等) を持つ。`npm run build` の `postbuild` フックでこれらを `dist/` へコピーしているため、ローカル / GitHub Actions / Cloudflare Pages のいずれの環境でも自動で配置される。

## デザイン規則

- カラーテーマ: green / lime (山・自然を想起)
- 三角形 (▲) の装飾モチーフをロゴ・見出し・フッターに使用
  - Tailwind の `before:` / `after:` 疑似要素で border-trick を利用して描画
- フォントウェイト: light (`:root` に `font-weight: var(--font-weight-light)` を設定)
- レスポンシブ: モバイルファーストで設計
- ナビゲーション: 左下フローティングボタン「目次」を押してメニューを展開
