---
type: slide
slideOptions:
  transition: slide
  theme: white
---

# Docker 新手入門

### 以 Laravel 8 + PHP 7.4 + MySQL 8 專案為例

<!-- .element: style="color: gray; font-size: 0.8em;" -->

---

## 大綱

1. Docker 是什麼？
2. 核心概念：Image / Container / Registry
3. Dockerfile — 打造你的映像檔
4. Volume — 資料持久化
5. Docker Compose — 多容器管理
6. 實戰操作
7. 常用指令速查 & FAQ

---

## Docker 是什麼？

- 一種**容器化技術**，把應用程式和所有依賴打包在一起
- 確保在任何環境都能一致運行
- 比虛擬機器更輕量、啟動更快

> 💡 就像國際貨運的「標準貨櫃」— 不管裡面裝什麼，規格統一，到哪都能卸貨

----

## 容器 vs 虛擬機器

|          | 虛擬機器 (VM)        | 容器 (Container) |
| -------- | -------------------- | ---------------- |
| 啟動速度 | 分鐘級               | 秒級             |
| 資源佔用 | GB 級（含 Guest OS） | MB 級            |
| 隔離性   | 完全隔離             | 程序級隔離       |
| 效能     | 有虛擬化開銷         | 接近原生         |

----

## 為什麼要用 Docker？

- ✅ **環境一致性** — 「在我電腦上可以跑啊」不再發生
- ✅ **快速部署** — `docker compose up` 一行搞定
- ✅ **隔離性** — 不同專案不同版本，互不干擾
- ✅ **可重現** — Image 打包一次，到處部署

---

## 核心概念

```
Dockerfile ──build──▶ Image ──run──▶ Container
                        │
                   push / pull
                        │
                    Registry
                   (Docker Hub)
```

----

## Image / Container / Registry

| 概念          | 比喻         | 說明                      |
| ------------- | ------------ | ------------------------- |
| **Image**     | 光碟         | 唯讀模板，包含 App + 依賴 |
| **Container** | 播放中的光碟 | Image 的執行實體          |
| **Registry**  | 唱片行       | 存放 Image 的地方         |

- 一個 Image 可建立多個 Container
- Docker Hub 是最常用的公開 Registry

---

## Dockerfile 常用指令

| 指令         | 用途               |
| ------------ | ------------------ |
| `FROM`       | 指定基底映像檔     |
| `RUN`        | 建置時執行命令     |
| `COPY`       | 複製檔案到映像檔   |
| `WORKDIR`    | 設定工作目錄       |
| `CMD`        | 容器啟動的預設命令 |
| `ENTRYPOINT` | 容器啟動的固定命令 |

----

## CMD vs ENTRYPOINT

```dockerfile
# ENTRYPOINT = 主程式（固定）
ENTRYPOINT ["entrypoint.sh"]

# CMD = 預設參數（可覆蓋）
CMD ["apache2-foreground"]
```

- `ENTRYPOINT` 一定會執行
- `CMD` 可在 `docker run` 時被覆蓋
- 搭配使用：`ENTRYPOINT` 當主程式，`CMD` 當預設參數

----
 
## Dockerfile 範例

```dockerfile
FROM php:7.4-apache-bullseye AS base

RUN apt-get update && apt-get install -y \
        libpng-dev libjpeg62-turbo-dev \
        libzip-dev unzip git curl \
    && docker-php-ext-install \
        pdo_mysql mbstring xml zip gd

COPY --from=composer:2 /usr/bin/composer \
     /usr/bin/composer

RUN a2enmod rewrite
WORKDIR /var/www/html
```

---

## 實戰：Stage 1 — base

> PHP 7.4 + Apache + 系統依賴

- 以 `php:7.4-apache-bullseye` 為基底
- 安裝 Laravel 需要的 PHP 擴充套件
- 從 `composer:2` 複製 Composer 執行檔
- 啟用 Apache `rewrite` 模組
- 建立 `laravel` 使用者（UID 1000）

