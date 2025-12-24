import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

export function MarkdownRenderer({ content, className } : MarkdownRendererProps) {
	return (
		<div className={cn('text-sm leading-relaxed space-y-2 break-words', className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					a: ({ node, ...props }) => (
						<a
							{...props}
							target='_blank'
							rel='noopener noreferrer'
							className='font-semibold underline underline-offset-4 decoration-muted-foreground hover:decoration-primary transition-colors'
						/>
					),

					strong: ({ node, ...props }) => <span {...props} className='font-bold' />,

					ul: ({ node, ...props }) => <ul {...props} className='list-disc pl-4 space-y-1 my-2' />,

					ol: ({ node, ...props }) => <ol {...props} className='list-decimal pl-4 space-y-1 my-2' />,

					code: ({ node, className, children, ...props }: any) => {
						const match = /language-(\w+)/.exec(className || '')
						const isInline = !match && !String(children).includes('\n')

						if (isInline) {
							return (
								<code {...props} className='px-1 py-0.5 rounded font-mono text-[0.8em]'>
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

					blockquote: ({ node, ...props }) => (
						<blockquote {...props} className='border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-2' />
					),

					h1: ({ node, ...props }) => <h1 {...props} className='text-lg font-bold mt-4 mb-2' />,
					h2: ({ node, ...props }) => <h2 {...props} className='text-base font-bold mt-3 mb-1' />,
					h3: ({ node, ...props }) => <h3 {...props} className='text-sm font-bold mt-2 mb-1' />,

					p: ({ node, ...props }) => <p {...props} className='mb-1 last:mb-0' />,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}
