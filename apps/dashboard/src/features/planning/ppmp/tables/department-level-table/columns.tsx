import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  FilePen,
  FolderOpen,
  Download,
  CheckCircle2,
  FilePlus2,
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
import { useQueryClient } from '@tanstack/react-query'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { generatePPMPDocumentRequest } from '../../handlers/generatePPMPDocumentRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'
import { togglePpmpFinalizationRequest } from '../../handlers/togglePpmpFinalizationRequest'
import { useToast } from '@/components/ui/use-toast'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  selectedPpmpForDeleteAtom,
  deletePpmpDialogOpenAtom,
  selectedPpmpForEditAtom,
  editPpmpDialogOpenAtom,
  supplementalDialogOpenAtom,
  selectedPpmpForSupplementalAtom,
} from '../../atoms/ppmpStateAtoms'

const useToggleFinal = createMutationHookFromTemplate(
  togglePpmpFinalizationRequest,
)

function PpmpActions({ ppmp }: { ppmp: PPMP }) {
  const queryClient = useQueryClient()
  const setSelectedForDelete = useSetAtom(selectedPpmpForDeleteAtom)
  const setDeleteOpen = useSetAtom(deletePpmpDialogOpenAtom)

  const setSelectedForEdit = useSetAtom(selectedPpmpForEditAtom)
  const setEditOpen = useSetAtom(editPpmpDialogOpenAtom)
  const setSupplementalOpen = useSetAtom(supplementalDialogOpenAtom)
  const setSelectedForSupplemental = useSetAtom(
    selectedPpmpForSupplementalAtom,
  )

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
  const { mutateAsync: toggleFinal, isPending: isTogglingFinal } =
    useToggleFinal()

  const handleToggleFinal = async () => {
    if (!ppmp.id) return
    try {
      await toggleFinal({
        pathParams: { id: ppmp.id },
        payload: { isFinal: !ppmp.isFinal },
      })
      toast({
        title: ppmp.isFinal ? 'Marked as Indicative' : 'Marked as Final PPMP',
        description: ppmp.isFinal
          ? `${ppmp.ppmpNumber || 'PPMP'} is now marked as an Indicative PPMP.`
          : `${ppmp.ppmpNumber || 'PPMP'} is now marked as Final PPMP.`,
      })
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/ppmp')
        },
      })
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update PPMP final status.'
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      })
    }
  }

  const handleCreateSupplemental = () => {
    setSelectedForSupplemental(ppmp)
    setSupplementalOpen(true)
  }

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
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not generate document'
      toast({
        title: 'Export failed',
        description: msg,
      })
    }
  }

  const isApproved = ppmp.status?.toLowerCase() === 'approved'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            to="/v2/ppmp/$ppmpId"
            params={{
              ppmpId: ppmp.id,
            }}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleGenerate('Pdf')}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>

        {isApproved && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleFinal}
              disabled={isTogglingFinal}
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
              {ppmp.isFinal ? 'Unmark as Final' : 'Mark as Final'}
            </DropdownMenuItem>
            {ppmp.ppmpType !== 'Supplemental' && !ppmp.sourcePPMPId && !ppmp.consolidatedIntoId && (
              <DropdownMenuItem
                onClick={handleCreateSupplemental}
                disabled={!ppmp.isFinal}
                title={
                  !ppmp.isFinal
                    ? 'Must be marked as Final before creating Supplemental PPMP'
                    : undefined
                }
              >
                <FilePlus2 className="mr-2 h-4 w-4 text-indigo-600" />
                <span>Create Supplemental PPMP</span>
                {!ppmp.isFinal && (
                  <span className="ml-auto text-[10px] text-muted-foreground pl-2">
                    (Needs Final)
                  </span>
                )}
              </DropdownMenuItem>
            )}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleEdit}>
          <FilePen className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
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
    accessorKey: 'isFinal',
    id: 'planType',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Plan Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const ppmp = row.original
      const isSupplemental =
        ppmp.ppmpType === 'Supplemental' || Boolean(ppmp.sourcePPMPId)
      const isFinal = ppmp.isFinal || isSupplemental

      if (isSupplemental) {
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium px-2.5 py-0.5 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            Supplemental {ppmp.supplementalNumber ? `#${ppmp.supplementalNumber}` : ''}
          </Badge>
        )
      }

      if (isFinal) {
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium px-2.5 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Final PPMP
          </Badge>
        )
      }

      return (
        <Badge
          variant="outline"
          className="text-xs font-medium px-2.5 py-0.5 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
        >
          Indicative
        </Badge>
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
      const ppmp = row.original
      const status = ppmp.status || 'Draft'
      const isApproved = status.toLowerCase() === 'approved'

      return (
        <Badge
          variant="outline"
          className={cn(
            'capitalize text-xs font-medium',
            isApproved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : status.toLowerCase() === 'submitted'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : status.toLowerCase() === 'rejected'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700',
          )}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <PpmpActions ppmp={row.original} />,
  },
]
