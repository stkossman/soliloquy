import { db } from '$lib/db'
import type { Message } from '$lib/types'

export const messageService = {
	async sendMessage(chatId: number, content: string) {
		return db.transaction('rw', db.chats, db.messages, async () => {
			await db.messages.add({
				chatId,
				content,
				createdAt: new Date(),
				isEdited: false,
				isPinned: false,
			})
			await db.chats.update(chatId, {
				lastModified: new Date(),
				previewText: content,
				draft: '',
			})
		})
	},

	async updateMessage(message: Message, newContent: string) {
		return db.transaction('rw', db.chats, db.messages, async () => {
			await db.messages.update(message.id!, {
				content: newContent,
				isEdited: true,
			})
			const lastMsg = await db.messages
				.where('chatId')
				.equals(message.chatId)
				.last()
			if (lastMsg && lastMsg.id === message.id) {
				await db.chats.update(message.chatId, { previewText: newContent })
			}
		})
	},

	async deleteMessage(id: number, chatId: number) {
		return db.transaction('rw', db.chats, db.messages, async () => {
			await db.messages.delete(id)
			const lastMsg = await db.messages.where('chatId').equals(chatId).last()
			await db.chats.update(chatId, {
				previewText: lastMsg ? lastMsg.content : '',
			})
		})
	},

	async togglePin(id: number, isPinned: boolean) {
		return db.messages.update(id, { isPinned })
	},

	async unpinAll(chatId: number) {
		const pinned = await db.messages
			.where('chatId')
			.equals(chatId)
			.filter(msg => !!msg.isPinned)
			.toArray()

		if (pinned.length === 0) return

		return db.transaction('rw', db.messages, async () => {
			for (const msg of pinned) {
				await db.messages.update(msg.id!, { isPinned: false })
			}
		})
	},

	async clearHistory(chatId: number) {
		return db.transaction('rw', db.messages, db.chats, async () => {
			await db.messages.where({ chatId }).delete()
			await db.chats.update(chatId, {
				previewText: '',
				lastModified: new Date(),
				draft: '',
			})
		})
	},
}
