# Docker Laravel Vue — Backend

使用 Docker 容器化部署的 Laravel 8 後端應用程式。

## 技術棧

| 技術          | 版本          |
| ------------- | ------------- |
| PHP           | 7.4           |
| Apache        | latest        |
| Laravel       | 8             |
| MySQL         | 8.0           |
| Node.js       | 18（開發環境） |
| Docker Compose | v3.8+        |

## 專案目錄結構

```
backend/
├── app/                    # Laravel 應用程式核心（Models、Controllers 等）
├── bootstrap/              # Laravel 啟動程式與快取目錄
├── config/                 # Laravel 設定檔
├── database/               # Migration、Seeder、Factory
├── docker/                 # Docker 相關設定檔
│   ├── apache/
│   │   └── laravel.conf    # Apache VirtualHost 設定
│   ├── mysql/
│   │   └── my.cnf          # MySQL 自訂設定（utf8mb4 等）
│   └── entrypoint.sh       # 開發環境容器啟動腳本
├── docs/                   # 專案文件
├── public/                 # 公開目錄（Apache DocumentRoot）
├── resources/              # 前端資源（Blade、JS、CSS）
├── routes/                 # 路由定義
├── storage/                # Log、Cache、Session、上傳檔案
├── tests/                  # 測試檔案
├── .env.example            # 環境變數範本
├── Dockerfile              # Multi-stage Dockerfile
├── docker-compose.yml      # Docker Compose 主設定（正式環境基底）
└── docker-compose.override.yml  # Docker Compose 覆寫（開發環境專用）
```

## 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 已安裝並執行

## 開發環境啟動

### 1. 建立環境變數檔

```bash
cp .env.example .env
```

> 預設的資料庫連線資訊已配置好，通常不需要修改。

### 2. 建置並啟動容器

```bash
docker compose up -d
```

首次執行時，Docker 會自動：
- 建置 PHP + Apache 映像（`development` 階段）
- 拉取 MySQL 8.0 映像
- 啟動 `laravel-app`（PHP + Apache）與 `laravel-db`（MySQL）容器

> 容器啟動時，`entrypoint.sh` 會自動處理以下事項：
> - 建立 `storage/` 子目錄與設定權限
> - 若 `vendor/` 不存在，自動執行 `composer install`
> - 若 `APP_KEY` 為空，自動執行 `php artisan key:generate`

### 3. 執行資料庫遷移

```bash
docker compose exec app php artisan migrate
```

### 4. 存取應用程式

瀏覽器開啟 http://localhost:8087

### 5.（可選）安裝前端依賴並編譯

```bash
docker compose exec app npm install
docker compose exec app npm run dev
```

## 正式環境部署

正式環境使用 `-f` 參數指定只讀主設定檔，跳過 `docker-compose.override.yml`：

```bash
# 建置正式環境映像
docker compose -f docker-compose.yml build

# 啟動服務
docker compose -f docker-compose.yml up -d
```

正式環境與開發環境的差異：

| 項目         | 開發環境                     | 正式環境                            |
| ------------ | ---------------------------- | ----------------------------------- |
| Build target | `development`                | `production`                        |
| 程式碼       | Bind Mount，修改即時生效      | COPY 進 Image，需重新 build         |
| Node.js      | 容器內包含，可執行 npm        | 不包含，前端資源在 build 時預先編譯   |
| MySQL Port   | 對外開放 3306（供本機工具連線） | 不暴露，僅限內部網路                 |

## 資料庫工具連線（TablePlus / DBeaver）

開發環境下，MySQL 的 3306 port 會映射到主機，可使用以下資訊連線：

| 欄位     | 值          |
| -------- | ----------- |
| Host/IP  | `127.0.0.1` |
| Port     | `3306`      |
| User     | `laravel`   |
| Password | `secret`    |
| Database | `laravel`   |

> 以上為 `.env.example` 的預設值，若你修改了 `.env` 請使用對應的值。

## 常用指令

### Docker

```bash
# 啟動所有服務
docker compose up -d

# 停止所有服務
docker compose down

# 停止並刪除 Volume（資料庫資料會全部清除）
docker compose down -v

# 重新建置映像（不使用快取）
docker compose build --no-cache

# 進入 app 容器
docker compose exec app bash

# 查看容器狀態
docker compose ps

# 查看容器 Log
docker compose logs -f app
docker compose logs -f db
```

### Laravel（容器內執行）

```bash
# 資料庫遷移
docker compose exec app php artisan migrate

# 回滾最後一次遷移
docker compose exec app php artisan migrate:rollback

# 重建資料庫（刪除所有表並重新遷移）
docker compose exec app php artisan migrate:fresh

# 執行 Seeder
docker compose exec app php artisan db:seed

# 清除快取
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear

# 執行測試
docker compose exec app php artisan test
```
