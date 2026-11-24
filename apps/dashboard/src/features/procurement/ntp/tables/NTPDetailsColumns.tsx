/**
 * NTP Details Line Items Columns Definition
 * Defines columns for the NTP line items read-only table
 */

import { ColumnDef } from '@tanstack/react-table'
import type { NTPLineItem } from '../types/ntpTypes'

export const NTPDetailsColumns: ColumnDef<NTPLineItem>[] = [
  {
    accessorKey: 'itemCode',
    header: 'Item Code',
    cell: ({ row }) => {
      const code = (row.getValue('itemCode') as string) || row.original.itemId || '—'
      return <span className="font-mono text-xs">{code}</span>
    },
  },
  {
    accessorKey: 'description',
    header: 'Description & Specifications',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      const specs = row.original.specs
      return (
        <div className="space-y-0.5 max-w-md">
          <p className="font-medium text-xs text-slate-900 dark:text-slate-100">{description}</p>
          {specs && <p className="text-[11px] text-muted-foreground">{specs}</p>}
        </div>
      )
    },
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
    cell: ({ row }) => {
      const unit = row.original.unitOfMeasurement || (row.getValue('unit') as string) || 'unit'
      return <span className="text-xs text-muted-foreground">{unit}</span>
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number
      return <span className="font-semibold text-xs">{quantity}</span>
    },
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => {
      const price = row.getValue('unitPrice') as number
      return (
        <span className="text-xs">
          {new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(price || 0)}
        </span>
      )
    },
  },
  {
    id: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const quantity = row.original.quantity || 0
      const unitPrice = row.original.unitPrice || 0
      const total = row.original.totalPrice || quantity * unitPrice
      return (
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
          {new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(total)}
        </span>
      )
    },
  },
]
