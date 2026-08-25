#!/bin/bash
set -e

# 建立 storage 子目錄結構
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# 修正權限
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# 若 .env 不存在則複製 .env.example
if [ ! -f /var/www/html/.env ]; then
    if [ -f /var/www/html/.env.example ]; then
        cp /var/www/html/.env.example /var/www/html/.env
        echo "[entrypoint] .env created from .env.example"
    fi
fi

# 若 vendor/ 不存在則執行 composer install
if [ ! -d /var/www/html/vendor ]; then
    echo "[entrypoint] vendor/ not found, running composer install..."
    composer install --working-dir=/var/www/html
fi

# 若 APP_KEY 為空則產生
if grep -q "^APP_KEY=$" /var/www/html/.env 2>/dev/null; then
    echo "[entrypoint] APP_KEY is empty, generating..."
    php /var/www/html/artisan key:generate
fi

exec "$@"
