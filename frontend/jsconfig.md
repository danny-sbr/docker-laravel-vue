# JSConfig.json 設定說明

這個檔案是用來配置 JavaScript 專案的 TypeScript 編譯器選項。

## 主要設定說明

### compilerOptions（編譯器選項）

- `paths`: 設定模組路徑別名
  - `@/*`: 將 `@` 符號對應到 `./src/*` 目錄，方便引用檔案時使用簡短路徑
    - 例如：可以使用 `import { Component } from '@/components'` 取代 `'./src/components'`

- `module`: 設定為 "ESNext"，表示使用最新的 ECMAScript 模組系統
  - 支援 import/export 等現代模組語法

- `moduleResolution`: 設定為 "Bundler"，指定模組解析策略
  - 適用於使用打包工具（如 Webpack、Vite）的專案

- `checkJs`: JavaScript 檔案的型別檢查選項
  - 目前設定為 false（預設關閉）
  - 當設定為 true 時，編輯器會：
    - 對 .js 檔案進行型別推斷
    - 提示可能的型別錯誤（例如：undefined 的變數使用）
    - 檢查函式參數使用是否正確
    - 協助發現可能的潛在的程式碼問題

### exclude（排除項目）

指定不要被 TypeScript/JavaScript 語言服務處理的檔案：
- `node_modules`: 排除所有依賴套件
- `dist`: 排除建置輸出目錄
