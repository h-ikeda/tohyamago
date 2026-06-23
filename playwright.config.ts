import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright (実ブラウザ E2E) の設定。
 *
 * jsdom ではレイアウト/描画を行えないため検証できない問題
 * (重なり順・スタッキングコンテキスト等) のリグレッションを実ブラウザで確認する。
 * 方針: ブラウザテストは NG (不具合) を修正した際に、その再発防止として追加する。
 *
 * テストはビルド成果物 (dist/) を `npm run preview` で配信したサーバーに対して
 * 実行する。Astro 7 の `astro dev` は非 TTY 環境 (CI 等) でバックグラウンド
 * デーモン化し、起動コマンドが即座に終了するため Playwright の webServer が
 * "exited early" で失敗する。`astro preview` はフォアグラウンドで動作し続けるため
 * webServer に適し、かつ本番に近いビルド済み出力を検証できる。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    // ビルド (画像最適化込み) を含むため余裕を持たせる
    timeout: 240_000,
  },
})
