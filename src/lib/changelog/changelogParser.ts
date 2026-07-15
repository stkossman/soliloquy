import type { ChangelogEntry } from './changelog.types'

function parseFrontmatterValue(value: string) {
	const trimmedValue = value.trim()

	if (
		(trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
		(trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
	) {
		return trimmedValue.slice(1, -1)
	}

	return trimmedValue
}

function isValidReleaseDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

	const date = new Date(`${value}T00:00:00.000Z`)
	return (
		!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
	)
}

export function parseChangelogEntry(
	source: string,
	filePath = 'changelog entry',
): ChangelogEntry {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)

	if (!match) {
		throw new Error(
			`Invalid changelog entry in ${filePath}: missing frontmatter`,
		)
	}

	const metadata = new Map<string, string>()
	for (const line of match[1].split(/\r?\n/)) {
		const metadataMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
		if (metadataMatch) {
			metadata.set(metadataMatch[1], parseFrontmatterValue(metadataMatch[2]))
		}
	}

	const version = metadata.get('version')
	const date = metadata.get('date')
	const title = metadata.get('title')

	if (!version || !date || !title) {
		throw new Error(
			`Invalid changelog entry in ${filePath}: version, date, and title are required`,
		)
	}

	if (!isValidReleaseDate(date)) {
		throw new Error(`Invalid changelog entry in ${filePath}: date is invalid`)
	}

	return {
		version,
		date,
		title,
		content: match[2].trim(),
	}
}

export function sortChangelogEntries(entries: ChangelogEntry[]) {
	return [...entries].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
}
