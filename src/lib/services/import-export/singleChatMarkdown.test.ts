import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Chat, Message } from '$lib/types'
import {
	parseSingleChatMarkdownImport,
	serializeSingleChatMarkdownExport,
} from './singleChatMarkdown.ts'

function chat(overrides: Partial<Chat> = {}): Chat {
	return {
		id: 1,
		title: 'My Notes',
		isPinned: false,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		lastModified: new Date('2026-01-02T00:00:00.000Z'),
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
		isPinned: false,
		...overrides,
	}
}

describe('single chat Markdown import/export', () => {
	it('exports frontmatter metadata', () => {
		const markdown = serializeSingleChatMarkdownExport({
			chat: chat(),
			messages: [message()],
		})

		assert.match(
			markdown,
			/^---\ntitle: "My Notes"\nicon: "star"\ncolor: "#eab308"\n---/,
		)
	})

	it('imports frontmatter metadata', () => {
		const imported = parseSingleChatMarkdownImport(
			serializeSingleChatMarkdownExport({
				chat: chat({ icon: 'book', color: '#3b82f6' }),
				messages: [message()],
			}),
			'fallback',
		)

		assert.equal(imported.chat.title, 'My Notes (Imported)')
		assert.equal(imported.chat.icon, 'book')
		assert.equal(imported.chat.color, '#3b82f6')
	})

	it('imports legacy Markdown exports', () => {
		const imported = parseSingleChatMarkdownImport(
			[
				'# Legacy Notes',
				'',
				'*Exported on 1/1/2026*',
				'',
				'---',
				'',
				'### [2026-01-03T00:00:00.000Z]',
				'Legacy content',
				'',
				'> 📌 Pinned',
				'',
				'---',
				'',
			].join('\n'),
			'fallback',
		)

		assert.equal(imported.chat.title, 'Legacy Notes (Imported)')
		assert.equal(imported.messages.length, 1)
		assert.equal(imported.messages[0].content, 'Legacy content')
		assert.equal(imported.messages[0].isPinned, true)
	})

	it('preserves user content containing Markdown-like legacy markers', () => {
		const content = [
			'First line',
			'### [2026-01-01T00:00:00.000Z]',
			'---',
			'Last line',
		].join('\n')
		const imported = parseSingleChatMarkdownImport(
			serializeSingleChatMarkdownExport({
				chat: chat(),
				messages: [message({ content })],
			}),
			'fallback',
		)

		assert.equal(imported.messages[0].content, content)
	})

	it('preserves multiline messages', () => {
		const content = ['one', '', 'two', 'three'].join('\n')
		const imported = parseSingleChatMarkdownImport(
			serializeSingleChatMarkdownExport({
				chat: chat(),
				messages: [message({ content })],
			}),
			'fallback',
		)

		assert.equal(imported.messages[0].content, content)
	})

	it('preserves spoiler syntax as raw text', () => {
		const content = 'Keep ||spoiler|| untouched.'
		const imported = parseSingleChatMarkdownImport(
			serializeSingleChatMarkdownExport({
				chat: chat(),
				messages: [message({ content })],
			}),
			'fallback',
		)

		assert.equal(imported.messages[0].content, content)
	})
})
