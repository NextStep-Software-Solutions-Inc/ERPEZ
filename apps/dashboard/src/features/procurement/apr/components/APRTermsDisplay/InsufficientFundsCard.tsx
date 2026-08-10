import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import type { InsufficientFundsAction } from '@/features/procurement/apr/types'

interface InsufficientFundsCardProps {
  action: InsufficientFundsAction | undefined
}

const ACTION_LABELS: Record<string, { label: string; description: string }> = {
  REDUCE_QUANTITY: {
    label: 'Reduce Quantity',
    description: 'Reduce item quantities if funds are insufficient',
  },
  BILL_US: {
    label: 'Bill Us',
    description: 'Bill the requesting office for shortfall',
  },
  CHARGE_TO_DEPOSIT: {
    label: 'Charge to Deposit',
    description: 'Charge insufficient amount to deposit account',
  },
}

export function InsufficientFundsCard({
  action,
}: InsufficientFundsCardProps) {
  if (!action) return null

  const details = ACTION_LABELS[action] || { label: action, description: '' }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Handling for Insufficient Funds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-amber-900">{details.label}</p>
        {details.description && (
          <p className="text-xs text-amber-700 mt-1">{details.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
