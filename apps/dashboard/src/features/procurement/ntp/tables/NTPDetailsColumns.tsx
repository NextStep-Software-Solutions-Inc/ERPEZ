/**
 * NTP Details Line Items Columns Definition
 * Defines columns for the NTP line items read-only table
 * Follows template pattern: focused columns with clean formatting
 */

import { ColumnDef } from '@tanstack/react-table'
import type { NTPLineItem } from '../types/ntpTypes'

export const NTPDetailsColumns: ColumnDef<NTPLineItem>[] = [
  {
    accessorKey: 'itemCode',
    header: 'Item Code',
    cell: ({ row }) => {
      const code = row.getValue('itemCode') as string
      return <span className="font-medium text-sm">{code}</span>
    },
  },
  {
    accessorKey: 'description',
    header: 'Item Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      const specs = row.original.specs
      return (
        <div>
          <p className="font-medium">{description}</p>
          {specs && <p className="text-xs text-muted-foreground mt-1">{specs}</p>}
        </div>
      )
    },
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
    cell: ({ row }) => {
      const unit = row.getValue('unit') as string
      return <span className="text-sm">{unit}</span>
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number
      return <span className="font-medium">{quantity}</span>
    },
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => {
      const price = row.getValue('unitPrice') as number
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(price)
    },
  },
  {
    id: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const quantity = row.original.quantity
      const unitPrice = row.original.unitPrice
      const total = quantity * unitPrice
      return (
        <span className="font-semibold">
          {new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(total)}
        </span>
      )
    },
  },
]
