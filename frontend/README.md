# Vue 3 + Vite + PrimeVue 4 + TailwindCSS 專案模板

這是一個基於 Vue 3 生態系統打造的現代化前端開發模板。整合了 Vite 建構工具帶來的快速開發體驗，PrimeVue 4 提供的豐富 UI 元件，以及 TailwindCSS 樣式設計系統。此模板已預先配置好開發所需的必要工具，讓您能夠專注在應用程式的開發上，無需花費時間在環境設定。

## Tech Stack

- Vue 3
- Vite
- Pinia (狀態管理)
- Vue Router
- TailwindCSS
- SASS
- ESLint + Prettier (程式碼品質工具)
- @ianvs/prettier-plugin-sort-imports (Prettier 排序插件)
- Stylelint
- 套件自動引入工具 (unplugin-auto-import)
- Vitest (單元測試框架)
- PrimeVue (PrimeVue UI 套件)
- PrimeLocale (PrimeVue 多語系套件 - 社區維護)

## 建議的開發環境設定

- [VSCode](https://code.visualstudio.com/) 
- [Vue -Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss#review-details)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [prettier-plugin-sort-imports
](https://github.com/IanVS/prettier-plugin-sort-imports)

- Node.js v18.18.2 版本佳
- pnpm@9.15.9 版本佳

## 專案設定

安裝依賴：
```sh
pnpm install
```

### 開發指令

開發環境運行（支援熱重載）：
```sh
pnpm dev
```

建置生產版本：
```sh
pnpm build
```

預覽建置結果：
```sh
pnpm preview
```

### 程式碼品質與測試

執行程式碼格式化：
```sh
pnpm format
```

執行 ESLint 檢查與自動修復：
```sh
pnpm lint
```

執行單元測試：
```sh
pnpm test:unit
```

## 專案結構說明

- `/src` - 原始碼目錄
- `/public` - 靜態資源目錄
- `/tests` - 測試檔案目錄

## 相關文件

- [Vite 設定參考](https://vitejs.dev/config/)
- [Vue 3 文件](https://vuejs.org/)
- [Pinia 文件](https://pinia.vuejs.org/)
- [TailwindCSS 文件](https://tailwindcss.com/docs)
- [Stylelint 文件](https://stylelint.io/)
- [ESLint 文件](https://eslint.org/)
- [Prettier 文件](https://prettier.io/)
- [PrimeVue 文件](https://primevue.org/)
- [PrimeLocale 文件](https://github.com/primefaces/primelocale)
