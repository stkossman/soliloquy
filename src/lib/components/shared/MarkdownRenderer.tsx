import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
	content: string
	className?: string
}

const SpoilerText = ({ children }: { children: React.ReactNode }) => {
	return (
		<span className='bg-foreground text-transparent select-none rounded px-1 transition-all hover:bg-muted/50 hover:text-foreground hover:select-text cursor-pointer duration-300'>
			{children}
		</span>
	)
}

export function MarkdownRenderer({
	content,
	className,
}: MarkdownRendererProps) {
	const processedContent = content
		.replace(/^#/gm, '\\#')
		.replace(/^>/gm, '\\>')
		.replace(/^([-*+]) /gm, '\\$1 ')
		.replace(/^(\d+)\. /gm, '$1\\. ')
		.replace(/^---/gm, '\\---')
		.replace(/\|\|(.*?)\|\|/g, '[$1](#spoiler)')

	return (
		<div
			className={cn('text-sm leading-relaxed space-y-1 break-words', className)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					a: ({ node, href, children, ...props }) => {
						if (href === '#spoiler') {
							return <SpoilerText>{children}</SpoilerText>
						}

						return (
							<a
								{...props}
								href={href}
								target='_blank'
								rel='noopener noreferrer'
								className='font-semibold underline underline-offset-4 decoration-muted-foreground hover:decoration-primary transition-colors'
							>
								{children}
							</a>
						)
					},

					strong: ({ node, ...props }) => (
						<span {...props} className='font-bold' />
					),
					em: ({ node, ...props }) => <span {...props} className='italic' />,
					del: ({ node, ...props }) => (
						<span {...props} className='line-through opacity-70' />
					),

					code: ({ node, className, children, ...props }: any) => {
						const match = /language-(\w+)/.exec(className || '')
						const isInline = !match && !String(children).includes('\n')

						if (isInline) {
							return (
								<code
									{...props}
									className='px-1.5 py-0.5 rounded bg-muted font-mono text-[0.85em] text-foreground'
								>
									{children}
								</code>
							)
						}

						return (
							<code
								{...props}
								className='block bg-muted/50 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 border border-border/50 text-foreground'
							>
								{children}
							</code>
						)
					},

					p: ({ node, ...props }) => (
						<p {...props} className='mb-1 last:mb-0 whitespace-pre-wrap' />
					),
				}}
			>
				{processedContent}
			</ReactMarkdown>
		</div>
	)
}
