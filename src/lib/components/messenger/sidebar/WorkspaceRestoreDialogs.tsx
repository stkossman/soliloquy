import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '$lib/components/ui/alert-dialog'
import { Button } from '$lib/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '$lib/components/ui/dialog'
import type { WorkspaceRestoreMode } from '$lib/services/import-export/workspace-backup/workspaceBackup'
import { cn } from '$lib/utils'

interface WorkspaceRestoreDialogsProps {
	isRestoreDialogOpen: boolean
	onRestoreDialogOpenChange: (open: boolean) => void
	mode: WorkspaceRestoreMode
	onModeChange: (mode: WorkspaceRestoreMode) => void
	onContinue: () => void
	isReplaceConfirmOpen: boolean
	onReplaceConfirmOpenChange: (open: boolean) => void
	onConfirmReplace: () => void
}

export function WorkspaceRestoreDialogs({
	isRestoreDialogOpen,
	onRestoreDialogOpenChange,
	mode,
	onModeChange,
	onContinue,
	isReplaceConfirmOpen,
	onReplaceConfirmOpenChange,
	onConfirmReplace,
}: WorkspaceRestoreDialogsProps) {
	return (
		<>
			<Dialog
				open={isRestoreDialogOpen}
				onOpenChange={onRestoreDialogOpenChange}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Restore workspace backup</DialogTitle>
						<DialogDescription>
							Choose how to apply the selected backup to your local workspace.
						</DialogDescription>
					</DialogHeader>

					<fieldset className='grid grid-cols-2 overflow-hidden rounded-md border'>
						<legend className='sr-only'>Workspace restore mode</legend>
						<button
							type='button'
							className={cn(
								'px-3 py-2 text-sm font-medium transition-colors',
								mode === 'merge'
									? 'bg-primary text-primary-foreground'
									: 'hover:bg-muted',
							)}
							onClick={() => onModeChange('merge')}
							aria-pressed={mode === 'merge'}
						>
							Merge
						</button>
						<button
							type='button'
							className={cn(
								'border-l px-3 py-2 text-sm font-medium transition-colors',
								mode === 'replace'
									? 'bg-destructive text-destructive-foreground'
									: 'hover:bg-muted',
							)}
							onClick={() => onModeChange('replace')}
							aria-pressed={mode === 'replace'}
						>
							Replace
						</button>
					</fieldset>

					<p className='text-muted-foreground text-sm'>
						{mode === 'merge'
							? 'Add the backup chats and messages to the current workspace.'
							: 'Delete all local chats and messages, then restore this backup.'}
					</p>

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => onRestoreDialogOpenChange(false)}
						>
							Cancel
						</Button>
						<Button onClick={onContinue}>Continue</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={isReplaceConfirmOpen}
				onOpenChange={onReplaceConfirmOpenChange}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Replace current workspace?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently deletes all local chats and messages before
							restoring the selected backup. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onConfirmReplace}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Replace and Restore
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
