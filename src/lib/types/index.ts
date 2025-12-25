export interface Chat {
	id?: number
	title: string
	isPinned: boolean
	createdAt: Date
	lastModified: Date
	previewText?: string
	isSystem?: boolean
}

export interface Message {
	id?: number
	chatId: number
	content: string
	createdAt: Date
	isEdited: boolean
	isPinned?: boolean
}
