/**
 * NTP List Table Columns Definition
 * Defines columns for the NTP data table
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { NTP, NTPStatus } from '../types/ntpTypes'

const statusConfig: Record<NTPStatus, { label: string; variant?: 'outline' | 'soft' }> = {
  Draft: { label: 'Draft', variant: 'soft' },
  'For Approval': { label: 'For Approval', variant: 'outline' },
  Approved: { label: 'Approved', variant: 'soft' },
  Returned: { label: 'Returned', variant: 'outline' },
}

export const NTPListColumns: ColumnDef<NTP>[] = [
  {
    accessorKey: 'ntpNumber',
    header: 'NTP Number',
    cell: ({ row }) => <span className="font-medium">{row.getValue('ntpNumber')}</span>,
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => row.getValue('supplierName'),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(amount)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as NTPStatus
      const config = statusConfig[status] || { label: status }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as string
      return format(new Date(date), 'MMM d, yyyy')
    },
  },
]
