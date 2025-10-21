#!/bin/bash
set -e

# Run Laravel setup commands
php artisan package:discover --ansi
php artisan config:cache
php artisan route:cache

# Start the server
exec php artisan serve --host=0.0.0.0 --port=8000
