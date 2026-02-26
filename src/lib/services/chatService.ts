import { db } from '$lib/db'
import type { Chat } from '$lib/types'
import { arrayMove } from '@dnd-kit/sortable'

export const chatService = {
	async createChat() {
		const regularChats = await db.chats
			.filter(c => !c.isPinned && !c.isSystem)
			.toArray()
		const minOrder = regularChats.reduce(
			(min, c) => Math.min(min, c.order || 0),
			0,
		)
		return db.chats.add({
			title: 'New Note',
			isPinned: false,
			order: minOrder - 1,
			createdAt: new Date(),
			lastModified: new Date(),
		})
	},

	async updateChat(id: number, data: Partial<Chat>) {
		return db.chats.update(id, data)
	},

	async deleteChatWithMessages(id: number) {
		return db.transaction('rw', db.chats, db.messages, async () => {
			await db.messages.where({ chatId: id }).delete()
			await db.chats.delete(id)
		})
	},

	async togglePin(chat: Chat) {
		if (!chat.isPinned) {
			const allPinned = await db.chats.filter(c => !!c.isPinned).toArray()
			const maxOrder = allPinned.reduce(
				(max, c) => Math.max(max, c.order || 0),
				-1,
			)
			return db.chats.update(chat.id!, { isPinned: true, order: maxOrder + 1 })
		} else {
			return db.chats.update(chat.id!, { isPinned: false })
		}
	},

	async getSafeSelectedIds(ids: number[]) {
		const chatsToCheck = await db.chats.where('id').anyOf(ids).toArray()
		return chatsToCheck.filter(c => !c.isSystem).map(c => c.id!)
	},

	async batchPin(ids: number[], pin: boolean) {
		const safeIds = await this.getSafeSelectedIds(ids)
		if (safeIds.length > 0) {
			return db.chats.where('id').anyOf(safeIds).modify({ isPinned: pin })
		}
	},

	async batchDelete(ids: number[]) {
		const safeIds = await this.getSafeSelectedIds(ids)
		if (safeIds.length > 0) {
			return db.transaction('rw', db.chats, db.messages, async () => {
				await db.messages.where('chatId').anyOf(safeIds).delete()
				await db.chats.where('id').anyOf(safeIds).delete()
			})
		}
	},

	async reorderChats(activeId: number, overId: number) {
		const currentChats = await db.chats.toArray()
		const activeChat = currentChats.find(c => String(c.id) === String(activeId))
		const overChat = currentChats.find(c => String(c.id) === String(overId))

		if (!activeChat || !overChat) return
		if (activeChat.isPinned !== overChat.isPinned) return

		const isPinnedGroup = activeChat.isPinned
		const groupChats = currentChats
			.filter(c => c.isPinned === isPinnedGroup && !c.isSystem)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

		const oldIndex = groupChats.findIndex(
			c => String(c.id) === String(activeId),
		)
		const newIndex = groupChats.findIndex(c => String(c.id) === String(overId))

		if (oldIndex !== -1 && newIndex !== -1) {
			const newOrder = arrayMove(groupChats, oldIndex, newIndex)
			await db.transaction('rw', db.chats, async () => {
				for (let i = 0; i < newOrder.length; i++) {
					await db.chats.update(newOrder[i].id!, { order: i })
				}
			})
		}
	},

	async fixMissingOrders() {
		const currentChats = await db.chats.toArray()
		const missingOrder = currentChats.filter(
			c => !c.isSystem && typeof c.order !== 'number',
		)

		if (missingOrder.length > 0) {
			const pinned = currentChats.filter(c => c.isPinned && !c.isSystem)
			const regular = currentChats.filter(c => !c.isPinned && !c.isSystem)

			await db.transaction('rw', db.chats, async () => {
				for (let i = 0; i < pinned.length; i++) {
					if (typeof pinned[i].order !== 'number') {
						await db.chats.update(pinned[i].id!, { order: i })
					}
				}
				for (let i = 0; i < regular.length; i++) {
					if (typeof regular[i].order !== 'number') {
						await db.chats.update(regular[i].id!, { order: i })
					}
				}
			})
		}
	},
}
