import { ArrowUpDown, LockKeyhole, LockKeyholeOpen } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { DUAllocation } from './types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toSentenceCase } from '@/utils/formatters'

export const ColumnAllocations: Array<ColumnDef<DUAllocation>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'purpose',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Purpose
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const purpose = row.getValue('purpose')
      return toSentenceCase(purpose)
    }
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Total Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount')
      return amount.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
      })
    },
  },
  {
    accessorKey: 'isLocked',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isLocked = row.getValue('isLocked')
      return isLocked ? (
        <LockKeyhole className="lock-closed text-[#FF3B30]" />
      ) : (
        <LockKeyholeOpen className="lock-open text-[#34C759]" />
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const data = row.original
      return <Actions data={data} readonly={readonly} actions={actions} />
    },
  },
]
