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
│   │   ├── index.astro         # トップ (ヒーロー + 3導線 + 近況/カレンダー誘導)
│   │   ├── purpose.astro       # 活動趣旨
│   │   ├── story.astro         # 活動の始まり物語 (新規)
│   │   ├── join.astro          # はじめての方へ / 参加案内 (新規)
│   │   ├── calendar.astro      # 農作業カレンダー (新規)
│   │   ├── products.astro      # 成果品紹介 → shop (新規)
│   │   ├── support.astro       # 寄付案内 (新規, Phase 4)
│   │   ├── membership.astro    # 入会案内
│   │   ├── news/
│   │   │   └── [slug].astro     # 記事個別ページ (新規, SEO/共有用・任意)
│   │   ├── articles.astro      # 定款 (PDF, fullscreen)
│   │   ├── public_notices.astro# 公告 (URL 固定・変更禁止)
│   │   └── notation.astro      # 特定商取引法に基づく表記
│   ├── layouts/
│   │   └── BaseLayout.astro    # 共通レイアウト + フッター + RouterMenu
│   ├── components/
│   │   ├── SiteHeader.astro    # グローバルナビ (新規, ジャーナリー導線ヘッダー)
│   │   ├── RouterMenu.tsx      # フローティングメニュー (React, client:load)
│   │   ├── RouterMenu.test.tsx # RouterMenu のテスト (Vitest)
│   │   ├── HomeTabs.tsx        # 近況/予定タブ (React, client:load, hash 同期)
│   │   ├── HomeTabs.test.tsx   # HomeTabs のテスト (Vitest)
│   │   ├── JourneyCards.astro  # トップの3導線カード (新規: 参加/購入/支える)
│   │   ├── FarmCalendar.tsx    # 農作業ガントチャート (新規, React island)
│   │   ├── FarmCalendar.test.tsx # FarmCalendar のテスト (新規, Vitest)
│   │   ├── ProductCard.astro   # 成果品カード (新規)
│   │   ├── Button.astro        # 共通 UI プリミティブ (CTA ボタン)
│   │   ├── Card.astro          # 共通 UI プリミティブ (カード)
│   │   ├── Container.astro     # 共通 UI プリミティブ (コンテナ幅)
│   │   ├── SectionHeading.astro# 共通 UI プリミティブ (▲ 見出し)
│   │   ├── Posts.astro         # Content Collection から記事を描画
│   │   └── PdfViewer.tsx       # PDF.js Express ラッパー (React, client:only)
│   ├── content.config.ts       # Content Collection スキーマ (posts / crops / events)
│   ├── content/
│   │   ├── posts/              # 記事 (Markdown) と添付画像
│   │   ├── crops/              # 農作業カレンダーの作物・作業データ (新規, YAML)
│   │   └── events/             # 地域イベントデータ (新規, YAML)
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

## サイト構成（情報設計）

> 設計の背景・ユーザー導線の考え方は [`README.md` の「サイト構成（情報設計とユーザー導線）」](./README.md) を参照。本節は実装者向けに **ルート・コンポーネント・データ構造・実装順序** を具体化したもの。

### 設計方針（ターゲットとゴール）

- **ターゲット（新規来訪者を主眼）**
  - 農作業・イベントに参加したいボランティア参加者（特にこれから参加する **20〜40 代**）… 最優先導線
  - 寄付・購入を検討する支援者（**富裕層・高齢層**）
  - ※ 既存の参加者・寄付者向けの深い情報発信は将来のマイページ（Clerk, Phase 5）に委ね、**公開サイトは「入口」に徹する**
- **ゴール優先順位**
  1. 継続的な（2 回以上）活動参加者を増やす ＝ **コミュニティの拡大（最優先）**
  2. 活動に賛同する気持ちでのショップ購入
  3. 継続寄付する会員数の増加
  - まずは金額よりコミュニティの大きさを優先する
- **情報設計の原則**: 新規来訪者を「**知る → 参加する**」へ最短で導く。各ページに次の一歩（CTA）を必ず置き、迷子を作らない。

### グローバルナビ（ジャーナリー導線）

