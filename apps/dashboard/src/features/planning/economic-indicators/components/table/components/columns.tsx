import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useAtom } from 'jotai'

// import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EconomicIndicator } from '../data/economicIndicatorTypes'
import { Button } from '@/components/ui/button'
import {
  editEconomicIndicatorDialogOpenAtom,
  deleteEconomicIndicatorDialogOpenAtom,
  selectedEconomicIndicatorForEditAtom,
  selectedEconomicIndicatorForDeleteAtom,
} from '../../../atoms'

export const columns: ColumnDef<EconomicIndicator>[] = [
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
    accessorKey: 'fiscalYearYear',
    header: 'Fiscal Year',
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowValue = row.getValue(id)?.toString().toLowerCase() || ''
      const filterValue = value.toString().toLowerCase()
      return rowValue.includes(filterValue)
    },
  },
  {
    accessorKey: 'vatRate',
    header: 'VAT Rate',
    cell: ({ row }) => {
      const value = row.getValue('vatRate') as number
      return (
        <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 inline-block">
          <span className="text-emerald-700 font-semibold">
            {value.toFixed(2)}%
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'inflationRate',
    header: 'Inflation Rate',
    cell: ({ row }) => {
      const value = row.getValue('inflationRate') as number
      return (
        <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 inline-block">
          <span className="text-blue-700 font-semibold">
            {value.toFixed(2)}%
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'incomeTaxRate',
    header: 'Income Tax Rate',
    cell: ({ row }) => {
      const value = row.getValue('incomeTaxRate') as number
      return (
        <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 inline-block">
          <span className="text-purple-700 font-semibold">
            {value.toFixed(2)}%
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'))
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const indicator = row.original
      const [, setEditDialogOpen] = useAtom(editEconomicIndicatorDialogOpenAtom)
      const [, setDeleteDialogOpen] = useAtom(
        deleteEconomicIndicatorDialogOpenAtom,
      )
      const [, setSelectedForEdit] = useAtom(
        selectedEconomicIndicatorForEditAtom,
      )
      const [, setSelectedForDelete] = useAtom(
        selectedEconomicIndicatorForDeleteAtom,
      )

      const handleEdit = () => {
        setSelectedForEdit(indicator)
        setEditDialogOpen(true)
      }

      const handleDelete = () => {
        setSelectedForDelete(indicator)
        setDeleteDialogOpen(true)
      }

      return (
        <div className="text-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
