import type { Chat } from '$lib/types'

export function getSidebarChatGroups(chats: Chat[] | undefined) {
	return {
		systemChats: chats?.filter(chat => chat.isSystem) || [],
		pinnedChats: chats?.filter(chat => chat.isPinned && !chat.isSystem) || [],
		regularChats: chats?.filter(chat => !chat.isPinned && !chat.isSystem) || [],
	}
}
