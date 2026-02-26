import { db } from '$lib/db'
import type { Message } from '$lib/types'

export const importExportService = {
	async exportChat(chatId: number, format: 'json' | 'md') {
		const messages = await db.messages
			.where('chatId')
			.equals(chatId)
			.sortBy('createdAt')
		const chatInfo = await db.chats.get(chatId)

		const title = chatInfo?.title || 'Unknown Chat'
		const dateStr = new Date().toISOString().split('T')[0]
		const fileName = `soliloquy_export_${title.replace(/\s+/g, '_')}_${dateStr}`

		if (format === 'json') {
			const data = JSON.stringify({ chat: chatInfo, messages }, null, 2)
			const blob = new Blob([data], { type: 'application/json' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${fileName}.json`
			a.click()
			URL.revokeObjectURL(url)
		} else if (format === 'md') {
			let mdContent = `# ${title}\n\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`
			messages.forEach(msg => {
				const time = msg.createdAt.toLocaleString()
				mdContent += `### [${time}]\n${msg.content}\n\n`
				if (msg.isPinned) mdContent += `> 📌 Pinned\n\n`
				mdContent += `---\n\n`
			})
			const blob = new Blob([mdContent], { type: 'text/markdown' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${fileName}.md`
			a.click()
			URL.revokeObjectURL(url)
		}
	},

	async importChat(file: File): Promise<number> {
		const text = await file.text()
		const extension = file.name.split('.').pop()?.toLowerCase()

		if (extension === 'json') {
			const data = JSON.parse(text)
			if (!data.chat || !data.messages) throw new Error('Invalid JSON format')

			const chatId = await db.chats.add({
				title: data.chat.title + ' (Imported)',
				isPinned: false,
				createdAt: new Date(data.chat.createdAt),
				lastModified: new Date(),
				previewText: data.chat.previewText,
			})

			const messagesToAdd = data.messages.map((msg: any) => ({
				chatId: chatId,
				content: msg.content,
				createdAt: new Date(msg.createdAt),
				isEdited: msg.isEdited,
				isPinned: msg.isPinned,
			}))
			await db.messages.bulkAdd(messagesToAdd)
			return chatId as number
		} else if (extension === 'md') {
			const lines = text.split('\n')
			const titleMatch = lines[0].match(/^# (.*)/)
			const title = titleMatch ? titleMatch[1] : file.name.replace('.md', '')

			const chatId = await db.chats.add({
				title: title + ' (Imported)',
				isPinned: false,
				createdAt: new Date(),
				lastModified: new Date(),
			})

			const rawMessages = text.split('\n---\n\n')
			const messagesToAdd: Message[] = []
			const contentChunks = rawMessages.slice(1)

			for (const chunk of contentChunks) {
				if (!chunk.trim()) continue
				const dateMatch = chunk.match(/^### \[(.*?)\]/)
				const createdAt = dateMatch ? new Date(dateMatch[1]) : new Date()
				const isPinned = chunk.includes('> 📌 Pinned')
				let content = chunk
					.replace(/^### \[.*?\]\n/, '')
					.replace(/> 📌 Pinned\n\n?/, '')
					.trim()

				if (content) {
					messagesToAdd.push({
						chatId: chatId as number,
						content,
						createdAt,
						isEdited: false,
						isPinned,
					})
				}
			}

			if (messagesToAdd.length > 0) {
				await db.messages.bulkAdd(messagesToAdd)
				await db.chats.update(chatId as number, {
					previewText: messagesToAdd[messagesToAdd.length - 1].content,
				})
			}
			return chatId as number
		}
		throw new Error('Unsupported file format')
	},
}
