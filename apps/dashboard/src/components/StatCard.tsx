import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ColorScheme = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'

const colorSchemeStyles: Record<ColorScheme, { bg: string; border: string; icon: string; text: string }> = {
  default: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    text: 'text-slate-900',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-900',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
  secondary: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-900',
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
    <Card className={`shadow-sm gap-2 ${styles.bg} ${styles.border} border`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${styles.icon}`} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span className={`text-2xl font-bold ${styles.text}`}>
          {prefixSymbol ? `${prefixSymbol}${formattedValue}` : formattedValue}
        </span>
        {details && (
          <span className="text-sm text-muted-foreground">{details}</span>
        )}
      </CardContent>
    </Card>
  )
}
