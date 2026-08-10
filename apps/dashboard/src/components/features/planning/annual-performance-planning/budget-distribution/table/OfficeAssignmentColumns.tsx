/**
 * Office Assignment Table Columns
 * Defines all columns for the office assignment table
 */

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { OfficeAssignment } from '../mocks'
import { OfficeAssignmentActions } from './OfficeAssignmentActions'

interface UseOfficeAssignmentColumnsProps {
  onEditAssignment?: (assignment: OfficeAssignment) => void
  onDeleteAssignment?: (assignmentId: string, kpiName: string) => void
}

export function useOfficeAssignmentColumns(
  props?: UseOfficeAssignmentColumnsProps
) {
  const { onEditAssignment, onDeleteAssignment } = props || {}

  const columns: ColumnDef<OfficeAssignment>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'kpiCode',
        header: 'KPI Code',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.original.kpiCode}</div>
        ),
      },
      {
        accessorKey: 'kpiName',
        header: 'KPI Name',
        cell: ({ row }) => (
          <div className="text-sm text-gray-700 max-w-xs">{row.original.kpiName}</div>
        ),
      },
      {
        accessorKey: 'allocationFromPlanning',
        header: 'Planning Allocation',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 text-right">
            {row.original.allocationFromPlanning > 0
              ? row.original.allocationFromPlanning.toFixed(2)
              : '—'}
          </div>
        ),
      },
      {
        accessorKey: 'officeTarget',
        header: 'Office Target',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.officeTarget ?? ''}
            disabled={row.original.isFromPlanning && row.original.allocationFromPlanning > 0}
            className="w-24 text-sm h-8 text-center"
            placeholder={
              row.original.isFromPlanning && row.original.allocationFromPlanning > 0
                ? row.original.allocationFromPlanning.toFixed(2)
                : '0.00'
            }
          />
        ),
      },
      {
        accessorKey: 'q1',
        header: 'Q1',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.q1 ?? ''}
            className="w-16 text-sm h-8 text-center"
            placeholder="0"
          />
        ),
      },
      {
        accessorKey: 'q2',
        header: 'Q2',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.q2 ?? ''}
            className="w-16 text-sm h-8 text-center"
            placeholder="0"
          />
        ),
      },
      {
        accessorKey: 'q3',
        header: 'Q3',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.q3 ?? ''}
            className="w-16 text-sm h-8 text-center"
            placeholder="0"
          />
        ),
      },
      {
        accessorKey: 'q4',
        header: 'Q4',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.q4 ?? ''}
            className="w-16 text-sm h-8 text-center"
            placeholder="0"
          />
        ),
      },
      {
        accessorKey: 'isEdited',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`text-xs ${
              row.original.isEdited
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {row.original.isEdited ? 'Edited' : 'Original'}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Submission',
        cell: ({ row }) => {
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
          }
          return (
            <Badge
              variant="outline"
              className={`text-xs ${statusColors[row.original.status] || ''}`}
            >
              {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <OfficeAssignmentActions
            assignment={row.original}
            onEdit={() => onEditAssignment?.(row.original)}
            onDelete={() => onDeleteAssignment?.(row.original.id, row.original.kpiName)}
          />
        ),
      },
    ],
    [onEditAssignment, onDeleteAssignment]
  )

  return columns
}
