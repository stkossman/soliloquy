import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Chat } from '$lib/types'
import { getSidebarChatGroups } from './sidebarChatGroups.ts'

function chat(data: Partial<Chat> & Pick<Chat, 'id'>): Chat {
	return {
		title: String(data.id),
		isPinned: false,
		createdAt: new Date(),
		lastModified: new Date(),
		...data,
	}
}

describe('getSidebarChatGroups', () => {
	it('splits chats into system, pinned and regular groups', () => {
		const groups = getSidebarChatGroups([
			chat({ id: 1, isSystem: true }),
			chat({ id: 2, isPinned: true }),
			chat({ id: 3 }),
		])

		assert.deepEqual(
			groups.systemChats.map(c => c.id),
			[1],
		)
		assert.deepEqual(
			groups.pinnedChats.map(c => c.id),
			[2],
		)
		assert.deepEqual(
			groups.regularChats.map(c => c.id),
			[3],
		)
	})
})
