import { messageService } from '$lib/services/messageService'
import type { Message } from '$lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface UsePinnedMessagesResult {
	pinnedMessages: Message[] | undefined
	isPinnedView: boolean
	setIsPinnedView: React.Dispatch<React.SetStateAction<boolean>>
	activePinIndex: number
	currentDisplayPin: Message | null
	handlePinClick: () => void
	pinMessage: (msg: Message) => Promise<void>
	unpinAllMessages: () => Promise<void>
}

interface UsePinnedMessagesParams {
	activeChatId: number
	messageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
}

export function usePinnedMessages({
	activeChatId,
	messageRefs,
}: UsePinnedMessagesParams): UsePinnedMessagesResult {
	const [isPinnedView, setIsPinnedView] = useState(false)
	const [activePinIndex, setActivePinIndex] = useState<number>(-1)

	const pinnedMessages = useLiveQuery(
		() => messageService.getPinnedMessagesForChat(activeChatId),
		[activeChatId],
	)

	useEffect(() => {
		setIsPinnedView(false)
		setActivePinIndex(-1)
	}, [activeChatId])

	useEffect(() => {
		if (pinnedMessages && pinnedMessages.length > 0) {
			if (activePinIndex === -1 || activePinIndex >= pinnedMessages.length) {
				setActivePinIndex(pinnedMessages.length - 1)
			}
		} else {
			setActivePinIndex(-1)
		}
	}, [pinnedMessages?.length, activeChatId])

	const currentDisplayPin = useMemo(
		() =>
			pinnedMessages && activePinIndex !== -1
				? pinnedMessages[activePinIndex]
				: null,
		[pinnedMessages, activePinIndex],
	)

	const handlePinClick = useCallback(() => {
		if (!pinnedMessages || activePinIndex === -1) return
		const targetMsg = pinnedMessages[activePinIndex]
		const el = messageRefs.current.get(targetMsg.id!)

		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('bg-primary/10', 'ring-2', 'ring-primary/20')
			setTimeout(
				() => el.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/20'),
				1000,
			)
		}

		setActivePinIndex(prev => {
			const next = prev - 1
			return next < 0 ? pinnedMessages.length - 1 : next
		})
	}, [pinnedMessages, activePinIndex, messageRefs])

	const pinMessage = useCallback(async (msg: Message) => {
		await messageService.togglePin(msg.id!, !msg.isPinned)
	}, [])

	const unpinAllMessages = useCallback(async () => {
		await messageService.unpinAll(activeChatId)
		setIsPinnedView(false)
	}, [activeChatId])

	return {
		pinnedMessages,
		isPinnedView,
		setIsPinnedView,
		activePinIndex,
		currentDisplayPin,
		handlePinClick,
		pinMessage,
		unpinAllMessages,
	}
}
