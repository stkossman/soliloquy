export function createSelectedChatIds(initialChatId: number) {
	return new Set([initialChatId])
}

export function toggleSelectedChatId(
	selectedChatIds: Set<number>,
	chatId: number,
) {
	const nextSelectedChatIds = new Set(selectedChatIds)

	if (nextSelectedChatIds.has(chatId)) {
		nextSelectedChatIds.delete(chatId)
	} else {
		nextSelectedChatIds.add(chatId)
	}

	return {
		selectedChatIds: nextSelectedChatIds,
		isSelectionMode: nextSelectedChatIds.size > 0,
	}
}
