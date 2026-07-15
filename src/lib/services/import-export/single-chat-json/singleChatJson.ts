import { getSafeChatPersonalization } from '$lib/db/chat-personalization/chatPersonalization'
import type { Chat, Message } from '$lib/types'

interface SingleChatJsonExport {
	chat?: Chat
	messages: Message[]
}

interface ImportedJsonChat {
	chat: Omit<Chat, 'id'>
	messages: Omit<Message, 'id' | 'chatId'>[]
}

interface JsonRecord {
	[key: string]: unknown
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseDate(value: unknown, fallback: Date): Date {
	if (typeof value !== 'string' && !(value instanceof Date)) {
		return fallback
	}

	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? fallback : date
}

function getOptionalString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function getOptionalBoolean(value: unknown): boolean | undefined {
	return typeof value === 'boolean' ? value : undefined
}

export function serializeSingleChatJsonExport({
	chat,
	messages,
}: SingleChatJsonExport): string {
	return JSON.stringify({ chat, messages }, null, 2)
}

export function parseSingleChatJsonImport(text: string): ImportedJsonChat {
	const data: unknown = JSON.parse(text)

	if (
		!isRecord(data) ||
		!isRecord(data.chat) ||
		!Array.isArray(data.messages)
	) {
		throw new Error('Invalid JSON format')
	}

	const chatData = data.chat
	const title = getOptionalString(chatData.title)

	if (!title) {
		throw new Error('Invalid JSON format')
	}

	const now = new Date()
	const personalization = getSafeChatPersonalization({
		icon: getOptionalString(chatData.icon),
		color: getOptionalString(chatData.color),
	})

	const messages = data.messages
		.filter(isRecord)
		.map(messageData => ({
			content: getOptionalString(messageData.content) ?? '',
			createdAt: parseDate(messageData.createdAt, now),
			isEdited: getOptionalBoolean(messageData.isEdited) ?? false,
			isPinned: getOptionalBoolean(messageData.isPinned),
		}))
		.filter(message => message.content.length > 0)

	return {
		chat: {
			title: `${title} (Imported)`,
			isPinned: false,
			createdAt: parseDate(chatData.createdAt, now),
			lastModified: now,
			previewText: getOptionalString(chatData.previewText),
			icon: personalization.icon,
			color: personalization.color,
		},
		messages,
	}
}
