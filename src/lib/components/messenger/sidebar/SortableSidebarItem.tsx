import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SidebarItem } from './SidebarItem'
import type { Chat } from '$lib/types'

interface SortableSidebarItemProps {
	chat: Chat
	isActive: boolean
	onSelect: () => void
	onPin: () => void
	onEdit: () => void
	onDelete: () => void
	isSelectionMode: boolean
	isSelected: boolean
	onToggleSelection: () => void
	onStartSelection: () => void
}

export function SortableSidebarItem(props: SortableSidebarItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: props.chat.id! })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 50 : 'auto',
		position: 'relative' as const,
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<SidebarItem {...props} />
		</div>
	)
}
