#!/bin/bash
set -e

# Set default PORT
PORT=${PORT:-8000}
echo "==> Starting application on PORT: ${PORT}"

# Start PHP-FPM in background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Wait for PHP-FPM to start
sleep 3

# Configure Nginx with PORT
echo "==> Configuring Nginx for port $PORT..."
export PORT
envsubst '${PORT}' < /etc/nginx/sites-available/laravel > /etc/nginx/sites-enabled/laravel
cp /etc/nginx/sites-enabled/laravel /etc/nginx/sites-available/laravel

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
php artisan package:discover --ansi || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run migrations
echo "==> Running database migrations..."
php artisan migrate --force || echo "Migrations failed - check database connection"

echo "==> Application started successfully!"

# Keep Nginx running in foreground
wait $NGINX_PID
