import { getSafeChatPersonalization } from '$lib/db/chat-personalization/chatPersonalization'
import type { Chat, Message } from '$lib/types'

const FRONTMATTER_BOUNDARY = '---'
const MESSAGE_START_PREFIX = '<!-- soliloquy-message-start '
const MESSAGE_START_SUFFIX = ' -->'
const MESSAGE_END = '<!-- soliloquy-message-end -->'

interface SingleChatMarkdownExport {
	chat?: Chat
	messages: Message[]
}

interface ImportedMarkdownChat {
	chat: Omit<Chat, 'id'>
	messages: Omit<Message, 'id' | 'chatId'>[]
}

interface MessageMetadata {
	createdAt: string
	isPinned?: boolean
}

function yamlValue(value: string): string {
	return JSON.stringify(value)
}

function parseYamlValue(value: string): string {
	const trimmed = value.trim()

	if (!trimmed) return ''

	try {
		const parsed: unknown = JSON.parse(trimmed)
		return typeof parsed === 'string' ? parsed : trimmed
	} catch {
		return trimmed
	}
}

function parseFrontmatter(text: string): {
	metadata: Record<string, string>
	body: string
} | null {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)

	if (!match) return null

	const metadata: Record<string, string> = {}

	for (const line of match[1].split(/\r?\n/)) {
		const lineMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
		if (!lineMatch) continue
		metadata[lineMatch[1]] = parseYamlValue(lineMatch[2])
	}

	return {
		metadata,
		body: text.slice(match[0].length),
	}
}

function parseDate(value: unknown, fallback: Date): Date {
	if (typeof value !== 'string' && !(value instanceof Date)) {
		return fallback
	}

	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? fallback : date
}

function parseMessageMetadata(value: string): MessageMetadata | null {
	try {
		const parsed: unknown = JSON.parse(value)

		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			'createdAt' in parsed &&
			typeof parsed.createdAt === 'string'
		) {
			return {
				createdAt: parsed.createdAt,
				isPinned:
					'isPinned' in parsed && typeof parsed.isPinned === 'boolean'
						? parsed.isPinned
						: undefined,
			}
		}
	} catch {
		return null
	}

	return null
}

function parseGeneratedMarkdownMessages(
	body: string,
	now: Date,
): Omit<Message, 'id' | 'chatId'>[] {
	const messages: Omit<Message, 'id' | 'chatId'>[] = []
	const messagePattern =
		/^<!-- soliloquy-message-start ([\s\S]*?) -->\r?\n([\s\S]*?)\r?\n<!-- soliloquy-message-end -->/gm

	for (const match of body.matchAll(messagePattern)) {
		const metadata = parseMessageMetadata(match[1])
		if (!metadata) continue

		messages.push({
			content: match[2],
			createdAt: parseDate(metadata.createdAt, now),
			isEdited: false,
			isPinned: metadata.isPinned,
		})
	}

	return messages
}

function parseLegacyMarkdownMessages(
	text: string,
	now: Date,
): Omit<Message, 'id' | 'chatId'>[] {
	const messages: Omit<Message, 'id' | 'chatId'>[] = []
	const legacyMessagePattern =
		/(?:^|\r?\n)---\r?\n\r?\n### \[(.*?)\]\r?\n([\s\S]*?)(?=\r?\n---(?:\r?\n|$))/g

	for (const match of text.matchAll(legacyMessagePattern)) {
		const rawContent = match[2]
		const isPinned = /(?:\r?\n)?> 📌 Pinned\s*$/.test(rawContent)
		const content = rawContent.replace(/(?:\r?\n)?> 📌 Pinned\s*$/, '').trim()

		if (!content) continue

		messages.push({
			content,
			createdAt: parseDate(match[1], now),
			isEdited: false,
			isPinned,
		})
	}

	return messages
}

function getLegacyMarkdownTitle(text: string, fallbackTitle: string): string {
	const titleMatch = text.split(/\r?\n/, 1)[0]?.match(/^# (.*)$/)
	return titleMatch?.[1] || fallbackTitle
}

export function serializeSingleChatMarkdownExport({
	chat,
	messages,
}: SingleChatMarkdownExport): string {
	const title = chat?.title || 'Unknown Chat'
	const personalization = getSafeChatPersonalization({
		icon: chat?.icon,
		color: chat?.color,
	})
	const frontmatter = [
		FRONTMATTER_BOUNDARY,
		`title: ${yamlValue(title)}`,
		`icon: ${yamlValue(personalization.icon)}`,
		`color: ${yamlValue(personalization.color)}`,
		FRONTMATTER_BOUNDARY,
		'',
	].join('\n')
	const messageBlocks = messages
		.map(message => {
			const metadata: MessageMetadata = {
				createdAt: message.createdAt.toISOString(),
				isPinned: message.isPinned || undefined,
			}

			return [
				`${MESSAGE_START_PREFIX}${JSON.stringify(metadata)}${MESSAGE_START_SUFFIX}`,
				message.content,
				MESSAGE_END,
			].join('\n')
		})
		.join('\n\n')

	return `${frontmatter}${messageBlocks}${messageBlocks ? '\n' : ''}`
}

export function parseSingleChatMarkdownImport(
	text: string,
	fallbackTitle: string,
): ImportedMarkdownChat {
	const now = new Date()
	const frontmatter = parseFrontmatter(text)

	if (frontmatter) {
		const personalization = getSafeChatPersonalization({
			icon: frontmatter.metadata.icon,
			color: frontmatter.metadata.color,
		})

		return {
			chat: {
				title: `${frontmatter.metadata.title || fallbackTitle} (Imported)`,
				isPinned: false,
				createdAt: now,
				lastModified: now,
				icon: personalization.icon,
				color: personalization.color,
			},
			messages: parseGeneratedMarkdownMessages(frontmatter.body, now),
		}
	}

	return {
		chat: {
			title: `${getLegacyMarkdownTitle(text, fallbackTitle)} (Imported)`,
			isPinned: false,
			createdAt: now,
			lastModified: now,
		},
		messages: parseLegacyMarkdownMessages(text, now),
	}
}
