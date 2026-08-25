import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 4129,
  },
  css: {
    /** @description CSS 相關配置選項，用於設定 CSS 預處理器的行為 */
    preprocessorOptions: {
      scss: {
        /**
         * @description SCSS 預處理器的模式設定，在 Vite 5.4 版本中預設為 legacy 模式
         * 為避免出現警告訊息，建議將其設定為 modern-compiler 模式以優化編譯效能
         * @see {@link https://cn.vite.dev/config/shared-options#css-preprocessoroptions}
         */
        api: 'modern-compiler',
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', 'vitest'],
      dts: './src/auto-imports.d.ts', // 檔案位置
      eslintrc: {
        enabled: true, // 改為 true 會自動生成 unplugin-auto-import 的規則設定
      },
    }),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
