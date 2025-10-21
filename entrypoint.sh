#!/bin/bash
set -e

echo "Starting Laravel application..."

# Set default PORT if not provided by Render
PORT=${PORT:-8000}
echo "Using PORT: $PORT"

# Run Laravel setup commands
php artisan package:discover --ansi || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Wait a moment for PHP-FPM to fully start
sleep 2

# Configure Nginx with the PORT variable
echo "Configuring Nginx for port $PORT..."
export PORT
envsubst '${PORT}' < /etc/nginx/sites-available/laravel > /etc/nginx/sites-enabled/laravel

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx in foreground
echo "Starting Nginx on 0.0.0.0:$PORT..."
exec nginx -g "daemon off;"
