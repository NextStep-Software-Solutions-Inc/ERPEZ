import { ArrowUpDown } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { toSentenceCase } from '@/utils/formatters'
import type { OPCRActivity } from './types'

export type OPCRTableProps = {
  data: OPCRActivity[]
  isLoading?: boolean
  onEdit?: (activity: OPCRActivity) => void
  onDelete?: (activity: OPCRActivity) => void
  readonly?: boolean
}

export const Column: Array<ColumnDef<OPCRActivity>> = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-left"
        >
          Activity Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="font-medium text-gray-700">{row.original.name}</span>
    }
  },
  {
    accessorKey: 'indicator',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Indicator
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="text-sm text-gray-600">{toSentenceCase(row.original.indicator)}</span>
    }
  },
  {
    accessorKey: 'weight',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Weight
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const weight = row.original.weight as number
      return <span className="font-semibold text-blue-700">{weight}%</span>
    }
  },
  {
    accessorKey: 'quarterlyTargets',
    header: () => 'Q1',
    cell: ({ row }) => {
      return <span className="text-sm font-medium">{row.original.quarterlyTargets?.q1 ?? '-'}</span>
    }
  },
  {
    id: 'q2',
    header: () => 'Q2',
    cell: ({ row }) => {
      return <span className="text-sm font-medium">{row.original.quarterlyTargets?.q2 ?? '-'}</span>
    }
  },
  {
    id: 'q3',
    header: () => 'Q3',
    cell: ({ row }) => {
      return <span className="text-sm font-medium">{row.original.quarterlyTargets?.q3 ?? '-'}</span>
    }
  },
  {
    id: 'q4',
    header: () => 'Q4',
    cell: ({ row }) => {
      return <span className="text-sm font-medium">{row.original.quarterlyTargets?.q4 ?? '-'}</span>
    }
  },
]
