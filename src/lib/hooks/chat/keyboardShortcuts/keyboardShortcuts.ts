export function isSearchShortcut(
	event: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'key'>,
) {
	return (event.ctrlKey || event.metaKey) && event.key === 'f'
}
