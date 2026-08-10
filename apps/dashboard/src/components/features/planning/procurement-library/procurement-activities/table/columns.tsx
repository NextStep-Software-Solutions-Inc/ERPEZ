import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { ProcurementActivityActions } from '../dialog/ProcurementActivityActions'
import type { ProcurementActivity } from '../../types'

export const Column: ColumnDef<ProcurementActivity>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: 'activityName',
    header: 'Activity Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('activityName')}</span>,
  },
  {
    accessorKey: 'minDays',
    header: 'Min Days',
    cell: ({ row }) => <span>{row.getValue('minDays')} days</span>,
  },
  {
    accessorKey: 'maxDays',
    header: 'Max Days',
    cell: ({ row }) => <span>{row.getValue('maxDays')} days</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const activity = row.original as ProcurementActivity
      const meta = table.options.meta as any
      return (
        <ProcurementActivityActions
          row={activity}
          onEdit={meta?.onEdit}
          onDelete={meta?.onDelete}
        />
      )
    },
  },
]
