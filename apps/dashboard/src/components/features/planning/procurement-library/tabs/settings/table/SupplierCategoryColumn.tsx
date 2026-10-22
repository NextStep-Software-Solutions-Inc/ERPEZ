import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SupplierCategoryActions } from '../dialog/SupplierCategoryActions'
import type { SupplierCategory } from '../../../types'
import type { MetaActions } from '@/types/global'

interface Handlers {
  onEdit: (item: SupplierCategory) => void
  onDelete: (id: string) => void
  actions?: MetaActions
}

export const getSupplierCategoryColumns = (handlers: Handlers): ColumnDef<SupplierCategory>[] => [
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
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      const truncated = description && description.length > 50 ? description.substring(0, 50) + '...' : description
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground truncate cursor-help">
                {truncated || '-'}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              {description || 'No description available'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const category = row.original
      return (
        <SupplierCategoryActions
          row={category}
          actions={handlers.actions ?? ['read']}
          onEdit={() => handlers.onEdit(category)}
          onDelete={() => handlers.onDelete(category.id)}
        />
      )
    },
  },
]
