import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ExpenseClass } from '../types/expenseClassTypes'

interface ColumnConfig {
  onEdit?: (item: ExpenseClass) => void
  onDelete?: (item: ExpenseClass) => void
}

export function createExpenseClassColumns(config: ColumnConfig = {}): ColumnDef<ExpenseClass>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      size: 80,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-lg">{row.getValue('code')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.getValue('description') || '-'}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeMap: Record<number, string> = {
          1: 'Personnel Services',
          2: 'MOOE',
          3: 'Capital Outlay',
          4: 'Financial Expenditure',
        }
        return <span className="text-sm">{typeMap[row.getValue('type') as number] || 'Unknown'}</span>
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.getValue('isActive')
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              title="Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => config.onEdit?.(row.original)}
              className="gap-2 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => config.onDelete?.(row.original)}
              className="gap-2 cursor-pointer text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
