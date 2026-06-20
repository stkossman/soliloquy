import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Message } from '$lib/types'
import { getActiveSearchId, getMessagesForChatView } from './chatWindowState.ts'

const allMessages = [{ id: 1 }] as Message[]
const pinnedMessages = [{ id: 2 }] as Message[]

describe('chat window conditional state helpers', () => {
	it('uses all messages in the normal view', () => {
		assert.equal(
			getMessagesForChatView({
				isPinnedView: false,
				pinnedMessages,
				allMessages,
			}),
			allMessages,
		)
	})

	it('uses pinned messages in pinned view', () => {
		assert.equal(
			getMessagesForChatView({
				isPinnedView: true,
				pinnedMessages,
				allMessages,
			}),
			pinnedMessages,
		)
	})

	it('returns the active search id only for a valid match index', () => {
		assert.equal(getActiveSearchId([10, 20], 1), 20)
		assert.equal(getActiveSearchId([], 0), null)
		assert.equal(getActiveSearchId([10], -1), null)
	})
})
