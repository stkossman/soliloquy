// @ts-check

import vercel from '@astrojs/vercel'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

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

	adapter: vercel(),
})
