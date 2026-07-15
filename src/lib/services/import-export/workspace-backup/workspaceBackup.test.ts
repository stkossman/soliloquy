import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Chat, Message } from '$lib/types'
import {
	WORKSPACE_BACKUP_FORMAT,
	WORKSPACE_BACKUP_VERSION,
	createWorkspaceBackup,
	parseWorkspaceBackupImport,
	prepareMergeWorkspaceChats,
	prepareMergeWorkspaceMessages,
	prepareReplaceWorkspaceData,
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

describe('workspace backup import', () => {
	it('parses a valid backup and restores chat-message relationships', () => {
		const parsed = parseWorkspaceBackupImport(
			serializeWorkspaceBackup({
				chats: [chat({ id: 1 })],
				messages: [message({ id: 10, chatId: 1 })],
				exportedAt: new Date('2026-06-20T10:00:00.000Z'),
			}),
		)

		assert.equal(parsed.chats.length, 1)
		assert.equal(parsed.messages.length, 1)
		assert.equal(parsed.messages[0].chatId, parsed.chats[0].id)
	})

	it('rejects invalid backups before restore data is prepared', () => {
		assert.throws(
			() =>
				parseWorkspaceBackupImport(
					JSON.stringify({
						format: WORKSPACE_BACKUP_FORMAT,
						version: WORKSPACE_BACKUP_VERSION,
						exportedAt: '2026-06-20T10:00:00.000Z',
						data: {
							chats: [chat({ id: 1 })],
							messages: [message({ id: 10, chatId: 999 })],
						},
					}),
				),
			/missing chat 999/,
		)
	})

	it('prepares replace data without changing ids', () => {
		const parsed = parseWorkspaceBackupImport(
			serializeWorkspaceBackup({
				chats: [chat({ id: 7 })],
				messages: [message({ id: 70, chatId: 7 })],
				exportedAt: new Date('2026-06-20T10:00:00.000Z'),
			}),
		)
		const replaceData = prepareReplaceWorkspaceData(parsed)

		assert.equal(replaceData.chats[0].id, 7)
		assert.equal(replaceData.messages[0].id, 70)
		assert.equal(replaceData.messages[0].chatId, 7)
	})

	it('prepares merge chats without source ids', () => {
		const chats = prepareMergeWorkspaceChats([chat({ id: 7 })])

		assert.equal('id' in chats[0], false)
		assert.equal(chats[0].title, 'Personal Notes')
	})

	it('excludes system chats from merge data', () => {
		const chats = prepareMergeWorkspaceChats([
			chat({ id: 7, isSystem: true, title: 'Soliloquy Info' }),
			chat({ id: 8, title: 'Imported Notes' }),
		])

		assert.equal(chats.length, 1)
		assert.equal(chats[0].title, 'Imported Notes')
	})

	it('remaps message chat ids for merge restore', () => {
		const messages = prepareMergeWorkspaceMessages(
			[message({ id: 70, chatId: 7 })],
			new Map([[7, 107]]),
		)

		assert.equal('id' in messages[0], false)
		assert.equal(messages[0].chatId, 107)
		assert.equal(messages[0].content, 'Hello')
	})

	it('preserves personalization fields during validation', () => {
		const parsed = parseWorkspaceBackupImport(
			serializeWorkspaceBackup({
				chats: [chat({ icon: 'book', color: '#3b82f6' })],
				messages: [message()],
				exportedAt: new Date('2026-06-20T10:00:00.000Z'),
			}),
		)

		assert.equal(parsed.chats[0].icon, 'book')
		assert.equal(parsed.chats[0].color, '#3b82f6')
	})
})
