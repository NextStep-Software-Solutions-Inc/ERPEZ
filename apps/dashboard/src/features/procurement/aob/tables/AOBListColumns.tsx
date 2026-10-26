/**
 * AOB List Table Columns
 * Column definitions for AOB data display
 */

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { AOB } from '../types/aobTypes'
import { formatAOBStatus, getAOBStatusColor, formatAwardCriterion, formatDateDisplay } from '../utils/formatters'
import { AOBListActions } from './AOBListActions'

interface AOBListColumnsOptions {
  onView?: (aob: AOB) => void
  onEdit?: (aob: AOB) => void
  onDelete?: (aob: AOB) => void
}

export function createAOBListColumns(options: AOBListColumnsOptions): ColumnDef<AOB>[] {
  const columnHelper = createColumnHelper<AOB>()

  return [
    columnHelper.accessor('aobNumber', {
      id: 'aobNumber',
      header: 'AOB Number',
      cell: (info) => (
        <div className="font-semibold text-sm text-blue-600">
          {info.getValue()}
        </div>
      ),
      size: 130,
    }),

    columnHelper.accessor('description', {
      id: 'description',
      header: 'Description',
      cell: (info) => (
        <div className="text-sm text-gray-700 max-w-xs truncate">
          {info.getValue() || '-'}
        </div>
      ),
      size: 200,
    }),

    columnHelper.accessor('awardCriterion', {
      id: 'awardCriterion',
      header: 'Award Criterion',
      cell: (info) => (
        <span className="text-xs font-medium text-gray-600">
          {formatAwardCriterion(info.getValue())}
        </span>
      ),
      size: 150,
    }),

    columnHelper.accessor('date', {
      id: 'date',
      header: 'Date',
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {formatDateDisplay(info.getValue())}
        </span>
      ),
      size: 100,
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return (
          <Badge variant="outline" className={getAOBStatusColor(status, 'user')}>
            {formatAOBStatus(status, 'user')}
          </Badge>
        )
      },
      size: 120,
    }),

    columnHelper.accessor('createdBy', {
      id: 'createdBy',
      header: 'Created By',
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {info.getValue()}
        </span>
      ),
      size: 120,
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (props) => (
        <AOBListActions
          aob={props.row.original}
          onView={options.onView}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      size: 60,
    }),
  ] as ColumnDef<AOB>[]
}