団体組織図ではなく **来訪者のやりたいこと** で章立てする。ゴール優先順位の高い「参加する」を最も目立たせる。

| ナビ項目         | 内包ページ                          | 主ターゲット     |
| ---------------- | ----------------------------------- | ---------------- |
| 活動を知る       | 活動趣旨 / 始まり物語 / 近況        | 参加・支援の両方 |
| **参加する**(主) | はじめての方へ / 農作業カレンダー   | 新規ボランティア |
| 成果品           | 成果品紹介 →（外部）ショップ        | 購入支援者       |
| 支える           | 寄付 / 入会案内                     | 寄付・会員支援者 |
| （フッター）     | 定款 / 公告 / 特商法表記 / 法人概要 | 法令・信頼性     |

- 現行の左下フローティング「法令」(`RouterMenu.tsx`、旧「目次」) は、**ヘッダーナビ (`SiteHeader.astro`) へ再編**する（README ロードマップ Phase 2）。ヘッダーで網羅したページは `RouterMenu` から外し、法令系の文書（定款 / 公告 / 特商法表記）のみを残す。移行期間は両立可、最終的にヘッダー＋フッターへ寄せる。
- ヘッダーは常時「**参加する / 寄付**」の 2 CTA をボタン表示し、どのページからもゴール導線に届くようにする。

### ページ一覧（新構成）

> 区分: 現行=既存維持, 変更=既存を改修, 新規=新設。「現状のコンテンツは全て含める」方針のため既存ページは削除しない。

| パス              | コンポーネント         | 区分 | 主ターゲット     | 説明                                                                                          |
| ----------------- | ---------------------- | ---- | ---------------- | --------------------------------------------------------------------------------------------- |
| `/`               | `index.astro`          | 変更 | 全員             | ヒーロー＋3 導線カード＋近況プレビュー＋今参加できる作業（カレンダー誘導）＋始まり物語 teaser |
| `/purpose`        | `purpose.astro`        | 現行 | 参加・支援       | 活動趣旨（ミッション・ビジョン）                                                              |
| `/story`          | `story.astro`          | 新規 | 参加・支援       | **活動の始まり物語**（初期エピソードで活動の性質への理解を助ける）                            |
| `/join`           | `join.astro`           | 新規 | 新規ボランティア | **はじめての方へ**（参加の流れ・FAQ・アクセス・持ち物・服装・activo 募集導線）                |
| `/calendar`       | `calendar.astro`       | 新規 | 参加者＋運営     | **農作業カレンダー**（作物 × 作業時期のガント＋地域イベント重畳）                             |
| `/products`       | `products.astro`       | 新規 | 購入支援者       | 成果品紹介（下栗芋・茶・蕎麦・大豆のストーリー）→ shop.tohyamago.org                          |
| `/support`        | `support.astro`        | 新規 | 寄付支援者       | 寄付案内（単発／継続）。Stripe 導線は Phase 4 で実装                                          |
| `/membership`     | `membership.astro`     | 現行 | 会員支援者       | 入会案内（権限・年会費・入会手続き）                                                          |
| `/news/[slug]`    | `news/[slug].astro`    | 新規 | 全員             | 記事個別ページ（共有・SEO 用、任意）。一覧/近況は従来どおり `Posts.astro`                     |
| `/articles`       | `articles.astro`       | 現行 | —                | 定款（PDF ビューワー、fullscreen）                                                            |
| `/public_notices` | `public_notices.astro` | 現行 | —                | 公告。**URL は法人登記に記載のため変更禁止**                                                  |
| `/notation`       | `notation.astro`       | 現行 | —                | 特定商取引法に基づく表記                                                                      |

#### 近況 / 予定タブの扱い（`HomeTabs.tsx`）

- 「近況」フィードは維持（トップのプレビュー＋将来 `/news` 等のアーカイブ）。
- 「予定」タブは activo へのリンクのみで情報量が薄いため、**`/calendar`（農作業カレンダー）へ発展的に統合**する。activo の募集 CTA は `/join` に集約する。
- 既存の `HomeTabs` の hash 同期テストは、タブ構成変更時に追従して更新する。

