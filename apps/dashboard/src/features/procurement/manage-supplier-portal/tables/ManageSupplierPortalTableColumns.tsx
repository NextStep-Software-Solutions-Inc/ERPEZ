import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, ExternalLink, Users, FileText, Globe } from 'lucide-react'
import { Project } from '../types'
import { cn } from '@/lib/utils'

const columnHelper = createColumnHelper<Project>()

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    case 'evaluation':
    case 'submitted':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'closed':
    case 'returned':
      return 'bg-slate-100 text-slate-800 border-slate-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export interface ManageSupplierPortalTableColumnsProps {
  onViewBids: (projectId: string, source: 'rfq' | 'bac') => void
}

export function getManageSupplierPortalTableColumns({
  onViewBids,
}: ManageSupplierPortalTableColumnsProps): ColumnDef<Project, any>[] {
  return [
    columnHelper.accessor('id', {
      header: 'ID / Number',
      cell: ({ row }) => (
        <span className="font-medium text-primary font-mono text-xs">
          {row.original.sourceNumber || (row.original.id ? row.original.id.substring(0, 8) : '')}
        </span>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title / Description',
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:underline text-primary font-medium max-w-[280px] truncate"
          onClick={() => onViewBids(row.original.id, row.original.source)}
          title={row.getValue('title')}
        >
          {row.getValue('title')}
        </div>
      ),
    }),
    columnHelper.accessor('source', {
      header: 'Source',
      cell: ({ row }) => {
        const source = row.original.source
        return source === 'rfq' ? (
          <Badge variant="outline" className="text-[11px] gap-1 bg-violet-50 text-violet-700 border-violet-200">
            <FileText className="h-3 w-3" />
            Internal RFQ
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[11px] gap-1 bg-sky-50 text-sky-700 border-sky-200">
            <Globe className="h-3 w-3" />
            Public Portal
          </Badge>
        )
      },
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        const isSvp = type?.toLowerCase().includes('svp') || type?.toLowerCase().includes('small value')
        const isPublic = type?.toLowerCase().includes('public')
        const typeColor = isSvp
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : isPublic
          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
        return (
          <Badge variant="outline" className={cn('text-xs font-medium', typeColor)}>
            {type || 'SVP'}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('abc', {
      header: 'ABC',
      cell: ({ row }) => {
        const abc = row.getValue('abc') as number
        return <span className="font-medium">₱{(abc || 0).toLocaleString()}</span>
      },
    }),
    columnHelper.accessor('deadline', {
      header: 'Deadline',
      cell: ({ row }) => {
        const deadline = row.getValue('deadline') as string
        return (
          <span className="text-xs text-muted-foreground">
            {deadline && !isNaN(Date.parse(deadline))
              ? new Date(deadline).toLocaleDateString()
              : '—'}
          </span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant="outline" className={cn('text-xs font-medium capitalize', getStatusColor(status))}>
            {status || 'Active'}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('applicantCount', {
      header: 'Submissions',
      cell: ({ row }) => {
        const count = row.getValue('applicantCount') as number | undefined
        return (
          <Badge variant="secondary" className="gap-1 font-semibold">
            <Users className="h-3 w-3" />
            {count || 0}
          </Badge>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const project = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Open menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewBids(project.id, project.source)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Submissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
}
