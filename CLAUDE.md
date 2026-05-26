# 遠山郷応援会 ウェブサイト

一般社団法人遠山郷応援会の公式ウェブサイト。

## 移行方針

**現状:** Firebase Hosting でホスティング中  
**方針:** Cloudflare への移行とデザイン・機能の全面刷新

移行にあたり、Firebase CLI・Firebase Hosting 依存の設定・ワークフローはすべて Cloudflare 向けに置き換える。

## 技術スタック

| 用途 | ライブラリ |
|------|-----------|
| フレームワーク | Vue 3 (Composition API / `<script setup>`) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| バンドラー | Parcel 2 |
| ルーター | vue-router v5 |
| PDF表示 | @pdftron/pdfjs-express-viewer |

## ディレクトリ構造

```
tohyamago/
├── public/               # フロントエンドソース
│   ├── index.html        # エントリーHTML
│   ├── index.ts          # Vueアプリ起動・ルーター初期化
│   ├── App.vue           # ルートコンポーネント（レイアウト）
│   ├── routes.ts         # ルート定義・タイトル設定
│   ├── macros.ts         # Parcelマクロ（Facebook APIフェッチ）
│   ├── components/
│   │   ├── RouterMenu.vue    # フローティングナビゲーションメニュー
│   │   └── FacebookFeed.vue  # Facebookフィード表示
│   ├── views/
│   │   ├── Home.vue          # トップページ（近況・予定タブ）
│   │   ├── Purpose.vue       # 活動趣旨
│   │   ├── Membership.vue    # 入会案内
│   │   ├── Articles.vue      # 定款（PDF表示）
│   │   ├── PublicNotices.vue # 公告
│   │   └── Notation.vue      # 特定商取引法に基づく表記
│   ├── assets/
│   │   ├── farm.jpg          # トップ画像
│   │   ├── mounts.jpg        # 山の画像
│   │   └── articles.pdf      # 定款PDF
│   ├── statics/
│   │   └── .well-known/      # Apple Pay ドメイン検証ファイル
│   ├── test/mock.json        # Facebook APIモックデータ（開発用）
│   └── .postcssrc            # PostCSS設定
├── .github/workflows/        # CI/CDワークフロー（Firebase → Cloudflare移行対象）
├── firebase.json             # Firebase設定（移行後は不要）
├── .firebaserc               # Firebaseプロジェクト設定（移行後は不要）
└── package.json              # ルートスクリプト（`postinstall`・`start`）
```

## ページ一覧

| パス | コンポーネント | 説明 |
|------|---------------|------|
| `/` | `Home.vue` | トップページ。「近況」(Facebook フィード) と「予定」タブを切り替え |
| `/purpose` | `Purpose.vue` | 活動趣旨（テキスト） |
| `/membership` | `Membership.vue` | 入会案内（会員権限・年会費・入会手続き） |
| `/articles` | `Articles.vue` | 定款（PDF ビューワー、`fullscreen: true`） |
| `/public_notices` | `PublicNotices.vue` | 公告 |
| `/notation` | `Notation.vue` | 特定商取引法に基づく表記 |

## 外部連携

### Facebook Graph API
- `macros.ts` で Parcel マクロとして実装（ビルド時に API フェッチ）
- 本番: `FACEBOOK_PAGE_ID` と `FACEBOOK_ACCESS_TOKEN` 環境変数を使用
- 開発時: `NODE_ENV !== 'production'` のとき `test/mock.json` を返す

### 外部リンク
- ボランティア募集: `https://activo.jp/s/a/119414`
- 成果品販売: `https://shop.tohyamago.org`

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `FACEBOOK_PAGE_ID` | Facebook ページ ID |
| `FACEBOOK_ACCESS_TOKEN` | Facebook アクセストークン |
| `PDFJS_EXPRESS_VIEWER` | PDF.js Express ビューワーライセンスキー |

## 開発コマンド

```bash
# 依存関係インストール（ルートで実行するとpublic/も自動インストール）
npm ci

# 開発サーバー起動（Firebase エミュレーター経由）
# ※ Cloudflare 移行後はこのコマンドを置き換える
npm start

# ビルド（public/ ディレクトリ内で実行）
cd public && npm run build
```

## デザイン規則（現行）

- カラーテーマ: green / lime（山・自然を想起）
- 三角形（▲）の装飾モチーフをロゴ・見出し・フッターに使用
  - Tailwind の `before:` / `after:` 疑似要素で border-trick を利用して描画
- フォントウェイト: light（`:root` に `font-weight: var(--font-weight-light)` を設定）
- レスポンシブ: モバイルファーストで設計
- ナビゲーション: 左下フローティングボタン「目次」を押してメニューを展開

## Cloudflare 移行時の主な作業

- [ ] `firebase.json` / `.firebaserc` を削除し、Cloudflare Pages 向け設定を追加
- [ ] GitHub Actions ワークフロー（`firebase-hosting-*.yml`）を Cloudflare Pages デプロイに置き換え
- [ ] SPAのフォールバック設定を Cloudflare Pages の `_redirects` ファイルで対応
- [ ] セキュリティヘッダー（`X-Frame-Options` 等）を Cloudflare Pages の `_headers` ファイルへ移行
- [ ] Parcel マクロの Facebook フェッチを Cloudflare Workers / Pages Functions に移行することも検討
- [ ] Apple Pay `.well-known` ファイルの配信設定確認