## 記事 (Content Collection)

- `src/content/posts/` に `<slug>.md` (Markdown 本文) を配置
- 添付画像は `src/content/posts/<slug>/<filename>` に置き、frontmatter の `images` で参照
- スキーマは `src/content.config.ts` で定義 (`date` / `images` / `sourceUrl`)
- Markdown は `remark-breaks` で単一改行も `<br>` 化されるため、Facebook 風の改行スタイルがそのまま再現される

### 外部リンク

- ボランティア募集: `https://activo.jp/s/a/119414`
- 成果品販売: `https://shop.tohyamago.org`

## 新規コンテンツの仕様

### 活動の始まり物語 (`/story`)

- **目的**: 初期エピソード（2018 年の下栗応援サークル発足〜法人化までの経緯、AgriRecorder による「ゆるいつながり」づくり、お茶手摘みへの挑戦など）を物語として読ませ、活動の **性質・温度感** への理解を助ける。趣旨ページ（理念）が「なぜ」を語るのに対し、物語ページは「どう始まり・続いてきたか」を語る。
- **位置づけ**: `purpose`（理念）→ `story`（経緯）→ `join`（参加）という理解の階段を作る。
- **構成案**:
  1. 導入（一文のキャッチ＋下栗の里の写真）
  2. 年代別の節（2018〜2019 / 2020〜2022 / 2023〜2024 / 2025〜）。各節に当時の記事（`src/content/posts/`）の写真・引用を 1〜2 点添える。
  3. 「法人化（2024-10-01）」の節で、サークルから一般社団法人へ形を変えた意味を説明。
  4. 末尾に CTA（「あなたも畑へ → `/join`」「物語の続きは近況で →」）。
- **データソース**: 既存記事を活用。年表本文は `story.astro` に直接記述、または `src/content/posts/` から該当記事を slug 指定で引用するヘルパーを用意。記事 frontmatter（`date` / `images` / `sourceUrl`）の後方互換は厳守。
- **README の「これまでの歩み」** と内容を重複させず、README は方針、`/story` は読み物として作り分ける。

### 農作業カレンダー (`/calendar`)

サイトの新しい目玉機能。**二つの役割**を同時に満たす。

1. **参加意欲の喚起（対 新規ボランティア）**: 「いつ・どの作物の・どんな作業に参加できるか」を一目で示し、「この時期に行ってみたい」を引き出す。各作業から `/join`・activo へ送客する。
2. **運営の確認用（対 管理者）**: 作付け・作業・地域行事の年間スケジュールを一望できる、編集しやすいデータ台帳。

#### 表示要件

- 横軸＝1〜12 月（ガントチャート風）。縦軸＝作物（行）。各作業を期間バーで表示。
- バーは色分け（作物ごと）。**ボランティア歓迎の作業は強調**（テラコッタ `accent` 等）し、参加対象が直感的に分かるようにする。
- **地域イベント**を別レーン（または月軸上のマーカー）として重畳表示。
- **当月をハイライト**（縦ライン or 当月列の強調）し、「今・近いうちに参加できる作業」へ視線を誘導。
- バーのクリック/タップで詳細（作業内容・ひとこと・参加 CTA）を展開。
- レスポンシブ: モバイルは横スクロール、または「月 → 作業」の縦リストにフォールバック。
- アクセシビリティ: 色だけに依存しない（ラベル・凡例・`aria`）。スクリーンリーダー向けに表形式の意味を保持。

#### データ構造（Content Collections）

作物の作業は **毎年ほぼ同時期に繰り返す** ため月（半月）粒度の循環データ、地域イベントは **特定日** を持つデータ、として分離する。管理者が 1 ファイルで更新できるよう YAML データコレクションとする（`content.config.ts` に追加）。

`src/content/crops/<id>.yaml`（作物 1 件＝1 ファイル）:

