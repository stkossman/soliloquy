// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	integrations: [svelte()],
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
