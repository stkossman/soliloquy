import { NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { ChatWindow } from './ChatWindow'
import { Sidebar } from './Sidebar'

export default function MessengerLayout() {
	const [activeChatId, setActiveChatId] = useState<number | null>(null)

	return (
		<div className='flex h-screen w-full overflow-hidden bg-background text-foreground'>
			<Sidebar activeChatId={activeChatId} onChatSelect={setActiveChatId} />

			<main className='flex-1 flex flex-col h-full relative min-w-0'>
				{activeChatId !== null ? (
					<ChatWindow key={activeChatId} activeChatId={activeChatId} />
				) : (
					<div className='flex h-full items-center justify-center text-muted-foreground flex-col gap-2'>
						<div className='bg-muted/20 p-4 rounded-full'>
							<NotebookPen className='h-10 w-10' />
						</div>
						<p>Choose a chat to view</p>
					</div>
				)}
			</main>
		</div>
	)
}
