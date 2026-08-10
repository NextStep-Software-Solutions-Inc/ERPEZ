/**
 * Procurement mode color mapping utility.
 * Maps procurement mode names to Tailwind color class sets.
 * Falls back to gray if the mode name is not in the map.
 */

export interface ModeColorSet {
  badge: string // badge background + text
  dot: string // solid dot indicator color
  bar: string // progress bar fill color (Tailwind bg class)
  text: string // text color class
}

const MODE_COLOR_MAP: Record<string, ModeColorSet> = {
  // Competitive / Public Bidding
  'competitive bidding': {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    text: 'text-blue-700',
  },
  'public bidding': {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    text: 'text-blue-700',
  },
  // Shopping
  shopping: {
    badge: 'bg-orange-100 text-orange-800 border border-orange-200',
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
    text: 'text-orange-700',
  },
  // Direct Purchase / Contracting
  'direct purchase': {
    badge: 'bg-purple-100 text-purple-800 border border-purple-200',
    dot: 'bg-purple-500',
    bar: 'bg-purple-500',
    text: 'text-purple-700',
  },
  'direct contracting': {
    badge: 'bg-purple-100 text-purple-800 border border-purple-200',
    dot: 'bg-purple-500',
    bar: 'bg-purple-500',
    text: 'text-purple-700',
  },
  // Negotiated Procurement
  'negotiated procurement': {
    badge: 'bg-pink-100 text-pink-800 border border-pink-200',
    dot: 'bg-pink-500',
    bar: 'bg-pink-500',
    text: 'text-pink-700',
  },
  // Limited Source Bidding
  'limited source bidding': {
    badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    dot: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    text: 'text-cyan-700',
  },
  // Small Value / SVP
  'small value procurement': {
    badge: 'bg-green-100 text-green-800 border border-green-200',
    dot: 'bg-green-500',
    bar: 'bg-green-500',
    text: 'text-green-700',
  },
  svp: {
    badge: 'bg-green-100 text-green-800 border border-green-200',
    dot: 'bg-green-500',
    bar: 'bg-green-500',
    text: 'text-green-700',
  },
  // Emergency / Repeat Order
  'emergency procurement': {
    badge: 'bg-red-100 text-red-800 border border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    text: 'text-red-700',
  },
  'repeat order': {
    badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    dot: 'bg-yellow-500',
    bar: 'bg-yellow-500',
    text: 'text-yellow-700',
  },
}

/** Color pool for modes not in the map — cycles through a set of distinct colors. */
const FALLBACK_COLORS: ModeColorSet[] = [
  {
    badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    text: 'text-indigo-700',
  },
  {
    badge: 'bg-teal-100 text-teal-800 border border-teal-200',
    dot: 'bg-teal-500',
    bar: 'bg-teal-500',
    text: 'text-teal-700',
  },
  {
    badge: 'bg-rose-100 text-rose-800 border border-rose-200',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    text: 'text-rose-700',
  },
  {
    badge: 'bg-violet-100 text-violet-800 border border-violet-200',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    text: 'text-violet-700',
  },
  {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    text: 'text-amber-700',
  },
]

const GRAY_FALLBACK: ModeColorSet = {
  badge: 'bg-gray-100 text-gray-700 border border-gray-200',
  dot: 'bg-gray-400',
  bar: 'bg-gray-400',
  text: 'text-gray-600',
}

/**
 * Returns a consistent color set for a given procurement mode name.
 * Matching is case-insensitive and trims whitespace.
 */
export function getModeColor(modeName: string | undefined): ModeColorSet {
  if (!modeName) return GRAY_FALLBACK
  const key = modeName.trim().toLowerCase()
  if (MODE_COLOR_MAP[key]) return MODE_COLOR_MAP[key]

  // Consistent fallback based on first character code to keep color stable per mode
  const index = modeName.charCodeAt(0) % FALLBACK_COLORS.length
  return FALLBACK_COLORS[index]
}
