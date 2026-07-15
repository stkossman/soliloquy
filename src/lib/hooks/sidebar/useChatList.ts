import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { chatService } from '$lib/services/chatService'
import { getVisibleSidebarChats } from '$lib/utils/sidebar-chats/sidebarChats'

const SYSTEM_CHAT_VISIBILITY_STORAGE_KEY = 'soliloquy-show-system-chat'

export function useChatList() {
	const [searchQuery, setSearchQuery] = useState('')
	const [showSystemChat, setShowSystemChat] = useState(true)

	useEffect(() => {
		setShowSystemChat(
			localStorage.getItem(SYSTEM_CHAT_VISIBILITY_STORAGE_KEY) !== 'false',
		)
	}, [])

	const handleShowSystemChatChange = (show: boolean) => {
		setShowSystemChat(show)
		localStorage.setItem(SYSTEM_CHAT_VISIBILITY_STORAGE_KEY, String(show))
	}

	const chats = useLiveQuery(async () => {
		const allChats = await chatService.getChats()
		return getVisibleSidebarChats(allChats, searchQuery, showSystemChat)
	}, [searchQuery, showSystemChat])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Preserve the legacy repair trigger keyed to chat count changes.
	useEffect(() => {
		chatService.fixMissingOrders()
	}, [chats?.length])

	return {
		chats,
		searchQuery,
		setSearchQuery,
		showSystemChat,
		setShowSystemChat: handleShowSystemChatChange,
	}
}
