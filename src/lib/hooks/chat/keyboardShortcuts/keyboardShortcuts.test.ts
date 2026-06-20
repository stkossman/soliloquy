import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isSearchShortcut } from './keyboardShortcuts.ts'

describe('isSearchShortcut', () => {
	it('matches Ctrl+F', () => {
		assert.equal(
			isSearchShortcut({ ctrlKey: true, metaKey: false, key: 'f' }),
			true,
		)
	})

	it('matches Meta+F', () => {
		assert.equal(
			isSearchShortcut({ ctrlKey: false, metaKey: true, key: 'f' }),
			true,
		)
	})

	it('does not match unrelated keys', () => {
		assert.equal(
			isSearchShortcut({ ctrlKey: true, metaKey: false, key: 'k' }),
			false,
		)
	})
})
