import {
	AlertCircle,
	Book,
	Briefcase,
	CheckCircle,
	Code,
	Coffee,
	Flame,
	Globe,
	Heart,
	Home,
	Image,
	Lightbulb,
	MessageSquare,
	Music,
	Rocket,
	Star,
	Terminal,
	User,
	Video,
	Zap,
} from 'lucide-react'

export const ICON_MAP = {
	message: MessageSquare,
	book: Book,
	code: Code,
	heart: Heart,
	star: Star,
	zap: Zap,
	briefcase: Briefcase,
	coffee: Coffee,
	music: Music,
	image: Image,
	video: Video,
	globe: Globe,
	home: Home,
	user: User,
	alert: AlertCircle,
	check: CheckCircle,
	flame: Flame,
	bulb: Lightbulb,
	rocket: Rocket,
	terminal: Terminal,
} as const

export type IconKey = keyof typeof ICON_MAP

export const DEFAULT_CHAT_ICON: IconKey = 'message'
export const DEFAULT_CHAT_COLOR = '#71717a'

export const PRESET_COLORS = [
	DEFAULT_CHAT_COLOR,
	'#ef4444',
	'#f97316',
	'#eab308',
	'#22c55e',
	'#06b6d4',
	'#3b82f6',
	'#8b5cf6',
	'#d946ef',
	'#f43f5e',
]