```yaml
name: 下栗芋
emoji: 🥔
color: '#a65f3b' # ガントバーの基調色
order: 1 # 表示順
tasks:
  - label: 植付
    start: 4.0 # 月.上下旬 (整数=上旬, .5=下旬)。例: 4.0=4月上旬, 4.5=4月下旬
    end: 4.5
    volunteer: true # ボランティア歓迎 → 強調＆CTA表示
    note: 種芋の植え付け。初参加歓迎。
  - label: 管理（除草・土寄せ）
    start: 5.0
    end: 8.5
    volunteer: true
  - label: 収穫（芋掘り）
    start: 9.0
    end: 10.5
    volunteer: true
```

`src/content/events/<id>.yaml`（地域イベント 1 件＝1 ファイル）:

```yaml
name: 霜月祭
start: 12.0 # 月.上下旬。複数日にまたがる行事は start/end で範囲指定
end: 12.5
category: 地域行事 # 地域行事 / 当会イベント / 販売 など
location: 遠山郷各地区
url: https://example.com # 任意
note: 国指定重要無形民俗文化財。
```

> **シードデータ（既存記事から推定。実装時に運営が確定）**: 下栗芋＝植付 4 月／管理 5〜8 月／収穫 9〜10 月、大豆＝種まき 5 月下旬〜6 月／収穫・脱穀 11〜12 月、蕎麦＝種まき 8 月／収穫・脱穀 10〜11 月、茶＝茶摘み（新茶）5 月／整枝 夏〜秋。地域行事は運営が随時追加。

`content.config.ts` への追加イメージ:

```ts
// 月.上下旬 (1.0〜12.5, 0.5 刻み)。CSS Grid の列計算に直結するためスキーマで厳密に検証する
const halfMonth = z
  .number()
  .min(1.0)
  .max(12.5)
  .refine((n) => n % 0.5 === 0, {
    message:
      '値は 1.0〜12.5 の 0.5 刻み（整数=上旬, .5=下旬）で指定してください',
  })

const crops = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/crops' }),
  schema: z.object({
    name: z.string(),
    emoji: z.string().optional(),
    color: z.string(),
    order: z.number().default(0),
    tasks: z.array(
      z.object({
        label: z.string(),
        start: halfMonth,
        end: halfMonth,
        volunteer: z.boolean().default(false),
        note: z.string().optional(),
      }),
    ),
  }),
})

const events = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
  schema: z.object({
    name: z.string(),
    start: halfMonth,
    end: halfMonth,
    category: z.string().default('地域行事'),
    location: z.string().optional(),
    url: z.string().url().optional(),
    note: z.string().optional(),
  }),
})
```

#### コンポーネント設計

- `FarmCalendar.tsx`（React island, `client:load`）。当月ハイライト・バー展開などのインタラクションを担う。データは `calendar.astro`（Astro 側で `getCollection('crops'|'events')`）から props で受け渡す。
- レイアウトは **CSS Grid**（12 列＝月、半月粒度なら 24 列）。バーは `grid-column: start / end` でスパン。色は作物の `color`、ボランティア作業は枠線/塗りで強調。
- 凡例（作物色・ボランティア歓迎マーク・イベント種別）を別表示。
- テストは `FarmCalendar.test.tsx`（代表ケース: 当月ハイライト、ボランティアバーの強調クラス、イベント描画）。

### ナビゲーション再設計（`SiteHeader.astro`）

- 上記「グローバルナビ」を実装。ドロップダウン（活動を知る／参加する／支える）＋常時表示 CTA（参加する・寄付）。
- `BaseLayout.astro` に組み込み、`RouterMenu` から段階移行。`currentPath` でアクティブ表示。
- a11y: キーボード操作・フォーカスリング・`aria-current`。モバイルはハンバーガー or 既存フローティングを当面併用。

## 実装ステップ（段階的コーディング手順）

各ステップは独立リリース可能。**静的構成のまま**進め、決済（Stripe）・認証（Clerk）は README ロードマップ Phase 4/5 に従い後段でハイブリッド化する。

