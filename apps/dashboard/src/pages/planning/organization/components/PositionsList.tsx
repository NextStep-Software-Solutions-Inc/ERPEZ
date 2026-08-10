import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TemplateTable } from '@/components/TemplateTable'
import type { Position } from '@/services/api/positions'

export const positionColumns: Array<ColumnDef<Position>> = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="font-semibold text-default-700"
      >
        Position Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="font-semibold text-default-700"
      >
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'functionalTitle',
    header: 'Functional Title',
    cell: ({ getValue }) => <span>{getValue<string>() || '—'}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<string>()
      const statusLower = status?.toLowerCase() || 'vacant'
      return (
        <Badge 
          variant="soft"
          className={`text-xs capitalize ${
            statusLower === 'vacant' ? 'bg-yellow-100 text-yellow-800' :
            statusLower === 'filled' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLower}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'authorizedFTE',
    header: 'FTE',
    cell: ({ getValue }) => <span className="text-center">{getValue<number>()}</span>,
  },
]

interface PositionsListProps {
  positions: Position[] | undefined
  isLoading: boolean
  positionCount: number
}

export function PositionsList({ positions, isLoading, positionCount }: PositionsListProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wider">Total Positions</h3>
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
          {positionCount} Items
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="rounded-lg border border-default-200 p-4 bg-default-50 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm text-default-500 font-medium">Loading positions...</p>
          </div>
        </div>
      ) : positions && positions.length > 0 ? (
        <TemplateTable<Position>
          columns={positionColumns}
          data={positions}
          actions={['read']}
          readonly={true}
          fixedPageSize={8}
          forTab={true}
        />
      ) : (
        <div className="rounded-lg border border-default-200 p-4 bg-default-50">
          <p className="text-sm text-default-600">No positions assigned to this office.</p>
        </div>
      )}
    </div>
  )
}
