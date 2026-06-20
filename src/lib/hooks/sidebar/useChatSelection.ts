import { useCallback, useState } from 'react'
import { createSelectedChatIds, toggleSelectedChatId } from './selectionState'

export function useChatSelection() {
	const [isSelectionMode, setIsSelectionMode] = useState(false)
	const [selectedChatIds, setSelectedChatIds] = useState<Set<number>>(new Set())
	const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

	const clearSelection = useCallback(() => {
		setIsSelectionMode(false)
		setSelectedChatIds(new Set())
	}, [])

	const startSelectionMode = useCallback((initialChatId: number) => {
		setIsSelectionMode(true)
		setSelectedChatIds(createSelectedChatIds(initialChatId))
	}, [])

	const toggleChatSelection = useCallback((id: number) => {
		setSelectedChatIds(prev => {
			const next = toggleSelectedChatId(prev, id)
			setIsSelectionMode(next.isSelectionMode)
			return next.selectedChatIds
		})
	}, [])

	return {
		startSelectionMode,
		toggleChatSelection,
		clearSelection,
		isSelectionMode,
		selectedChatIds,
		showBatchDeleteConfirm,
		setShowBatchDeleteConfirm,
	}
}