----

## 實戰：Stage 2 — node-builder

> 編譯前端靜態資源

```dockerfile
FROM node:18-alpine AS node-builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY resources/ resources/
COPY webpack.mix.js ./
COPY public/ public/
RUN npm run production
```

- 先複製 `package.json` → 利用 Docker 層快取
- 編譯完成後，這個 Stage 不會出現在最終 Image

----

## 實戰：Stage 3 — development

> 開發環境

```dockerfile
FROM base AS development
COPY --from=node:18-bullseye /usr/local/bin/node \
     /usr/local/bin/node
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost/ || exit 1
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
```

- 包含 Node.js（需要跑 `npm run dev`）
- 程式碼透過 Volume 掛載，不用 COPY

----

## 實戰：Stage 4 — production

> 正式環境

```dockerfile
FROM base AS production
COPY . /var/www/html
RUN composer install --no-dev --optimize-autoloader
COPY --from=node-builder /build/public/js public/js
COPY --from=node-builder /build/public/css public/css
RUN chown -R www-data:www-data storage bootstrap/cache
CMD ["apache2-foreground"]
```

- 原始碼直接 COPY 進 Image
- 從 `node-builder` 複製編譯後的靜態資源

----

## Multi-stage Build 總結

```
node-builder (~900MB)    base (~500MB)
      │                      │
      │ 只複製編譯產物          │ 繼承
      ▼                      ▼
   ┌─────── production ────────┐
   │    最終 Image ≈ 500-600MB  │
   │    ✅ 不含 Node.js         │
   │    ✅ 不含 dev 依賴         │
   └────────────────────────────┘
```

- 更小的 Image → 更快部署
- 更少的工具 → 更小的攻擊面

---

## 安全性：不要把 .env Build 進 Image

**Image 每一層都可被檢視** — 密碼、金鑰會外洩！

```dockerfile
# ❌ 錯誤
COPY .env /var/www/html/.env

# ✅ 正確：執行時注入
# docker-compose.yml
services:
  app:
    env_file:
      - .env
```

- 將 `.env` 加入 `.dockerignore`
- 生產環境使用 Docker Secrets 或 Vault

----

## .dockerignore

```
.git
node_modules
vendor
.env              ← 排除敏感檔案
!.env.example     ← 保留範本
*.md
Dockerfile
docker-compose*.yml
```

- 作用類似 `.gitignore`
- 減少 Build Context 大小 → 加速建置
- **`.env` 必須列入！**

---

## Volume — 為什麼需要？

容器有一個「可寫層」：

- 容器刪除 → 資料消失 💥
- 無法在容器間共享

**Volume 讓資料獨立於容器生命週期之外**

----

## Volumes（Docker 管理）

```yaml
services:
  db:
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

- Docker 自動管理儲存位置
- 容器刪除後 Volume 仍在
- **最適合資料庫等需要持久化的資料**

----

## Bind Mounts（綁定掛載）

```yaml
services:
  app:
    volumes:
      - .:/var/www/html
```

- 主機目錄直接映射到容器
- 修改程式碼 → 容器內即時同步
- **開發環境必備！**
- 加上 `:ro` 可設為唯讀

```yaml
- ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro
```

----

## tmpfs Mounts（記憶體掛載）

```yaml
services:
  app:
    tmpfs:
      - /tmp
```

- 資料只存在記憶體中
- 容器停止即消失
- 速度最快
- 適合暫存資料、快取

----

## 三種掛載類型比較

|          | Volumes                     | Bind Mounts       | tmpfs          |
| -------- | --------------------------- | ----------------- | -------------- |
| 管理者   | Docker                      | 使用者            | OS（記憶體）   |
| 生命週期 | 需手動刪除                  | 跟隨主機          | 容器停止即消失 |
| 效能     | 好                          | 視檔案系統        | 最快           |
| 場景     | 資料庫                      | 開發環境          | 暫存/快取      |
| 範例     | `mysql_data:/var/lib/mysql` | `.:/var/www/html` | `/tmp`         |

---

## Docker Compose — 多容器管理

一個應用通常需要多個容器：

```yaml
version: "3.8"
name: docker-laravel-vue

