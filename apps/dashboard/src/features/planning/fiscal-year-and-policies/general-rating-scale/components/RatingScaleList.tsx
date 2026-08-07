import { useMemo, useState } from 'react'
import { AlertCircle, Edit, MoreVertical } from 'lucide-react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import {
  decimalToPercentage,
  formatDecimalScore,
} from '@/lib/fiscal-year-and-policies/utils'

interface RatingScaleListProps {
  ratingScales: GeneralRatingScale[]
  // canEdit: boolean
  selectedFY?: string | null
  onEditClick: (scaleId: string) => void
}

/**
 * RatingScaleList - Presentational component for displaying all rating scales using TanStack Table
 *
 * Responsibilities:
 * - Render rating scales in a table format using TanStack Table
 * - Filter scales by selected fiscal year when selectedFY is provided
 * - Provide read-only summary of each scale
 * - Trigger edit callbacks without handling logic
 *
 * Does NOT contain:
 * - Form handling
 * - Validation logic
 * - Complex state management
 */
export default function RatingScaleList({
  ratingScales,
  // canEdit,
  selectedFY,
  onEditClick,
}: RatingScaleListProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'scoreRangeDecimal', desc: true },
  ])

  // Filter scales based on selected fiscal year
  const filteredScales = useMemo(() => {
    if (!selectedFY) return ratingScales
    return ratingScales.filter((scale) => scale.fiscalYearId === selectedFY)
  }, [ratingScales, selectedFY])

  // Precompute rating values for efficient lookup
  const ratingValueMap = useMemo(() => {
    const map = new Map<string, number>()
    const sortedData = [...filteredScales].sort(
      (a, b) => b.minScore - a.minScore,
    )
    sortedData.forEach((scale, index) => {
      map.set(scale.id, 5 - index)
    })
    return map
  }, [filteredScales])

  // Define columns for TanStack Table
  const columns: ColumnDef<GeneralRatingScale>[] = useMemo(
    () => [
      {
        id: 'ratingValue',
        header: 'Rating',
        cell: ({ row }) => {
          const ratingValue = ratingValueMap.get(row.original.id)
          return (
            <p className="font-bold text-gray-900">
              {ratingValue !== undefined ? ratingValue : '—'}
            </p>
          )
        },
      },
      {
        accessorKey: 'adjectivalRatingName',
        header: '',
        cell: ({ row }) => (
          <p className="font-semibold text-gray-900">
            {row.original.adjectivalRatingName}
          </p>
        ),
      },
      {
        accessorKey: 'minScore',
        id: 'scoreRangeDecimal',
        header: 'Score Range (Decimal)',
        cell: ({ row }) => (
          <div className="font-mono text-gray-700">
            {formatDecimalScore(row.original.minScore)}–
            {formatDecimalScore(row.original.maxScore)}
          </div>
        ),
      },
      {
        accessorKey: 'minScore',
        id: 'scoreRangePercentage',
        header: 'Score Range (%)',
        cell: ({ row }) => {
          const minPercentage = decimalToPercentage(row.original.minScore)
          const maxPercentage = decimalToPercentage(row.original.maxScore)
          return (
            <div className="font-mono text-gray-700">
              {Math.round(minPercentage)}–{Math.round(maxPercentage)}%
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Popover
            open={openPopoverId === row.original.id}
            onOpenChange={(open) =>
              setOpenPopoverId(open ? row.original.id : null)
            }
          >
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="More actions"
                aria-label={`More actions for ${row.original.adjectivalRatingName}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="end">
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    onEditClick(row.original.id)
                    setOpenPopoverId(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    [onEditClick, openPopoverId],
  )

  // Initialize table
  const table = useReactTable({
    data: filteredScales,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (filteredScales.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <AlertCircle className="h-5 w-5 text-gray-500" />
        <p className="text-sm text-gray-600">
          {selectedFY
            ? 'No rating scales configured for the selected fiscal year.'
            : 'No rating scales configured for this fiscal year.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-gray-200 bg-gray-50"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold text-gray-700"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
