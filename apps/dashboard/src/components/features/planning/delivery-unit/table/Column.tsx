import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { DeliveryUnit } from './types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export const Column: Array<ColumnDef<DeliveryUnit>> = [
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

  // Delivery Unit Name
  {
    accessorKey: 'officeName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Delivery Unit
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // 🆕 Number of Sub Delivery Units
  {
    accessorKey: 'subDUCount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        # of Sub-Delivery Units
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.subDUCount ?? 0
      return <span>{count}</span>
    },
  },

  // 🆕 Organizational Cluster Name
  {
    accessorKey: 'clusterName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Organizational Cluster
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const data = row.original
      return (
        <Actions
          data={data}
          readonly={readonly}
          actions={actions}
          tableType="main"
        />
      )
    },
  },
]
