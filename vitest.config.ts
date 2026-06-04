/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// Astro の Vite 設定 (React 連携等) を引き継いでテストを実行する。
export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
