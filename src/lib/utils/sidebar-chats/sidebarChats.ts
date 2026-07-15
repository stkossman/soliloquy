import type { Chat } from '$lib/types'

function compareChats(a: Chat, b: Chat) {
	if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1
	if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1

	const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
	const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER

	if (orderA !== orderB) return orderA - orderB

	return b.lastModified.getTime() - a.lastModified.getTime()
}

export function getVisibleSidebarChats(
	chats: Chat[],
	searchQuery: string,
	showSystemChat = true,
) {
	let visibleChats = showSystemChat
		? chats
		: chats.filter(chat => !chat.isSystem)

	if (searchQuery.trim()) {
		const lowerQuery = searchQuery.toLowerCase()
		visibleChats = visibleChats.filter(chat =>
			chat.title.toLowerCase().includes(lowerQuery),
		)
	}

	return [...visibleChats].sort(compareChats)
}
