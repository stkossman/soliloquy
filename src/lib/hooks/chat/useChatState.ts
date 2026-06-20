import { useCallback, useEffect, useMemo, useState } from 'react'
import { chatService } from '$lib/services/chatService'
import type { Message } from '$lib/types'

export interface UseChatStateResult {
	inputValue: string
	setInputValue: React.Dispatch<React.SetStateAction<string>>
	editingMessage: Message | null
	editingId: number | null
	editingText: string
	startEditing: (msg: Message) => void
	cancelEdit: () => void
	setEditingMessage: React.Dispatch<React.SetStateAction<Message | null>>
}

interface UseChatStateParams {
	activeChatId: number
	onStartEditing?: () => void
}

export function useChatState({
	activeChatId,
	onStartEditing,
}: UseChatStateParams): UseChatStateResult {
	const [inputValue, setInputValue] = useState('')
	const [editingMessage, setEditingMessage] = useState<Message | null>(null)

	useEffect(() => {
		let cancelled = false

		setEditingMessage(null)
		chatService.getChat(activeChatId).then(chat => {
			if (cancelled) return
			setInputValue(chat?.draft ?? '')
		})

		return () => {
			cancelled = true
		}
	}, [activeChatId])

	useEffect(() => {
		const timer = setTimeout(() => {
			if (activeChatId && !editingMessage) {
				chatService.updateChat(activeChatId, { draft: inputValue })
			}
		}, 500)
		return () => clearTimeout(timer)
	}, [inputValue, activeChatId, editingMessage])

	const startEditing = useCallback(
		(msg: Message) => {
			onStartEditing?.()
			setEditingMessage(msg)
			setInputValue(msg.content)
		},
		[onStartEditing],
	)

	const cancelEdit = useCallback(() => {
		setEditingMessage(null)
		setInputValue('')
	}, [])

	const editingId = useMemo(
		() => (editingMessage?.id ? editingMessage.id : null),
		[editingMessage],
	)

	const editingText = useMemo(
		() => editingMessage?.content ?? '',
		[editingMessage],
	)

	return {
		inputValue,
		setInputValue,
		editingMessage,
		editingId,
		editingText,
		startEditing,
		cancelEdit,
		setEditingMessage,
	}
}
