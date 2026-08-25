# Docker Laravel Vue

以 Docker 容器化部署的 Laravel + Vue 全端專案模板。Backend 使用 Laravel 8（PHP 7.4 + Apache + MySQL 8），透過 JWT 提供 API；Frontend 使用 Vue 3 + Vite + PrimeVue 4 + TailwindCSS，作為獨立的 SPA 開發。

## 專案結構

```
docker-laravel-vue/
├── backend/    # Laravel 8 API（Docker 化，含 docker-compose.yml）
└── frontend/   # Vue 3 + Vite SPA（本機以 pnpm 開發）
```

- Backend 詳細說明（Docker 啟動、環境變數、常用指令）：[`backend/README.md`](./backend/README.md)
- Frontend 詳細說明（開發指令、程式碼品質工具）：[`frontend/README.md`](./frontend/README.md)

## 技術棧

| 分層     | 技術                                                              |
| -------- | ----------------------------------------------------------------- |
| Backend  | PHP 7.4、Laravel 8、Apache、MySQL 8、JWT（tymon/jwt-auth）、Docker |
| Frontend | Vue 3、Vite、Pinia、Vue Router、PrimeVue 4、TailwindCSS、Vitest    |

## 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（用於啟動 Backend）
- Node.js v18.18.2 以上、[pnpm](https://pnpm.io/) 9.15.9 以上（用於開發 Frontend）

## 快速開始

### 1. 啟動 Backend（Laravel API）

```bash
cd backend
cp .env.example .env
docker compose up -d
docker compose exec app php artisan migrate
```

API 服務將在 http://localhost:8087 提供。詳細步驟（含 JWT 設定、資料庫連線資訊）請見 [`backend/README.md`](./backend/README.md)。

### 2. 啟動 Frontend（Vue SPA）

```bash
cd frontend
pnpm install
pnpm dev
```

開發伺服器啟動後即可存取，詳細指令請見 [`frontend/README.md`](./frontend/README.md)。

## 開發注意事項

- Backend 與 Frontend 為各自獨立的專案，分別管理套件與環境變數（各自的 `.env`）。
- Frontend 若需呼叫 Backend API，請於 `frontend/.env` 設定 `VITE_BASE_URL` 指向 Backend 服務位址（預設 `http://localhost:8087`）。
- Backend 正式環境部署方式（Multi-stage Docker Build）請參考 [`backend/README.md`](./backend/README.md) 的「正式環境部署」章節。
