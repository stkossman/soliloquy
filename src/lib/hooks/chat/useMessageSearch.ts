import { useCallback, useEffect, useState } from 'react'
import type { Message } from '$lib/types'

export interface UseMessageSearchResult {
	isSearchOpen: boolean
	setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>
	searchQuery: string
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>
	searchResults: number[]
	currentMatchIndex: number
	toggleSearch: () => void
	nextMatch: () => void
	prevMatch: () => void
	jumpToDate: (date: Date) => void
}

interface UseMessageSearchParams {
	allMessages: Message[] | undefined
	messageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
}

export function useMessageSearch({
	allMessages,
	messageRefs,
}: UseMessageSearchParams): UseMessageSearchResult {
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<number[]>([])
	const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)

	useEffect(() => {
		if (!searchQuery.trim() || !allMessages) {
			setSearchResults([])
			setCurrentMatchIndex(-1)
			return
		}

		const lowerQuery = searchQuery.toLowerCase()
		const matches = allMessages
			.filter(msg => msg.content.toLowerCase().includes(lowerQuery))
			.map(msg => msg.id!)

		setSearchResults(matches)
		setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : -1)
	}, [searchQuery, allMessages])

	useEffect(() => {
		if (currentMatchIndex < 0 || searchResults.length === 0) return
		const msgId = searchResults[currentMatchIndex]
		const el = messageRefs.current.get(msgId)
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}, [currentMatchIndex, searchResults, messageRefs])

	const toggleSearch = useCallback(() => {
		setIsSearchOpen(prev => {
			if (prev) setSearchQuery('')
			return !prev
		})
	}, [])

	const nextMatch = useCallback(() => {
		if (searchResults.length === 0) return
		setCurrentMatchIndex(prev =>
			prev < searchResults.length - 1 ? prev + 1 : 0,
		)
	}, [searchResults])

	const prevMatch = useCallback(() => {
		if (searchResults.length === 0) return
		setCurrentMatchIndex(prev =>
			prev > 0 ? prev - 1 : searchResults.length - 1,
		)
	}, [searchResults])

	const jumpToDate = useCallback(
		(date: Date) => {
			if (!allMessages) return
			const targetTime = new Date(date).setHours(0, 0, 0, 0)

			const targetMsg = allMessages.find(msg => {
				const msgTime = new Date(msg.createdAt).setHours(0, 0, 0, 0)
				return msgTime >= targetTime
			})

			if (!targetMsg?.id) return
			const el = messageRefs.current.get(targetMsg.id)
			if (!el) return

			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('ring-2', 'ring-primary', 'bg-primary/5')
			setTimeout(
				() => el.classList.remove('ring-2', 'ring-primary', 'bg-primary/5'),
				2000,
			)
		},
		[allMessages, messageRefs],
	)

	return {
		isSearchOpen,
		setIsSearchOpen,
		searchQuery,
		setSearchQuery,
		searchResults,
		currentMatchIndex,
		toggleSearch,
		nextMatch,
		prevMatch,
		jumpToDate,
	}
}
