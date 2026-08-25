# 前端 CRUD 實作指南

## 架構概覽

```
frontend/src/
├── types/example-item.d.ts          # 型別定義
├── utils/axios.js                    # Axios 實例
├── composables/useExampleItemApi.js  # API 封裝
├── stores/exampleItem.js             # Pinia Store
├── components/ExampleItemDialog.vue  # 新增/編輯 Dialog
└── views/ExampleItemListView.vue     # 列表頁
```

## 分層架構

```
View → Store → Composable (API) → Axios → Backend
```

1. **型別定義** (`types/*.d.ts`)：集中管理資料模型與 payload 型別
2. **Axios 實例** (`utils/axios.js`)：統一 baseURL 和 headers
3. **API Composable** (`composables/use*Api.js`)：封裝 HTTP 請求，回傳 Promise
4. **Pinia Store** (`stores/*.js`)：管理狀態與業務邏輯，呼叫 API composable
5. **元件/頁面** (`views/*.vue`, `components/*.vue`)：UI 層，使用 Store

## API 層模式

```js
import apiClient from '@/utils/axios'

export function useXxxApi() {
  const getAll = (page = 1) => apiClient.get('/xxx', { params: { page } })
  const create = (payload) => apiClient.post('/xxx', payload)
  const update = (id, payload) => apiClient.put(`/xxx/${id}`, payload)
  const remove = (id) => apiClient.delete(`/xxx/${id}`)
  return { getAll, create, update, remove }
}
```

## Store 模式

- 使用 Composition API 風格（`defineStore('name', () => { ... })`）
- State 用 `ref()`，Actions 為 async function
- 操作完成後自動 `fetchAll()` 刷新列表

## 元件層級

- **ExampleItemListView**：DataTable + Toolbar + 分頁
- **ExampleItemDialog**：Dialog + 表單，透過 `v-model:visible` 控制顯示
- 刪除使用 PrimeVue `useConfirm()` 確認對話框
- 通知使用 PrimeVue `useToast()`

## PrimeVue 注意事項

- PrimeVue v4 中 `Dropdown` 已改名為 `Select`
- `ToastService` 和 `ConfirmationService` 需在 `main.js` 註冊
- `<Toast />` 和 `<ConfirmDialog />` 需放在 `App.vue`

## 複製新實體 Checklist

1. 新增型別定義：`src/types/xxx.d.ts`
2. 新增 API composable：`src/composables/useXxxApi.js`
3. 新增 Pinia Store：`src/stores/xxx.js`
4. 新增 Dialog 元件：`src/components/XxxDialog.vue`
5. 新增列表頁：`src/views/XxxListView.vue`
6. 註冊路由：`src/router/index.js`
