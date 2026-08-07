import { ArrowUpDown } from 'lucide-react'
import Actions from './Actions'
import type { FundReceiving } from './types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrencyPHP, toSentenceCase } from '@/utils/formatters'

export const Column: Array<ColumnDef<FundReceiving>> = [
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
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center"
          >
            Fund Received
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      return (
        <div className="text-center font-medium">
          {formatCurrencyPHP(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center"
          >
            Purpose
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const description = row.getValue('description')
      const formattedDescription = toSentenceCase(description)
      return <div className="text-center">{formattedDescription}</div>
    },
  },
  {
    accessorKey: 'receivedDate',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center"
          >
            Date Received
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const dateString = row.getValue('receivedDate')

      if (!dateString) {
        return <div className="text-center text-gray-400">-</div>
      }

      try {
        const date = new Date(dateString as string)
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date)

        return <div className="text-center font-medium">{formattedDate}</div>
      } catch (e) {
        return <div className="text-center text-destructive">Invalid Date</div>
      }
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
