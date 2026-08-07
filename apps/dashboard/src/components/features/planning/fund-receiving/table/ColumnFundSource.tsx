import { ArrowUpDown } from 'lucide-react'
import Actions from '../../fund-source/table/FundReceivingActions'
import type { FundSource } from '../../fund-source'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrencyPHP, toTitleCase } from '@/utils/formatters'

export const ColumnFundSource: Array<ColumnDef<FundSource>> = [
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
    accessorKey: 'fundSourceId',
    id: 'fundSourceId',
    header: () => null,
    cell: () => null,
    enableHiding: true,
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fund Source
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue('name')
      const formattedName = toTitleCase(name)
      return <div className="text-left">{formattedName}</div>
    },
  },
  {
    accessorKey: 'totalReceivedFunds',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center"
          >
            Total Amount Received
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalReceivedFunds'))
      return (
        <div className="text-center font-medium">
          {formatCurrencyPHP(amount)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const data = row.original
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions ?? []
      return <Actions data={data} readonly={readonly} actions={actions} />
    },
  },
]
