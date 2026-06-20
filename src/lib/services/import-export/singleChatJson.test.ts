import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_CHAT_COLOR, DEFAULT_CHAT_ICON } from '$lib/constants'
import type { Chat, Message } from '$lib/types'
import {
	parseSingleChatJsonImport,
	serializeSingleChatJsonExport,
} from './singleChatJson.ts'

function chat(overrides: Partial<Chat> = {}): Chat {
	return {
		id: 1,
		title: 'Personal Notes',
		isPinned: true,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		lastModified: new Date('2026-01-02T00:00:00.000Z'),
		previewText: 'Last message',
		icon: 'star',
		color: '#eab308',
		...overrides,
	}
}

function message(overrides: Partial<Message> = {}): Message {
	return {
		id: 10,
		chatId: 1,
		content: 'Hello',
		createdAt: new Date('2026-01-03T00:00:00.000Z'),
		isEdited: false,
		isPinned: true,
		...overrides,
	}
}

describe('single chat JSON import/export', () => {
	it('exports chat personalization metadata', () => {
		const json = serializeSingleChatJsonExport({
			chat: chat(),
			messages: [message()],
		})

		const data = JSON.parse(json)
		assert.equal(data.chat.icon, 'star')
		assert.equal(data.chat.color, '#eab308')
	})

	it('imports chat personalization metadata', () => {
		const imported = parseSingleChatJsonImport(
			serializeSingleChatJsonExport({
				chat: chat({ icon: 'book', color: '#3b82f6' }),
				messages: [message()],
			}),
		)

		assert.equal(imported.chat.icon, 'book')
		assert.equal(imported.chat.color, '#3b82f6')
	})

	it('imports legacy JSON without personalization metadata', () => {
		const imported = parseSingleChatJsonImport(
			JSON.stringify({
				chat: {
					title: 'Legacy',
					isPinned: false,
					createdAt: '2026-01-01T00:00:00.000Z',
					lastModified: '2026-01-02T00:00:00.000Z',
				},
				messages: [message()],
			}),
		)

		assert.equal(imported.chat.icon, DEFAULT_CHAT_ICON)
		assert.equal(imported.chat.color, DEFAULT_CHAT_COLOR)
	})

	it('falls back for invalid optional personalization metadata', () => {
		const imported = parseSingleChatJsonImport(
			JSON.stringify({
				chat: {
					title: 'Invalid metadata',
					createdAt: '2026-01-01T00:00:00.000Z',
					icon: 'not-real',
					color: '#000000',
				},
				messages: [message()],
			}),
		)

		assert.equal(imported.chat.icon, DEFAULT_CHAT_ICON)
		assert.equal(imported.chat.color, DEFAULT_CHAT_COLOR)
	})
})
