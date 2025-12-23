// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    output: 'server',

    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                '@': '/src',
                $lib: '/src/lib',
            },
        },
        server: {
            fs: {
                allow: ['..'],
            },
        },
    },

    adapter: cloudflare(),
})
