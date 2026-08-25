# ============================================================
# Stage 1: base — PHP 7.4 + Apache + 系統依賴 + PHP 擴充套件
# ============================================================
# 這是所有後續階段（development、production）的共用基底。
# 包含：PHP 執行環境、Apache 網頁伺服器、Laravel 所需的 PHP 擴充套件。
# 不含：原始碼、Node.js、Composer 依賴（這些在後續階段處理）。
# ============================================================
FROM php:7.4-apache-bullseye AS base

# 安裝 Laravel 所需的系統套件與 PHP 擴充套件
# --mount=type=cache：利用 BuildKit 的快取掛載，加速重複建置
#   target=/var/cache/apt  → 快取已下載的 .deb 套件
#   target=/var/lib/apt    → 快取 apt 套件索引
#   sharing=locked         → 多個 build 同時執行時，排隊共享快取（避免衝突）
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
        # --- 圖片處理相關（GD 擴充套件的依賴）---
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        # --- 壓縮相關（zip 擴充套件的依賴）---
        libzip-dev \
        # --- XML 相關（xml 擴充套件的依賴）---
        libxml2-dev \
        # --- 多位元組字串（mbstring 擴充套件的依賴）---
        libonig-dev \
        # --- 常用工具 ---
        unzip \
        git \
        curl \
    # 設定 GD 擴充套件：啟用 FreeType 字型 + JPEG 支援
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    # 編譯安裝 PHP 擴充套件
    # -j"$(nproc)"：使用所有 CPU 核心平行編譯，加速建置
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        xml \
        zip \
        bcmath \
        gd \
    # 清理 apt 快取，縮小 Image 體積
    && apt-get clean

# 從官方 Composer 映像檔複製 Composer 執行檔
# 不需要在此 Image 中安裝整個 Composer 建置環境
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache 設定
# 啟用 rewrite 模組 — Laravel 的路由需要 URL 重寫功能
RUN a2enmod rewrite
# 複製自訂的 Apache VirtualHost 設定
# 主要設定 DocumentRoot 指向 Laravel 的 public/ 目錄
COPY docker/apache/laravel.conf /etc/apache2/sites-available/000-default.conf

# 建立 laravel 使用者（UID 1000）
# UID 1000 通常對應主機的第一個使用者，避免 Volume 掛載時的權限問題
# -m：建立 home 目錄  -s /bin/bash：使用 bash shell
RUN useradd -u 1000 -ms /bin/bash laravel

# 設定工作目錄 — 後續的 COPY、RUN 都以此為基準
WORKDIR /var/www/html

# ============================================================
# Stage 2: node-builder — 編譯前端靜態資源（僅 production 使用）
# ============================================================
# 這是一個「拋棄式」的建置階段：
#   1. 安裝 Node.js 依賴
#   2. 用 Laravel Mix（Webpack）編譯 JS/CSS
#   3. 編譯產物會被 production 階段 COPY 走
#   4. 此階段本身不會出現在最終 Image 中
# 好處：最終 Image 不包含 Node.js + node_modules（省下約 400MB）
# ============================================================
FROM node:18-alpine AS node-builder

WORKDIR /build

# 先複製 package*.json，再執行 npm ci
# 這樣只要 package.json 沒改，Docker 就能使用層快取，跳過 npm ci
# npm ci 比 npm install 更適合 CI/CD：嚴格依照 package-lock.json 安裝
COPY package*.json ./
RUN npm ci

# 複製前端原始碼與設定
COPY resources/ resources/
COPY webpack.mix.js ./
COPY public/ public/

# 執行正式環境的前端編譯（壓縮、混淆、版本雜湊）
RUN npm run production

# ============================================================
# Stage 3: development — 開發環境（target: development）
# ============================================================
# 繼承 base 階段，額外加入：
#   - Node.js（用於 npm run dev / npm run watch / hot reload）
#   - entrypoint.sh（容器啟動時的初始化腳本）
#
# 開發環境的程式碼不用 COPY，而是透過 docker-compose.override.yml
# 的 Bind Mount（.:/var/www/html）即時掛載。
# ============================================================
FROM base AS development

# 從 Node.js 官方映像複製 node 執行檔 + npm 模組
# 這比在 base 上重新安裝 Node.js 更快、更乾淨
COPY --from=node:18-bullseye /usr/local/bin/node /usr/local/bin/node
COPY --from=node:18-bullseye /usr/local/lib/node_modules /usr/local/lib/node_modules
# 建立 npm / npx 的符號連結，讓命令列可以直接使用
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# 複製容器啟動腳本並設定可執行權限
# entrypoint.sh 負責：建立 storage 目錄、設定權限、執行 migration 等
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 健康檢查：Docker 定期確認容器是否正常運作
# --interval=30s   每 30 秒檢查一次
# --timeout=5s     單次檢查超過 5 秒視為失敗
# --start-period=10s 容器啟動後等 10 秒才開始檢查（給 Apache 啟動時間）
# --retries=3      連續失敗 3 次才標記為 unhealthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# ENTRYPOINT vs CMD：
#   ENTRYPOINT → 容器啟動時「一定」會執行的命令（初始化腳本）
#   CMD        → 傳給 ENTRYPOINT 的「預設參數」（可被 docker run 覆寫）
# 實際執行的命令：entrypoint.sh apache2-foreground
# → entrypoint.sh 做完初始化後，啟動 Apache 前台行程
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]

# ============================================================
# Stage 4: production — 正式環境（target: production）
# ============================================================
# 繼承 base 階段，特點：
#   - 程式碼直接 COPY 進 Image（不依賴 Volume 掛載）
#   - 不包含 Node.js（前端資源從 node-builder 階段複製）
#   - 不包含 dev 依賴（composer install --no-dev）
#   - Image 體積更小、攻擊面更小
# ============================================================
FROM base AS production

# 將整個專案原始碼複製進 Image
# .dockerignore 會排除 .git、node_modules、.env 等不需要的檔案
COPY . /var/www/html

# 安裝 PHP 依賴（僅正式環境套件）
# --no-dev            不安裝 require-dev 的套件（如 PHPUnit）
# --no-interaction    不詢問互動式問題
# --optimize-autoloader  產生最佳化的 class map，加速 autoload
RUN composer install --no-dev --no-interaction --optimize-autoloader

# 從 node-builder 階段複製編譯後的前端靜態資源
# 只拿編譯產物，不帶 node_modules（省下約 400MB）
COPY --from=node-builder /build/public/js public/js
COPY --from=node-builder /build/public/css public/css
# mix-manifest.json 記錄版本雜湊，Laravel 的 mix() helper 靠它載入正確的檔案
COPY --from=node-builder /build/public/mix-manifest.json public/mix-manifest.json

# 設定檔案權限
# storage/     → Laravel 寫入 log、cache、session、上傳檔案的地方
# bootstrap/cache/ → Laravel 寫入設定快取、路由快取的地方
# www-data 是 Apache 的執行使用者，需要有這些目錄的寫入權限
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 健康檢查（與 development 相同設定）
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 正式環境不需要 ENTRYPOINT 初始化腳本
# 直接啟動 Apache 前台行程
CMD ["apache2-foreground"]
