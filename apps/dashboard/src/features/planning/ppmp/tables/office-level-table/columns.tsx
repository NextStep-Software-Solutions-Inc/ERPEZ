import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  FilePen,
  FolderOpen,
  Download,
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
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { generatePPMPDocumentRequest } from '../../handlers/generatePPMPDocumentRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP } from '@/utils/formatters'
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
    accessorKey: 'ppmpNumber',
    header: 'PPMP Number',
    cell: ({ row }) => (
      <div className="min-w-0">
        <span className="font-semibold text-sm text-foreground">
          {row.getValue('ppmpNumber') || '-'}
        </span>
        {row.original.libName && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">
            {row.original.libName}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'fiscalYearName',
    header: 'Fiscal Year',
    cell: ({ row }) => {
      const val = row.getValue('fiscalYearName') as string | undefined
      const fyYear = row.original.fiscalYear?.year
      return (
        <span className="text-sm">
          {val || (fyYear ? `${fyYear}` : '-')}
        </span>
      )
    },
  },
  {
    accessorKey: 'totalEstimatedBudget',
    header: 'Total Estimated Budget',
    cell: ({ row }) => {
      const raw = row.getValue('totalEstimatedBudget')
      const amount = Number(raw) || 0
      return (
        <span className="text-sm font-medium">
          {formatCurrencyPHP(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = (row.getValue('status') as string) || 'Draft'
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {status}
        </Badge>
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

      const handleView = () => {
        navigate({
          to: '/v2/ppmp/$ppmpId',
          params: { ppmpId: ppmp.id },
        })
      }

      const handleEdit = () => {
        setSelectedForEdit(ppmp)
        setEditOpen(true)
      }

      const handleDelete = () => {
        setSelectedForDelete(ppmp)
        setDeleteOpen(true)
      }

      const { toast } = useToast()

      const useGeneratePPMPDocument = createMutationHookFromTemplate(
        generatePPMPDocumentRequest,
      )
      const useDownloadDocument = createMutationHookFromTemplate(
        downloadLIBDocumentRequest,
      )

      const { mutateAsync: generatePPMPDocument } = useGeneratePPMPDocument()
      const { mutateAsync: downloadDocument } = useDownloadDocument()

      const handleGenerate = async (format: 'Pdf' | 'Excel') => {
        if (!ppmp.id) return
        try {
          const genResponse = await generatePPMPDocument({
            pathParams: { ppmpId: ppmp.id },
            queryParams: { format },
          })

          const documentId = genResponse.data
          if (!documentId)
            throw new Error('No document ID returned from generation API')

          const downloadResponse = await downloadDocument({
            pathParams: { documentId },
          })
          const blob = downloadResponse.blob

          const fileExtension = format === 'Excel' ? 'xlsx' : 'pdf'
          const filename = ppmp.ppmpNumber
            ? `${ppmp.ppmpNumber}.${fileExtension}`
            : `PPMP_${ppmp.id}.${fileExtension}`

          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(link.href)

          toast({
            title: 'Export started',
            description: 'Your document has been downloaded.',
          })
        } catch (err: any) {
          toast({
            title: 'Export failed',
            description: err?.message ?? 'Could not generate document',
          })
        } finally {
          // Export complete
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={handleView}>
              <FolderOpen className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleGenerate('Pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
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
