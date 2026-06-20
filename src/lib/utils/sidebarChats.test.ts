import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Chat } from '$lib/types'
import { getVisibleSidebarChats } from './sidebarChats.ts'

function chat(data: Partial<Chat> & Pick<Chat, 'id' | 'title'>): Chat {
	return {
		isPinned: false,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		lastModified: new Date('2026-01-01T00:00:00.000Z'),
		...data,
	}
}

describe('getVisibleSidebarChats', () => {
	it('keeps system chats first, then pinned chats, then regular chats', () => {
		const chats = [
			chat({ id: 1, title: 'Regular', order: 0 }),
			chat({ id: 2, title: 'Pinned', isPinned: true, order: 0 }),
			chat({ id: 3, title: 'System', isSystem: true, order: 0 }),
		]

		assert.deepEqual(
			getVisibleSidebarChats(chats, '').map(c => c.id),
			[3, 2, 1],
		)
	})

	it('sorts by explicit order before last modified date', () => {
		const chats = [
			chat({
				id: 1,
				title: 'Older first by order',
				order: 1,
				lastModified: new Date('2026-01-01T00:00:00.000Z'),
			}),
			chat({
				id: 2,
				title: 'Newer second by order',
				order: 2,
				lastModified: new Date('2026-02-01T00:00:00.000Z'),
			}),
			chat({
				id: 3,
				title: 'Missing order last',
				lastModified: new Date('2026-03-01T00:00:00.000Z'),
			}),
		]

		assert.deepEqual(
			getVisibleSidebarChats(chats, '').map(c => c.id),
			[1, 2, 3],
		)
	})

	it('filters by case-insensitive title before sorting', () => {
		const chats = [
			chat({ id: 1, title: 'Daily Notes', order: 2 }),
			chat({ id: 2, title: 'Project Log', order: 1 }),
			chat({ id: 3, title: 'note archive', order: 0 }),
		]

		assert.deepEqual(
			getVisibleSidebarChats(chats, 'NOTE').map(c => c.id),
			[3, 1],
		)
	})
})
