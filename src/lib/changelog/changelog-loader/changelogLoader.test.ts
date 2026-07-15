import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import {
	parseChangelogEntry,
	sortChangelogEntries,
} from '../changelogParser.ts'

describe('changelog loader', () => {
	it('loads the v0.1.0 Markdown entry', async () => {
		const source = await readFile(
			new URL('../../../content/changelog/0.1.0.md', import.meta.url),
			'utf8',
		)
		const entry = parseChangelogEntry(source, '0.1.0.md')

		assert.equal(entry.version, '0.1.0')
		assert.equal(entry.date, '2026-07-16')
		assert.equal(entry.title, 'Initial formal release')
	})

	it('parses required frontmatter and Markdown content', () => {
		const entry = parseChangelogEntry(
			[
				'---',
				'version: 0.1.0',
				'date: 2026-07-16',
				'title: Initial release',
				'---',
				'',
				'## Added',
				'',
				'- Local workspace',
			].join('\n'),
			'0.1.0.md',
		)

		assert.deepEqual(entry, {
			version: '0.1.0',
			date: '2026-07-16',
			title: 'Initial release',
			content: '## Added\n\n- Local workspace',
		})
	})

	it('sorts releases from newest to oldest', () => {
		const entries = sortChangelogEntries([
			{ version: '0.1.0', date: '2026-07-16', title: 'First', content: '' },
			{ version: '0.2.0', date: '2026-08-01', title: 'Second', content: '' },
		])

		assert.deepEqual(
			entries.map(entry => entry.version),
			['0.2.0', '0.1.0'],
		)
	})

	it('rejects malformed or incomplete entries', () => {
		assert.throws(
			() => parseChangelogEntry('## Added\n\n- Missing frontmatter'),
			/missing frontmatter/,
		)
		assert.throws(
			() =>
				parseChangelogEntry(
					['---', 'version: 0.1.0', 'date: 2026-07-16', '---'].join('\n'),
				),
			/are required/,
		)
		assert.throws(
			() =>
				parseChangelogEntry(
					[
						'---',
						'version: 0.1.0',
						'date: 2026-02-30',
						'title: Invalid',
						'---',
					].join('\n'),
				),
			/date is invalid/,
		)
	})
})
