/**
 * Insufficient Funds Card Component
 * Clean policy presentation for budget shortfall handling
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import type { InsufficientFundsAction } from '@/features/procurement/apr/types'

interface InsufficientFundsCardProps {
  action: InsufficientFundsAction | string | undefined
}

const ACTION_LABELS: Record<string, { label: string; description: string }> = {
  REDUCE_QUANTITY: {
    label: 'Reduce Quantity',
    description: 'Item quantities will automatically be reduced when available funds are insufficient.',
  },
  ReduceQuantity: {
    label: 'Reduce Quantity',
    description: 'Item quantities will automatically be reduced when available funds are insufficient.',
  },
  BILL_US: {
    label: 'Bill Us',
    description: 'Procuring entity will issue an official billing statement for any funding deficit.',
  },
  BillUs: {
    label: 'Bill Us',
    description: 'Procuring entity will issue an official billing statement for any funding deficit.',
  },
  CHARGE_TO_DEPOSIT: {
    label: 'Charge to Unutilized Deposit',
    description: 'Any shortfall will be charged against the agency unutilized cash deposit account.',
  },
  ChargeToUnutilizedDeposit: {
    label: 'Charge to Unutilized Deposit',
    description: 'Any shortfall will be charged against the agency unutilized cash deposit account.',
  },
}

export function InsufficientFundsCard({
  action,
}: InsufficientFundsCardProps) {
  const current = (action && ACTION_LABELS[action]) ? ACTION_LABELS[action] : { label: action || 'Reduce Quantity', description: 'Handling policy for budget shortfall' }

  return (
    <Card className="border border-border shadow-xs bg-card text-card-foreground rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-5 border-b border-border/70 bg-slate-50/60 dark:bg-slate-900/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          If Funds Are Insufficient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-1">
        <p className="font-semibold text-sm text-foreground">{current.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {current.description}
        </p>
      </CardContent>
    </Card>
  )
}
