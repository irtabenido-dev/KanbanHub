#!/bin/bash
set -ex

echo "PORT environment variable is: ${PORT:-NOT SET}"

# Set default PORT
PORT=${PORT:-8000}
echo "Using PORT: $PORT"

# Start PHP-FPM in background
php-fpm -D
sleep 2

# Configure Nginx
export PORT
envsubst '${PORT}' < /etc/nginx/sites-available/laravel > /etc/nginx/sites-enabled/laravel

echo "Testing Nginx config..."
nginx -t

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

sleep 2

# Run Laravel commands
echo "Running Laravel setup..."
php artisan package:discover --ansi || true

# IMPORTANT: Generate app key if not set
php artisan key:generate --force --ansi || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Show Laravel errors for debugging
echo "Checking Laravel logs..."
tail -n 50 /var/www/html/storage/logs/laravel.log || echo "No logs yet"

# Test if Laravel is working
echo "Testing Laravel..."
php artisan --version || echo "Artisan failed"

# Keep nginx running
wait $NGINX_PID
```

## Check Environment Variables in Render Dashboard

Make sure these are set in your Render environment variables:
```
APP_KEY=base64:... (Laravel will generate this)
APP_ENV=production
APP_DEBUG=false (set to true temporarily to see errors)
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
