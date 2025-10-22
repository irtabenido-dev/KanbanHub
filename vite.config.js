import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    define: {
        'import.meta.env.VITE_REVERB_APP_KEY': JSON.stringify(
            env.VITE_REVERB_APP_KEY || 'jihpl3l4kliugp1yjfre'
        ),
        'import.meta.env.VITE_REVERB_HOST': JSON.stringify(
            env.VITE_REVERB_HOST || 'localhost'
        ),
        'import.meta.env.VITE_REVERB_PORT': JSON.stringify(
            env.VITE_REVERB_PORT || '8080'
        ),
        'import.meta.env.VITE_REVERB_SCHEME': JSON.stringify(
            env.VITE_REVERB_SCHEME || 'http'
        ),
    },
});
