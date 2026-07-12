import {
	DEFAULT_CHAT_COLOR,
	DEFAULT_CHAT_ICON,
	ICON_MAP,
	PRESET_COLORS,
	type IconKey,
} from '$lib/constants'
import type { Chat } from '$lib/types'

export interface ChatPersonalization {
	icon: IconKey
	color: string
}

export function isValidChatIcon(value: unknown): value is IconKey {
	return typeof value === 'string' && value in ICON_MAP
}

export function isValidChatColor(value: unknown): value is string {
	return typeof value === 'string' && PRESET_COLORS.includes(value)
}

export function getSafeChatPersonalization(
	chat: Pick<Chat, 'icon' | 'color'>,
): ChatPersonalization {
	return {
		icon: isValidChatIcon(chat.icon) ? chat.icon : DEFAULT_CHAT_ICON,
		color: isValidChatColor(chat.color) ? chat.color : DEFAULT_CHAT_COLOR,
	}
}

export function getChatPersonalizationMigrationPatch(
	chat: Pick<Chat, 'icon' | 'color'>,
): Partial<Pick<Chat, 'icon' | 'color'>> {
	const safePersonalization = getSafeChatPersonalization(chat)
	const patch: Partial<Pick<Chat, 'icon' | 'color'>> = {}

	if (chat.icon !== safePersonalization.icon) {
		patch.icon = safePersonalization.icon
	}

	if (chat.color !== safePersonalization.color) {
		patch.color = safePersonalization.color
	}

	return patch
}
