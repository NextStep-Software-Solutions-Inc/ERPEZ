import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SdgPillProps {
  label: string
  color: string
  className?: string
}

const pillVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28 } },
  hover: { scale: 1.03, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' },
}

export function SdgPill({ label, color, className }: SdgPillProps) {
  return (
    <motion.span
      variants={pillVariants}
      whileHover="hover"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white uppercase tracking-wide cursor-default select-none',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {label}
    </motion.span>
  )
}
