import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatChatDate(date: Date): string {
	const now = new Date()
	const isToday =
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()

	if (isToday) {
		return date.toLocaleTimeString('uk-UA', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}
	return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
}

export function stripMarkdown(text: string): string {
	if (!text) return ''
	return text
		.replace(/(\*\*|__)(.*?)\1/g, '$2')
		.replace(/(\*|_)(.*?)\1/g, '$2')
		.replace(/~~(.*?)~~/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\|\|(.*?)\|\|/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#+\s+/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/\n/g, ' ')
		.trim()
}
