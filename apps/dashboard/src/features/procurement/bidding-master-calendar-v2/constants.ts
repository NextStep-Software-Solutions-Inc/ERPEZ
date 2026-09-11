export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const WORKING_HOURS = [
  7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
]

export interface ProjectColorPalette {
  bg: string
  border: string
  text: string
  badge: string
  solid: string
}

export const PROJECT_COLOR_PALETTES: ProjectColorPalette[] = [
  {
    bg: 'bg-blue-50/90 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    solid: 'bg-blue-600',
  },
  {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    solid: 'bg-emerald-600',
  },
  {
    bg: 'bg-purple-50/90 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-200',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    solid: 'bg-purple-600',
  },
  {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    solid: 'bg-amber-600',
  },
  {
    bg: 'bg-indigo-50/90 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-800',
    text: 'text-indigo-900 dark:text-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    solid: 'bg-indigo-600',
  },
  {
    bg: 'bg-teal-50/90 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-800',
    text: 'text-teal-900 dark:text-teal-200',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    solid: 'bg-teal-600',
  },
  {
    bg: 'bg-cyan-50/90 dark:bg-cyan-950/40',
    border: 'border-cyan-300 dark:border-cyan-800',
    text: 'text-cyan-900 dark:text-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    solid: 'bg-cyan-600',
  },
  {
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-800',
    text: 'text-rose-900 dark:text-rose-200',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    solid: 'bg-rose-600',
  },
]

export function getPaletteForProject(projectIdOrNumber: string): ProjectColorPalette {
  let hash = 0
  for (let i = 0; i < projectIdOrNumber.length; i++) {
    hash = (hash << 5) - hash + projectIdOrNumber.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % PROJECT_COLOR_PALETTES.length
  return PROJECT_COLOR_PALETTES[index]
}

export const CATEGORY_COLOR_MAP: Record<string, ProjectColorPalette> = {
  goods: {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    solid: 'bg-emerald-600',
  },
  infrastructure: {
    bg: 'bg-blue-50/90 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    solid: 'bg-blue-600',
  },
  consulting: {
    bg: 'bg-purple-50/90 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-200',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    solid: 'bg-purple-600',
  },
  alternative: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    solid: 'bg-amber-600',
  },
}

export const STATUS_COLOR_MAP: Record<string, ProjectColorPalette> = {
  'completed-locked': {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    solid: 'bg-slate-500',
  },
  'in-progress': {
    bg: 'bg-blue-50/90 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    solid: 'bg-blue-600',
  },
  'due-soon': {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    solid: 'bg-amber-600',
  },
  overdue: {
    bg: 'bg-red-50/90 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-800',
    text: 'text-red-900 dark:text-red-200',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    solid: 'bg-red-600',
  },
  upcoming: {
    bg: 'bg-slate-50/90 dark:bg-slate-900/40',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-800 dark:text-slate-200',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    solid: 'bg-slate-600',
  },
}

export const RA9184_DEFAULT_MAX_DAYS: Record<string, number | null> = {
  'ib-posting': null,
  'bid-documents-issuance': 1,
  'pre-bid-conference': 12,
  'clarification-deadline': 5,
  'bid-submission-opening': 30,
  'bid-evaluation': 15,
  'post-qualification': 30,
  'bac-resolution-award': 7,
  'approval-resolution': 7,
  'notice-of-award': 3,
  'contract-signing': 10,
  'notice-to-proceed': 7,
}
