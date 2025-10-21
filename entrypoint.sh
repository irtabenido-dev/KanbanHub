#!/bin/bash
set -e

# Run Laravel setup commands
php artisan package:discover --ansi
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
php-fpm -D

# Configure Nginx with Render's PORT and start it
PORT=${PORT:-8000} envsubst '${PORT}' < /etc/nginx/sites-available/default > /etc/nginx/sites-enabled/default
nginx -g "daemon off;"