services:
  app:    # PHP + Apache
    build:
      target: production
    ports:
      - "8087:80"
    env_file:
      - .env

  db:     # MySQL 8
    image: mysql:8.0
```

一個 YAML 檔定義所有服務 → `docker compose up` 一鍵啟動

----

## Networks（網路）

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true     # 純內部網路
```

```
瀏覽器 → :8087
            │
       ── frontend ──
            │
          [ app ]
            │
       ── backend ── (internal)
            │
          [ db ]    ← 外部無法直接存取
```

----

## Networks — 用房間來比喻

```
┌─ 大廳（frontend）────────────────┐
│                                  │
│  大門 :8087 ← 瀏覽器可以進來      │
│      │                           │
│  [ app ] ← 接待客人              │
│      │                           │
└──────┼───────────────────────────┘
       │ (app 有通往密室的鑰匙)
┌──────┼─ 密室（backend, internal）─┐
│      │                           │
│  [ db ] ← 保險箱在密室裡          │
│                                  │
│  ❌ 沒有門通往外面                 │
└──────────────────────────────────┘
```

- `app` 是唯一同時在兩個網路的「橋梁」
- `db` 只在密室裡 → 外部連不進去
- 開發環境的 `3306` port 是另一個機制（port mapping），不是 network

----

## Healthcheck + depends_on

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy

  db:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping",
             "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

- 確保 MySQL **真的準備好**才啟動 app
- 不只是「容器已啟動」，而是「服務可用」

----

## docker-compose.override.yml

```yaml
# 開發環境自動覆寫
services:
  app:
    build:
      target: development     # 改用 dev stage
    volumes:
      - .:/var/www/html       # 程式碼即時同步

  db:
    ports:
      - "3306:3306"           # 開放 DB port
```

- Compose **自動合併** `docker-compose.yml` + `override`
- 正式環境：`docker compose -f docker-compose.yml up -d`

---

## 實戰：啟動本專案

```bash
# 1. Clone 專案
git clone <repository-url>
cd docker-laravel-vue/backend

# 2. 建立 .env
cp .env.example .env

# 3. 啟動服務
docker compose up -d

# 4. 執行資料庫遷移
docker compose exec app php artisan migrate
```

----

## 驗證服務

```bash
# 查看容器狀態
docker compose ps

# 查看 log
docker compose logs app

# 瀏覽器開啟
# http://localhost:8087
```

確認所有服務都是 `Up (healthy)` 即完成！

---

## 常用指令速查

| 指令                              | 說明              |
| --------------------------------- | ----------------- |
| `docker compose up -d`            | 啟動所有服務      |
| `docker compose down`             | 停止並移除容器    |
| `docker compose down -v`          | 移除容器 + Volume |
| `docker compose ps`               | 查看服務狀態      |
| `docker compose logs -f`          | 即時查看 log      |
| `docker compose exec app bash`    | 進入容器          |
| `docker compose build --no-cache` | 完整重建          |
| `docker system prune`             | 清理未使用資源    |

---

## 常見問題 FAQ

- **app 一直重啟** → 檢查 `.env` 的 `DB_HOST=db` 是否正確
- **程式碼沒生效** → 確認有 override 的 Volume 掛載
- **port 衝突** → `lsof -i :8087` 找出佔用程式
- **Image 太大** → 檢查 `.dockerignore`、善用 Multi-stage Build
- **`docker-compose` vs `docker compose`** → 建議用新版 `docker compose`（空格）

---

## Q&A

### 感謝聆聽！🎉

有任何問題歡迎提問
