import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { KPI } from '../types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { truncateText } from '@/utils/formatters'
import { splitPascalCase } from '@/lib/utils'

/** Maximum character length for description before truncation */
const DESCRIPTION_MAX_LENGTH = 60
export const Column: Array<ColumnDef<KPI>> = [
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
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Performance Indicator
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const description = getValue<string>()
      return (
        <span title={description}>
          {truncateText(description, DESCRIPTION_MAX_LENGTH)}
        </span>
      )
    },
  },
  {
    accessorKey: 'subKpisCount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          No. of Sub-KPI
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const count = getValue<number | undefined>()
      return <span className="text-center">{count ?? 0}</span>
    },
  },
  {
    accessorKey: 'functionType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          KPI Function
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const functionType = getValue<string>()
      return <span>{splitPascalCase(functionType ?? '-')}</span>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const role = table.options.meta?.role
      const deliveryUnitId = table.options.meta?.deliveryUnitId
      const data = row.original
      return <Actions data={data} readonly={readonly} actions={actions} role={role} deliveryUnitId={deliveryUnitId} />
    },
  },
]
