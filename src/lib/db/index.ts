import Dexie, { type Table } from 'dexie';

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

export class SoliloquyDB extends Dexie {
	chats!: Table<Chat>;
	messages!: Table<Message>;

	constructor() {
		super('SoliloquyDB');

		this.version(1).stores({
			chats: '++id, title, isPinned, lastModified',
			messages: '++id, chatId, createdAt'
		});

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
								'**Welcome to Soliloquy**\n\nA local-first space for your thoughts, designed as a monologue with yourself.',
							createdAt: new Date(Date.now() - 10000),
							isEdited: false,
							isPinned: true,
						},
						{
							chatId: id as number,
							content:
								'**Quick Guide**\n\n• **Create Chat:** Click `+` in the sidebar.\n• **Pin Chat:** Right-click on any chat.\n• **Edit/Delete:** Right-click context menu.\n• **Pin Message:** Right-click on a message -> Pin. Click the top bar to navigate pins.\n• **Edit Message:** Right-click -> Edit.',
							createdAt: new Date(Date.now() - 5000),
							isEdited: false,
						},
						{
							chatId: id as number,
							content:
								"**Philosophy**\n\nUnlike standard note apps, Soliloquy treats notes as a *flow*.\n\n**Privacy First:** All data lives in your browser (IndexedDB). No servers. No tracking.",
							createdAt: new Date(Date.now() - 2000),
							isEdited: false,
						},
						{
							chatId: id as number,
							content:
								'👨‍💻 **Developer**\n\nCreated by **Kossman**.\n\n[GitHub Profile](https://github.com/stkossman)\n[Soliloquy Repo](https://github.com/stkossman/soliloquy)',
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

export const db = new SoliloquyDB();
