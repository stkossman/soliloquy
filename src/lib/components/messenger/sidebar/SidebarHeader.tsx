import { ArchiveRestore, Download, Plus, Search, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
import { Button } from '$lib/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu'
import { Input } from '$lib/components/ui/input'

interface SidebarHeaderProps {
	searchQuery: string
	onSearchChange: (val: string) => void
	onCreateChat: () => void
	onImportChat: (file: File) => void
	onExportWorkspace: () => void
	onImportWorkspace: (file: File) => void
	isSelectionMode: boolean
}

export function SidebarHeader({
	searchQuery,
	onSearchChange,
	onCreateChat,
	onImportChat,
	onExportWorkspace,
	onImportWorkspace,
	isSelectionMode,
}: SidebarHeaderProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const workspaceFileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			onImportChat(file)
		}
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleWorkspaceFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0]
		if (file) {
			onImportWorkspace(file)
		}
		if (workspaceFileInputRef.current) {
			workspaceFileInputRef.current.value = ''
		}
	}

	return (
		<div className='p-4 space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Avatar className='h-9 w-9'>
						<AvatarImage src='/logo.svg' alt='@stkossman' />
						<AvatarFallback>SK</AvatarFallback>
					</Avatar>
					<div className='flex flex-col'>
						<span className='text-sm font-semibold'>Soliloquy</span>
						<span className='text-xs text-muted-foreground'>Local Storage</span>
					</div>
				</div>

				<div className='flex items-center gap-1'>
					{!isSelectionMode && (
						<>
							<input
								type='file'
								ref={workspaceFileInputRef}
								onChange={handleWorkspaceFileChange}
								className='hidden'
								accept='.json,application/json'
							/>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
										title='Workspace Backup'
									>
										<ArchiveRestore className='h-5 w-5' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuItem onClick={onExportWorkspace}>
										<Download className='h-4 w-4' /> Export Workspace Backup
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => workspaceFileInputRef.current?.click()}
									>
										<Upload className='h-4 w-4' /> Restore Workspace Backup
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<input
								type='file'
								ref={fileInputRef}
								onChange={handleFileChange}
								className='hidden'
								accept='.json,.md'
							/>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => fileInputRef.current?.click()}
								title='Import Chat'
							>
								<Download className='h-5 w-5' />
							</Button>

							<Button
								variant='ghost'
								size='icon'
								onClick={onCreateChat}
								title='New Chat'
							>
								<Plus className='h-5 w-5' />
							</Button>
						</>
					)}
				</div>
			</div>

			<div className='relative'>
				<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Search...'
					className='pl-8 bg-background/50 border-sidebar-border focus-visible:ring-sidebar-ring'
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
					disabled={isSelectionMode}
				/>
			</div>
		</div>
	)
}
