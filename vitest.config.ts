/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// Astro の Vite 設定 (React 連携等) を引き継いでテストを実行する。
export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Codecov 連携用に lcov を出力。ローカル確認用に text / html も併設。
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      // テスト本体・型定義・設定ファイル (テスト可能なロジックを持たない) を除外する。
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/types/**',
        'src/content.config.ts',
      ],
    },
  },
})
