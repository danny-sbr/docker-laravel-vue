# 後端 CRUD 實作指南

## 架構概覽

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/ExampleItemController.php
│   │   ├── Requests/
│   │   │   ├── StoreExampleItemRequest.php
│   │   │   └── UpdateExampleItemRequest.php
│   │   └── Resources/ExampleItemResource.php
│   └── Models/ExampleItem.php
├── database/
│   ├── migrations/xxxx_create_example_items_table.php
│   └── seeders/ExampleItemSeeder.php
├── routes/api.php
└── config/cors.php
```

## 路由設定

- `RouteServiceProvider` 已移除 `api` prefix，API 路由直接掛在根路徑
- 使用 `Route::apiResource()` 自動產生 5 條 RESTful 路由

| Method   | URI                     | 用途   |
| -------- | ----------------------- | ------ |
| GET      | `/example`              | 列表   |
| POST     | `/example`              | 新增   |
| GET      | `/example/{exampleItem}` | 單筆   |
| PUT      | `/example/{exampleItem}` | 更新   |
| DELETE   | `/example/{exampleItem}` | 刪除   |

## 驗證模式

- 使用 Form Request（`StoreExampleItemRequest` / `UpdateExampleItemRequest`）
- Update request 的欄位加上 `sometimes` 讓部分更新可行
- 狀態值以 Model 常數 `ExampleItem::STATUSES` 集中管理

## Resource 格式

- `ExampleItemResource` 輸出 camelCase key（`createdAt`, `updatedAt`）
- 前端不需額外轉換命名風格

## CORS

- `config/cors.php` 的 `paths` 設為 `['*']`，允許所有路徑跨域
- `allowed_origins` 設為 `['*']`

## 複製新實體 Checklist

1. 建立 Migration：`php artisan make:migration create_xxx_table`
2. 建立 Model：定義 `$fillable`、常數
3. 建立 Form Requests：Store + Update
4. 建立 Resource：camelCase 輸出
5. 建立 Controller：index/store/show/update/destroy
6. 註冊路由：`routes/api.php` 加入 `Route::apiResource()`
7. 建立 Seeder（選用）
8. 執行 `php artisan migrate` 和 `php artisan db:seed`
