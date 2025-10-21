#!/bin/bash
set -ex  # x flag shows each command as it executes

echo "PORT environment variable is: ${PORT:-NOT SET}"
echo "All environment variables:"
env | grep -E "PORT|RENDER" || echo "No PORT/RENDER vars found"

# Set default PORT if not provided by Render
PORT=${PORT:-8000}

echo "Using PORT: $PORT"

# Start PHP-FPM in background
php-fpm -D
sleep 3

# Configure and test Nginx
export PORT
envsubst '${PORT}' < /etc/nginx/sites-available/laravel > /etc/nginx/sites-enabled/laravel

echo "Generated Nginx config:"
cat /etc/nginx/sites-enabled/laravel

echo "Testing Nginx config..."
nginx -t

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Give nginx a moment to start
sleep 3

# Check if nginx is listening
echo "Checking if port $PORT is open..."
netstat -tlnp | grep ":$PORT" || echo "Port $PORT not listening!"

# Run Laravel commands AFTER nginx starts (to avoid blocking)
php artisan package:discover --ansi || true
php artisan config:cache || true
php artisan route:cache || true

# Keep nginx running in foreground
wait $NGINX_PID
