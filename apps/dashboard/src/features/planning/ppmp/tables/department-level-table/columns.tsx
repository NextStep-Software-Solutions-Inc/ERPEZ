import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  FilePen,
  FolderOpen,
} from 'lucide-react'
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
import { useNavigate } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPPMPRequest } from '../../handlers'
import {
  selectedPpmpForDeleteAtom,
  deletePpmpDialogOpenAtom,
  selectedPpmpForEditAtom,
  editPpmpDialogOpenAtom,
} from '../../atoms/ppmpStateAtoms'

const usePpmpDetail = createQueryHookFromTemplate(getPPMPRequest)

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
      const navigate = useNavigate()
      const setSelectedForDelete = useSetAtom(selectedPpmpForDeleteAtom)
      const setDeleteOpen = useSetAtom(deletePpmpDialogOpenAtom)
      const setSelectedForEdit = useSetAtom(selectedPpmpForEditAtom)
      const setEditOpen = useSetAtom(editPpmpDialogOpenAtom)

      const { refetch } = usePpmpDetail({
        pathParams: { id: ppmp.id },
        queryParams: {},
        enabled: false,
      })

      const handleView = () => {
        navigate({
          to: '/v2/ppmp/department-level/$ppmpId',
          params: { ppmpId: ppmp.id },
        })
      }

      const handleEdit = async () => {
        try {
          const { data } = await refetch()
          if (data?.data) {
            setSelectedForEdit(data.data)
            setEditOpen(true)
          }
        } catch (err) {
          // swallow — UI elsewhere shows errors
        }
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
            <DropdownMenuItem onClick={handleView}>
              <FolderOpen className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
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
