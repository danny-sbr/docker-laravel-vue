# Docker 新手入門教學

> 以本專案（Laravel 8 + PHP 7.4 + MySQL 8）為範例，帶你從零開始認識 Docker。

---

## 目錄

1. [Docker 是什麼？](#一docker-是什麼)
2. [Docker 核心概念](#二docker-核心概念)
3. [Dockerfile — 打造你的映像檔](#三dockerfile--打造你的映像檔)
4. [Volume — 資料持久化](#四volume--資料持久化)
5. [Docker Compose — 多容器管理](#五docker-compose--多容器管理)
6. [實戰：啟動本專案](#六實戰啟動本專案)
7. [常用指令速查表](#七常用指令速查表)
8. [常見問題 FAQ](#八常見問題-faq)

---

## 一、Docker 是什麼？

### 容器 vs 虛擬機器

想像一下國際貨運的場景：

- **虛擬機器 - VM**就像每批貨物都用一艘專屬貨船來運送 — 每艘船都有自己的引擎、船員、燃料系統，即使只運一小箱貨物也要出動整艘船。
- **容器 - Container**就像標準化的貨櫃 — 不管裡面裝什麼貨物，都用同一種規格的貨櫃，放在同一艘大船上運送，共享船的引擎和基礎設施。

```
┌──────────────────────────────────────────────────────┐
│                    虛擬機器 (VM)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │    App A     │ │    App B     │ │    App C     │  │
│  │   Libs/Bins  │ │   Libs/Bins  │ │   Libs/Bins  │  │
│  │   Guest OS   │ │   Guest OS   │ │   Guest OS   │  │
│  │ (完整 kernel │ │ (完整 kernel │ │ (完整 kernel │  │
│  │ + userspace) │ │ + userspace) │ │ + userspace) │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│               Hypervisor (虛擬化層)                     │
│                    Host OS                            │
│                    硬體設備                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   容器 (Container)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │    App A     │ │    App B     │ │    App C     │  │
│  │   Libs/Bins  │ │   Libs/Bins  │ │   Libs/Bins  │  │
│  │ Linux 發行版 │ │ Linux 發行版 │ │ Linux 發行版 │  │
│  │ (僅 user-   │ │ (僅 user-   │ │ (僅 user-   │  │
│  │  space)     │ │  space)     │ │  space)     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│    ← 沒有自己的 kernel，共享 Host OS 的 kernel →       │
│               Docker Engine (容器引擎)                  │
│                    Host OS (kernel)                    │
│                    硬體設備                             │
└──────────────────────────────────────────────────────┘
```

**關鍵差異**：
- **VM**：每個虛擬機器都有完整的 Guest OS（包含自己的 kernel + userspace），而且啟動時必須**預先分配固定的 CPU 和記憶體**（例如 2 核 CPU + 4GB RAM），即使 VM 內的應用實際只用了一小部分，這些資源也會被鎖住無法給其他程式使用。所以佔用資源多、啟動慢。
- **Container**：每個容器**有**一個輕量的 Linux 發行版（如 Alpine、Debian），提供檔案系統、套件管理、系統工具等 **userspace** 元件，但**不包含 kernel** — 所有容器共享 Host OS 的 kernel。資源方面，容器預設**動態共享** Host 的 CPU 和記憶體，用多少算多少，不會預先鎖定（除非你主動設定 `resources.limits`）。這就是容器啟動快、佔用資源少的原因。

> 💡 舉例：當你用 `FROM php:7.4-apache` 時，這個 Image 底層其實是基於 Debian 的 userspace，包含 apt 套件管理器、bash、coreutils 等工具 — 只是沒有自己的 kernel。

### 為什麼要用 Docker？

| 痛點                            | Docker 怎麼解決                |
| ------------------------------- | ------------------------------ |
| 「在我電腦上可以跑啊！」        | 環境打包成 Image，到哪裡都一樣 |
| 安裝環境要半天                  | `docker compose up` 一行搞定   |
| 不同專案需要不同版本的 PHP/Node | 每個容器獨立，互不干擾         |
| 正式環境部署複雜                | Image 打包一次，到處部署       |

### 安裝 Docker Desktop

1. 前往 [Docker 官方網站](https://www.docker.com/products/docker-desktop/) 下載 Docker Desktop
2. 依照作業系統（macOS / Windows / Linux）的指引安裝
3. 安裝完成後，開啟終端機輸入以下指令驗證：

```bash
docker --version
# Docker version 24.x.x, build xxxxxxx

docker compose version
# Docker Compose version v2.x.x
```

---

## 二、Docker 核心概念

Docker 有三個最重要的概念，它們的關係就像**燒錄檔、光碟、唱片行**：

```
┌──────────────┐    docker build    ┌──────────────┐    docker run     ┌──────────────┐
│              │  ───────────────>  │              │  ───────────────>  │              │
│  Dockerfile  │                   │    Image     │                   │  Container   │
│  (燒錄檔)     │                   │  (光碟)       │                   │  (播放中的光碟) │
│              │                   │              │                   │              │
└──────────────┘                   └──────────────┘                   └──────────────┘
                                         │
                                    docker push / pull
                                         │
                                   ┌─────▼────────┐
                                   │   Registry   │
                                   │  (唱片行)     │
                                   │  Docker Hub  │
                                   └──────────────┘
```

| 概念                  | 比喻         | 說明                                                                      |
| --------------------- | ------------ | ------------------------------------------------------------------------- |
| **Image（映像檔）**   | 光碟         | 唯讀的模板，包含應用程式和所有依賴。可以從同一個 Image 建立多個 Container |
| **Container（容器）** | 播放中的光碟 | Image 的執行實體。每個 Container 都是獨立的執行環境                       |
| **Registry（倉庫）**  | 唱片行       | 存放和分享 Image 的地方，最常用的是 [Docker Hub](https://hub.docker.com/) |

### 簡單操作體驗

```bash
# 從 Docker Hub 拉取一個 Image
docker pull hello-world

# 用這個 Image 建立並啟動一個 Container
docker run hello-world
```

---

## 三、Dockerfile — 打造你的映像檔

Dockerfile 是一個文字檔，裡面包含一系列指令，告訴 Docker 如何一步步建立你的 Image。

### 常用指令

| 指令         | 用途                     | 範例                                           |
| ------------ | ------------------------ | ---------------------------------------------- |
| `FROM`       | 指定基底映像檔           | `FROM php:7.4-apache-bullseye`                 |
| `RUN`        | 在建置時執行命令         | `RUN apt-get update && apt-get install -y git` |
| `COPY`       | 將檔案從主機複製到映像檔 | `COPY . /var/www/html`                         |
| `WORKDIR`    | 設定工作目錄             | `WORKDIR /var/www/html`                        |
| `CMD`        | 容器啟動時預設執行的命令 | `CMD ["apache2-foreground"]`                   |
| `ENTRYPOINT` | 容器啟動時固定執行的命令 | `ENTRYPOINT ["entrypoint.sh"]`                 |
| `EXPOSE`     | 宣告容器要監聽的 port    | `EXPOSE 80`                                    |
| `ENV`        | 設定環境變數             | `ENV APP_ENV=production`                       |

> **`CMD` vs `ENTRYPOINT`**：
> - `ENTRYPOINT` 是容器的「主程式」，一定會執行
> - `CMD` 是「預設參數」，可以在 `docker run` 時被覆蓋
> - 兩者搭配使用時：`ENTRYPOINT` 當主程式，`CMD` 當預設參數

### 實戰：逐段解析本專案的 Dockerfile

本專案使用 **Multi-stage Build（多階段建置）**，一個 Dockerfile 裡定義了四個階段：

#### Stage 1：`base` — 基底映像檔

```dockerfile
# ============================================================
# Stage: base — PHP 7.4 + Apache + 系統依賴 + PHP 擴充套件
# ============================================================
FROM php:7.4-apache-bullseye AS base

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libzip-dev \
        libxml2-dev \
        libonig-dev \
        unzip \
        git \
        curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        xml \
        zip \
        bcmath \
        gd \
    && apt-get clean

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache 設定
RUN a2enmod rewrite
COPY docker/apache/laravel.conf /etc/apache2/sites-available/000-default.conf

# 建立 laravel 使用者 (UID 1000)
RUN useradd -u 1000 -ms /bin/bash laravel

WORKDIR /var/www/html
```

**這個階段做了什麼？**

1. 以 `php:7.4-apache-bullseye` 為基底（已包含 PHP 7.4 和 Apache）
2. `--mount=type=cache`：使用 BuildKit 快取機制，加速重複建置時的 `apt-get` 下載
3. 安裝 Laravel 需要的系統函式庫和 PHP 擴充套件（`pdo_mysql`、`gd` 等）
4. 從官方 `composer:2` 映像檔複製 Composer 執行檔（不需要完整安裝）
5. 啟用 Apache 的 `rewrite` 模組（Laravel 路由需要）
6. 複製自訂的 Apache 設定，讓 DocumentRoot 指向 `public/`
7. 建立一個 UID 為 1000 的使用者（對應主機使用者，避免權限問題）

#### Stage 2：`node-builder` — 前端資源編譯

```dockerfile
# ============================================================
# Stage: node-builder — 編譯前端靜態資源 (僅 production 使用)
# ============================================================
FROM node:18-alpine AS node-builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY resources/ resources/
COPY webpack.mix.js ./
COPY public/ public/

RUN npm run production
```

**這個階段做了什麼？**

1. 使用輕量的 `node:18-alpine` 映像檔
2. 先只複製 `package*.json` 並執行 `npm ci`（利用 Docker 的層快取，只有 `package.json` 改變時才重新安裝）
3. 再複製前端原始碼並編譯
4. 編譯完成後，這個階段的 Node.js 環境就不需要了（不會出現在最終 Image）

#### Stage 3：`development` — 開發環境

```dockerfile
# ============================================================
# Stage: development — 開發環境 (target: development)
# ============================================================
FROM base AS development

# 從 Node.js 映像複製 node + npm
COPY --from=node:18-bullseye /usr/local/bin/node /usr/local/bin/node
COPY --from=node:18-bullseye /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
```

**這個階段做了什麼？**

1. 從 `base` 階段繼承（已有 PHP + Apache）
2. 從 Node.js 映像檔中複製 `node` 和 `npm`（開發時需要跑 `npm run dev`）
3. 設定 `entrypoint.sh` 作為容器啟動的進入點腳本
4. 加入 `HEALTHCHECK`，讓 Docker 定期檢查服務是否正常
5. 開發環境的程式碼透過 Volume 掛載，所以不需要 `COPY` 原始碼

#### Stage 4：`production` — 正式環境

```dockerfile
# ============================================================
# Stage: production — 正式環境 (target: production)
# ============================================================
FROM base AS production

# 複製原始碼
COPY . /var/www/html

# 安裝 PHP 依賴 (不含 dev)
RUN composer install --no-dev --no-interaction --optimize-autoloader

# 複製 node-builder 編譯後的靜態資源
COPY --from=node-builder /build/public/js public/js
COPY --from=node-builder /build/public/css public/css
COPY --from=node-builder /build/public/mix-manifest.json public/mix-manifest.json

# 設定權限
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["apache2-foreground"]
```

**這個階段做了什麼？**

1. 從 `base` 階段繼承
2. 複製全部原始碼到 Image 中
3. 安裝 PHP 依賴（`--no-dev` 排除開發用套件）
4. 從 `node-builder` 階段複製已編譯好的 JS/CSS（不需要 Node.js 環境）
5. 設定 Laravel 需要的目錄權限

### Multi-stage Build 的好處

```
┌──────────────┐     ┌──────────────┐
│ node-builder │     │     base     │
│  (Node 18)   │     │ (PHP+Apache) │
│  ~900MB      │     │  ~500MB      │
└──────┬───────┘     └──────┬───────┘
       │ 只複製               │ 繼承
       │ 編譯產物              │
       ▼                     ▼
┌─────────────────────────────────┐
│          production             │
│  最終 Image ≈ 500-600MB         │
│  不含 Node.js / npm             │
│  不含 dev dependencies          │
└─────────────────────────────────┘
```

- **更小的 Image**：最終產物不包含建置工具（Node.js、npm）
- **更安全**：攻擊面更小，沒有不必要的工具
- **更快部署**：Image 越小，傳輸和啟動越快

### 安全性：不要將 `.env` 等敏感資訊 Build 進 Image

#### 為什麼不能把 `.env` COPY 進 Image？

Docker Image 是由一層層的「Layer」堆疊而成，**每一層都可以被檢視**。即使你在後面的層刪除了 `.env`，它仍然存在於先前的層中。

```
⚠️ 這代表任何拿到你 Image 的人，都能用以下指令看到你的密碼：
docker history <image>
docker save <image> | tar -x  # 解開每一層
```

#### ❌ 錯誤做法

```dockerfile
# 千萬不要這樣做！
COPY . /var/www/html          # .env 也被複製進去了
COPY .env /var/www/html/.env  # 直接複製 .env
```

#### ✅ 正確做法

**1. 將 `.env` 加入 `.dockerignore`**

```
# .dockerignore
.env
!.env.example
```

> 這樣 `COPY . /var/www/html` 時就不會包含 `.env`

**2. 執行時注入環境變數**

```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env    # 在容器啟動時載入，不會進入 Image
```

或用 `docker run`：

```bash
docker run --env-file .env my-app
```

**3. 生產環境建議**

- 使用 **Docker Secrets**（Docker Swarm 模式）
- 使用外部密鑰管理服務（如 HashiCorp Vault、AWS Secrets Manager）

### `.dockerignore` 作用與範例

`.dockerignore` 就像 `.gitignore`，用來排除不需要送進 Build Context 的檔案。

**本專案的 `.dockerignore`：**

```
.git
node_modules
vendor
.env
!.env.example
*.md
Dockerfile
docker-compose*.yml
.claude
.agents
.idea
.vscode
```

**為什麼需要 `.dockerignore`？**

1. **安全性**：排除 `.env` 等敏感檔案
2. **加速建置**：減少送進 Docker 的檔案量（`.git`、`node_modules` 都很大）
3. **避免覆蓋**：不讓主機的 `vendor` 覆蓋容器內 `composer install` 的結果

---

## 四、Volume — 資料持久化

### 為什麼容器資料會消失？

容器有一個「可寫層（Writable Layer）」，所有在容器內的寫入操作都在這一層。但是：

- 容器被刪除時，可寫層也跟著消失
- 可寫層無法輕易在不同容器間共享

**Volume 就是解決這個問題的機制** — 讓資料獨立於容器生命週期之外。

### 三種掛載類型

#### 1. Volumes（Docker 管理）

由 Docker 負責管理的儲存空間，資料存放在 Docker 的內部目錄中。

```yaml
# docker-compose.yml
services:
  db:
    volumes:
      - mysql_data:/var/lib/mysql    # Named Volume

volumes:
  mysql_data:    # 宣告 Volume
```

```
主機 (Docker 管理的目錄)          容器
┌─────────────────────┐       ┌──────────────────┐
│ /var/lib/docker/     │ ◄──► │ /var/lib/mysql    │
│   volumes/           │       │ (MySQL 資料)      │
│   mysql_data/_data   │       │                  │
└─────────────────────┘       └──────────────────┘
```

**特點**：
- Docker 自動管理，不用關心實際存放位置
- 最適合需要持久化的資料（如資料庫）
- 容器刪除後，Volume 仍然存在

#### 2. Bind Mounts（綁定掛載）

直接將主機的目錄或檔案映射到容器中。

```yaml
# docker-compose.override.yml（開發環境）
services:
  app:
    volumes:
      - .:/var/www/html    # 綁定掛載
```

```
主機 (你的專案目錄)              容器
┌─────────────────────┐       ┌──────────────────┐
│ ./backend/           │ ◄──► │ /var/www/html     │
│   app/               │       │   app/            │
│   routes/            │       │   routes/         │
│   resources/         │       │   resources/      │
└─────────────────────┘       └──────────────────┘

   你在主機編輯程式碼 ──────► 容器內即時同步生效！
```

**特點**：
- 開發時必備！修改程式碼後不用重建 Image
- 主機和容器看到的是同一份檔案
- 適合開發環境，不建議用於生產

**唯讀掛載**：加上 `:ro` 可以讓容器只能讀取，無法修改

```yaml
# docker-compose.yml
services:
  db:
    volumes:
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro
```

> 本專案將 MySQL 設定檔以唯讀方式掛載，容器內不會意外修改到主機上的設定。

#### 3. tmpfs Mounts（記憶體掛載）

資料只存在於記憶體中，容器停止即消失。

```yaml
services:
  app:
    tmpfs:
      - /tmp
      - /var/run
```

**特點**：
- 速度最快（記憶體讀寫）
- 容器停止後資料就消失
- 適合暫存資料、快取、或敏感資料（不想寫入磁碟）

### 三種類型比較表

| 特性         | Volumes                     | Bind Mounts        | tmpfs Mounts         |
| ------------ | --------------------------- | ------------------ | -------------------- |
| 由誰管理     | Docker                      | 使用者             | 作業系統（記憶體）   |
| 主機上的位置 | Docker 內部目錄             | 使用者指定         | 記憶體（無磁碟路徑） |
| 生命週期     | 獨立於容器，需手動刪除      | 跟隨主機檔案       | 容器停止即消失       |
| 效能         | 好                          | 視主機檔案系統而定 | 最快                 |
| 適用場景     | 資料庫、持久化資料          | 開發環境、設定檔   | 暫存、快取、敏感資料 |
| 本專案範例   | `mysql_data:/var/lib/mysql` | `.:/var/www/html`  | —                    |

---

## 五、Docker Compose — 多容器管理

### 為什麼需要 Compose？

一個完整的應用通常不只一個容器。以本專案為例，至少需要：

- **app**：PHP + Apache（跑 Laravel）
- **db**：MySQL 8（資料庫）

如果每次都要手動下 `docker run` 並設定一堆參數，會非常痛苦。Docker Compose 讓你用一個 YAML 檔就能定義和管理多個容器。

### `docker-compose.yml` 逐段解析

#### Services（服務定義）

```yaml
version: "3.8"
name: docker-laravel-vue

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production          # 指定建置到哪個 stage
    ports:
      - "8087:80"                 # 主機 8087 → 容器 80
    env_file:
      - .env                      # 載入環境變數
    networks:
      - frontend
      - backend
    depends_on:
      db:
        condition: service_healthy # 等 db 健康檢查通過才啟動
    restart: unless-stopped        # 除非手動停止，否則自動重啟
    stop_grace_period: 30s         # 停止時給 30 秒優雅關閉
    deploy:
      resources:
        limits:
          memory: 512M             # 限制記憶體使用
    logging:
      driver: json-file
      options:
        max-size: "10m"            # 每個 log 檔最大 10MB
        max-file: "3"              # 最多保留 3 個 log 檔
```

```yaml
  db:
    image: mysql:8.0               # 直接使用官方 Image，不用自己 build
    volumes:
      - mysql_data:/var/lib/mysql                              # 資料持久化
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro     # 設定檔（唯讀）
    env_file:
      - .env
    environment:
      MYSQL_DATABASE: ${DB_DATABASE:-laravel}       # 從 .env 讀取，預設 laravel
      MYSQL_USER: ${DB_USERNAME:-laravel}
      MYSQL_PASSWORD: ${DB_PASSWORD:-secret}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-rootsecret}
    networks:
      - backend
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s               # 每 10 秒檢查一次
      timeout: 5s                 # 超過 5 秒視為失敗
      retries: 5                  # 連續失敗 5 次才標記為 unhealthy
      start_period: 30s           # 啟動後 30 秒內不計入失敗
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

#### Networks（網路）

```yaml
networks:
  frontend:
    driver: bridge               # 預設的橋接網路
  backend:
    driver: bridge
    internal: true               # 內部網路，無法從外部存取
```

```
                    外部 (你的瀏覽器)
                         │
                         ▼
                    ┌─────────┐
                    │  :8087  │
                    └────┬────┘
                         │
              ┌──────────┼────────── frontend (bridge) ──────┐
              │          │                                    │
              │    ┌─────▼─────┐                              │
              │    │    app    │                              │
              │    │ PHP+Apache│                              │
              │    └─────┬─────┘                              │
              │          │                                    │
              └──────────┼────────────────────────────────────┘
                         │
              ┌──────────┼────────── backend (internal) ─────┐
              │          │                                    │
              │    ┌─────▼─────┐                              │
              │    │    db     │                              │
              │    │  MySQL 8  │                              │
              │    └───────────┘                              │
              │                                              │
              └──────────────────────────────────────────────┘
```

**用房間來比喻：**

把 Docker 環境想像成一棟建築物：

```
┌─ 大廳（frontend 網路）──────────────────────┐
│                                             │
│   大門 :8087  ←── 外面的人（瀏覽器）可以進來   │
│       │                                     │
│   [ app 服務 ]  ←── 站在大廳裡，接待客人       │
│       │                                     │
└───────┼─────────────────────────────────────┘
        │ (app 有通往密室的鑰匙)
┌───────┼─ 密室（backend 網路，internal）──────┐
│       │                                     │
│   [ db 服務 ]  ←── 保險箱放在密室裡           │
│                                             │
│   ❌ 這間房間沒有門通往外面                    │
└─────────────────────────────────────────────┘
```

**為什麼要分兩個網路？**

- `frontend`：有對外的門（port 8087），瀏覽器的請求從這裡進來找 `app`
- `backend`：`internal: true` 代表**沒有對外的門**，外面的人完全進不來
- `app` 同時在兩個網路裡 — 它是唯一的「橋梁」，外面的請求進到 app，app 再去密室找 db 拿資料
- `db` 只在 backend 網路 — 外部無法直接連到 MySQL，就算知道密碼也連不進去，因為根本沒有路可以到達

> 💡 **開發環境的 3306 port 呢？**
> `docker-compose.override.yml` 開了 `3306:3306`，這是透過 Docker 的 **port mapping** 直接映射到主機，跟 network 是不同機制。讓你在開發時可以用 TablePlus 等工具連 DB，但正式環境的 `docker-compose.yml` 不會開這個 port。

#### Volumes 宣告

```yaml
volumes:
  mysql_data:    # 宣告一個 Named Volume
```

在 `services` 裡使用的 Named Volume（如 `mysql_data:/var/lib/mysql`）必須在頂層 `volumes` 中宣告。

#### depends_on + healthcheck

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy    # 等 db 的 healthcheck 通過

  db:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

**為什麼不用預設的 `depends_on`？**

預設的 `depends_on` 只確保容器「已啟動」，但 MySQL 可能還沒準備好接受連線。加上 `condition: service_healthy` 會等到 `mysqladmin ping` 回應成功，才啟動 app — **確保 Laravel 連得上資料庫**。

### `docker-compose.override.yml` — 開發環境覆寫

```yaml
version: "3.8"

services:
  app:
    build:
      target: development          # 改用 development stage
    volumes:
      - .:/var/www/html            # 綁定掛載，程式碼即時同步

  db:
    ports:
      - "3306:3306"                # 開放 MySQL port，方便用 GUI 工具連線
```

**工作原理**：Docker Compose 會**自動合併** `docker-compose.yml` 和 `docker-compose.override.yml`。override 檔案中的設定會覆蓋主檔案中的同名設定。

**效果**：
- app 改用 `development` stage（包含 Node.js、entrypoint.sh）
- 程式碼透過 Bind Mount 即時同步，不用重建 Image
- MySQL 的 3306 port 開放到主機，方便用 DBeaver、TablePlus 等工具連線

> 在正式環境部署時，可以用 `-f` 指定只載入主檔案：
> ```bash
> docker compose -f docker-compose.yml up -d
> ```

---

## 六、實戰：啟動本專案

### 前置條件

- 已安裝 Docker Desktop 並確認運行中
- 已安裝 Git

### 操作步驟

```bash
# 1. Clone 專案
git clone <repository-url>
cd docker-laravel-vue/backend

# 2. 建立環境設定檔
cp .env.example .env

# 3. 編輯 .env（設定資料庫密碼等）
#    確認以下設定與 docker-compose.yml 一致：
#    DB_HOST=db
#    DB_DATABASE=laravel
#    DB_USERNAME=laravel
#    DB_PASSWORD=secret

# 4. 啟動所有服務（首次執行會自動 build Image）
docker compose up -d

# 5. 等待服務啟動完成，查看狀態
docker compose ps

# 6. 執行資料庫遷移
docker compose exec app php artisan migrate

# 7. 安裝前端依賴並編譯（開發環境）
docker compose exec app npm install
docker compose exec app npm run dev
```

### 驗證服務正常運作

```bash
# 查看容器狀態 — 應該都是 Up (healthy)
docker compose ps

# 瀏覽器開啟
# http://localhost:8087

# 查看 app 的 log
docker compose logs app

# 查看 db 的 log
docker compose logs db
```

---

## 七、常用指令速查表

### Docker 基本指令

| 指令                               | 說明                     |
| ---------------------------------- | ------------------------ |
| `docker ps`                        | 列出執行中的容器         |
| `docker ps -a`                     | 列出所有容器（含已停止） |
| `docker images`                    | 列出所有映像檔           |
| `docker pull <image>`              | 下載映像檔               |
| `docker build -t <name> .`         | 建置映像檔               |
| `docker run <image>`               | 建立並啟動容器           |
| `docker exec -it <container> bash` | 進入執行中的容器         |
| `docker logs <container>`          | 查看容器 log             |
| `docker stop <container>`          | 停止容器                 |
| `docker rm <container>`            | 刪除容器                 |
| `docker rmi <image>`               | 刪除映像檔               |
| `docker system prune`              | 清理未使用的資源         |

### Docker Compose 指令

| 指令                                 | 說明                                          |
| ------------------------------------ | --------------------------------------------- |
| `docker compose up -d`               | 啟動所有服務（背景執行）                      |
| `docker compose down`                | 停止並移除所有容器                            |
| `docker compose down -v`             | 停止並移除容器和 Volume（⚠️ 會刪除資料庫資料） |
| `docker compose ps`                  | 查看服務狀態                                  |
| `docker compose logs -f`             | 即時查看 log                                  |
| `docker compose logs <service>`      | 查看特定服務的 log                            |
| `docker compose exec <service> bash` | 進入指定服務的容器                            |
| `docker compose build`               | 重新建置所有服務的映像檔                      |
| `docker compose build --no-cache`    | 不使用快取，完整重建                          |
| `docker compose restart`             | 重啟所有服務                                  |

### Volume 相關指令

| 指令                           | 說明                    |
| ------------------------------ | ----------------------- |
| `docker volume ls`             | 列出所有 Volume         |
| `docker volume inspect <name>` | 查看 Volume 詳細資訊    |
| `docker volume rm <name>`      | 刪除指定 Volume         |
| `docker volume prune`          | 刪除所有未使用的 Volume |

---

## 八、常見問題 FAQ

### Q1：`docker compose up` 後 app 一直重啟怎麼辦？

**A**：通常是因為 `.env` 設定有誤或資料庫連線失敗。

```bash
# 查看 app 的 log 找出錯誤原因
docker compose logs app

# 確認 db 是否正常運行
docker compose ps
docker compose logs db
```

常見原因：
- `.env` 中的 `DB_HOST` 必須是 `db`（Docker Compose 的 service 名稱）
- 資料庫密碼不一致

### Q2：修改程式碼後沒有生效？

**A**：確認你使用的是開發環境（有 `docker-compose.override.yml`）。

```bash
# 確認 Volume 掛載是否正確
docker compose exec app ls -la /var/www/html

# 如果是修改 .env，需要清除快取
docker compose exec app php artisan config:clear
```

### Q3：`port is already allocated` 錯誤？

**A**：代表 port 8087（或 3306）已被其他程式佔用。

```bash
# macOS / Linux：查看誰佔用了 port
lsof -i :8087

# 解決方案 1：停止佔用 port 的程式
# 解決方案 2：修改 docker-compose.yml 中的 port 映射
#   例如改成 "8088:80"
```

### Q4：Image 太大怎麼辦？

**A**：

1. 確認 `.dockerignore` 有排除不需要的檔案（`node_modules`、`.git`、`vendor`）
2. 使用 Multi-stage Build（本專案已經使用）
3. 合併 `RUN` 指令以減少層數
4. 使用 `--no-install-recommends` 安裝套件

```bash
# 查看 Image 的各層大小
docker history <image-name>
```

### Q5：如何完全重置環境？

**A**：

```bash
# 停止所有容器並刪除 Volume（⚠️ 資料庫資料會消失）
docker compose down -v

# 重新建置 Image（不使用快取）
docker compose build --no-cache

# 重新啟動
docker compose up -d
```

### Q6：`docker compose` 和 `docker-compose` 有什麼差別？

**A**：

- `docker-compose`（有連字號）：舊版，是用 Python 寫的獨立工具
- `docker compose`（空格）：新版，整合在 Docker CLI 中，效能更好

建議使用新版 `docker compose`。Docker Desktop 最新版已內建。

### Q7：如何查看容器的健康狀態？

**A**：

```bash
# 查看所有服務的狀態（包含 health status）
docker compose ps

# 查看特定容器的詳細健康檢查記錄
docker inspect --format='{{json .State.Health}}' <container-name> | python3 -m json.tool
```
