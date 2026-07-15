import { parseChangelogEntry, sortChangelogEntries } from '../changelogParser'

const changelogModules = import.meta.glob('../../../content/changelog/*.md', {
	eager: true,
	query: '?raw',
	import: 'default',
}) as Record<string, string>

export function loadChangelogEntries() {
	return sortChangelogEntries(
		Object.entries(changelogModules).map(([filePath, source]) =>
			parseChangelogEntry(source, filePath),
		),
	)
}
