import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { MasterDoc } from '../../types'

interface Handlers {
  onViewTemplate: (doc: MasterDoc) => void
  onEdit: (doc: MasterDoc) => void
  onDelete: (doc: MasterDoc) => void
}

// Add this helper above the getColumns function
const getTemplateFileName = (url: string): string => {
  try {
    const decoded = decodeURIComponent(url)
    const lastSegment = decoded.split('/').pop() ?? url
    const underscoreIndex = lastSegment.indexOf('_')
    return underscoreIndex !== -1
      ? lastSegment.slice(underscoreIndex + 1)
      : lastSegment
  } catch {
    return url
  }
}

export const getColumns = ({
  onViewTemplate,
  onEdit,
  onDelete,
}: Handlers): ColumnDef<MasterDoc>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all master documents"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Document Specification',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm">{row.original.name}</div>
        <div className="text-2xs text-muted-foreground line-clamp-1">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'envelope',
    header: 'Envelope Group',
    cell: ({ row }) => {
      const envelope = row.original.envelope

      return (
        <Badge
          variant="outline"
          color={envelope === 1 ? 'info' : 'warning'}
          className={
            envelope === 1
              ? 'bg-info/10 text-info border-info/20'
              : 'bg-warning/10 text-warning border-warning/20'
          }
        >
          {envelope === 1 ? 'Envelope 1: Technical' : 'Envelope 2: Financial'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'templateFile',
    header: 'Blank Template File',
    cell: ({ row }) => {
      const doc = row.original
      const displayName = getTemplateFileName(doc.templateFile)

      return doc.templateFile ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          title={doc.templateFile}
          className="h-8 max-w-full justify-start gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 font-mono text-2xs text-primary hover:bg-primary/10"
          onClick={() => onViewTemplate(doc)}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{displayName}</span>
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          None Attached
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => {
      const doc = row.original

      return (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-info"
            onClick={() => onEdit(doc)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(doc)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
