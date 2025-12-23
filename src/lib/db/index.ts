import Dexie, { type Table } from 'dexie';

export interface Chat {
	id?: number
	title: string
	isPinned: boolean
	createdAt: Date
	lastModified: Date
	previewText?: string
}

export interface Message {
	id?: number;
	chatId: number;
	content: string;
	createdAt: Date;
	isEdited: boolean;
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
			this.chats
				.add({
					title: 'You are alone here',
					isPinned: true,
					createdAt: new Date(),
					lastModified: new Date(),
				})
				.then(id => {
					this.messages.bulkAdd([
						{
							chatId: id as number,
							content: 'Hello. This is your new space for thoughts.',
							createdAt: new Date(),
							isEdited: false,
						},
						{
							chatId: id as number,
							content: 'Create a new chat on the left to start writing.',
							createdAt: new Date(Date.now() + 100),
							isEdited: false,
						},
					])
				})
		})
	}
}

export const db = new SoliloquyDB();
