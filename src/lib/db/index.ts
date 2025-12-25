import Dexie, { type Table } from 'dexie'
import type { Chat, Message } from '$lib/types'

export class SoliloquyDB extends Dexie {
	chats!: Table<Chat>
	messages!: Table<Message>

	constructor() {
		super('SoliloquyDB')

		this.version(1).stores({
			chats: '++id, title, isPinned, lastModified',
			messages: '++id, chatId, createdAt',
		})

		this.on('populate', () => {
			// system chat
			this.chats
				.add({
					title: 'Soliloquy Info',
					isPinned: true,
					createdAt: new Date(),
					lastModified: new Date(),
					isSystem: true,
					previewText: 'Contacts, Roadmap & Guide',
				})
				.then(id => {
					this.messages.bulkAdd([
						{
							chatId: id as number,
							content:
								'# Welcome to Soliloquy\n\nA local-first space for your thoughts, designed as a monologue with yourself.\n\nEverything you write here lives **only** in your browser via IndexedDB. No servers, no tracking, pure privacy.',
							createdAt: new Date(Date.now() - 15000),
							isEdited: false,
							isPinned: true,
						},
						{
							chatId: id as number,
							content:
								'### **Controls Guide**\n\nManage your workflow efficiently:\n\n- **New Chat:** Click `+` in the sidebar.\n- **Context Menu:** Right-click chats or messages to **Pin**, **Edit**, or **Delete**.\n- **Pinned Navigation:** Click the pinned message bar at the top to cycle through saved notes.',
							createdAt: new Date(Date.now() - 10000),
							isEdited: false,
						},
						{
							chatId: id as number,
							content:
								'### **Markdown Support**\n\nSoliloquy supports rich text formatting. Try these:\n\n- **Bold**: `**text**`\n- *Italic*: `*text*`\n- [Links](https://soliloquy-notes.vercel.app/): `[Link](url)`\n\n> Blockquotes are great for highlighting ideas (`> text`)\n\nCode blocks work too:\n```js\nconsole.log("Hello Soliloquy");\n```',
							createdAt: new Date(Date.now() - 5000),
							isEdited: false,
						},
						{
							chatId: id as number,
							content:
								'### **About**\n\nCreated by **Kossman**.\n\n[GitHub Profile](https://github.com/stkossman)\n[Soliloquy Repo](https://github.com/stkossman/soliloquy)\n\n*Note: This is a system chat (read-only).*',
							createdAt: new Date(),
							isEdited: false,
						},
					])
				})

			// default chat
			this.chats.add({
				title: 'Notes',
				isPinned: false,
				createdAt: new Date(),
				lastModified: new Date(),
				previewText: 'Your first note space.',
			})
		})
	}
}

export const db = new SoliloquyDB()
