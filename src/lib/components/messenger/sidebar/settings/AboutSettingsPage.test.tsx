import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AboutSettingsPage } from './AboutSettingsPage'

describe('AboutSettingsPage', () => {
	it('links to the internal changelog without changing source code link behavior', () => {
		const markup = renderToStaticMarkup(<AboutSettingsPage />)

		assert.match(markup, /href="\/changelog"/)
		assert.match(markup, /Release notes/)
		assert.match(markup, /target="_blank"/)
		assert.match(markup, /rel="noopener noreferrer"/)
	})
})
