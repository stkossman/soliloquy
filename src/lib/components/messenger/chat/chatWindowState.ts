import type { Message } from '$lib/types'

export function getMessagesForChatView({
	isPinnedView,
	pinnedMessages,
	allMessages,
}: {
	isPinnedView: boolean
	pinnedMessages: Message[] | undefined
	allMessages: Message[] | undefined
}) {
	return isPinnedView ? pinnedMessages : allMessages
}

export function getActiveSearchId(
	searchResults: number[],
	currentMatchIndex: number,
) {
	return searchResults.length > 0 && currentMatchIndex >= 0
		? searchResults[currentMatchIndex]
		: null
}
