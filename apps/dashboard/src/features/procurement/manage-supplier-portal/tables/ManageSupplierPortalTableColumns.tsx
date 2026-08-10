import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, ExternalLink, Users } from 'lucide-react'
import { Project } from '../types'
import { cn } from '@/lib/utils'

const columnHelper = createColumnHelper<Project>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': 
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    case 'Evaluation': 
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'Closed': 
      return 'bg-slate-100 text-slate-800 border-slate-300'
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export interface ManageSupplierPortalTableColumnsProps {
  onViewBids: (projectId: string) => void
}

export function getManageSupplierPortalTableColumns({
  onViewBids,
}: ManageSupplierPortalTableColumnsProps): ColumnDef<Project, any>[] {
  return [
    columnHelper.accessor('id', {
      header: 'Project ID',
      cell: ({ row }) => (
        <span className="font-medium text-primary">
          {row.getValue('id')}
        </span>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: ({ row }) => (
        <div 
          className="cursor-pointer hover:underline text-primary font-medium"
          onClick={() => onViewBids(row.original.id)}
          title="Click to view applicants"
        >
          {row.getValue('title')}
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        const typeColor = type === 'SVP' 
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : 'bg-indigo-100 text-indigo-800 border-indigo-300'
        return (
          <Badge variant="outline" className={cn('text-xs font-medium', typeColor)}>
            {type}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('abc', {
      header: 'ABC',
      cell: ({ row }) => {
        const abc = row.getValue('abc') as number
        return <span className="font-medium">₱{abc.toLocaleString()}</span>
      },
    }),
    columnHelper.accessor('deadline', {
      header: 'Deadline',
      cell: ({ row }) => {
        const deadline = row.getValue('deadline') as string
        return <span>{new Date(deadline).toLocaleDateString()}</span>
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant="outline" className={cn('text-xs font-medium', getStatusColor(status))}>
            {status}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('applicantCount', {
      header: 'Applicants',
      cell: ({ row }) => {
        const count = row.getValue('applicantCount') as number | undefined
        return (
          <Badge variant="secondary" className="gap-1">
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
              <DropdownMenuItem onClick={() => onViewBids(project.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Applicants
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
}
