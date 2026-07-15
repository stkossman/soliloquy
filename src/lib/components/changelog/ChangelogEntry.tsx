import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChangelogEntry as ChangelogEntryData } from '$lib/changelog/changelog.types'

interface ChangelogEntryProps {
	entry: ChangelogEntryData
}

function formatReleaseDate(date: string) {
	return new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(`${date}T00:00:00.000Z`))
}

function getReleaseAnchor(version: string) {
	return `v${version.replace(/[^A-Za-z0-9]+/g, '-')}`
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
	return (
		<article
			id={getReleaseAnchor(entry.version)}
			className='border-t border-border py-8 first:border-t-0 first:pt-0'
		>
			<header className='mb-6 space-y-3'>
				<div className='flex flex-wrap items-center gap-3'>
					<span className='rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary'>
						v{entry.version}
					</span>
					<time dateTime={entry.date} className='text-sm text-muted-foreground'>
						{formatReleaseDate(entry.date)}
					</time>
				</div>
				<h2 className='text-xl font-semibold text-foreground'>{entry.title}</h2>
			</header>

			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h2: ({ children }) => (
						<h3 className='mb-3 mt-7 text-base font-semibold text-foreground first:mt-0'>
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className='mb-4 text-sm leading-6 text-muted-foreground'>
							{children}
						</p>
					),
					ul: ({ children }) => (
						<ul className='mb-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground'>
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className='mb-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground'>
							{children}
						</ol>
					),
					li: ({ children }) => <li>{children}</li>,
					code: ({ children }) => (
						<code className='rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground'>
							{children}
						</code>
					),
					a: ({ href, children }) => (
						<a
							href={href}
							className='font-medium text-foreground underline underline-offset-4 decoration-muted-foreground hover:decoration-foreground'
						>
							{children}
						</a>
					),
				}}
			>
				{entry.content}
			</ReactMarkdown>
		</article>
	)
}
