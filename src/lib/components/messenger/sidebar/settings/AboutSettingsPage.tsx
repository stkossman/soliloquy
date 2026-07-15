import { Github, Info } from 'lucide-react'
import {
	APP_NAME,
	APP_SOURCE_CODE_URL,
	APP_VERSION,
} from '$lib/appInfo'
import { Button } from '$lib/components/ui/button'

export function AboutSettingsPage() {
	return (
		<section className='space-y-5 px-6 py-5' aria-labelledby='about-heading'>
			<h2 id='about-heading' className='sr-only'>
				About Soliloquy
			</h2>
			<div className='flex items-center gap-3'>
				<span className='flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary'>
					<Info className='size-5' />
				</span>
				<div>
					<p className='text-sm font-semibold'>{APP_NAME}</p>
					<p className='text-sm text-muted-foreground'>v{APP_VERSION}</p>
				</div>
			</div>

			<dl className='space-y-3 border-y py-4 text-sm'>
				<AboutRow label='Year' value='2026' />
				<AboutRow label='Author' value='Kossman' />
			</dl>

			<Button variant='outline' size='sm' asChild>
				<a
					href={APP_SOURCE_CODE_URL}
					target='_blank'
					rel='noopener noreferrer'
				>
					<Github /> Source code
				</a>
			</Button>
		</section>
	)
}

function AboutRow({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex items-center justify-between gap-4'>
			<dt className='text-muted-foreground'>{label}</dt>
			<dd className='font-medium'>{value}</dd>
		</div>
	)
}
