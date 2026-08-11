import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  FilePen,
  FolderOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PPMP } from '../../types'
import { Checkbox } from '@/components/ui/checkbox'
import { useSetAtom } from 'jotai'
import { Link } from '@tanstack/react-router'
import {
  selectedPpmpForDeleteAtom,
  deletePpmpDialogOpenAtom,
  selectedPpmpForEditAtom,
  editPpmpDialogOpenAtom,
} from '../../atoms/ppmpStateAtoms'

export const columns: ColumnDef<PPMP>[] = [
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
  },
  {
    accessorKey: 'documentName',
    header: 'PPMP Name',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="font-medium text-sm text-foreground leading-tight truncate max-w-xs">
            {row.getValue('documentName')}
          </div>
          {row.original.consolidatedIntoId && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              Consolidated
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {row.original.libName}
        </div>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'ppmpNumber',
    header: 'PPMP Number',
  },
  {
    accessorKey: 'fiscalYearName',
    header: 'Fiscal Year',
  },
  {
    accessorKey: 'totalEstimatedBudget',
    header: 'Total Estimated Budget',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="soft"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ppmp = row.original
      const setSelectedForDelete = useSetAtom(selectedPpmpForDeleteAtom)
      const setDeleteOpen = useSetAtom(deletePpmpDialogOpenAtom)
      const setSelectedForEdit = useSetAtom(selectedPpmpForEditAtom)
      const setEditOpen = useSetAtom(editPpmpDialogOpenAtom)


      const handleEdit = () => {
        setSelectedForEdit(ppmp)
        setEditOpen(true)
      }

      const handleDelete = () => {
        setSelectedForDelete(ppmp)
        setDeleteOpen(true)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link
              to="/v2/ppmp/$ppmpId"
              params={{ ppmpId: ppmp.id }}
            >
              <DropdownMenuItem >
                <FolderOpen className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <FilePen className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
