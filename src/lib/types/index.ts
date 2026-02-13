export interface Chat {
	id?: number
	title: string
	isPinned: boolean
	createdAt: Date
	lastModified: Date
	previewText?: string
	draft?: string
	isSystem?: boolean
	order?: number
	icon?: string
	color?: string
}

export interface Message {
	id?: number
	chatId: number
	content: string
	createdAt: Date
	isEdited: boolean
	isPinned?: boolean
}
