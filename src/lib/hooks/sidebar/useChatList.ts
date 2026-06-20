import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { chatService } from '$lib/services/chatService'
import { getVisibleSidebarChats } from '$lib/utils/sidebarChats'

export function useChatList() {
	const [searchQuery, setSearchQuery] = useState('')

	const chats = useLiveQuery(async () => {
		const allChats = await chatService.getChats()
		return getVisibleSidebarChats(allChats, searchQuery)
	}, [searchQuery])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Preserve the legacy repair trigger keyed to chat count changes.
	useEffect(() => {
		chatService.fixMissingOrders()
	}, [chats?.length])

	return {
		chats,
		searchQuery,
		setSearchQuery,
	}
}
