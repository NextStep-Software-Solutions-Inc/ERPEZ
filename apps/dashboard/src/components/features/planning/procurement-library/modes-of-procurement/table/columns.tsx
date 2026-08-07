import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { ModeOfProcurement } from '../../types'
import { hasThresholdConfiguration } from '../../utils'

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return 'Unlimited'
  }

  return `₱${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const Column: ColumnDef<ModeOfProcurement>[] = [
  {
    accessorKey: 'modeName',
    header: 'Mode Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('modeName')}</span>
    ),
  },
  {
    accessorKey: 'minThreshold',
    header: 'Min Threshold',
    cell: ({ row }) => {
      const amount = row.getValue('minThreshold') as number
      return <span className="font-mono">{formatCurrency(amount)}</span>
    },
  },
  {
    accessorKey: 'maxThreshold',
    header: 'Max Threshold',
    cell: ({ row }) => {
      const amount = row.getValue('maxThreshold') as number | null
      return <span className="font-mono">{formatCurrency(amount)}</span>
    },
  },
  {
    id: 'thresholdStatus',
    header: 'Threshold Status',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          hasThresholdConfiguration(row.original)
            ? 'text-green-700 border-green-200 bg-green-50'
            : 'text-slate-600 border-slate-200 bg-slate-50'
        }
      >
        {hasThresholdConfiguration(row.original)
          ? 'Configured'
          : 'Not configured'}
      </Badge>
    ),
  },
]
