import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type CardColorScheme =
  | 'primary'
  | 'blue'
  | 'orange'
  | 'purple'
  | 'emerald'
  | 'red'

interface CardAction {
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'outline' | 'destructive'
  size?: 'sm' | 'icon'
  className?: string
  disabled?: boolean
  hasPermission?: boolean
}

interface TemplateCardDashtailProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  colorScheme?: CardColorScheme
  actions?: CardAction[]
  index?: number
  children: ReactNode
  className?: string
  onHover?: boolean
}

const colorSchemeMap: Record<
  CardColorScheme,
  { border: string; bg: string; icon: string }
> = {
  primary: {
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    icon: 'text-primary',
  },
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50/50',
    icon: 'text-blue-600',
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50/50',
    icon: 'text-orange-600',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50/50',
    icon: 'text-purple-600',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/50',
    icon: 'text-emerald-600',
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50/50',
    icon: 'text-red-600',
  },
}

export function TemplateCardDashtail({
  title,
  subtitle,
  icon,
  colorScheme = 'primary',
  actions = [],
  index = 0,
  children,
  className = '',
  onHover = true,
}: TemplateCardDashtailProps) {
  const colors = colorSchemeMap[colorScheme]
  const visibleActions = actions.filter(
    (action) => action.hasPermission !== false,
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={className}
    >
      <Card
        className={`overflow-hidden ${
          onHover ? 'hover:shadow-lg transition-all' : ''
        } border-border group rounded-xl bg-card shadow-sm flex flex-col h-full border`}
      >
        <CardHeader className="bg-muted/30 border-b border-border py-4 px-5 flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="bg-background p-2 rounded-lg shadow-sm border border-border">
                <div className={colors.icon}>{icon}</div>
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-default-900 leading-none">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {visibleActions.length > 0 && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {visibleActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'outline'}
                  size={action.size || 'icon'}
                  className={`h-8 w-8 ${action.className || ''}`}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  aria-label={action.label}
                  title={action.label}
                >
                  {action.icon}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 space-y-5 flex-1 flex flex-col justify-center">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}
