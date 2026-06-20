import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	createSelectedChatIds,
	toggleSelectedChatId,
} from './selectionState.ts'

describe('sidebar selection state', () => {
	it('starts selection with the initial chat id', () => {
		assert.deepEqual([...createSelectedChatIds(42)], [42])
	})

	it('adds an unselected chat id without mutating the previous set', () => {
		const previous = new Set([1])
		const next = toggleSelectedChatId(previous, 2)

		assert.deepEqual([...previous], [1])
		assert.deepEqual([...next.selectedChatIds], [1, 2])
		assert.equal(next.isSelectionMode, true)
	})

	it('turns selection mode off when the last selected chat is toggled off', () => {
		const next = toggleSelectedChatId(new Set([1]), 1)

		assert.deepEqual([...next.selectedChatIds], [])
		assert.equal(next.isSelectionMode, false)
	})
})
