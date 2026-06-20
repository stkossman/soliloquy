import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Chat, Message } from '$lib/types'
import {
	WORKSPACE_BACKUP_FORMAT,
	WORKSPACE_BACKUP_VERSION,
	createWorkspaceBackup,
	serializeWorkspaceBackup,
} from './workspaceBackup.ts'

function chat(overrides: Partial<Chat> = {}): Chat {
	return {
		id: 1,
		title: 'Personal Notes',
		isPinned: true,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		lastModified: new Date('2026-01-02T00:00:00.000Z'),
		previewText: 'Last message',
		draft: 'draft',
		isSystem: false,
		order: 3,
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
		isEdited: true,
		isPinned: true,
		...overrides,
	}
}

describe('workspace backup export', () => {
	it('includes format, version and timestamp metadata', () => {
		const exportedAt = new Date('2026-06-20T10:00:00.000Z')
		const backup = createWorkspaceBackup({
			chats: [],
			messages: [],
			exportedAt,
		})

		assert.equal(backup.format, WORKSPACE_BACKUP_FORMAT)
		assert.equal(backup.version, WORKSPACE_BACKUP_VERSION)
		assert.equal(backup.exportedAt, '2026-06-20T10:00:00.000Z')
	})

	it('exports all chats and messages', () => {
		const backup = createWorkspaceBackup({
			chats: [chat({ id: 1 }), chat({ id: 2, title: 'Second' })],
			messages: [
				message({ id: 10, chatId: 1 }),
				message({ id: 11, chatId: 2 }),
			],
			exportedAt: new Date('2026-06-20T10:00:00.000Z'),
		})

		assert.equal(backup.data.chats.length, 2)
		assert.equal(backup.data.messages.length, 2)
		assert.equal(backup.data.messages[1].chatId, 2)
	})

	it('preserves chat personalization and other chat fields', () => {
		const backup = createWorkspaceBackup({
			chats: [chat()],
			messages: [],
			exportedAt: new Date('2026-06-20T10:00:00.000Z'),
		})

		assert.deepEqual(backup.data.chats[0], chat())
	})

	it('serializes an empty workspace', () => {
		const json = serializeWorkspaceBackup({
			chats: [],
			messages: [],
			exportedAt: new Date('2026-06-20T10:00:00.000Z'),
		})
		const parsed = JSON.parse(json)

		assert.equal(parsed.data.chats.length, 0)
		assert.equal(parsed.data.messages.length, 0)
	})
})
