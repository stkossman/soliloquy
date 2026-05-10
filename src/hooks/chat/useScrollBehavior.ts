import type { Message } from '$lib/types'
import { useCallback, useEffect, useState } from 'react'

export interface UseScrollBehaviorResult {
	showScrollToBottom: boolean
	handleScroll: () => void
	scrollToBottom: () => void
}

interface UseScrollBehaviorParams {
	activeChatId: number
	allMessages: Message[] | undefined
	isPinnedView: boolean
	isEditing: boolean
	scrollViewportRef: React.RefObject<HTMLDivElement | null>
}

export function useScrollBehavior({
	activeChatId,
	allMessages,
	isPinnedView,
	isEditing,
	scrollViewportRef,
}: UseScrollBehaviorParams): UseScrollBehaviorResult {
	const [showScrollToBottom, setShowScrollToBottom] = useState(false)

	useEffect(() => {
		setShowScrollToBottom(false)
	}, [activeChatId])

	useEffect(() => {
		const viewport = scrollViewportRef.current
		if (!viewport || isEditing || isPinnedView) return
		viewport.scrollTop = viewport.scrollHeight
	}, [allMessages, isEditing, isPinnedView, activeChatId, scrollViewportRef])

	const handleScroll = useCallback(() => {
		const viewport = scrollViewportRef.current
		if (!viewport) return

		const { scrollTop, scrollHeight, clientHeight } = viewport
		const isDistanceFromBottom = scrollHeight - scrollTop - clientHeight > 100
		setShowScrollToBottom(isDistanceFromBottom)
	}, [scrollViewportRef])

	const scrollToBottom = useCallback(() => {
		const viewport = scrollViewportRef.current
		if (!viewport) return

		viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
		setShowScrollToBottom(false)
	}, [scrollViewportRef])

	return { showScrollToBottom, handleScroll, scrollToBottom }
}
