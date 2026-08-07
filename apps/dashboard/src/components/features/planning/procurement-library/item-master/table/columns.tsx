import { ColumnDef, Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ItemMasterActions } from '../dialog/ItemMasterActions'
import type { ItemMaster } from '../../types'

interface Handlers {
  onView: (item: ItemMaster) => void
  onEdit: (item: ItemMaster) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export const getColumns = (handlers: Handlers): ColumnDef<ItemMaster>[] => [
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
    accessorKey: 'itemName',
    header: 'Item Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('itemName')}</span>,
  },
  {
    accessorKey: 'uacsCode',
    header: 'Object Code',
    cell: ({ row }) => <code className="text-sm">{row.getValue('uacsCode')}</code>,
  },
  {
    accessorKey: 'unspscCode',
    header: 'UNSPSC Code',
    cell: ({ row }) => <code className="text-sm">{row.getValue('unspscCode') || '-'}</code>,
  },
  {
    accessorKey: 'uom',
    header: 'Unit',
    cell: ({ row }) => {
      const uom = row.getValue('uom') as string
      return <span className="font-medium">{uom || '-'}</span>
    },
  },
  {
    accessorKey: 'itemType',
    header: 'Item Type',
    size: 180,
    cell: ({ row }) => {
      const itemType = row.getValue('itemType') as string
      const getItemTypeLabel = (type: string) => {
        switch (type) {
          case 'expendable':
            return 'Expendable'
          case 'semi expendable':
            return 'Semi Expendable'
          case 'ppe':
            return 'PPE'
          default:
            return type
        }
      }
      const getItemTypeClasses = (type: string) => {
        switch (type) {
          case 'expendable':
            return 'bg-green-100 text-green-800 border-green-300'
          case 'semi expendable':
            return 'bg-blue-100 text-blue-800 border-blue-300'
          case 'ppe':
            return 'bg-purple-100 text-purple-800 border-purple-300'
          default:
            return 'text-slate-700 border-slate-300'
        }
      }
      return (
        <Badge variant="outline" className={`capitalize ${getItemTypeClasses(itemType)} w-full justify-center min-w-0 whitespace-nowrap`}>
          {getItemTypeLabel(itemType)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'minimumTechnicalSpecifications',
    header: 'Specification',
    size: 80,
    cell: ({ row }) => {
      const spec = row.getValue('minimumTechnicalSpecifications') as string
      const truncated = spec.length > 50 ? spec.substring(0, 50) + '...' : spec
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm truncate cursor-help">
                {truncated}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              {spec}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge color={status === 'active' ? 'success' : 'warning'}>
          {status}
        </Badge>
      )
    },
    },
    {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: { row: Row<ItemMaster> }) => {
      const item = row.original
      return (
        <div className="flex justify-end">
          <ItemMasterActions
            row={item}
            onView={() => handlers.onView(item)}
            onEdit={() => handlers.onEdit(item)}
            onDelete={() => handlers.onDelete(item.id)}
            onToggleStatus={() => handlers.onToggleStatus(item.id)}
          />
        </div>
      )
    },
  },
]
