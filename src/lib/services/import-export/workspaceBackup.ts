import type { Chat, Message } from '$lib/types'

export const WORKSPACE_BACKUP_FORMAT = 'soliloquy-workspace-backup'
export const WORKSPACE_BACKUP_VERSION = 1

export interface WorkspaceBackup {
	format: typeof WORKSPACE_BACKUP_FORMAT
	version: typeof WORKSPACE_BACKUP_VERSION
	exportedAt: string
	data: {
		chats: Chat[]
		messages: Message[]
	}
}

interface WorkspaceBackupExport {
	chats: Chat[]
	messages: Message[]
	exportedAt?: Date
}

export function createWorkspaceBackup({
	chats,
	messages,
	exportedAt = new Date(),
}: WorkspaceBackupExport): WorkspaceBackup {
	return {
		format: WORKSPACE_BACKUP_FORMAT,
		version: WORKSPACE_BACKUP_VERSION,
		exportedAt: exportedAt.toISOString(),
		data: {
			chats,
			messages,
		},
	}
}

export function serializeWorkspaceBackup(data: WorkspaceBackupExport): string {
	return JSON.stringify(createWorkspaceBackup(data), null, 2)
}
