#!/bin/bash
set -e

# Set default PORT
PORT=${PORT:-8000}
echo "==> Starting application on PORT: ${PORT}"

# Debug: Print environment variables (remove after debugging)
echo "==> Checking Pusher environment variables..."
echo "PUSHER_APP_ID: ${PUSHER_APP_ID:-NOT SET}"
echo "PUSHER_APP_KEY: ${PUSHER_APP_KEY:-NOT SET}"
echo "PUSHER_APP_SECRET: ${PUSHER_APP_SECRET:-NOT SET}"
echo "PUSHER_APP_CLUSTER: ${PUSHER_APP_CLUSTER:-NOT SET}"

# Start PHP-FPM in background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Wait for PHP-FPM to start
sleep 3
g
# Configure Nginx with PORT
echo "==> Configuring Nginx for port $PORT..."
export PORT
envsubst '${PORT}' < /etc/nginx/sites-available/laravel > /etc/nginx/sites-enabled/laravel

# Test Nginx config
echo "==> Testing Nginx configuration..."
nginx -t

# Start Nginx in background
echo "==> Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait a bit for Nginx to start
sleep 3

# Run Laravel setup commands
echo "==> Running Laravel setup..."
php artisan config:clear
php artisan config:cache

# Run migrations
echo "==> Running database migrations..."
php artisan migrate --force || echo "Migrations failed - check database connection"

# Cache optimization (after migrations)
php artisan route:cache || true
php artisan view:cache || true

echo "==> Application started successfully!"

# Keep Nginx running in foreground
wait $NGINX_PID
