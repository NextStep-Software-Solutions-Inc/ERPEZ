import React from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'

type PurchaseOrderSummaryCardProps = {
  title: string
  value: string
  description: string
  // optional icon component (e.g. from lucide-react)
  icon?: React.ComponentType<{ className?: string }>
  // optional color classes for the icon background, icon color, and value text
  iconBgClass?: string
  iconColorClass?: string
  valueColorClass?: string
  // optional card class to override default card styling (background, border, hover)
  cardClassName?: string
}

export function PurchaseOrderSummaryCard({
  title,
  value,
  description,
  icon: IconComponent,
  iconBgClass,
  iconColorClass,
  valueColorClass,
  cardClassName,
}: PurchaseOrderSummaryCardProps) {
  const cardClasses = cardClassName ?? 'rounded-lg border border-default-200/70 bg-white/50 hover:shadow-lg transition'

  return (
    <Card className={cardClasses}>
      <CardHeader className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass ?? 'bg-violet-50'}`}>
                <IconComponent className={`h-5 w-5 ${iconColorClass ?? 'text-violet-600'}`} />
              </div>
            )}

            <div>
              <CardTitle className="text-base font-semibold text-default-900">{title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-extrabold ${valueColorClass ?? 'text-violet-700'}`}>{value}</div>
            {/* small helper line if needed */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
