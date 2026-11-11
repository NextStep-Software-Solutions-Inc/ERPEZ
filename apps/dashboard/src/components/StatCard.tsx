import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ColorScheme = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'

const colorSchemeStyles: Record<
  ColorScheme,
  { bg: string; border: string; iconBox: string; icon: string; text: string }
> = {
  default: {
    bg: 'bg-card',
    border: 'border-border',
    iconBox: 'bg-secondary border border-border',
    icon: 'text-muted-foreground',
    text: 'text-foreground',
  },
  success: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/25',
    border: 'border-emerald-200/90 dark:border-emerald-500/25',
    iconBox: 'bg-emerald-100/90 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-950 dark:text-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/25',
    border: 'border-amber-200/90 dark:border-amber-500/25',
    iconBox: 'bg-amber-100/90 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-950 dark:text-amber-100',
  },
  danger: {
    bg: 'bg-red-50/80 dark:bg-red-950/25',
    border: 'border-red-200/90 dark:border-red-500/25',
    iconBox: 'bg-red-100/90 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-950 dark:text-red-100',
  },
  info: {
    bg: 'bg-blue-50/80 dark:bg-blue-950/25',
    border: 'border-blue-200/90 dark:border-blue-500/25',
    iconBox: 'bg-blue-100/90 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-950 dark:text-blue-100',
  },
  secondary: {
    bg: 'bg-purple-50/80 dark:bg-purple-950/25',
    border: 'border-purple-200/90 dark:border-purple-500/25',
    iconBox: 'bg-purple-100/90 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-950 dark:text-purple-100',
  },
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  details?: string
  prefix?: string | 'currency' | 'peso'
  colorScheme?: ColorScheme
}

export function StatCard({
  label,
  value,
  icon: Icon,
  details,
  prefix,
  colorScheme = 'default',
}: StatCardProps) {
  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : value

  const styles = colorSchemeStyles[colorScheme]

  const prefixSymbol = 
    prefix === 'currency' || prefix === 'peso' ? '₱' : 
    prefix === 'dollar' ? '$' : 
    prefix

  return (
    <Card className={`rounded-xl shadow-xs transition-all hover:shadow-sm ${styles.bg} ${styles.border} border`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-0 px-5 pt-4 pb-1.5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${styles.iconBox}`}>
          <Icon className={`h-4 w-4 ${styles.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-5 pb-4 pt-1">
        <span className={`text-2xl font-bold tracking-tight tabular-nums ${styles.text}`}>
          {prefixSymbol ? `${prefixSymbol}${formattedValue}` : formattedValue}
        </span>
        {details && (
          <span className="text-xs font-medium text-muted-foreground">{details}</span>
        )}
      </CardContent>
    </Card>
  )
}
