import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChangelogPage } from './ChangelogPage'

describe('ChangelogPage', () => {
	it('renders release metadata and Markdown content', () => {
		const markup = renderToStaticMarkup(
			<ChangelogPage
				entries={[
					{
						version: '0.1.0',
						date: '2026-07-16',
						title: 'Initial formal release',
						content: '## Added\n\n- Local workspace',
					},
				]}
			/>,
		)

		assert.match(markup, /v0\.1\.0/)
		assert.match(markup, /July 16, 2026/)
		assert.match(markup, /Initial formal release/)
		assert.match(markup, /Added/)
		assert.match(markup, /Local workspace/)
	})
})
