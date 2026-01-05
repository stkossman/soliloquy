// @ts-check

import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
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
