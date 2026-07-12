import { getSafeChatPersonalization } from '$lib/db/chat-personalization/chatPersonalization'
import type { Chat, Message } from '$lib/types'

export const WORKSPACE_BACKUP_FORMAT = 'soliloquy-workspace-backup'
export const WORKSPACE_BACKUP_VERSION = 1

export interface WorkspaceBackup {
	format: typeof WORKSPACE_BACKUP_FORMAT
	version: typeof WORKSPACE_BACKUP_VERSION
	exportedAt: string
	data: {
		chats: Chat[]
		messages: Message[]
	}
}

interface WorkspaceBackupExport {
	chats: Chat[]
	messages: Message[]
	exportedAt?: Date
}

export type WorkspaceRestoreMode = 'replace' | 'merge'

export interface WorkspaceRestoreData {
	chats: Chat[]
	messages: Message[]
}

interface JsonRecord {
	[key: string]: unknown
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseRequiredDate(value: unknown, fieldName: string): Date {
	if (typeof value !== 'string' && !(value instanceof Date)) {
		throw new Error(`Invalid workspace backup: ${fieldName} is required`)
	}

	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid workspace backup: ${fieldName} is invalid`)
	}

	return date
}

function parseOptionalString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function parseOptionalBoolean(value: unknown): boolean | undefined {
	return typeof value === 'boolean' ? value : undefined
}

function parseOptionalNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function parseChat(value: unknown, index: number): Chat {
	if (!isRecord(value)) {
		throw new Error(`Invalid workspace backup: chat ${index} is invalid`)
	}

	const id = parseOptionalNumber(value.id)
	const title = parseOptionalString(value.title)

	if (typeof id !== 'number') {
		throw new Error(`Invalid workspace backup: chat ${index} id is required`)
	}

	if (!title) {
		throw new Error(`Invalid workspace backup: chat ${index} title is required`)
	}

	if (typeof value.isPinned !== 'boolean') {
		throw new Error(
			`Invalid workspace backup: chat ${index} isPinned is required`,
		)
	}

	const personalization = getSafeChatPersonalization({
		icon: parseOptionalString(value.icon),
		color: parseOptionalString(value.color),
	})

	return {
		id,
		title,
		isPinned: value.isPinned,
		createdAt: parseRequiredDate(value.createdAt, `chat ${index} createdAt`),
		lastModified: parseRequiredDate(
			value.lastModified,
			`chat ${index} lastModified`,
		),
		previewText: parseOptionalString(value.previewText),
		draft: parseOptionalString(value.draft),
		isSystem: parseOptionalBoolean(value.isSystem),
		order: parseOptionalNumber(value.order),
		icon: personalization.icon,
		color: personalization.color,
	}
}

function parseMessage(value: unknown, index: number): Message {
	if (!isRecord(value)) {
		throw new Error(`Invalid workspace backup: message ${index} is invalid`)
	}

	const content = parseOptionalString(value.content)
	const chatId = parseOptionalNumber(value.chatId)

	if (typeof chatId !== 'number') {
		throw new Error(
			`Invalid workspace backup: message ${index} chatId is required`,
		)
	}

	if (typeof content !== 'string') {
		throw new Error(
			`Invalid workspace backup: message ${index} content is required`,
		)
	}

	if (typeof value.isEdited !== 'boolean') {
		throw new Error(
			`Invalid workspace backup: message ${index} isEdited is required`,
		)
	}

	return {
		id: parseOptionalNumber(value.id),
		chatId,
		content,
		createdAt: parseRequiredDate(value.createdAt, `message ${index} createdAt`),
		isEdited: value.isEdited,
		isPinned: parseOptionalBoolean(value.isPinned),
	}
}

function omitChatId(chat: Chat): Omit<Chat, 'id'> {
	const { id: _id, ...chatWithoutId } = chat
	return chatWithoutId
}

function omitMessageId(message: Message): Omit<Message, 'id'> {
	const { id: _id, ...messageWithoutId } = message
	return messageWithoutId
}

export function createWorkspaceBackup({
	chats,
	messages,
	exportedAt = new Date(),
}: WorkspaceBackupExport): WorkspaceBackup {
	return {
		format: WORKSPACE_BACKUP_FORMAT,
		version: WORKSPACE_BACKUP_VERSION,
		exportedAt: exportedAt.toISOString(),
		data: {
			chats,
			messages,
		},
	}
}

export function serializeWorkspaceBackup(data: WorkspaceBackupExport): string {
	return JSON.stringify(createWorkspaceBackup(data), null, 2)
}

export function parseWorkspaceBackupImport(text: string): WorkspaceRestoreData {
	const data: unknown = JSON.parse(text)

	if (!isRecord(data)) {
		throw new Error('Invalid workspace backup')
	}

	if (
		data.format !== WORKSPACE_BACKUP_FORMAT ||
		data.version !== WORKSPACE_BACKUP_VERSION
	) {
		throw new Error('Unsupported workspace backup format')
	}

	if (!isRecord(data.data) || !Array.isArray(data.data.chats)) {
		throw new Error('Invalid workspace backup')
	}

	if (!Array.isArray(data.data.messages)) {
		throw new Error('Invalid workspace backup')
	}

	const chats = data.data.chats.map(parseChat)
	const chatIds = new Set(chats.map(chat => chat.id))
	const messages = data.data.messages.map(parseMessage)

	for (const message of messages) {
		if (!chatIds.has(message.chatId)) {
			throw new Error(
				`Invalid workspace backup: message references missing chat ${message.chatId}`,
			)
		}
	}

	return { chats, messages }
}

export function prepareReplaceWorkspaceData({
	chats,
	messages,
}: WorkspaceRestoreData): WorkspaceRestoreData {
	return {
		chats,
		messages,
	}
}

export function prepareMergeWorkspaceMessages(
	messages: Message[],
	chatIdMap: Map<number, number>,
): Omit<Message, 'id'>[] {
	return messages.map(message => {
		const newChatId = chatIdMap.get(message.chatId)

		if (typeof newChatId !== 'number') {
			throw new Error(
				`Invalid workspace backup: missing remapped chat ${message.chatId}`,
			)
		}

		return {
			...omitMessageId(message),
			chatId: newChatId,
		}
	})
}

export function prepareMergeWorkspaceChats(chats: Chat[]): Omit<Chat, 'id'>[] {
	return chats.filter(chat => !chat.isSystem).map(omitChatId)
}
