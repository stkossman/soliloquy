import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatChatDate(date: Date): string {
	const now = new Date()
	const isToday =
		date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()

	if (isToday) {
		return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
	}
	return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
}
