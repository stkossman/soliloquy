import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type SensorDescriptor,
	type SensorOptions,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MessageSquare } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import type { Chat } from '$lib/types'
import { SidebarItem } from './SidebarItem'
import { SortableSidebarItem } from './SortableSidebarItem'
import { getSidebarChatGroups } from './sidebar-chat-groups/sidebarChatGroups'

interface SidebarChatListProps {
	chats: Chat[] | undefined
	searchQuery: string
	isSelectionMode: boolean
	selectedChatIds: Set<number>
	activeChatId: number | null
	onChatSelect: (id: number | null) => void
	onPinChat: (chat: Chat) => void
	onEditChat: (chat: Chat) => void
	onDeleteChat: (chat: Chat) => void
	onToggleSelection: (id: number) => void
	onStartSelection: (id: number) => void
	onDragEnd: (event: DragEndEvent) => void
	sensors: SensorDescriptor<SensorOptions>[]
}

interface SidebarChatListItemProps {
	chat: Chat
	activeChatId: number | null
	isSelectionMode: boolean
	isSelected: boolean
	sortable?: boolean
	onChatSelect: (id: number | null) => void
	onPinChat: (chat: Chat) => void
	onEditChat: (chat: Chat) => void
	onDeleteChat: (chat: Chat) => void
	onToggleSelection: (id: number) => void
	onStartSelection: (id: number) => void
}

const SidebarChatListItem = memo(function SidebarChatListItem({
	chat,
	activeChatId,
	isSelectionMode,
	isSelected,
	sortable,
	onChatSelect,
	onPinChat,
	onEditChat,
	onDeleteChat,
	onToggleSelection,
	onStartSelection,
}: SidebarChatListItemProps) {
	const chatId = chat.id

	const handleSelect = useCallback(() => {
		onChatSelect(typeof chatId === 'number' ? chatId : null)
	}, [chatId, onChatSelect])

	const handlePin = useCallback(() => onPinChat(chat), [chat, onPinChat])
	const handleEdit = useCallback(() => onEditChat(chat), [chat, onEditChat])
	const handleDelete = useCallback(
		() => onDeleteChat(chat),
		[chat, onDeleteChat],
	)
	const handleToggleSelection = useCallback(() => {
		if (typeof chatId === 'number') onToggleSelection(chatId)
	}, [chatId, onToggleSelection])
	const handleStartSelection = useCallback(() => {
		if (typeof chatId === 'number') onStartSelection(chatId)
	}, [chatId, onStartSelection])

	const itemProps = {
		chat,
		isActive: activeChatId === chatId,
		onSelect: handleSelect,
		onPin: handlePin,
		onEdit: handleEdit,
		onDelete: handleDelete,
		isSelectionMode,
		isSelected,
		onToggleSelection: handleToggleSelection,
		onStartSelection: handleStartSelection,
	}

	if (sortable) return <SortableSidebarItem {...itemProps} />
	return <SidebarItem {...itemProps} />
})

export function SidebarChatList({
	chats,
	searchQuery,
	isSelectionMode,
	selectedChatIds,
	activeChatId,
	onChatSelect,
	onPinChat,
	onEditChat,
	onDeleteChat,
	onToggleSelection,
	onStartSelection,
	onDragEnd,
	sensors,
}: SidebarChatListProps) {
	const { systemChats, pinnedChats, regularChats } = useMemo(
		() => getSidebarChatGroups(chats),
		[chats],
	)
	const pinnedChatIds = useMemo(
		() =>
			pinnedChats
				.map(chat => chat.id)
				.filter((id): id is number => typeof id === 'number'),
		[pinnedChats],
	)
	const regularChatIds = useMemo(
		() =>
			regularChats
				.map(chat => chat.id)
				.filter((id): id is number => typeof id === 'number'),
		[regularChats],
	)

	const renderItem = useCallback(
		(chat: Chat, sortable = false) => (
			<SidebarChatListItem
				key={chat.id}
				chat={chat}
				activeChatId={activeChatId}
				isSelectionMode={isSelectionMode}
				isSelected={typeof chat.id === 'number' && selectedChatIds.has(chat.id)}
				sortable={sortable}
				onChatSelect={onChatSelect}
				onPinChat={onPinChat}
				onEditChat={onEditChat}
				onDeleteChat={onDeleteChat}
				onToggleSelection={onToggleSelection}
				onStartSelection={onStartSelection}
			/>
		),
		[
			activeChatId,
			isSelectionMode,
			selectedChatIds,
			onChatSelect,
			onPinChat,
			onEditChat,
			onDeleteChat,
			onToggleSelection,
			onStartSelection,
		],
	)

	return (
		<div className='flex flex-col gap-1 p-2'>
			{systemChats.map(chat => renderItem(chat))}

			{!searchQuery && !isSelectionMode ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={onDragEnd}
				>
					<SortableContext
						items={pinnedChatIds}
						strategy={verticalListSortingStrategy}
					>
						{pinnedChats.map(chat => renderItem(chat, true))}
					</SortableContext>

					<SortableContext
						items={regularChatIds}
						strategy={verticalListSortingStrategy}
					>
						{regularChats.map(chat => renderItem(chat, true))}
					</SortableContext>
				</DndContext>
			) : (
				[...pinnedChats, ...regularChats].map(chat => renderItem(chat))
			)}

			{chats?.length === 0 && (
				<div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
					<MessageSquare className='mb-2 h-10 w-10 opacity-20' />
					<p className='text-sm'>No notes</p>
				</div>
			)}
		</div>
	)
}
