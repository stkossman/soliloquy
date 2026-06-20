import { db } from '$lib/db'
import {
	parseSingleChatJsonImport,
	serializeSingleChatJsonExport,
} from './import-export/singleChatJson'
import {
	parseSingleChatMarkdownImport,
	serializeSingleChatMarkdownExport,
} from './import-export/singleChatMarkdown'
import {
	parseWorkspaceBackupImport,
	prepareMergeWorkspaceChats,
	prepareMergeWorkspaceMessages,
	prepareReplaceWorkspaceData,
	serializeWorkspaceBackup,
	type WorkspaceRestoreMode,
} from './import-export/workspaceBackup'

function downloadTextFile(content: string, fileName: string, type: string) {
	const blob = new Blob([content], { type })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	a.click()
	URL.revokeObjectURL(url)
}

export interface WorkspaceImportResult {
	chatsImported: number
	messagesImported: number
	mode: WorkspaceRestoreMode
}

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
			const data = serializeSingleChatJsonExport({ chat: chatInfo, messages })
			downloadTextFile(data, `${fileName}.json`, 'application/json')
		} else if (format === 'md') {
			const mdContent = serializeSingleChatMarkdownExport({
				chat: chatInfo,
				messages,
			})
			downloadTextFile(mdContent, `${fileName}.md`, 'text/markdown')
		}
	},

	async exportWorkspaceBackup() {
		const chats = await db.chats.toArray()
		const messages = await db.messages.toArray()
		const dateStr = new Date().toISOString().split('T')[0]
		const data = serializeWorkspaceBackup({ chats, messages })

		downloadTextFile(
			data,
			`soliloquy_workspace_backup_${dateStr}.json`,
			'application/json',
		)
	},

	async importWorkspaceBackup(
		file: File,
		mode: WorkspaceRestoreMode = 'replace',
	): Promise<WorkspaceImportResult> {
		const text = await file.text()
		const backup = parseWorkspaceBackupImport(text)

		if (mode === 'replace') {
			const data = prepareReplaceWorkspaceData(backup)

			await db.transaction('rw', db.chats, db.messages, async () => {
				await db.messages.clear()
				await db.chats.clear()

				if (data.chats.length > 0) {
					await db.chats.bulkAdd(data.chats)
				}

				if (data.messages.length > 0) {
					await db.messages.bulkAdd(data.messages)
				}
			})

			return {
				chatsImported: data.chats.length,
				messagesImported: data.messages.length,
				mode,
			}
		}

		const chatIdMap = new Map<number, number>()
		const chatsToAdd = prepareMergeWorkspaceChats(backup.chats)

		await db.transaction('rw', db.chats, db.messages, async () => {
			for (let index = 0; index < chatsToAdd.length; index++) {
				const sourceId = backup.chats[index].id
				const newId = await db.chats.add(chatsToAdd[index])

				if (typeof sourceId === 'number') {
					chatIdMap.set(sourceId, newId as number)
				}
			}

			const messagesToAdd = prepareMergeWorkspaceMessages(
				backup.messages,
				chatIdMap,
			)

			if (messagesToAdd.length > 0) {
				await db.messages.bulkAdd(messagesToAdd)
			}
		})

		return {
			chatsImported: backup.chats.length,
			messagesImported: backup.messages.length,
			mode,
		}
	},

	async importChat(file: File): Promise<number> {
		const text = await file.text()
		const extension = file.name.split('.').pop()?.toLowerCase()

		if (extension === 'json') {
			const data = parseSingleChatJsonImport(text)

			const chatId = await db.chats.add(data.chat)

			const messagesToAdd = data.messages.map(msg => ({
				chatId,
				content: msg.content,
				createdAt: msg.createdAt,
				isEdited: msg.isEdited,
				isPinned: msg.isPinned,
			}))
			await db.messages.bulkAdd(messagesToAdd)
			return chatId as number
		} else if (extension === 'md') {
			const data = parseSingleChatMarkdownImport(
				text,
				file.name.replace(/\.md$/i, ''),
			)

			const chatId = await db.chats.add(data.chat)

			const messagesToAdd = data.messages.map(msg => ({
				chatId,
				content: msg.content,
				createdAt: msg.createdAt,
				isEdited: msg.isEdited,
				isPinned: msg.isPinned,
			}))

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
