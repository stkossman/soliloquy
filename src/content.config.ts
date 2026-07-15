import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

const changelog = defineCollection({
	loader: glob({
		base: './src/content/changelog',
		pattern: '**/*.md',
	}),
})

export const collections = { changelog }
