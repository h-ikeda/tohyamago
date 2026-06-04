import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright (実ブラウザ E2E) の設定。
 *
 * jsdom ではレイアウト/描画を行えないため検証できない問題
 * (重なり順・スタッキングコンテキスト等) のリグレッションを実ブラウザで確認する。
 * 方針: ブラウザテストは NG (不具合) を修正した際に、その再発防止として追加する。
 *
 * テストは `npm run dev` で起動した Astro 開発サーバーに対して実行する。
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
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