1. **ナビ基盤**: `SiteHeader.astro` を新設し `BaseLayout` に組込み（ジャーナリー導線＋常時 CTA）。既存 `RouterMenu` は当面併存。
2. **始まり物語**: `story.astro` を新設（既存記事の写真・引用を活用）。`purpose → story → join` の導線を張る。
3. **参加案内**: `join.astro` を新設（参加の流れ・FAQ・アクセス・持ち物、activo CTA を集約）。`HomeTabs` の「予定」タブから activo 導線を移設。
4. **農作業カレンダー（データ）**: `content.config.ts` に `crops` / `events` コレクションを追加し、`src/content/crops`・`src/content/events` にシードデータを投入。
5. **農作業カレンダー（UI）**: `FarmCalendar.tsx` ＋ `calendar.astro` を実装。トップ（`index.astro`）に「今参加できる作業」プレビューを追加。`HomeTabs` の「予定」をカレンダーへ統合。
6. **成果品**: `products.astro` ＋ `ProductCard.astro` を新設（下栗芋・茶・蕎麦・大豆のストーリー → shop へ送客）。
7. **トップ刷新**: `index.astro` にヒーロー＋3 導線カード（`JourneyCards.astro`）＋近況/カレンダー/物語の各プレビューを配置。
8. **寄付**: `support.astro` を新設（当面は案内のみ）。Stripe 導線は Phase 4 で実装。
9. **記事個別ページ（任意）**: `news/[slug].astro` を追加し SEO/共有を改善。
10. **ナビ統合の仕上げ**: `RouterMenu` をヘッダー/フッターへ収れん。フッターに法人情報（定款・公告・特商法・法人概要）を整理。

> 各ステップ完了時に `npm run lint` / `format:check` / `typecheck` / `test` / `build` を通すこと。新規 React island には代表的な Vitest テストを添える。

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
npm run test:e2e      # Playwright (実ブラウザ E2E, e2e/ 配下)
```

- **Linter**: ESLint 9 (flat config, `eslint.config.js`)。TypeScript / React / React Hooks / jsx-a11y / Astro 対応。整形系ルールは `eslint-config-prettier` で無効化し Prettier に委譲。日本語コンテンツの全角スペースを許容するため `no-irregular-whitespace` は無効。
- **Formatter**: Prettier (`.prettierrc.json`)。セミコロンなし・シングルクォート。`.astro` は `prettier-plugin-astro` で整形。対象外は `.prettierignore`。
- **テスト (方針)**: リグレッションテストは可能な限りコードを広くカバーする。ブラウザ依存の不具合 (NG) を修正したときは、その再発防止として実ブラウザテストを追加する。
  - **単体/結合 (jsdom)**: Vitest + Testing Library。React アイランドや DOM ロジックの「動き」と「スタイリング」を `src/**/*.{test,spec}.{ts,tsx}` に配置。インライン `<script>` のロジックは `*.ts` モジュールへ分離してテスト可能にする (例: `SiteHeader.astro` の挙動は `siteHeaderNav.ts` に分離し `siteHeaderNav.test.ts` で検証)。
  - **E2E (実ブラウザ)**: Playwright (`playwright.config.ts` / `e2e/*.spec.ts`)。jsdom が扱えないレイアウト・重なり順 (z-index/stacking) など、描画を伴う回帰のみを対象とする。CI では `e2e` ジョブで `npx playwright install --with-deps chromium` 後に実行する。

## ビルド時の補助処理

PDF.js Express ビューワーは `node_modules/@pdftron/pdfjs-express-viewer/public/` 配下に静的アセット (Web Worker 等) を持つ。`npm run build` の `postbuild` フックでこれらを `dist/` へコピーしているため、ローカル / GitHub Actions / Cloudflare Pages のいずれの環境でも自動で配置される。

## デザイン規則

- カラーテーマ: green / lime (山・自然を想起)
- 三角形 (▲) の装飾モチーフをロゴ・見出し・フッターに使用
  - Tailwind の `before:` / `after:` 疑似要素で border-trick を利用して描画
- フォントウェイト: light (`:root` に `font-weight: var(--font-weight-light)` を設定)
- レスポンシブ: モバイルファーストで設計
- ナビゲーション: グローバルナビは `SiteHeader.astro`。左下フローティングボタン「法令」(`RouterMenu`) は法令系文書（定款 / 公告 / 特商法表記）への補助導線
