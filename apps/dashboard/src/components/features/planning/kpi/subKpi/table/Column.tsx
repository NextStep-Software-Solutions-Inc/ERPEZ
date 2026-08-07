/**
 * SubKPI Table Column Definitions
 * Defines the column structure for the SubKPI table
 * Follows atomic component pattern - single responsibility for column rendering
 */
import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { KPI } from '../../types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

/** Maximum character length for description before truncation */
const DESCRIPTION_MAX_LENGTH = 60

/**
 * Truncates text to specified length with ellipsis
 * Follows DRY principle - single place for truncation logic
 */
function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}..` : text
}

/**
 * SubKPI Column definitions for TemplateTable
 */
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
          Sub-KPI Name
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
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Assigned Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
