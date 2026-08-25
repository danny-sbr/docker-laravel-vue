# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

此為 `docker-laravel-vue` 專案的 Backend，使用 Docker 容器化部署 Laravel 8 應用程式。

## 技術棧

- **PHP 7.4** + **Apache (latest)** — 基於 `php:7.4-apache` 映像
- **Laravel 8** — 後端框架
- **MySQL 8** — 資料庫，字元集 utf8mb4
- **Node.js 18** — 用於 Laravel Mix 編譯前端資源
- **Docker Compose v3.8+**

## Docker 常用指令

```bash
# 啟動所有服務
docker compose up -d

# 停止所有服務
docker compose down

# 重新建置映像
docker compose build --no-cache

# 進入 app 容器
docker compose exec app bash
```

## Laravel 常用指令（容器內執行）

```bash
# 資料庫遷移
php artisan migrate

# 清除快取
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# 執行測試
php artisan test

# 執行單一測試檔案
php artisan test --filter=ExampleTest

# 前端資源編譯
npm run dev
npm run production
```

## 架構重點

- Apache DocumentRoot 指向 Laravel 的 `public/` 目錄
- 程式碼透過 volume 掛載至容器，修改後即時生效
- MySQL 資料透過 volume 持久化
- 資料庫連線設定於 `.env`，需對應 `docker-compose.yml` 中的服務名稱與環境變數
