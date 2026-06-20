import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_CHAT_COLOR, DEFAULT_CHAT_ICON } from '$lib/constants'
import {
	getChatPersonalizationMigrationPatch,
	getSafeChatPersonalization,
	isValidChatColor,
	isValidChatIcon,
} from './chatPersonalization.ts'

describe('chat personalization migration helpers', () => {
	it('keeps valid chat personalization unchanged', () => {
		assert.deepEqual(
			getSafeChatPersonalization({ icon: 'star', color: '#eab308' }),
			{ icon: 'star', color: '#eab308' },
		)
	})

	it('falls back to safe defaults for missing personalization', () => {
		assert.deepEqual(getSafeChatPersonalization({}), {
			icon: DEFAULT_CHAT_ICON,
			color: DEFAULT_CHAT_COLOR,
		})
	})

	it('falls back to safe defaults for invalid personalization', () => {
		assert.deepEqual(
			getSafeChatPersonalization({ icon: 'unknown', color: 'red' }),
			{ icon: DEFAULT_CHAT_ICON, color: DEFAULT_CHAT_COLOR },
		)
	})

	it('returns an empty patch when no migration is needed', () => {
		assert.deepEqual(
			getChatPersonalizationMigrationPatch({
				icon: DEFAULT_CHAT_ICON,
				color: DEFAULT_CHAT_COLOR,
			}),
			{},
		)
	})

	it('returns only fields that need migration', () => {
		assert.deepEqual(
			getChatPersonalizationMigrationPatch({
				icon: 'book',
			}),
			{ color: DEFAULT_CHAT_COLOR },
		)
	})

	it('validates icon and color values explicitly', () => {
		assert.equal(isValidChatIcon('message'), true)
		assert.equal(isValidChatIcon('not-real'), false)
		assert.equal(isValidChatColor('#71717a'), true)
		assert.equal(isValidChatColor('#000000'), false)
	})
})
